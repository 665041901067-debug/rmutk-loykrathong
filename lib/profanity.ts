/**
 * รายการคำไม่สุภาพและคำต้องห้าม (Profanity Filter)
 * สามารถเพิ่มหรือแก้ไขคำต้องห้ามได้ที่ไฟล์นี้
 */
export const PROFANITY_LIST: readonly string[] = [
  'ควย',
  'เย็ด',
  'เหี้ย',
  'สัส',
  'สันดาน',
  'หน้าหมา',
  'ดอกทอง',
  'มึง',
  'กู',
  'อีดอก',
  'ไอ้สัตว์',
  'แม่ง',
  'กวนตีน',
  'เสือก',
  'จิ๋ม',
  'หำ',
  'fuck',
  'shit',
  'bitch',
  'dick',
  'pussy',
  'asshole',
] as const;

/**
 * ตรวจสอบว่าข้อความมีคำไม่สุภาพหรือไม่
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const clean = text.toLowerCase().replace(/[\s\-_.]/g, '');
  return PROFANITY_LIST.some((word) => clean.includes(word.toLowerCase()));
}
