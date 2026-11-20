/**
 * จัดการข้อมูล LocalStorage ภายในบราวเซอร์ของผู้ใช้
 * หมายเหตุความปลอดภัย: ข้อมูลใน LocalStorage (เช่น voter_id และ cooldown) เป็นเพียงการป้องกัน
 * การกดซ้ำระดับเบื้องต้นเท่านั้น ไม่ใช่การยืนยันตัวตนที่ปลอดภัยเทียบเท่าระบบสมาชิก
 */

const STORAGE_KEYS = {
  VOTER_ID: 'rmutk_loykrathong_voter_id',
  MY_KRATHONGS: 'rmutk_loykrathong_my_ids',
  VOTED_KRATHONGS: 'rmutk_loykrathong_voted_ids',
  LAST_SUBMISSION_TIME: 'rmutk_loykrathong_last_submit',
  FONT_SIZE: 'rmutk_loykrathong_font_size',
  LOCAL_KRATHONGS: 'rmutk_loykrathong_local_data',
} as const;

export const SUBMISSION_COOLDOWN_SECONDS = 30;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * สร้าง UUID v4 ที่ถูกต้องตามมาตรฐาน RFC 4122
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * ดึงหรือสร้างรหัสประจำอุปกรณ์ (Voter ID) รูปแบบ UUID v4 เพื่อป้องกันการกดร่วมอธิษฐานซ้ำ
 */
export function getOrCreateVoterId(): string {
  if (!isBrowser()) return '00000000-0000-4000-8000-000000000000';

  try {
    let voterId = localStorage.getItem(STORAGE_KEYS.VOTER_ID);
    // ตรวจสอบว่าเป็น UUID ที่ถูกต้องหรือไม่ หากไม่ใช่ให้สร้างใหม่
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!voterId || !uuidRegex.test(voterId)) {
      voterId = generateUUID();
      localStorage.setItem(STORAGE_KEYS.VOTER_ID, voterId);
    }
    return voterId;
  } catch {
    return generateUUID();
  }
}

/**
 * บันทึก ID กระทงที่ผู้ใช้ร่วมอธิษฐานแล้ว
 */
export function markKrathongVoted(krathongId: string): void {
  if (!isBrowser()) return;
  try {
    const list = getVotedKrathongIds();
    if (!list.includes(krathongId)) {
      list.push(krathongId);
      localStorage.setItem(STORAGE_KEYS.VOTED_KRATHONGS, JSON.stringify(list));
    }
  } catch (err) {
    console.warn('Unable to save voted krathong:', err);
  }
}

/**
 * ตรวจสอบว่าผู้ใช้เคยร่วมอธิษฐานกระทงนี้แล้วหรือไม่
 */
export function hasVotedKrathong(krathongId: string): boolean {
  if (!isBrowser()) return false;
  const list = getVotedKrathongIds();
  return list.includes(krathongId);
}

export function getVotedKrathongIds(): string[] {
  if (!isBrowser()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VOTED_KRATHONGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * บันทึก ID กระทงที่ผู้ใช้คนนี้เป็นผู้ลอย (กระทงของฉัน)
 */
export function saveMyKrathongId(krathongId: string): void {
  if (!isBrowser()) return;
  try {
    const myIds = getMyKrathongIds();
    if (!myIds.includes(krathongId)) {
      myIds.unshift(krathongId);
      localStorage.setItem(STORAGE_KEYS.MY_KRATHONGS, JSON.stringify(myIds));
    }
    // อัปเดตเวลาส่งล่าสุดสำหรับ Cooldown
    localStorage.setItem(STORAGE_KEYS.LAST_SUBMISSION_TIME, Date.now().toString());
  } catch (err) {
    console.warn('Unable to save my krathong ID:', err);
  }
}

/**
 * ดึงรายการ ID กระทงของฉัน
 */
export function getMyKrathongIds(): string[] {
  if (!isBrowser()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MY_KRATHONGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * ตรวจสอบระยะเวลาคูลดาวน์ 30 วินาที
 * ส่งคืนจำนวนวินาทีที่เหลือ หากเหลือ 0 แปลว่าสามารถส่งได้
 */
export function getRemainingCooldownSeconds(): number {
  if (!isBrowser()) return 0;
  try {
    const lastTimeStr = localStorage.getItem(STORAGE_KEYS.LAST_SUBMISSION_TIME);
    if (!lastTimeStr) return 0;

    const lastTime = parseInt(lastTimeStr, 10);
    const elapsed = Math.floor((Date.now() - lastTime) / 1000);
    if (elapsed < SUBMISSION_COOLDOWN_SECONDS) {
      return SUBMISSION_COOLDOWN_SECONDS - elapsed;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * บันทึกขนาดตัวอักษร ('normal' หรือ 'large')
 */
export function saveFontSizePreference(size: 'normal' | 'large'): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size);
  } catch {}
}

export function getFontSizePreference(): 'normal' | 'large' {
  if (!isBrowser()) return 'normal';
  try {
    const val = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
    return val === 'large' ? 'large' : 'normal';
  } catch {
    return 'normal';
  }
}
