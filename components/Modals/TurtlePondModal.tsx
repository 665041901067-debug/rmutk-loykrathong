'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Coins,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  Droplets,
  Share2,
  Check,
  Flame,
  Award,
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface TurtlePondModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TossedCoinEffect {
  id: number;
  x: number;
  y: number;
  label: string;
}

const ANTI_F_BLESSINGS = [
  'ปัดเป่าเกรด F สำเร็จ',
  'คว้าเกรด A วิชาคำนวณ',
  'ผ่านฉลุยวิชาโปรเจกต์',
  'ล้างอาถรรพ์เต่าสระ มทร.',
  'คะแนนสอบมิดเทอมพุ่งทะยาน',
  'อาจารย์ใจดี เมตตาปล่อยเกรด',
  'อ่านตรงข้อสอบ จำแม่นไม่หลุด',
  'เกรดเฉลี่ย 4.00 จงมา',
];

export const TurtlePondModal: React.FC<TurtlePondModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [myCoins, setMyCoins] = useState<number>(0);
  const [activeEffects, setActiveEffects] = useState<TossedCoinEffect[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isTossingBatch, setIsTossingBatch] = useState<boolean>(false);
  const pondRef = useRef<HTMLDivElement>(null);

  // Load saved coins from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('rmutk_turtle_coins');
      if (saved) {
        setMyCoins(parseInt(saved, 10) || 0);
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  // Community total counter (Realistic campus pool + user coins)
  const communityBaseCoins = 3420;
  const totalCoins = communityBaseCoins + myCoins;

  // Anti-F Protection Tier
  const getProtectionRank = (coins: number) => {
    if (coins >= 20) {
      return {
        title: 'เซียนเหรียญมงคล (เกรด A ยกเทอม 4.00)',
        desc: 'อาถรรพ์เต่าสระน้ำสลายสิ้น พลังแห่งความตั้งใจนำพาเกรด A ครบทุกวิชา',
        badgeColor: 'text-amber-300 bg-amber-400/20 border-amber-400/50',
        progress: 100,
      };
    }
    if (coins >= 10) {
      return {
        title: 'ลบอาถรรพ์ F สำเร็จ (ดึงดูดเกรด A)',
        desc: 'ล้างคำสาปเห็นเต่าติด F เรียบร้อย พร้อมเปิดรับโชคใหญ่ช่วงไฟนอล',
        badgeColor: 'text-emerald-300 bg-emerald-400/20 border-emerald-400/50',
        progress: 80,
      };
    }
    if (coins >= 5) {
      return {
        title: 'พลังเกรด B+ (พ้นเขตอันตราย)',
        desc: 'เกราะคุ้มครองเริ่มทำงาน สลายความเสี่ยงติดโปรและดรอปวิชา',
        badgeColor: 'text-cyan-300 bg-cyan-400/20 border-cyan-400/50',
        progress: 50,
      };
    }
    if (coins >= 1) {
      return {
        title: 'เกราะกัน F ระดับ 1 (เริ่มล้างอาถรรพ์)',
        desc: 'เริ่มต้นแก้เคล็ดเสริมสิริมงคล ปัดเป่าความกังวลในการเรียน',
        badgeColor: 'text-indigo-300 bg-indigo-400/20 border-indigo-400/50',
        progress: 25,
      };
    }
    return {
      title: 'ยังไม่ได้โยนเหรียญแก้เคล็ด',
      desc: 'แตะที่ผิวน้ำหรือกดปุ่มเพื่อโยนเหรียญลงบ่อเต่า ปัดเป่าอาถรรพ์เกรด F',
      badgeColor: 'text-slate-400 bg-white/5 border-white/10',
      progress: 5,
    };
  };

  const rank = getProtectionRank(myCoins);

  // Single Coin Toss Trigger
  const triggerTossAt = (targetX: number, targetY: number, customLabel?: string) => {
    sound.playWaterDrop();

    const label =
      customLabel ||
      ANTI_F_BLESSINGS[Math.floor(Math.random() * ANTI_F_BLESSINGS.length)];

    const effectId = Date.now() + Math.random();
    const newEffect: TossedCoinEffect = {
      id: effectId,
      x: targetX,
      y: targetY,
      label,
    };

    setActiveEffects((prev) => [...prev.slice(-8), newEffect]);

    setMyCoins((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('rmutk_turtle_coins', next.toString());
      } catch {}
      return next;
    });

    // Clean up effect after animation finishes
    setTimeout(() => {
      setActiveEffects((prev) => prev.filter((e) => e.id !== effectId));
    }, 1800);
  };

  // Direct Click on Pond Water
  const handlePondClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pondRef.current) return;
    const rect = pondRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    triggerTossAt(clickX, clickY);
  };

  // Multi-coin Batch Toss Button
  const handleBatchToss = (count: number) => {
    if (isTossingBatch || !pondRef.current) return;
    setIsTossingBatch(true);

    const rect = pondRef.current.getBoundingClientRect();
    let current = 0;

    const interval = setInterval(() => {
      const randomX = rect.width * 0.25 + Math.random() * (rect.width * 0.5);
      const randomY = rect.height * 0.35 + Math.random() * (rect.height * 0.4);
      triggerTossAt(randomX, randomY);

      current++;
      if (current >= count) {
        clearInterval(interval);
        setIsTossingBatch(false);
      }
    }, 180);
  };

  // Copy Anti-F Blessing to Share with Friends
  const handleCopyBlessing = () => {
    const text = `โยนเหรียญแก้เคล็ดบ่อเต่า สระน้ำ มทร.กรุงเทพ ลบอาถรรพ์เกรด F สำเร็จแล้ว! สะสมเหรียญมงคล ${myCoins} เหรียญ ขอให้สอบผ่านฉลุย คว้าเกรด A รวดทุกวิชาในเทอมนี้`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="turtle-modal-title"
    >
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-teal-500/30 w-full max-w-lg rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden text-slate-100 relative flex flex-col">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-2 bg-gradient-to-r from-transparent via-teal-400/60 to-transparent blur-sm" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-300" />
            <div>
              <h3 id="turtle-modal-title" className="text-sm sm:text-base font-bold text-white leading-tight">
                บ่อเต่ามงคล สระน้ำ มทร.กรุงเทพ
              </h3>
              <p className="text-[11px] text-teal-300/90">
                โยนเหรียญแก้เคล็ด • ลบอาถรรพ์ F • เสริมสิริมงคลคว้า A
              </p>
            </div>
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

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* Superstition & Lore Context Box */}
          <div className="bg-teal-950/40 border border-teal-500/25 rounded-2xl p-3 text-xs text-teal-100/90 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-teal-200 mb-0.5">
                ความเชื่อชาว มทร.กรุงเทพ:
              </p>
              <p className="text-[11px] text-slate-300">
                ว่ากันว่าใครเห็นเต่าในสระจะติด F แต่สามารถแก้เคล็ดได้ด้วยการโยนเหรียญลงสระน้ำ
                เพื่อเปลี่ยนเคราะห์เป็นโชคใหญ่ พลิกชีวิตสู่เกรด A รวดทุกวิชา!
              </p>
            </div>
          </div>

          {/* INTERACTIVE POND WATER VIEWPORT */}
          <div
            ref={pondRef}
            onClick={handlePondClick}
            className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden cursor-pointer select-none border border-teal-400/30 shadow-inner group"
            style={{
              background:
                'radial-gradient(ellipse at 50% 60%, #113636 0%, #0a2126 50%, #06151a 100%)',
            }}
          >
            {/* Water Caustics & Gentle Waves */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_40%,rgba(45,212,191,0.15),transparent_60%)] animate-pulse" />
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_70%_70%,rgba(251,191,36,0.12),transparent_50%)]" />

            {/* Stylized Minimalist Pond Turtle Illustration on a Zen Stone */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
              {/* Zen Stone under the turtle */}
              <div className="w-36 h-20 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-[50%] border border-slate-600/50 shadow-2xl relative flex items-center justify-center">
                {/* Water ring around the stone */}
                <div className="absolute -inset-2 rounded-[50%] border border-teal-300/25 animate-ping opacity-40" />

                {/* Stylized Geometric Vector Turtle (Clean Minimalist Vector - ZERO AI EMOJI) */}
                <svg
                  width="88"
                  height="72"
                  viewBox="0 0 100 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] animate-floatSlow"
                >
                  {/* Turtle Flippers / Feet */}
                  <ellipse cx="24" cy="26" rx="14" ry="7" fill="#1e3a34" transform="rotate(-25 24 26)" />
                  <ellipse cx="76" cy="26" rx="14" ry="7" fill="#1e3a34" transform="rotate(25 76 26)" />
                  <ellipse cx="26" cy="56" rx="12" ry="6" fill="#172e29" transform="rotate(25 26 56)" />
                  <ellipse cx="74" cy="56" rx="12" ry="6" fill="#172e29" transform="rotate(-25 74 56)" />

                  {/* Turtle Head */}
                  <ellipse cx="50" cy="14" rx="9" ry="12" fill="#2d584e" />
                  <circle cx="46" cy="10" r="1.5" fill="#0d1f1c" />
                  <circle cx="54" cy="10" r="1.5" fill="#0d1f1c" />

                  {/* Turtle Tail */}
                  <polygon points="50,72 47,62 53,62" fill="#1e3a34" />

                  {/* Turtle Shell (Geometric Plates) */}
                  <ellipse cx="50" cy="42" rx="28" ry="24" fill="#204b40" stroke="#3da088" strokeWidth="2" />
                  {/* Central Hexagonal Scutes */}
                  <polygon points="50,26 59,32 59,42 50,48 41,42 41,32" fill="#295f52" stroke="#52be9f" strokeWidth="1.2" />
                  <polygon points="50,48 59,54 59,62 50,66 41,62 41,54" fill="#245549" stroke="#52be9f" strokeWidth="1.2" />
                  {/* Side plates */}
                  <path d="M 41,32 L 26,35 L 26,48 L 41,45 Z" fill="#1b4238" stroke="#3da088" strokeWidth="1" />
                  <path d="M 59,32 L 74,35 L 74,48 L 59,45 Z" fill="#1b4238" stroke="#3da088" strokeWidth="1" />
                  <path d="M 41,45 L 26,48 L 30,60 L 41,54 Z" fill="#163930" stroke="#3da088" strokeWidth="1" />
                  <path d="M 59,45 L 74,48 L 70,60 L 59,54 Z" fill="#163930" stroke="#3da088" strokeWidth="1" />

                  {/* Subtle golden talisman emblem on shell center */}
                  <circle cx="50" cy="37" r="4.5" fill="#fbbf24" fillOpacity="0.85" />
                  <circle cx="50" cy="37" r="6" stroke="#fef08a" strokeWidth="0.8" strokeDasharray="2 2" />
                </svg>
              </div>

              {/* Stone Base Label */}
              <span className="mt-2 text-[10px] text-teal-300/80 font-medium tracking-wide bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                เต่ามงคลประจำสระ มทร.กรุงเทพ
              </span>
            </div>

            {/* Submerged Coins at the bottom of the pond */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[
                { x: 18, y: 75, s: 14, r: 12 },
                { x: 26, y: 82, s: 16, r: -20 },
                { x: 34, y: 72, s: 12, r: 45 },
                { x: 68, y: 78, s: 15, r: 15 },
                { x: 78, y: 84, s: 18, r: -30 },
                { x: 82, y: 70, s: 13, r: 60 },
                { x: 48, y: 85, s: 17, r: -5 },
                { x: 58, y: 82, s: 14, r: 25 },
              ].map((c, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-amber-300/60 bg-gradient-to-br from-amber-300/80 via-amber-500/70 to-amber-700/80 shadow-[0_0_8px_rgba(251,191,36,0.4)] opacity-70 flex items-center justify-center text-[8px] font-bold text-amber-950"
                  style={{
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    width: `${c.s}px`,
                    height: `${c.s}px`,
                    transform: `rotate(${c.r}deg)`,
                  }}
                >
                  A
                </div>
              ))}
            </div>

            {/* Live Interactive Coin Toss FX Elements */}
            {activeEffects.map((eff) => (
              <div
                key={eff.id}
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-30"
                style={{ left: `${eff.x}px`, top: `${eff.y}px` }}
              >
                {/* Water splash ripple rings */}
                <div className="w-12 h-12 rounded-full border-2 border-teal-300/90 bg-teal-400/20 animate-waterTouchRipple" />
                <div className="absolute -inset-2 rounded-full border border-amber-300/70 animate-ping opacity-75" />

                {/* Golden Coin dropping into water */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 border border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.9)] flex items-center justify-center font-extrabold text-[10px] text-amber-950 animate-bounce">
                  A
                </div>

                {/* Floating Blessing Pill Text */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 border border-amber-400/60 text-amber-200 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-lg animate-fadeIn flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{eff.label}</span>
                </div>
              </div>
            ))}

            {/* Instruction Callout Overlay */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-950/75 backdrop-blur-sm px-3 py-1 rounded-full border border-teal-400/30 text-[10px] sm:text-xs text-teal-200 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-teal-300 animate-bounce" />
              <span>แตะที่ผิวน้ำเพื่อโยนเหรียญแก้เคล็ด</span>
            </div>
          </div>

          {/* Gamified Coins Stats Row */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* My Tossed Coins */}
            <div className="bg-white/[0.04] border border-amber-400/30 rounded-2xl p-3 text-center">
              <span className="text-[10px] text-amber-300 font-semibold block uppercase">
                เหรียญที่คุณโยนสะสม
              </span>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-thai">
                  {myCoins}
                </span>
                <span className="text-xs text-amber-200/80">เหรียญ</span>
              </div>
            </div>

            {/* Campus Total Coins */}
            <div className="bg-white/[0.04] border border-teal-400/30 rounded-2xl p-3 text-center">
              <span className="text-[10px] text-teal-300 font-semibold block uppercase">
                เหรียญแก้เคล็ดรวมทั้ง มทร.
              </span>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-thai">
                  {totalCoins.toLocaleString()}
                </span>
                <span className="text-xs text-teal-200/80">เหรียญ</span>
              </div>
            </div>
          </div>

          {/* Anti-F Protection Status Card */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span className="font-bold text-slate-200">ระดับการแก้เคล็ด:</span>
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border ${rank.badgeColor}`}>
                {rank.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {rank.desc}
            </p>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-amber-300 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${rank.progress}%` }}
              />
            </div>
          </div>

          {/* Action Buttons (Standard Height, No Emojis, Clean Gen-Z) */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleBatchToss(1)}
                disabled={isTossingBatch}
                className="h-10 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-100 text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Coins className="w-3.5 h-3.5 text-teal-300" />
                <span>โยน 1 เหรียญ</span>
              </button>

              <button
                type="button"
                onClick={() => handleBatchToss(5)}
                disabled={isTossingBatch}
                className="h-10 rounded-xl bg-gradient-to-r from-amber-400/90 to-amber-500/90 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Flame className="w-3.5 h-3.5 text-slate-950" />
                <span>โยน 5 เหรียญ</span>
              </button>

              <button
                type="button"
                onClick={() => handleBatchToss(10)}
                disabled={isTossingBatch}
                className="h-10 rounded-xl bg-gradient-to-r from-emerald-500/80 to-teal-500/80 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Award className="w-3.5 h-3.5 text-emerald-200" />
                <span>เหมา 10 เหรียญ</span>
              </button>
            </div>

            {/* Share / Copy blessing */}
            <button
              type="button"
              onClick={handleCopyBlessing}
              className="w-full h-10 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-xs text-slate-200 font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">คัดลอกพรแก้เคล็ดส่งให้เพื่อนแล้ว</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-amber-300" />
                  <span>คัดลอกพรแก้เคล็ดส่งต่อให้เพื่อน</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};