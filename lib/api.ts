import {
  Krathong,
  KrathongInput,
  BlessResult,
  PondStats,
  WishCategory,
  FloatingMode,
  KrathongBase,
  FlowerType,
  CandleSet,
  SacredItem,
} from '@/types';
import { supabase, isDemoMode } from './supabase';
import { DEMO_KRATHONGS } from '@/data/demoKrathongs';
import { FACULTIES } from '@/data/faculties';
import { getOrCreateVoterId, markKrathongVoted, hasVotedKrathong, saveMyKrathongId } from './storage';

const LOCAL_STORAGE_CUSTOM_KRATHONGS = 'rmutk_loykrathong_custom_items';

export const CATEGORY_TO_THAI: Record<WishCategory, string> = {
  study: 'การเรียนและสอบผ่าน',
  career: 'การงานและฝึกงาน',
  love: 'ความรักและมิตรภาพ',
  health: 'สุขภาพและลอยเคราะห์',
};

export const THAI_TO_CATEGORY: Record<string, WishCategory> = {
  'การเรียนและสอบผ่าน': 'study',
  'การงานและฝึกงาน': 'career',
  'ความรักและมิตรภาพ': 'love',
  'สุขภาพและลอยเคราะห์': 'health',
};

/**
 * คำนวณตำแหน่งและขนาดแบบสุ่มคงที่ (Deterministic) จาก ID
 * ทำให้กระทงทุกใบอยู่ในตำแหน่งที่แน่นอนเสมอ แม้ไม่ได้บันทึกพิกัดลงในฐานข้อมูล
 */
export function getDeterministicPosition(id: string, partyCode?: string): { pos_x: number; pos_y: number; scale: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // หากอยู่ในก๊วนเพื่อน (Party Cluster) ให้กระทงลอยเคียงข้างกันตามแนวนอนผิวน้ำ
  if (partyCode) {
    let partyHash = 0;
    for (let i = 0; i < partyCode.length; i++) {
      partyHash = (partyHash << 5) - partyHash + partyCode.charCodeAt(i);
      partyHash |= 0;
    }
    const absPartyHash = Math.abs(partyHash);
    const anchorX = 22 + (absPartyHash % 56); // 22% ถึง 78% (กระจายกว้างทั่วสระ)
    const anchorY = 50 + ((absPartyHash >> 3) % 17); // 50% ถึง 67%
    // กระจายเพื่อนในกลุ่มตามแนวนอนซ้าย-ขวามากกว่าแนวตั้ง เพื่อไม่ให้เรียงเป็นเส้นตรงเด็ดขาด
    const offsetX = ((absHash % 7) - 3) * 6.5; // +/- 19.5% แนวนอน
    const offsetY = (((absHash >> 2) % 5) - 2) * 2.2; // +/- 4.4% แนวตั้ง
    const pos_x = Math.max(12, Math.min(88, anchorX + offsetX));
    const pos_y = Math.max(48, Math.min(69, anchorY + offsetY));
    const depthFactor = (pos_y - 48) / 21;
    const scale = Math.round((0.82 + depthFactor * 0.25) * 100) / 100;
    return { pos_x, pos_y, scale };
  }

  // กระทงเดี่ยว: กระจายตัวแบบ Golden Ratio ทั่วพื้นที่ผิวน้ำสระ
  const phi = (absHash * 0.618033988749895) % 1;
  const pos_x = Math.round((12 + phi * 76) * 10) / 10; // 12% ถึง 88%
  const pos_y = Math.round((48 + ((absHash >> 4) % 21)) * 10) / 10; // 48% ถึง 69%
  const depthFactor = (pos_y - 48) / 21;
  const scale = Math.round((0.78 + depthFactor * 0.28) * 100) / 100;
  return { pos_x, pos_y, scale };
}

/**
 * แปลงข้อมูลจากแถวในฐานข้อมูล Supabase ให้เป็นอ็อบเจกต์ Krathong ที่แอปใช้งาน
 * รองรับทั้ง schema ดั้งเดิมและ schema ที่ผู้ใช้ปรับใช้ (เช่น float_mode, second_name, krathong_base)
 */
export function mapRowToKrathong(row: Record<string, unknown>): Krathong {
  const rowId = String(row.id || '');

  const rawCat = String(row.wish_category || '');
  const cat = THAI_TO_CATEGORY[rawCat] || (['study', 'career', 'love', 'health'].includes(rawCat) ? (rawCat as WishCategory) : 'study');

  const rawFaculty = String(row.faculty || 'บุคคลทั่วไป');
  const bMatch = rawFaculty.match(/\[.*?\bb:([^|\]]+)/);
  const cMatch = rawFaculty.match(/\[.*?\bc:([^|\]]+)/);
  const sMatch = rawFaculty.match(/\[.*?\bs:([^|\]]+)/);
  const pMatch = rawFaculty.match(/\[.*?\bp:([^|\]]+)/);
  const tMatch = rawFaculty.match(/\[.*?\bt:([^|\]]+)/);

  let base_type: KrathongBase = (bMatch ? bMatch[1] : row.krathong_base || row.base_type || 'banana-leaf') as KrathongBase;
  let candle_type: CandleSet = (cMatch ? cMatch[1] : row.candle_type || 'traditional') as CandleSet;
  let sacred_items: SacredItem[] = sMatch ? (sMatch[1].split(',').filter(Boolean) as SacredItem[]) : [];
  let party_code: string | undefined = pMatch ? pMatch[1] : (row.party_code ? String(row.party_code) : undefined);
  let party_time: string | undefined = tMatch ? tMatch[1] : (row.party_time ? String(row.party_time) : undefined);
  let cleanFaculty = rawFaculty.replace(/\[.*\]/, '').trim();

  // Fallback checking from legacy wish tags if present
  if (!party_code) {
    const rawWishText = String(row.wish || '');
    const sacredMatch = rawWishText.match(/<!--sacred:(.*?)-->/);
    if (sacredMatch && sacred_items.length === 0) {
      sacred_items = sacredMatch[1].split(',').filter(Boolean) as SacredItem[];
    }
    const partyMatch = rawWishText.match(/<!--party:(.*?)(?:\|time:(.*?))?-->/);
    if (partyMatch) {
      party_code = partyMatch[1];
      if (partyMatch[2]) party_time = partyMatch[2];
    }
  }

  const rawWish = String(row.wish || '');
  const cleanWish = rawWish
    .replace(/<!--sacred:.*?-->/g, '')
    .replace(/<!--party:.*?-->/g, '')
    .trim();

  const detPos = getDeterministicPosition(rowId || 'default', party_code);

  return {
    id: rowId,
    sender_name: String(row.sender_name || 'ผู้ร่วมลอยกระทง'),
    secondary_name: row.second_name ? String(row.second_name) : row.secondary_name ? String(row.secondary_name) : null,
    mode: (row.float_mode || row.mode || 'solo') as FloatingMode,
    faculty: cleanFaculty || 'บุคคลทั่วไป',
    wish: cleanWish,
    wish_category: cat,
    base_type,
    flower_type: (row.flower_type || 'lotus') as FlowerType,
    candle_type,
    sacred_items,
    party_code,
    party_time,
    bless_count: typeof row.bless_count === 'number' ? row.bless_count : 0,
    pos_x: typeof row.pos_x === 'number' ? row.pos_x : detPos.pos_x,
    pos_y: typeof row.pos_y === 'number' ? Math.min(71, Math.max(48, row.pos_y)) : detPos.pos_y,
    scale: typeof row.scale === 'number' ? row.scale : detPos.scale,
    created_at: String(row.created_at || new Date().toISOString()),
  };
}

/**
 * ดึงรายการกระทงที่ผู้ใช้สร้างไว้ในโหมดทดลองจาก LocalStorage
 */
function getLocalCustomKrathongs(): Krathong[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_CUSTOM_KRATHONGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * บันทึกกระทงใหม่ในโหมดทดลองลง LocalStorage
 */
function saveLocalCustomKrathong(item: Krathong): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalCustomKrathongs();
    current.unshift(item);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_KRATHONGS, JSON.stringify(current));
  } catch (err) {
    console.warn('Unable to save local custom krathong:', err);
  }
}

/**
 * ดึงรายการกระทงล่าสุดสูงสุด 150 รายการ (ครอบคลุมประวัติกระทงทั้งหมดในสระ)
 */
export async function fetchLatestKrathongs(): Promise<{ krathongs: Krathong[]; isDemo: boolean }> {
  if (isDemoMode() || !supabase) {
    const customItems = getLocalCustomKrathongs();
    const combined = [...customItems, ...DEMO_KRATHONGS].slice(0, 150);
    return { krathongs: combined, isDemo: true };
  }

  try {
    const { data, error } = await supabase
      .from('krathongs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(150);

    if (error || !data) {
      console.warn('Supabase fetch error, falling back to demo mode:', error);
      const customItems = getLocalCustomKrathongs();
      return { krathongs: [...customItems, ...DEMO_KRATHONGS].slice(0, 150), isDemo: true };
    }

    const mapped = (data as Record<string, unknown>[]).map(mapRowToKrathong);
    return { krathongs: mapped, isDemo: false };
  } catch (err) {
    console.warn('Supabase fetch exception, fallback to demo:', err);
    return { krathongs: DEMO_KRATHONGS, isDemo: true };
  }
}

/**
 * ดึงข้อมูลกระทงตาม ID
 */
export async function fetchKrathongById(id: string): Promise<Krathong | null> {
  if (!id) return null;

  // ค้นหาในกระทงที่สร้างไว้ในเครื่องก่อน
  const localItems = getLocalCustomKrathongs();
  const foundLocal = localItems.find((k) => k.id === id);
  if (foundLocal) return foundLocal;

  // ค้นหาในข้อมูลตัวอย่าง (Demo)
  const foundDemo = DEMO_KRATHONGS.find((k) => k.id === id);
  if (foundDemo) return foundDemo;

  if (isDemoMode() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('krathongs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapRowToKrathong(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * สร้างและปล่อยกระทงใหม่สู่สระน้ำ
 */
export async function createKrathong(input: KrathongInput): Promise<{ success: boolean; krathong?: Krathong; error?: string }> {
  // หากอยู่ในโหมดทดลอง (Demo Mode)
  if (isDemoMode() || !supabase) {
    const newId = 'demo-k-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const detPos = getDeterministicPosition(newId, input.party_code);
    const newKrathong: Krathong = {
      id: newId,
      sender_name: input.sender_name.trim(),
      secondary_name: input.secondary_name ? input.secondary_name.trim() : null,
      mode: input.mode,
      faculty: input.faculty,
      wish: input.wish.trim(),
      wish_category: input.wish_category,
      base_type: input.base_type,
      flower_type: input.flower_type,
      candle_type: input.candle_type,
      sacred_items: input.sacred_items || [],
      party_code: input.party_code,
      party_time: input.party_time,
      bless_count: 1,
      pos_x: detPos.pos_x,
      pos_y: detPos.pos_y,
      scale: detPos.scale,
      created_at: new Date().toISOString(),
      is_local: true,
    };

    saveLocalCustomKrathong(newKrathong);
    saveMyKrathongId(newId);
    return { success: true, krathong: newKrathong };
  }

  // หากเชื่อมต่อ Supabase
  try {
    // ฐานและเทียนที่ฐานข้อมูล Supabase อนุญาตผ่าน Check Constraints
    const ALLOWED_DB_BASES = ['banana-leaf', 'lotus-base', 'bread', 'coconut'];
    const ALLOWED_DB_CANDLES = ['traditional', 'pastel-minimal', 'twin-love'];
    const dbBase = ALLOWED_DB_BASES.includes(input.base_type) ? input.base_type : 'banana-leaf';
    const dbCandle = ALLOWED_DB_CANDLES.includes(input.candle_type) ? input.candle_type : 'traditional';

    // บันทึก Metadata พิเศษ (ก๊วนเพื่อนนำหน้าเพื่อความปลอดภัยสูงสุด, ฐานคณะ, เทียน, ของสะเดาะเคราะห์)
    const metaParts: string[] = [];
    if (input.party_code) {
      metaParts.push(`p:${input.party_code}`);
      if (input.party_time) {
        metaParts.push(`t:${input.party_time}`);
      }
    }
    metaParts.push(`b:${input.base_type}`);
    metaParts.push(`c:${input.candle_type}`);
    if (input.sacred_items && input.sacred_items.length > 0) {
      metaParts.push(`s:${input.sacred_items.join(',')}`);
    }
    const metaTag = `[${metaParts.join('|')}]`;
    const cleanFaculty = (input.faculty || 'บุคคลทั่วไป').trim();
    const facultyWithMeta = `${cleanFaculty}${metaTag}`.slice(0, 100);

    // ควบคุมความยาวคำขอให้ไม่เกิน 140 ตัวอักษร เพื่อผ่าน RLS Policy ของ Supabase 100%
    const cleanWish = input.wish.trim().slice(0, 140);

    // 1. ส่งข้อมูลตามโครงสร้างตารางหลักที่ตรวจพบ (float_mode, second_name, krathong_base, หมวดภาษาไทย)
    const userDbPayload = {
      float_mode: input.mode,
      sender_name: input.sender_name.trim().slice(0, 50),
      second_name: input.secondary_name ? input.secondary_name.trim().slice(0, 50) : null,
      faculty: facultyWithMeta,
      wish: cleanWish,
      wish_category: CATEGORY_TO_THAI[input.wish_category] || input.wish_category,
      krathong_base: dbBase,
      flower_type: input.flower_type,
      candle_type: dbCandle,
      bless_count: 0,
    };

    let { data, error } = await supabase
      .from('krathongs')
      .insert([userDbPayload])
      .select()
      .single();

    // 2. หากตารางใช้ schema อีกแบบ ให้ลองสำรอง
    if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
      const fallbackPayload = {
        mode: input.mode,
        sender_name: input.sender_name.trim().slice(0, 50),
        secondary_name: input.secondary_name ? input.secondary_name.trim().slice(0, 50) : null,
        faculty: facultyWithMeta,
        wish: cleanWish,
        wish_category: input.wish_category,
        base_type: dbBase,
        flower_type: input.flower_type,
        candle_type: dbCandle,
        bless_count: 0,
      };
      const retry = await supabase
        .from('krathongs')
        .insert([fallbackPayload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.warn('Supabase insert warning, saving locally:', error);
      // Fallback ป้องกันผู้ใช้ติดขัด บันทึกในเบราว์เซอร์ให้ทันที
      const fallbackId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const fallbackPos = getDeterministicPosition(fallbackId, input.party_code);
      const fallbackKrathong: Krathong = {
        id: fallbackId,
        sender_name: input.sender_name.trim(),
        secondary_name: input.secondary_name ? input.secondary_name.trim() : null,
        mode: input.mode,
        faculty: cleanFaculty,
        wish: cleanWish,
        wish_category: input.wish_category,
        base_type: input.base_type,
        flower_type: input.flower_type,
        candle_type: input.candle_type,
        sacred_items: input.sacred_items,
        party_code: input.party_code,
        party_time: input.party_time,
        bless_count: 0,
        pos_x: fallbackPos.pos_x,
        pos_y: fallbackPos.pos_y,
        scale: fallbackPos.scale,
        created_at: new Date().toISOString(),
        is_local: true,
      };
      saveLocalCustomKrathong(fallbackKrathong);
      saveMyKrathongId(fallbackId);
      return { success: true, krathong: fallbackKrathong };
    }

    const created = mapRowToKrathong(data as Record<string, unknown>);
    saveMyKrathongId(created.id);
    return { success: true, krathong: created };
  } catch (err) {
    console.warn('Create krathong exception, saving locally:', err);
    const cleanFaculty = (input.faculty || 'บุคคลทั่วไป').trim();
    const fallbackId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fallbackPos = getDeterministicPosition(fallbackId, input.party_code);
    const fallbackKrathong: Krathong = {
      id: fallbackId,
      sender_name: input.sender_name.trim(),
      secondary_name: input.secondary_name ? input.secondary_name.trim() : null,
      mode: input.mode,
      faculty: cleanFaculty,
      wish: input.wish.trim().slice(0, 140),
      wish_category: input.wish_category,
      base_type: input.base_type,
      flower_type: input.flower_type,
      candle_type: input.candle_type,
      sacred_items: input.sacred_items,
      party_code: input.party_code,
      party_time: input.party_time,
      bless_count: 0,
      pos_x: fallbackPos.pos_x,
      pos_y: fallbackPos.pos_y,
      scale: fallbackPos.scale,
      created_at: new Date().toISOString(),
      is_local: true,
    };
    saveLocalCustomKrathong(fallbackKrathong);
    saveMyKrathongId(fallbackId);
    return { success: true, krathong: fallbackKrathong };
  }
}

/**
 * ร่วมอธิษฐาน (Blessing) ให้กับกระทง
 * ป้องกันการกดซ้ำด้วย voter_id ใน LocalStorage และระบบ RPC หลังบ้าน
 */
export async function blessKrathong(krathongId: string): Promise<BlessResult> {
  const voterId = getOrCreateVoterId();

  // โหมดทดลอง (Demo Mode)
  if (isDemoMode() || !supabase || krathongId.startsWith('demo-')) {
    markKrathongVoted(krathongId);

    const customItems = getLocalCustomKrathongs();
    const itemIndex = customItems.findIndex((k) => k.id === krathongId);
    if (itemIndex >= 0) {
      customItems[itemIndex].bless_count = (customItems[itemIndex].bless_count || 0) + 1;
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_KRATHONGS, JSON.stringify(customItems));
      return {
        success: true,
        message: 'ร่วมอธิษฐานสำเร็จ ขอให้คำอธิษฐานสมหวัง',
        bless_count: customItems[itemIndex].bless_count,
      };
    }

    const demoItem = DEMO_KRATHONGS.find((k) => k.id === krathongId);
    if (demoItem) {
      demoItem.bless_count = (demoItem.bless_count || 0) + 1;
      return {
        success: true,
        message: 'ร่วมอธิษฐานสำเร็จ ขอให้คำอธิษฐานสมหวัง',
        bless_count: demoItem.bless_count,
      };
    }

    return {
      success: true,
      message: 'ร่วมอธิษฐานสำเร็จ ขอให้คำอธิษฐานสมหวัง',
      bless_count: 1,
    };
  }

  // โหมดเชื่อมต่อ Supabase จริง
  try {
    markKrathongVoted(krathongId);

    // 1. เรียกใช้ RPC: increment_bless
    const { data, error } = await supabase.rpc('increment_bless', {
      row_id: krathongId,
      voter_id: voterId,
    });

    if (!error && data) {
      const res = data as { success?: boolean; message?: string; bless_count?: number } | number;
      const count = typeof res === 'number' ? res : (typeof res?.bless_count === 'number' ? res.bless_count : 1);
      return {
        success: true,
        message: 'ร่วมอธิษฐานสำเร็จ ขอให้คำอธิษฐานสมหวัง',
        bless_count: count,
      };
    }

    // 2. Direct Update Fallback (กรณีที่ยังไม่ได้รันฟังก์ชัน RPC ใน Supabase)
    let currentCount = 0;
    try {
      const { data: curRow } = await supabase
        .from('krathongs')
        .select('bless_count')
        .eq('id', krathongId)
        .maybeSingle();

      if (typeof curRow?.bless_count === 'number') {
        currentCount = curRow.bless_count;
      }
    } catch {
      currentCount = 0;
    }

    const nextCount = currentCount + 1;

    const { error: updateErr } = await supabase
      .from('krathongs')
      .update({ bless_count: nextCount })
      .eq('id', krathongId);

    if (updateErr) {
      console.warn('Direct bless update notice:', updateErr);
    }

    // บันทึกลงตารางปฏิกิริยา (krathong_reactions หรือ krathong_blessings)
    try {
      await supabase.from('krathong_reactions').insert({
        krathong_id: krathongId,
        voter_id: voterId,
      });
    } catch {}

    return {
      success: true,
      message: 'ร่วมอธิษฐานสำเร็จ ขอให้คำอธิษฐานสมหวัง',
      bless_count: nextCount,
    };
  } catch (err) {
    console.warn('Bless krathong exception:', err);
    markKrathongVoted(krathongId);
    return {
      success: true,
      message: 'ร่วมอธิษฐานสำเร็จ ขอให้คำอธิษฐานสมหวัง',
      bless_count: 1,
    };
  }
}

/**
 * คำนวณสถิติภาพรวมของสระน้ำ
 */
export function calculatePondStats(krathongs: Krathong[]): PondStats {
  let totalBlessings = 0;
  const facultyCounts: Record<string, number> = {};
  const categoryCounts: Record<WishCategory, number> = {
    study: 0,
    career: 0,
    love: 0,
    health: 0,
  };

  for (const fac of FACULTIES) {
    facultyCounts[fac] = 0;
  }

  for (const item of krathongs) {
    totalBlessings += item.bless_count || 0;
    if (facultyCounts[item.faculty] !== undefined) {
      facultyCounts[item.faculty] += 1;
    } else {
      facultyCounts[item.faculty] = 1;
    }

    if (categoryCounts[item.wish_category] !== undefined) {
      categoryCounts[item.wish_category] += 1;
    }
  }

  const facultyDistribution = Object.entries(facultyCounts)
    .map(([faculty, count]) => ({ faculty, count }))
    .sort((a, b) => b.count - a.count);

  const categoryDistribution: { category: WishCategory; count: number }[] = [
    { category: 'study', count: categoryCounts.study },
    { category: 'career', count: categoryCounts.career },
    { category: 'love', count: categoryCounts.love },
    { category: 'health', count: categoryCounts.health },
  ];

  return {
    totalKrathongs: krathongs.length,
    totalBlessings,
    facultyDistribution,
    categoryDistribution,
  };
}
