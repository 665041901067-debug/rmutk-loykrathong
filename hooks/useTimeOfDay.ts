'use client';

import { useState, useEffect } from 'react';
import { TimeOfDay } from '@/types';

export interface TimeModeInfo {
  mode: TimeOfDay;
  label: string;
  description: string;
  isDark: boolean;
  hasMoon: boolean;
  hasStars: boolean;
}

export const TIME_MODES: Record<TimeOfDay, TimeModeInfo> = {
  day: {
    mode: 'day',
    label: 'กลางวัน (05:00 - 16:59)',
    description: 'แดดอบอุ่นยามบ่าย ท้องฟ้าโปร่งและสระน้ำใสสะท้อนประกายแดด',
    isDark: false,
    hasMoon: false,
    hasStars: false,
  },
  twilight: {
    mode: 'twilight',
    label: 'ยามพลบค่ำ (17:00 - 18:59)',
    description: 'แสงอาทิตย์อัสดงสีทองส้มอบอุ่น เริ่มจุดโคมไฟรอบศาลาไทยริมสระ',
    isDark: false,
    hasMoon: false,
    hasStars: false,
  },
  moonlight: {
    mode: 'moonlight',
    label: 'ใต้แสงจันทร์ (19:00 - 22:59)',
    description: 'จันทร์เพ็ญทอแสงนวลผ่อง บรรยากาศงานลอยกระทงอบอวลด้วยแสงเทียน',
    isDark: true,
    hasMoon: true,
    hasStars: true,
  },
  'late-night': {
    mode: 'late-night',
    label: 'ดึกสงัด (23:00 - 04:59)',
    description: 'สระน้ำนิ่งสงบ แสงดาวพร่างพรายกระทบผิวน้ำแห่งสมาธิและคำอธิษฐาน',
    isDark: true,
    hasMoon: true,
    hasStars: true,
  },
};

/**
 * คำนวณช่วงเวลาจากนาฬิกาของเครื่องผู้ใช้
 */
export function getCurrentTimeOfDay(customHour?: number): TimeOfDay {
  const hour = customHour !== undefined ? customHour : new Date().getHours();

  if (hour >= 5 && hour < 17) {
    return 'day';
  } else if (hour >= 17 && hour < 19) {
    return 'twilight';
  } else if (hour >= 19 && hour < 23) {
    return 'moonlight';
  } else {
    return 'late-night';
  }
}

/**
 * Hook สำหรับติดตามช่วงเวลาตามนาฬิกาของอุปกรณ์ (พร้อมความสามารถในการทดสอบเปลี่ยนช่วงเวลา)
 */
export function useTimeOfDay(overrideMode?: TimeOfDay | null) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('moonlight'); // Default to atmospheric moonlight for Loy Krathong until hydrated

  useEffect(() => {
    if (overrideMode) {
      setTimeOfDay(overrideMode);
      return;
    }

    // อัปเดตทันทีเมื่อโหลดบน Client
    setTimeOfDay(getCurrentTimeOfDay());

    // ตรวจสอบทุกๆ 60 วินาที (low-frequency schedule) เพื่อลดภาระเครื่อง
    const interval = setInterval(() => {
      setTimeOfDay(getCurrentTimeOfDay());
    }, 60000);

    return () => clearInterval(interval);
  }, [overrideMode]);

  return {
    timeOfDay,
    modeInfo: TIME_MODES[timeOfDay],
  };
}
