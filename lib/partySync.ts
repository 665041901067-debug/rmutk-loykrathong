'use client';

import { Krathong } from '@/types';
import { supabase, isDemoMode } from './supabase';

const BROADCAST_CHANNEL_NAME = 'rmutk_party_sync';
const LAUNCH_KEY_PREFIX = 'rmutk_party_launch_';

export interface PartyLaunchPayload {
  partyCode: string;
  hostName?: string;
  timestamp: number;
}

// Registry to keep party channels alive and reuse established WebSocket connections
const partyChannelRegistry = new Map<string, any>();

function getOrCreatePartyChannel(partyCode: string) {
  if (!partyCode || isDemoMode() || !supabase) return null;
  if (!partyChannelRegistry.has(partyCode)) {
    const ch = supabase.channel(`party_room_${partyCode}`, {
      config: {
        broadcast: { ack: true, self: true },
        presence: { key: partyCode },
      },
    });
    partyChannelRegistry.set(partyCode, ch);
  }
  return partyChannelRegistry.get(partyCode);
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

  // 1. Native BroadcastChannel (Cross-tab in same browser)
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({ type: 'PARTY_LAUNCH', payload });
      setTimeout(() => bc.close(), 1000);
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }
  }

  // 2. LocalStorage Event (Cross-window & Persistence)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${LAUNCH_KEY_PREFIX}${partyCode}`, JSON.stringify(payload));
      localStorage.setItem('rmutk_party_event_ping', Date.now().toString());
      window.dispatchEvent(new CustomEvent('rmutk_party_launch', { detail: payload }));
    } catch (err) {
      console.warn('LocalStorage party event error:', err);
    }
  }

  // 3. Supabase Realtime Broadcast & Presence State (Cross-device / Mobile phones / Internet)
  if (!isDemoMode() && supabase) {
    const sendPulse = () => {
      try {
        const ch = getOrCreatePartyChannel(partyCode);
        if (ch) {
          ch.send({
            type: 'broadcast',
            event: 'group_launch',
            payload,
          });
          ch.track({ partyCode, isLaunched: true, launchedAt: Date.now() });
        }
      } catch (err) {
        console.warn('Party broadcast pulse error:', err);
      }
    };

    // Send immediately and retry 3 times to ensure zero packet drop across mobile connections
    sendPulse();
    setTimeout(sendPulse, 400);
    setTimeout(sendPulse, 1000);
    setTimeout(sendPulse, 2200);
  }
}

/**
 * สมัครรับฟังเหตุการณ์ปล่อยกระทงพร้อมกันในก๊วน (ข้ามอุปกรณ์ & ข้ามบราวเซอร์)
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

  // 1. ตรวจสอบสถานะทันทีว่าห้องนี้ถูกสั่งปล่อยไปแล้วหรือยัง
  try {
    const existing = localStorage.getItem(`${LAUNCH_KEY_PREFIX}${partyCode}`);
    if (existing) {
      const parsed = JSON.parse(existing) as PartyLaunchPayload;
      if (Date.now() - parsed.timestamp < 30000) {
        triggerOnce(parsed);
      }
    }
  } catch {}

  // 2. Window Custom Event (Direct in-page event)
  const handleCustomEvent = (e: Event) => {
    const detail = (e as CustomEvent).detail as PartyLaunchPayload;
    if (detail?.partyCode === partyCode) {
      triggerOnce(detail);
    }
  };
  window.addEventListener('rmutk_party_launch', handleCustomEvent);

  // 3. ฟังจาก BroadcastChannel (ข้ามแท็บในเครื่องเดียวกัน)
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

  // 4. ฟังจาก Storage Event
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
          if (Date.now() - parsed.timestamp < 25000) {
            triggerOnce(parsed);
          }
        }
      } catch {}
    }
  };
  window.addEventListener('storage', handleStorage);

  // 5. Supabase Realtime (Broadcast + Presence sync ข้ามเครื่อง/มือถือ)
  let sbChannel: any = null;
  if (!isDemoMode() && supabase) {
    try {
      sbChannel = getOrCreatePartyChannel(partyCode);
      if (sbChannel) {
        sbChannel
          .on('broadcast', { event: 'group_launch' }, (msg: any) => {
            if (msg.payload?.partyCode === partyCode) {
              triggerOnce(msg.payload);
            }
          })
          .on('presence', { event: 'sync' }, () => {
            try {
              const state = sbChannel.presenceState();
              for (const key of Object.keys(state)) {
                const list = state[key] as any[];
                if (list?.some((p) => p.isLaunched && p.partyCode === partyCode)) {
                  triggerOnce({ partyCode, timestamp: Date.now() });
                }
              }
            } catch {}
          })
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              sbChannel.track({ partyCode, joinedAt: Date.now() });
            }
          });
      }
    } catch (err) {
      console.warn('Supabase subscribe error:', err);
    }
  }

  // 6. Polling check ทุกๆ 750ms เพื่อความแน่นอนสูงสุด
  const pollInterval = setInterval(() => {
    try {
      const current = localStorage.getItem(`${LAUNCH_KEY_PREFIX}${partyCode}`);
      if (current) {
        const parsed = JSON.parse(current) as PartyLaunchPayload;
        if (Date.now() - parsed.timestamp < 25000) {
          triggerOnce(parsed);
        }
      }
    } catch {}
  }, 750);

  // คืนค่าฟังก์ชันยกเลิกการสมัคร
  return () => {
    window.removeEventListener('rmutk_party_launch', handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
    clearInterval(pollInterval);
    if (bc) bc.close();
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
    } catch {}
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('rmutk_party_member_ping', `${partyCode}_${Date.now()}`);
    } catch {}
  }
  if (!isDemoMode() && supabase) {
    try {
      const ch = getOrCreatePartyChannel(partyCode);
      if (ch) {
        ch.send({
          type: 'broadcast',
          event: 'member_joined',
          payload: { partyCode, member: krathong },
        });
      }
    } catch {}
  }
}
