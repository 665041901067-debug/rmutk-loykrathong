'use client';

import React, { useState } from 'react';
import { X, Sparkles, PenLine, ChevronDown } from 'lucide-react';
import { sound } from '@/lib/sound';

interface SkyLanternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReleaseLantern: (wish: string, senderName: string) => void;
}

export const SkyLanternModal: React.FC<SkyLanternModalProps> = ({
  isOpen,
  onClose,
  onReleaseLantern,
}) => {
  const [wish, setWish] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  if (!isOpen) return null;

  // Gen-Z Universal Wishes (คำขอกลางๆ ยอดฮิต ทัชใจวัยรุ่น)
  const genzQuickWishes = [
    'ขอให้โลกใบนี้ใจดีกับเรา ยิ้มได้เยอะๆ ในทุกวัน',
    'ลอยเรื่องแย่ๆ ทิ้งไป ขอให้ต่อจากนี้มีแต่เรื่องดีๆ',
    'สอบผ่านฉลุยทุกวิชา เกรดออกมาน่ารักสมความตั้งใจ',
    'เงินเข้าบัญชีรัวๆ มีใช้ไม่ขาดมือ เปย์ตัวเองได้ฟินๆ',
    'เจอคนที่พอดี เข้าใจกัน และเป็นเซฟโซนให้กันเสมอ',
    'ขอให้คนคุยชัดเจน เลิกดองแชท มีแฟนก่อนปีใหม่',
    'นอนหลับเต็มอิ่ม สุขภาพแข็งแรง ไม่ปวดหลัง',
    'ขอให้ได้ทำในสิ่งที่รัก และเติบโตอย่างมีความสุข',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wish.trim() || isLaunching) return;

    setIsLaunching(true);
    sound.playTempleBell();
    sound.playSparkle();

    // Trigger stunning launch animation then deliver to pond scene
    setTimeout(() => {
      onReleaseLantern(wish.trim(), senderName.trim() || 'เด็ก มทร.');
      setIsLaunching(false);
      setWish('');
      setSenderName('');
      onClose();
    }, 1100);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lantern-modal-title"
    >
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 w-full max-w-md rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden text-slate-100 relative flex flex-col max-h-[92dvh]">
        {/* Glowing Top Amber Flare */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent blur-sm pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h3 id="lantern-modal-title" className="text-base font-bold text-white">
              ปล่อยโคมลอยอธิษฐานสู่ฟากฟ้า
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Scrollable Content Body */}
          <div className="p-3.5 sm:p-4 flex flex-col items-center flex-1 overflow-y-auto overscroll-contain no-scrollbar space-y-2.5">
            {/* WOW Interactive Live Lantern Graphic (Compact & Responsive) */}
            <div className="w-full flex flex-col items-center relative min-h-[130px] justify-center overflow-hidden">
              {/* Ascending Fire Sparks when Launching */}
              {isLaunching && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-200 rounded-full animate-ping" />
                  <div className="absolute w-24 h-24 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
                </div>
              )}

              {/* Glowing Lantern with Live Inscribed Wish */}
              <div
                className={`relative transition-all duration-1000 ease-out flex flex-col items-center ${
                  isLaunching
                    ? '-translate-y-48 scale-90 opacity-0'
                    : 'animate-floatSlow'
                }`}
              >
                {/* Lantern Body */}
                <div className="relative w-24 h-30 bg-gradient-to-t from-amber-500 via-amber-300 to-amber-100 rounded-t-3xl rounded-b-lg shadow-[0_0_30px_rgba(251,191,36,0.85)] border-2 border-amber-300 flex flex-col items-center justify-center p-2.5 text-center overflow-hidden">
                  {/* Fire light flicker behind text */}
                  <div className="absolute bottom-2 w-9 h-9 bg-amber-200/90 rounded-full blur-md animate-pulse" />

                  {/* Real-time Wish Text Inscription */}
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <p className="text-slate-950 font-bold text-xs leading-snug font-thai line-clamp-3">
                      {wish.trim() ? `“${wish}”` : 'พิมพ์คำอธิษฐานของคุณ...'}
                    </p>
                    {senderName.trim() && (
                      <span className="text-[10px] text-amber-900 font-bold mt-1 bg-amber-400/50 px-2 py-0.5 rounded-full truncate max-w-[85px]">
                        {senderName}
                      </span>
                    )}
                  </div>

                  {/* Inner Flame Bead */}
                  <div className="absolute bottom-2.5 w-2.5 h-2.5 bg-white rounded-full blur-[1px] animate-ping" />
                </div>

                {/* Wooden Base Ring */}
                <div className="w-10 h-1.5 bg-amber-800 rounded-full mt-1 shadow" />
              </div>

              <p className="text-[11px] text-amber-200/90 mt-1 text-center font-medium">
                {isLaunching ? 'โคมลอยกำลังทะยานขึ้นสู่ท้องฟ้าราตรี...' : 'คำขอของคุณจะถูกสลักลงบนโคมลอยเรืองแสง'}
              </p>
            </div>

            {/* Sender Name */}
            <div className="w-full">
              <label className="block text-xs text-slate-300 mb-1 font-medium">
                ชื่อของคุณ (หรือปล่อยว่างเป็นนิรนามได้)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="เช่น บังวี หรือ เด็ก มทร."
                maxLength={24}
                disabled={isLaunching}
                className="w-full h-10.5 px-4 rounded-2xl bg-white/[0.05] border border-white/15 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>

            {/* Wish Input - Prominent & Clearly Editable */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5 text-amber-400" />
                  <span>พิมพ์คำอธิษฐานบนโคมลอย (แตะเขียนที่นี่) *</span>
                </label>
                <span className="text-xs text-amber-300/80 font-semibold">{wish.length}/80</span>
              </div>
              <textarea
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder="แตะที่นี่เพื่อพิมพ์คำอธิษฐาน เช่น ขอให้โลกใจดีกับเรา, สอบผ่านเกรดน่ารัก..."
                rows={2}
                maxLength={80}
                required
                disabled={isLaunching}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-800/95 border-2 border-amber-400/60 hover:border-amber-400 focus:border-amber-400 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-400/25 resize-none font-thai shadow-[0_0_18px_rgba(251,191,36,0.15)] font-medium leading-relaxed"
              />
            </div>

            {/* Gen-Z Quick Wish Presets - Clean Minimal Dropdown */}
            <div className="w-full space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="quick-wish-select" className="text-xs text-slate-300 block font-medium">
                  หรือเลือกจากคำขอยอดฮิต:
                </label>
                <span className="text-[11px] text-amber-300/70">เลือกเพื่อดึงลงช่องพิมพ์</span>
              </div>
              <div className="relative">
                <select
                  id="quick-wish-select"
                  value={genzQuickWishes.includes(wish) ? wish : ''}
                  onChange={(e) => {
                    if (e.target.value) setWish(e.target.value);
                  }}
                  disabled={isLaunching}
                  className="w-full h-10.5 bg-slate-800/90 border border-white/20 hover:border-amber-400/50 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-amber-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    -- แตะเพื่อเลือกคำขอยอดฮิตโดนใจ --
                  </option>
                  {genzQuickWishes.map((qw, idx) => (
                    <option key={idx} value={qw} className="bg-slate-900 text-white py-1.5">
                      {qw}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-amber-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Prominent Pinned Action Footer */}
          <div className="p-3.5 sm:p-4 border-t border-white/10 bg-slate-900/95 backdrop-blur-xl flex-shrink-0 w-full flex flex-col items-center gap-1.5">
            <button
              type="submit"
              disabled={!wish.trim() || isLaunching}
              className={`w-full h-12 sm:h-13 rounded-2xl font-black text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer select-none tracking-wide ${
                !wish.trim() || isLaunching
                  ? 'bg-amber-500/20 text-amber-200/40 border border-amber-400/20 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-2 border-amber-200/90 shadow-[0_0_28px_rgba(251,191,36,0.65)] hover:shadow-[0_0_40px_rgba(251,191,36,0.9)] active:scale-95'
              }`}
            >
              <Sparkles className={`w-5 h-5 ${wish.trim() && !isLaunching ? 'text-slate-950 animate-bounce' : 'text-amber-200/30'}`} />
              <span>{isLaunching ? 'กำลังจุดไฟปล่อยโคม...' : 'ปล่อยโคมลอยขึ้นสู่ฟ้า'}</span>
            </button>
            {!wish.trim() && !isLaunching && (
              <span className="text-[11px] text-amber-300/80 font-medium">
                แตะเลือกคำขอด้านบน หรือพิมพ์คำอธิษฐานเพื่อปล่อยโคม
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
