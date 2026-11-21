'use client';

import { supabase, isDemoMode } from './supabase';
import { generateUUID } from './storage';
import { FACULTIES } from '@/data/faculties';

export interface TurtleProfile {
  playerId: string;
  nickname: string;
  faculty: string;
}

export interface FacultyScore {
  faculty: string;
  coins: number;
}

export interface TurtleCoinPulse {
  faculty: string;
  coinsAdded: number;
  playerId: string;
  nickname: string;
  timestamp: number;
  totalCoins?: number;
}

const STORAGE_KEYS = {
  PROFILE: 'rmutk_turtle_profile',
  FACULTY_SCORES: 'rmutk_turtle_scores_real',
  MY_COINS: 'rmutk_turtle_coins_real',
} as const;

// คะแนนเริ่มต้นตามจริง ทุกคณะเริ่มต้นที่ 0 เหรียญ (ไม่มีการเมคตัวเลขขึ้นมา)
export const DEFAULT_FACULTY_SCORES: Record<string, number> = {
  'คณะวิศวกรรมศาสตร์': 0,
  'คณะวิทยาศาสตร์และเทคโนโลยี': 0,
  'คณะบริหารธุรกิจ': 0,
  'คณะศิลปศาสตร์': 0,
  'คณะครุศาสตร์อุตสาหกรรม': 0,
  'คณะเทคโนโลยีคหกรรมศาสตร์': 0,
  'คณะอุตสาหกรรมสิ่งทอ': 0,
  'วิทยาลัยนานาชาติ': 0,
  'บุคคลทั่วไป': 0,
  'ศิษย์เก่า': 0,
  'บุคลากร': 0,
};

/**
 * ดึงโปรไฟล์ผู้เล่นบ่อเต่าแบบ Anonymous (ไม่จำเป็นต้อง Login)
 */
export function getTurtleProfile(): TurtleProfile {
  if (typeof window === 'undefined') {
    return {
      playerId: 'anonymous',
      nickname: 'เด็ก มทร.',
      faculty: 'คณะวิศวกรรมศาสตร์',
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  const newProfile: TurtleProfile = {
    playerId: generateUUID(),
    nickname: 'เด็ก มทร.',
    faculty: 'คณะวิศวกรรมศาสตร์',
  };

  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
  } catch {}

  return newProfile;
}

/**
 * บันทึกโปรไฟล์ผู้เล่น (ชื่อเล่น หรือ เปลี่ยนสังกัดคณะ)
 */
export function saveTurtleProfile(updates: Partial<TurtleProfile>): TurtleProfile {
  const current = getTurtleProfile();
  const next = { ...current, ...updates };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(next));
    } catch {}
  }
  return next;
}

/**
 * ดึงคะแนนสะสมของแต่ละคณะ (ข้อมูลจริง เริ่มต้นจาก 0)
 */
export function getFacultyScores(): Record<string, number> {
  const scores: Record<string, number> = { ...DEFAULT_FACULTY_SCORES };
  if (typeof window === 'undefined') return scores;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FACULTY_SCORES);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.keys(parsed).forEach((fac) => {
        scores[fac] = Number(parsed[fac]) || 0;
      });
    }
  } catch {}

  return scores;
}

/**
 * บันทึกคะแนนเพิ่มให้กับคณะ (อัปเดตตามจริง)
 */
export function addCoinsToFaculty(faculty: string, count: number): Record<string, number> {
  const currentScores = getFacultyScores();
  currentScores[faculty] = (currentScores[faculty] || 0) + count;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.FACULTY_SCORES, JSON.stringify(currentScores));
    } catch {}
  }

  return currentScores;
}

/**
 * ดึงคะแนนสะสมของแต่ละคณะจาก Supabase turtle_coins ตามข้อมูลจริงในฐานข้อมูล
 */
export async function fetchSupabaseFacultyScores(): Promise<Record<string, number>> {
  const scores: Record<string, number> = { ...DEFAULT_FACULTY_SCORES };
  if (isDemoMode() || !supabase) return getFacultyScores();

  try {
    const { data, error } = await supabase
      .from('turtle_coins')
      .select('faculty, coin_count');

    if (!error && data && Array.isArray(data)) {
      data.forEach((row: { faculty: string; coin_count: number }) => {
        if (row.faculty) {
          scores[row.faculty] = Number(row.coin_count) || 0;
        }
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.FACULTY_SCORES, JSON.stringify(scores));
      }
    }
  } catch (err) {
    console.warn('fetchSupabaseFacultyScores notice:', err);
  }

  return scores;
}

/**
 * บันทึกคะแนนเพิ่มให้กับคณะบน Supabase turtle_coins
 */
export async function recordCoinToss(faculty: string, count: number): Promise<void> {
  if (isDemoMode() || !supabase) return;

  try {
    const { data: cur } = await supabase
      .from('turtle_coins')
      .select('coin_count')
      .eq('faculty', faculty)
      .maybeSingle();

    const currentCount = Number(cur?.coin_count) || 0;
    const newTotal = currentCount + count;

    await supabase
      .from('turtle_coins')
      .upsert(
        {
          faculty,
          coin_count: newTotal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'faculty' }
      );
  } catch (err) {
    console.warn('recordCoinToss notice:', err);
  }
}

// Supabase Realtime Channel Singleton for Turtle Pond Battle
let turtleChannel: any = null;

function getTurtleChannel() {
  if (isDemoMode() || !supabase) return null;
  if (!turtleChannel) {
    turtleChannel = supabase.channel('public:turtle_pond_battle', {
      config: { broadcast: { ack: false, self: false } },
    });
  }
  return turtleChannel;
}

/**
 * ส่ง Pulse เหรียญแบบ Realtime สไตล์ Popcat ไปยังทุกอุปกรณ์
 */
export function broadcastCoinPulse(pulse: TurtleCoinPulse): void {
  // 1. Cross-tab in same browser
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel('rmutk_turtle_sync');
      bc.postMessage({ type: 'COIN_PULSE', payload: pulse });
      setTimeout(() => bc.close(), 1000);
    } catch {}
  }

  // 2. Supabase Realtime Broadcast to everyone online
  if (!isDemoMode() && supabase) {
    try {
      const ch = getTurtleChannel();
      if (ch) {
        ch.send({
          type: 'broadcast',
          event: 'coin_pulse',
          payload: pulse,
        });
      }
    } catch (err) {
      console.warn('Turtle coin pulse broadcast error:', err);
    }
  }
}

/**
 * สมัครรับฟังเหตุการณ์การโยนเหรียญแบบ Realtime จากผู้เล่นทุกคน
 */
export function subscribeTurtleCoins(onPulse: (pulse: TurtleCoinPulse) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  // 1. Listen via BroadcastChannel
  let bc: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel('rmutk_turtle_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'COIN_PULSE' && event.data?.payload) {
          onPulse(event.data.payload);
        }
      };
    } catch {
      bc = null;
    }
  }

  // 2. Listen via Supabase Realtime Broadcast
  let ch: any = null;
  if (!isDemoMode() && supabase) {
    try {
      ch = getTurtleChannel();
      if (ch) {
        ch.on('broadcast', { event: 'coin_pulse' }, (msg: any) => {
          if (msg.payload && msg.payload.faculty) {
            onPulse(msg.payload as TurtleCoinPulse);
          }
        }).subscribe();
      }
    } catch (err) {
      console.warn('Turtle coin broadcast subscribe error:', err);
    }
  }

  // 3. Listen to Supabase Postgres Changes on turtle_coins table
  let pgCh: any = null;
  if (!isDemoMode() && supabase) {
    try {
      pgCh = supabase
        .channel('public:turtle_coins_table')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'turtle_coins' },
          (payload: any) => {
            const row = payload.new as { faculty?: string; coin_count?: number };
            if (row && row.faculty) {
              onPulse({
                faculty: row.faculty,
                coinsAdded: 0,
                playerId: '',
                nickname: '',
                timestamp: Date.now(),
                totalCoins: Number(row.coin_count) || 0,
              });
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Turtle coin pg subscribe error:', err);
    }
  }

  return () => {
    if (bc) bc.close();
    if (pgCh && supabase) supabase.removeChannel(pgCh);
  };
}
