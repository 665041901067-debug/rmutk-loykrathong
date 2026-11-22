'use client';

import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col items-center flex-1 overflow-y-auto overscroll-contain no-scrollbar">
          {/* WOW Interactive Live Lantern Graphic */}
          <div className="my-2 w-full flex flex-col items-center relative min-h-[170px] justify-center overflow-hidden">
            {/* Ascending Fire Sparks when Launching */}
            {isLaunching && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-200 rounded-full animate-ping" />
                <div className="absolute w-28 h-28 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
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
              <div className="relative w-28 h-36 bg-gradient-to-t from-amber-500 via-amber-300 to-amber-100 rounded-t-3xl rounded-b-lg shadow-[0_0_35px_rgba(251,191,36,0.85)] border-2 border-amber-300 flex flex-col items-center justify-center p-3 text-center overflow-hidden">
                {/* Fire light flicker behind text */}
                <div className="absolute bottom-2 w-10 h-10 bg-amber-200/90 rounded-full blur-md animate-pulse" />

                {/* Real-time Wish Text Inscription */}
                <div className="relative z-10 w-full flex flex-col items-center">
                  <p className="text-slate-950 font-bold text-xs leading-snug font-thai line-clamp-3">
                    {wish.trim() ? `“${wish}”` : 'พิมพ์คำอธิษฐานของคุณ...'}
                  </p>
                  {senderName.trim() && (
                    <span className="text-[10px] text-amber-900 font-bold mt-1 bg-amber-400/50 px-2 py-0.5 rounded-full truncate max-w-[90px]">
                      {senderName}
                    </span>
                  )}
                </div>

                {/* Inner Flame Bead */}
                <div className="absolute bottom-3 w-3 h-3 bg-white rounded-full blur-[1px] animate-ping" />
              </div>

              {/* Wooden Base Ring */}
              <div className="w-12 h-1.5 bg-amber-800 rounded-full mt-1 shadow" />
            </div>

            <p className="text-xs text-amber-200/90 mt-2 text-center">
              {isLaunching ? 'โคมลอยกำลังทะยานขึ้นสู่ท้องฟ้าราตรี...' : 'คำขอของคุณจะถูกสลักลงบนโคมลอยเรืองแสง'}
            </p>
          </div>

          {/* Sender Name */}
          <div className="w-full mt-2">
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
              className="w-full h-11 px-4 rounded-2xl bg-white/[0.04] border border-white/15 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Wish Input */}
          <div className="w-full mt-2.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-300 font-medium">
                คำอธิษฐานบนโคมลอย *
              </label>
              <span className="text-xs text-slate-400">{wish.length}/80</span>
            </div>
            <textarea
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder="เขียนคำขอพรของคุณที่นี่..."
              rows={2}
              maxLength={80}
              required
              disabled={isLaunching}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/15 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none font-thai"
            />
          </div>

          {/* Gen-Z Quick Wish Presets (Full Text, Clean 2-column Grid) */}
          <div className="w-full mt-2.5 space-y-1.5">
            <span className="text-xs text-slate-400 block font-medium">คำขอยอดฮิตโดนใจ (แตะเพื่อเลือก):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-0.5 no-scrollbar">
              {genzQuickWishes.map((qw, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setWish(qw)}
                  disabled={isLaunching}
                  className={`text-left text-xs p-2.5 rounded-xl transition-all border leading-snug break-words cursor-pointer ${
                    wish === qw
                      ? 'bg-amber-400/20 border-amber-400/60 text-amber-200 font-medium shadow-sm shadow-amber-500/10'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {qw}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button (Clean Text, No Emojis, Standard Height) */}
          <button
            type="submit"
            disabled={!wish.trim() || isLaunching}
            className="w-full h-11 sm:h-12 mt-4 rounded-full font-bold text-sm bg-gradient-to-r from-amber-400/90 via-amber-300/95 to-amber-500/90 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLaunching ? 'กำลังจุดไฟปล่อยโคม...' : 'ปล่อยโคมลอยขึ้นสู่ฟ้า'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
