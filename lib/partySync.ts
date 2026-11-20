'use client';

import { Krathong } from '@/types';
import { supabase, isDemoMode } from './supabase';

const BROADCAST_CHANNEL_NAME = 'rmutk_party_sync';
const LAUNCH_KEY_PREFIX = 'rmutk_party_launch_';
const MEMBER_KEY_PREFIX = 'rmutk_party_members_';

export interface PartyLaunchPayload {
  partyCode: string;
  hostName?: string;
  timestamp: number;
}

/**
 * แจ้งเตือนการปล่อยกระทงพร้อมกันไปยังทุกแท็บ/ทุกเครื่องในก๊วนเดียวกัน
 */
export function broadcastPartyLaunch(partyCode: string, hostName?: string): void {
  if (!partyCode) return;
  const payload: PartyLaunchPayload = {
    partyCode,
    hostName,
    timestamp: Date.now(),
  };

  // 1. BroadcastChannel (Native Cross-Tab Sync ใน Browser เดียวกัน ทันทีระดับ ms)
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({ type: 'PARTY_LAUNCH', payload });
      setTimeout(() => bc.close(), 1000);
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }
  }

  // 2. LocalStorage Event (Cross-Window / Cross-Tab Storage Event)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${LAUNCH_KEY_PREFIX}${partyCode}`, JSON.stringify(payload));
      localStorage.setItem('rmutk_party_event_ping', Date.now().toString());
    } catch (err) {
      console.warn('LocalStorage party event error:', err);
    }
  }

  // 3. Supabase Realtime Broadcast (ข้ามเครื่อง ข้ามเน็ตเวิร์ก)
  if (!isDemoMode() && supabase) {
    try {
      const channel = supabase.channel(`party_${partyCode}`);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'group_launch',
            payload,
          });
        }
      });
    } catch (err) {
      console.warn('Supabase party broadcast error:', err);
    }
  }
}

/**
 * สมัครรับฟังเหตุการณ์ปล่อยกระทงพร้อมกันในก๊วน
 */
export function subscribePartyLaunch(
  partyCode: string,
  onLaunch: (payload: PartyLaunchPayload) => void
): () => void {
  if (!partyCode || typeof window === 'undefined') return () => {};

  let isTriggered = false;

  const triggerOnce = (payload: PartyLaunchPayload) => {
    if (isTriggered) return;
    isTriggered = true;
    onLaunch(payload);
  };

  // ตรวจสอบสถานะทันทีว่ามีคำสั่งปล่อยลอยค้างอยู่หรือไม่ (ไม่เกิน 20 วินาที)
  try {
    const existing = localStorage.getItem(`${LAUNCH_KEY_PREFIX}${partyCode}`);
    if (existing) {
      const parsed = JSON.parse(existing) as PartyLaunchPayload;
      if (Date.now() - parsed.timestamp < 20000) {
        triggerOnce(parsed);
      }
    }
  } catch {
    // Ignore
  }

  // 1. ฟังจาก BroadcastChannel
  let bc: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data?.type === 'PARTY_LAUNCH' && event.data?.payload?.partyCode === partyCode) {
          triggerOnce(event.data.payload);
        }
      };
    } catch {
      bc = null;
    }
  }

  // 2. ฟังจาก Storage Event (เมื่อ Tab อื่นอัปเดต LocalStorage)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === `${LAUNCH_KEY_PREFIX}${partyCode}` && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as PartyLaunchPayload;
        triggerOnce(parsed);
      } catch {
        triggerOnce({ partyCode, timestamp: Date.now() });
      }
    } else if (e.key === 'rmutk_party_event_ping') {
      try {
        const item = localStorage.getItem(`${LAUNCH_KEY_PREFIX}${partyCode}`);
        if (item) {
          const parsed = JSON.parse(item) as PartyLaunchPayload;
          if (Date.now() - parsed.timestamp < 15000) {
            triggerOnce(parsed);
          }
        }
      } catch {
        // Ignore
      }
    }
  };
  window.addEventListener('storage', handleStorage);

  // 3. Fallback Polling ตรวจสอบ LocalStorage ทุกๆ 1 วินาที
  const pollInterval = setInterval(() => {
    try {
      const current = localStorage.getItem(`${LAUNCH_KEY_PREFIX}${partyCode}`);
      if (current) {
        const parsed = JSON.parse(current) as PartyLaunchPayload;
        if (Date.now() - parsed.timestamp < 15000) {
          triggerOnce(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, 1000);

  // 4. Supabase Realtime Broadcast Listener
  let sbChannel: any = null;
  if (!isDemoMode() && supabase) {
    try {
      sbChannel = supabase
        .channel(`party_${partyCode}`)
        .on('broadcast', { event: 'group_launch' }, (msg: any) => {
          if (msg.payload?.partyCode === partyCode) {
            triggerOnce(msg.payload);
          }
        })
        .subscribe();
    } catch {
      sbChannel = null;
    }
  }

  // คืนค่าฟังก์ชันยกเลิกการสมัคร
  return () => {
    if (bc) bc.close();
    window.removeEventListener('storage', handleStorage);
    clearInterval(pollInterval);
    if (sbChannel && supabase) {
      supabase.removeChannel(sbChannel);
    }
  };
}

/**
 * แจ้งอัปเดตสมาชิกใหม่ในก๊วนเพื่อน
 */
export function broadcastMemberJoined(partyCode: string, krathong: Krathong): void {
  if (!partyCode) return;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({ type: 'MEMBER_JOINED', partyCode, krathong });
      setTimeout(() => bc.close(), 1000);
    } catch {
      // Ignore
    }
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('rmutk_party_member_ping', `${partyCode}_${Date.now()}`);
    } catch {
      // Ignore
    }
  }
}
