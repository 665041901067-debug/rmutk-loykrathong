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
}

const STORAGE_KEYS = {
  PROFILE: 'rmutk_turtle_profile',
  FACULTY_SCORES: 'rmutk_turtle_faculty_scores',
  MY_COINS: 'rmutk_turtle_coins',
} as const;

// Realistic baseline campus tally so the leaderboard feels vibrant from day one
export const DEFAULT_FACULTY_SCORES: Record<string, number> = {
  'คณะวิศวกรรมศาสตร์': 1845,
  'คณะวิทยาศาสตร์และเทคโนโลยี': 1620,
  'คณะบริหารธุรกิจ': 1480,
  'คณะศิลปศาสตร์': 1350,
  'คณะครุศาสตร์อุตสาหกรรม': 980,
  'คณะเทคโนโลยีคหกรรมศาสตร์': 890,
  'คณะอุตสาหกรรมสิ่งทอ': 760,
  'วิทยาลัยนานาชาติ': 640,
  'บุคคลทั่วไป': 730,
  'ศิษย์เก่า': 520,
  'บุคลากร': 410,
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
 * ดึงคะแนนสะสมของแต่ละคณะ
 */
export function getFacultyScores(): Record<string, number> {
  const scores = { ...DEFAULT_FACULTY_SCORES };
  if (typeof window === 'undefined') return scores;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FACULTY_SCORES);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.keys(parsed).forEach((fac) => {
        scores[fac] = (scores[fac] || 0) + (parsed[fac] || 0);
      });
    }
  } catch {}

  return scores;
}

/**
 * บันทึกคะแนนเพิ่มให้กับคณะ
 */
export function addCoinsToFaculty(faculty: string, count: number): Record<string, number> {
  if (typeof window === 'undefined') return DEFAULT_FACULTY_SCORES;

  let addedMap: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FACULTY_SCORES);
    if (raw) addedMap = JSON.parse(raw);
  } catch {}

  addedMap[faculty] = (addedMap[faculty] || 0) + count;

  try {
    localStorage.setItem(STORAGE_KEYS.FACULTY_SCORES, JSON.stringify(addedMap));
  } catch {}

  return getFacultyScores();
}

/**
 * ดึงคะแนนสะสมของแต่ละคณะจาก Supabase turtle_coins (ถ้ามี)
 */
export async function fetchSupabaseFacultyScores(): Promise<Record<string, number>> {
  const scores = getFacultyScores();
  if (isDemoMode() || !supabase) return scores;

  try {
    const { data, error } = await supabase
      .from('turtle_coins')
      .select('faculty, coin_count');

    if (!error && data && data.length > 0) {
      data.forEach((row: { faculty: string; coin_count: number }) => {
        if (row.faculty) {
          scores[row.faculty] = Math.max(scores[row.faculty] || 0, Number(row.coin_count) || 0);
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

    const currentCount = Number(cur?.coin_count) || (DEFAULT_FACULTY_SCORES[faculty] || 0);
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

  // 2. Listen via Supabase Realtime
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
      console.warn('Turtle coin subscribe error:', err);
    }
  }

  return () => {
    if (bc) bc.close();
  };
}