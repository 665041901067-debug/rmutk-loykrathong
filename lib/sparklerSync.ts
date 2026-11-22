'use client';

import { supabase, isDemoMode } from './supabase';
import { generateUUID } from './storage';

export interface LiveSparkler {
  id: string;
  x: number; // 0 - 100% horizontal
  y: number; // 0 - 100% vertical
  playerName: string;
  faculty: string;
  isBurning: boolean;
  burnProgress: number; // 0 (full stick) to 100 (burnt down to bare metal wire)
  lastUpdated: number;
}

// Singleton Supabase Realtime Channel for Waterfront Sparklers
let sparklerChannel: any = null;

function getSparklerChannel() {
  if (isDemoMode() || !supabase) return null;
  if (!sparklerChannel) {
    sparklerChannel = supabase.channel('public:sparkler_live', {
      config: { broadcast: { ack: false, self: false } },
    });
  }
  return sparklerChannel;
}

/**
 * ส่งตำแหน่งและการโบกไฟเย็นแบบ Real-time ไปยังผู้เล่นทุกคนในสระ
 */
export function broadcastSparklerMove(sparkler: LiveSparkler): void {
  // 1. Cross-tab in same browser
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel('rmutk_sparkler_sync');
      bc.postMessage({ type: 'SPARKLER_MOVE', payload: sparkler });
      setTimeout(() => bc.close(), 500);
    } catch {}
  }

  // 2. Supabase Realtime Broadcast to everyone online
  if (!isDemoMode() && supabase) {
    try {
      const ch = getSparklerChannel();
      if (ch) {
        ch.send({
          type: 'broadcast',
          event: 'sparkler_move',
          payload: sparkler,
        });
      }
    } catch (err) {
      console.warn('Sparkler broadcast notice:', err);
    }
  }
}

/**
 * สมัครรับฟังเพื่อนๆ ที่กำลังจุดไฟเย็นอยู่ริมสระน้ำ
 */
export function subscribeLiveSparklers(onUpdate: (sparkler: LiveSparkler) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  // 1. Listen via BroadcastChannel
  let bc: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel('rmutk_sparkler_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SPARKLER_MOVE' && event.data?.payload) {
          onUpdate(event.data.payload);
        }
      };
    } catch {
      bc = null;
    }
  }

  // 2. Listen via Supabase Realtime
  let ch: any = null;
  if (!isDemoMode() && supabase) {
    try {
      ch = getSparklerChannel();
      if (ch) {
        ch.on('broadcast', { event: 'sparkler_move' }, (msg: any) => {
          if (msg.payload && msg.payload.id) {
            onUpdate(msg.payload as LiveSparkler);
          }
        }).subscribe();
      }
    } catch (err) {
      console.warn('Sparkler realtime subscribe notice:', err);
    }
  }

  return () => {
    if (bc) bc.close();
  };
}

/**
 * ดึงสถิติจำนวนแท่งไฟเย็นที่ถูกจุดจริงในสระน้ำ มทร.กรุงเทพ
 */
export async function getSparklerCampusTotal(): Promise<number> {
  if (isDemoMode() || !supabase) {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('rmutk_sparkler_total_real') : null;
    return raw ? parseInt(raw, 10) || 0 : 0;
  }

  try {
    const { data, error } = await supabase
      .from('sparkler_stats')
      .select('total_sparklers')
      .eq('id', 'global')
      .maybeSingle();

    if (!error && data && typeof data.total_sparklers === 'number') {
      return data.total_sparklers;
    }
  } catch {}

  const raw = typeof window !== 'undefined' ? localStorage.getItem('rmutk_sparkler_total_real') : null;
  return raw ? parseInt(raw, 10) || 0 : 0;
}

/**
 * บันทึกยอดแท่งไฟเย็นเพิ่มขึ้น 1 แท่ง (อัปเดตตามจริงจาก 0)
 */
export async function incrementSparklerCampusTotal(): Promise<number> {
  let next = 1;
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('rmutk_sparkler_total_real');
    next = (raw ? parseInt(raw, 10) || 0 : 0) + 1;
    localStorage.setItem('rmutk_sparkler_total_real', next.toString());
  }

  if (isDemoMode() || !supabase) return next;

  try {
    const { data } = await supabase
      .from('sparkler_stats')
      .select('total_sparklers')
      .eq('id', 'global')
      .maybeSingle();

    const cur = typeof data?.total_sparklers === 'number' ? data.total_sparklers : 0;
    const updated = cur + 1;

    await supabase
      .from('sparkler_stats')
      .upsert(
        { id: 'global', total_sparklers: updated, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );

    return updated;
  } catch {
    return next;
  }
}
