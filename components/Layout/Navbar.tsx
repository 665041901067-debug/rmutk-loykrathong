'use client';

import React from 'react';
import { TimeOfDay } from '@/types';
import { TIME_MODES } from '@/hooks/useTimeOfDay';
import { Search, BarChart3, User, Sparkles, Sun, Moon, Sunset, Type } from 'lucide-react';

interface NavbarProps {
  isDemo: boolean;
  timeOfDay: TimeOfDay;
  onTimeChange?: (mode: TimeOfDay) => void;
  onOpenSearch: () => void;
  onOpenStats: () => void;
  onOpenMyKrathongs: () => void;
  onOpenFortune: () => void;
  fontSize: 'normal' | 'large';
  onToggleFontSize: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDemo,
  timeOfDay,
  onTimeChange,
  onOpenSearch,
  onOpenStats,
  onOpenMyKrathongs,
  onOpenFortune,
  fontSize,
  onToggleFontSize,
}) => {
  const timeIcon = () => {
    switch (timeOfDay) {
      case 'day':
        return <Sun className="w-4 h-4 text-amber-300" />;
      case 'twilight':
        return <Sunset className="w-4 h-4 text-orange-400" />;
      case 'moonlight':
      case 'late-night':
      default:
        return <Moon className="w-4 h-4 text-yellow-200" />;
    }
  };

  const nextTimeMode = (): TimeOfDay => {
    switch (timeOfDay) {
      case 'day':
        return 'twilight';
      case 'twilight':
        return 'moonlight';
      case 'moonlight':
        return 'late-night';
      case 'late-night':
        return 'day';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-rmutk-midnight/90 backdrop-blur-md border-b border-rmutk-borderMuted select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & University Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rmutk-gold to-amber-700 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-rmutk-midnight flex items-center justify-center border border-rmutk-goldLight/40">
              <span className="font-bold text-xs text-rmutk-goldLight tracking-tighter">
                RMUTK
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-thai">
                ลอยกระทงออนไลน์ มทร.กรุงเทพ
              </h1>
              {isDemo && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">
                  โหมดทดลอง
                </span>
              )}
            </div>
            <p className="text-[11px] text-rmutk-gold/80 font-normal">
              สระน้ำแห่งคำอธิษฐาน • มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Fortune Sticks (เซียมซี) */}
          <button
            type="button"
            onClick={onOpenFortune}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-rmutk-goldLight bg-rmutk-surface/80 border border-rmutk-borderMuted hover:bg-rmutk-surface transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rmutk-gold"
            aria-label="เปิดเซียมซี มทร.กรุงเทพ"
          >
            <Sparkles className="w-4 h-4 text-rmutk-gold" />
            <span className="hidden md:inline">เซียมซี</span>
          </button>

          {/* Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-slate-300 bg-rmutk-surface/80 border border-rmutk-borderMuted hover:bg-rmutk-surface hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rmutk-gold"
            aria-label="ค้นหากระทง"
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">ค้นหา</span>
          </button>

          {/* My Krathongs Button */}
          <button
            type="button"
            onClick={onOpenMyKrathongs}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-slate-300 bg-rmutk-surface/80 border border-rmutk-borderMuted hover:bg-rmutk-surface hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rmutk-gold"
            aria-label="ดูกระทงของฉัน"
          >
            <User className="w-4 h-4" />
            <span className="hidden md:inline">กระทงของฉัน</span>
          </button>

          {/* Stats Button */}
          <button
            type="button"
            onClick={onOpenStats}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-slate-300 bg-rmutk-surface/80 border border-rmutk-borderMuted hover:bg-rmutk-surface hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rmutk-gold"
            aria-label="สถิติสระน้ำ"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden md:inline">สถิติ</span>
          </button>

          {/* Time of Day Toggle */}
          {onTimeChange && (
            <button
              type="button"
              onClick={() => onTimeChange(nextTimeMode())}
              className="p-2 rounded-xl bg-rmutk-surface/80 border border-rmutk-borderMuted hover:bg-rmutk-surface text-slate-300 transition-colors flex items-center gap-1 text-xs focus:outline-none focus:ring-2 focus:ring-rmutk-gold"
              title={`บรรยากาศ: ${TIME_MODES[timeOfDay].label} (คลิกเพื่อสลับ)`}
              aria-label={`สลับเวลาบรรยากาศ ปัจจุบันคือ ${TIME_MODES[timeOfDay].label}`}
            >
              {timeIcon()}
              <span className="hidden lg:inline text-[11px] text-slate-400">
                {timeOfDay === 'day' ? 'กลางวัน' : timeOfDay === 'twilight' ? 'พลบค่ำ' : timeOfDay === 'moonlight' ? 'แสงจันทร์' : 'ดึกสงัด'}
              </span>
            </button>
          )}

          {/* Font Size Toggle */}
          <button
            type="button"
            onClick={onToggleFontSize}
            className="p-2 rounded-xl bg-rmutk-surface/80 border border-rmutk-borderMuted hover:bg-rmutk-surface text-slate-300 hover:text-white transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rmutk-gold"
            title={`ปรับขนาดอักษร: ปัจจุบันคือ ${fontSize === 'large' ? 'ใหญ่ (ก+)' : 'ปกติ (ก)'}`}
            aria-label="สลับขนาดตัวอักษร"
          >
            <span className="text-xs font-bold text-rmutk-goldLight">
              {fontSize === 'large' ? 'ก+' : 'ก'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
