import { KrathongInput } from '@/types';
import { containsProfanity } from './profanity';
import { FACULTIES } from '@/data/faculties';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// Regex to detect dangerous HTML/script tags
const SCRIPT_REGEX = /<[a-z][\s\S]*>/i;

// Regex for standard UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * ตรวจสอบความถูกต้องของ UUID
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid) return false;
  // Support both standard UUID and demo id patterns like demo-101
  return UUID_REGEX.test(uuid) || /^demo-\d+$/i.test(uuid);
}

/**
 * ล้างช่องว่างและอักขระพิเศษ
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text.trim();
}

/**
 * ตรวจสอบข้อมูลก่อนสร้างกระทง
 * ข้อจำกัด: การตรวจสอบฝั่ง Client และ localStorage เป็นเพียงมาตรการเบื้องต้นเพื่อความสะดวกของผู้ใช้
 * ไม่สามารถทดแทนการป้องกันการสแปมที่สมบูรณ์แบบบนระบบหลังบ้านได้
 */
export function validateKrathongInput(input: KrathongInput): ValidationResult {
  const errors: Record<string, string> = {};

  const sender = sanitizeText(input.sender_name);
  if (!sender) {
    errors.sender_name = 'กรุณาระบุชื่อผู้ลอยกระทง';
  } else if (sender.length > 50) {
    errors.sender_name = 'ชื่อต้องมีความยาวไม่เกิน 50 ตัวอักษร';
  } else if (SCRIPT_REGEX.test(sender)) {
    errors.sender_name = 'ชื่อประกอบด้วยอักขระที่ไม่ได้รับอนุญาต';
  } else if (containsProfanity(sender)) {
    errors.sender_name = 'กรุณาใช้ถ้อยคำที่สุภาพและเหมาะสม';
  }

  if (input.mode === 'couple') {
    const secondary = sanitizeText(input.secondary_name || '');
    if (!secondary) {
      errors.secondary_name = 'กรุณาระบุชื่อคนที่คุณอยากลอยคู่ด้วย';
    } else if (secondary.length > 50) {
      errors.secondary_name = 'ชื่อต้องมีความยาวไม่เกิน 50 ตัวอักษร';
    } else if (SCRIPT_REGEX.test(secondary)) {
      errors.secondary_name = 'ชื่อประกอบด้วยอักขระที่ไม่ได้รับอนุญาต';
    } else if (containsProfanity(secondary)) {
      errors.secondary_name = 'กรุณาใช้ถ้อยคำที่สุภาพและเหมาะสม';
    }
  }

  if (!input.faculty || !FACULTIES.includes(input.faculty)) {
    errors.faculty = 'กรุณาเลือกคณะหรือหน่วยงานที่สังกัด';
  }

  const wish = sanitizeText(input.wish);
  if (!wish) {
    errors.wish = 'กรุณาระบุคำอธิษฐานของคุณ';
  } else if (wish.length > 140) {
    errors.wish = 'คำอธิษฐานต้องไม่เกิน 140 ตัวอักษร';
  } else if (SCRIPT_REGEX.test(wish)) {
    errors.wish = 'คำอธิษฐานประกอบด้วยอักขระที่ไม่ได้รับอนุญาต';
  } else if (containsProfanity(wish)) {
    errors.wish = 'กรุณาใช้ถ้อยคำอธิษฐานที่สุภาพและสร้างสรรค์';
  }

  const validCategories = ['study', 'career', 'love', 'health'];
  if (!validCategories.includes(input.wish_category)) {
    errors.wish_category = 'หมวดหมู่คำอธิษฐานไม่ถูกต้อง';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
