'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Coins,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  Droplets,
  Flame,
  Award,
  Trophy,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { sound } from '@/lib/sound';
import { FACULTIES } from '@/data/faculties';
import { Krathong } from '@/types';
import {
  getTurtleProfile,
  saveTurtleProfile,
  getFacultyScores,
  addCoinsToFaculty,
  fetchSupabaseFacultyScores,
  recordCoinToss,
  broadcastCoinPulse,
  subscribeTurtleCoins,
  TurtleProfile,
} from '@/lib/turtleStats';

interface TurtlePondModalProps {
  isOpen: boolean;
  onClose: () => void;
  krathongs?: Krathong[];
  onSelectKrathong?: (krathong: Krathong) => void;
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
  krathongs = [],
  onSelectKrathong,
}) => {
  // Tabs: 'pond' (โยนเหรียญ) vs 'leaderboard' (กระดานอันดับ)
  const [activeTab, setActiveTab] = useState<'pond' | 'leaderboard'>('pond');

  // Anonymous Player Profile (No login required)
  const [profile, setProfile] = useState<TurtleProfile>({
    playerId: 'anonymous',
    nickname: 'เด็ก มทร.',
    faculty: 'คณะวิศวกรรมศาสตร์',
  });

  const [myCoins, setMyCoins] = useState<number>(0);
  const [facultyScores, setFacultyScores] = useState<Record<string, number>>({});
  const [activeEffects, setActiveEffects] = useState<TossedCoinEffect[]>([]);
  const [isTossingBatch, setIsTossingBatch] = useState<boolean>(false);
  const [comboCount, setComboCount] = useState<number>(0);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPulseRef = useRef<number>(0);
  const pulseDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const pondRef = useRef<HTMLDivElement>(null);

  // Load profile and faculty scores on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = getTurtleProfile();
    setProfile(p);
    setFacultyScores(getFacultyScores());

    try {
      const saved = localStorage.getItem('rmutk_turtle_coins');
      if (saved) setMyCoins(parseInt(saved, 10) || 0);
    } catch {}

    // ดึงคะแนนสะสมสดล่าสุดจากฐานข้อมูล Supabase
    fetchSupabaseFacultyScores().then((scores) => {
      if (scores) setFacultyScores(scores);
    });
  }, [isOpen]);

  // Real-time synchronization of coin pulses across all devices
  useEffect(() => {
    const unsubscribe = subscribeTurtleCoins((pulse) => {
      setFacultyScores((prev) => ({
        ...prev,
        [pulse.faculty]: (prev[pulse.faculty] || 0) + pulse.coinsAdded,
      }));
    });

    return () => unsubscribe();
  }, []);

  // Flush debounced coin pulses to realtime broadcast channel & Supabase
  const flushCoinPulse = (coinsAdded: number) => {
    if (coinsAdded <= 0) return;
    broadcastCoinPulse({
      faculty: profile.faculty,
      coinsAdded,
      playerId: profile.playerId,
      nickname: profile.nickname,
      timestamp: Date.now(),
    });
    recordCoinToss(profile.faculty, coinsAdded);
  };

  if (!isOpen) return null;

  // Total coins across entire campus
  const totalCampusCoins = Object.values(facultyScores).reduce((acc, curr) => acc + curr, 0);

  // Sorted faculty leaderboard
  const sortedFaculties = Object.entries(facultyScores)
    .map(([faculty, coins]) => ({ faculty, coins }))
    .sort((a, b) => b.coins - a.coins);

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

  // Change user faculty without login
  const handleChangeFaculty = (newFaculty: string) => {
    const updated = saveTurtleProfile({ faculty: newFaculty });
    setProfile(updated);
  };

  // Trigger Coin Toss At Specific Coordinates
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

    setActiveEffects((prev) => [...prev.slice(-6), newEffect]);

    // Local user coin tally
    setMyCoins((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('rmutk_turtle_coins', next.toString());
      } catch {}
      return next;
    });

    // Faculty coin tally
    setFacultyScores(addCoinsToFaculty(profile.faculty, 1));

    // Popcat-style combo counter
    setComboCount((c) => c + 1);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setComboCount(0);
    }, 1200);

    // Debounced real-time broadcast to peer devices
    pendingPulseRef.current += 1;
    if (pulseDebounceRef.current) clearTimeout(pulseDebounceRef.current);
    pulseDebounceRef.current = setTimeout(() => {
      flushCoinPulse(pendingPulseRef.current);
      pendingPulseRef.current = 0;
    }, 1000);

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

  // Batch Multi-Toss
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
    }, 160);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="turtle-modal-title"
    >
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-teal-500/30 w-full max-w-md sm:max-w-lg rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden text-slate-100 relative flex flex-col max-h-[92dvh]">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-2 bg-gradient-to-r from-transparent via-teal-400/60 to-transparent blur-sm" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-300" />
            <div>
              <h3 id="turtle-modal-title" className="text-sm sm:text-base font-bold text-white leading-tight">
                บ่อเต่ามงคล สระน้ำ มทร.กรุงเทพ
              </h3>
              <p className="text-[10px] sm:text-[11px] text-teal-300/90">
                โยนเหรียญแก้เคล็ด F • แข่งคะแนนอันดับคณะ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="ปิด"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Clean Gen-Z Tabs Segment Control (โยนเหรียญ VS แข่งขันอันดับ) */}
        <div className="grid grid-cols-2 border-b border-white/10 bg-white/[0.02] text-xs font-semibold flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('pond')}
            className={`h-10 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'pond'
                ? 'border-teal-400 text-teal-200 bg-white/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>โยนเหรียญบ่อเต่า</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`h-10 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'border-amber-400 text-amber-200 bg-white/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>กระดานอันดับ (Leaderboard)</span>
          </button>
        </div>

        {/* TAB 1: POND & INTERACTIVE TAPPING */}
        {activeTab === 'pond' && (
          <div className="p-3 sm:p-4.5 flex flex-col gap-2.5 sm:gap-3 overflow-y-auto no-scrollbar">
            {/* Faculty Selector Pill (Login-free identification) */}
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                โยนแก้เคล็ดในนาม:
              </span>
              <select
                value={profile.faculty}
                onChange={(e) => handleChangeFaculty(e.target.value)}
                className="bg-transparent text-teal-200 font-semibold text-xs border-none focus:outline-none cursor-pointer"
              >
                {FACULTIES.map((fac) => (
                  <option key={fac} value={fac} className="bg-slate-900 text-slate-100">
                    {fac}
                  </option>
                ))}
              </select>
            </div>

            {/* INTERACTIVE POND WATER VIEWPORT */}
            <div
              ref={pondRef}
              onClick={handlePondClick}
              className="relative w-full h-40 sm:h-52 rounded-2xl overflow-hidden cursor-pointer select-none border border-teal-400/30 shadow-inner group flex-shrink-0"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 60%, #113636 0%, #0a2126 50%, #06151a 100%)',
              }}
            >
              {/* Caustics */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_40%,rgba(45,212,191,0.15),transparent_60%)] animate-pulse" />
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_70%_70%,rgba(251,191,36,0.12),transparent_50%)]" />

              {/* Combo Popcat Badge */}
              {comboCount > 1 && (
                <div className="absolute top-2.5 right-3 z-30 pointer-events-none bg-amber-400/90 text-slate-950 font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-lg animate-bounce flex items-center gap-1">
                  <Flame className="w-3 h-3 text-slate-950" />
                  <span>COMBO x{comboCount}</span>
                </div>
              )}

              {/* Stylized Minimalist Pond Turtle on Zen Stone */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
                <div className="w-32 sm:w-36 h-16 sm:h-18 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-[50%] border border-slate-600/50 shadow-2xl relative flex items-center justify-center">
                  <div className="absolute -inset-1.5 rounded-[50%] border border-teal-300/25 animate-ping opacity-35" />

                  <svg
                    width="78"
                    height="64"
                    viewBox="0 0 100 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] animate-floatSlow"
                  >
                    <ellipse cx="24" cy="26" rx="14" ry="7" fill="#1e3a34" transform="rotate(-25 24 26)" />
                    <ellipse cx="76" cy="26" rx="14" ry="7" fill="#1e3a34" transform="rotate(25 76 26)" />
                    <ellipse cx="26" cy="56" rx="12" ry="6" fill="#172e29" transform="rotate(25 26 56)" />
                    <ellipse cx="74" cy="56" rx="12" ry="6" fill="#172e29" transform="rotate(-25 74 56)" />
                    <ellipse cx="50" cy="14" rx="9" ry="12" fill="#2d584e" />
                    <circle cx="46" cy="10" r="1.5" fill="#0d1f1c" />
                    <circle cx="54" cy="10" r="1.5" fill="#0d1f1c" />
                    <polygon points="50,72 47,62 53,62" fill="#1e3a34" />
                    <ellipse cx="50" cy="42" rx="28" ry="24" fill="#204b40" stroke="#3da088" strokeWidth="2" />
                    <polygon points="50,26 59,32 59,42 50,48 41,42 41,32" fill="#295f52" stroke="#52be9f" strokeWidth="1.2" />
                    <polygon points="50,48 59,54 59,62 50,66 41,62 41,54" fill="#245549" stroke="#52be9f" strokeWidth="1.2" />
                    <path d="M 41,32 L 26,35 L 26,48 L 41,45 Z" fill="#1b4238" stroke="#3da088" strokeWidth="1" />
                    <path d="M 59,32 L 74,35 L 74,48 L 59,45 Z" fill="#1b4238" stroke="#3da088" strokeWidth="1" />
                    <path d="M 41,45 L 26,48 L 30,60 L 41,54 Z" fill="#163930" stroke="#3da088" strokeWidth="1" />
                    <path d="M 59,45 L 74,48 L 70,60 L 59,54 Z" fill="#163930" stroke="#3da088" strokeWidth="1" />
                    <circle cx="50" cy="37" r="4" fill="#fbbf24" fillOpacity="0.85" />
                    <circle cx="50" cy="37" r="5.5" stroke="#fef08a" strokeWidth="0.8" strokeDasharray="2 2" />
                  </svg>
                </div>

                <span className="mt-1.5 text-[9px] sm:text-[10px] text-teal-300/80 font-medium tracking-wide bg-slate-900/80 px-2 py-0.5 rounded-full border border-teal-500/20">
                  เต่ามงคลประจำสระ มทร.กรุงเทพ
                </span>
              </div>

              {/* Submerged Coins */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[
                  { x: 18, y: 75, s: 13, r: 12 },
                  { x: 26, y: 82, s: 15, r: -20 },
                  { x: 34, y: 72, s: 11, r: 45 },
                  { x: 68, y: 78, s: 14, r: 15 },
                  { x: 78, y: 84, s: 16, r: -30 },
                  { x: 82, y: 70, s: 12, r: 60 },
                  { x: 48, y: 85, s: 15, r: -5 },
                  { x: 58, y: 82, s: 13, r: 25 },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border border-amber-300/60 bg-gradient-to-br from-amber-300/80 via-amber-500/70 to-amber-700/80 shadow-[0_0_8px_rgba(251,191,36,0.4)] opacity-70 flex items-center justify-center text-[7px] sm:text-[8px] font-bold text-amber-950"
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

              {/* Live Interactive Coin Toss FX */}
              {activeEffects.map((eff) => (
                <div
                  key={eff.id}
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{ left: `${eff.x}px`, top: `${eff.y}px` }}
                >
                  <div className="w-10 h-10 rounded-full border-2 border-teal-300/90 bg-teal-400/20 animate-waterTouchRipple" />
                  <div className="absolute -inset-1.5 rounded-full border border-amber-300/70 animate-ping opacity-75" />

                  <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 border border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.9)] flex items-center justify-center font-extrabold text-[9px] text-amber-950 animate-bounce">
                    A
                  </div>

                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 border border-amber-400/60 text-amber-200 text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-fadeIn flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    <span>{eff.label}</span>
                  </div>
                </div>
              ))}

              {/* Callout Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-950/75 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-teal-400/30 text-[10px] text-teal-200 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-teal-300" />
                <span>แตะที่ผิวน้ำเพื่อโยนเหรียญ</span>
              </div>
            </div>

            {/* Coins Stats Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.04] border border-amber-400/30 rounded-xl p-2 sm:p-2.5 text-center">
                <span className="text-[9px] sm:text-[10px] text-amber-300 font-semibold block uppercase">
                  เหรียญที่คุณโยนสะสม
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl sm:text-2xl font-extrabold text-white font-thai">
                    {myCoins}
                  </span>
                  <span className="text-[11px] text-amber-200/80">เหรียญ</span>
                </div>
              </div>

              <div className="bg-white/[0.04] border border-teal-400/30 rounded-xl p-2 sm:p-2.5 text-center">
                <span className="text-[9px] sm:text-[10px] text-teal-300 font-semibold block uppercase">
                  เหรียญรวมคณะของคุณ
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl sm:text-2xl font-extrabold text-white font-thai">
                    {(facultyScores[profile.faculty] || 0).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-teal-200/80">เหรียญ</span>
                </div>
              </div>
            </div>

            {/* Anti-F Protection Status Card */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-2 sm:p-2.5 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-bold text-slate-200 text-xs">สถานะแก้เคล็ด:</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${rank.badgeColor}`}>
                  {rank.title}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug">
                {rank.desc}
              </p>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 via-amber-300 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${rank.progress}%` }}
                />
              </div>
            </div>

            {/* Action Buttons (Standard Height, No Emojis, Clean Gen-Z) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleBatchToss(1)}
                disabled={isTossingBatch}
                className="h-9 sm:h-10 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-100 text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Coins className="w-3.5 h-3.5 text-teal-300" />
                <span>โยน 1 เหรียญ</span>
              </button>

              <button
                type="button"
                onClick={() => handleBatchToss(5)}
                disabled={isTossingBatch}
                className="h-9 sm:h-10 rounded-xl bg-gradient-to-r from-amber-400/90 to-amber-500/90 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Flame className="w-3.5 h-3.5 text-slate-950" />
                <span>โยน 5 เหรียญ</span>
              </button>

              <button
                type="button"
                onClick={() => handleBatchToss(10)}
                disabled={isTossingBatch}
                className="h-9 sm:h-10 rounded-xl bg-gradient-to-r from-emerald-500/80 to-teal-500/80 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Award className="w-3.5 h-3.5 text-emerald-200" />
                <span>เหมา 10 เหรียญ</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: LEADERBOARD & POPCAT BATTLE (Styled after reference image 2) */}
        {activeTab === 'leaderboard' && (
          <div className="p-3 sm:p-5 space-y-4 overflow-y-auto no-scrollbar">
            {/* Section 1: คณะที่โยนเหรียญเยอะที่สุด (Popcat Battle) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    คณะที่โยนเหรียญแก้เคล็ดเยอะที่สุด
                  </h4>
                </div>
                <span className="text-[10px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  รวม {totalCampusCoins.toLocaleString()} เหรียญ
                </span>
              </div>

              <div className="space-y-1.5">
                {sortedFaculties.slice(0, 7).map((item, index) => {
                  const isMyFaculty = item.faculty === profile.faculty;
                  const percent =
                    totalCampusCoins > 0 ? Math.round((item.coins / totalCampusCoins) * 100) : 0;

                  return (
                    <div
                      key={item.faculty}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isMyFaculty
                          ? 'bg-amber-400/10 border-amber-400/40 shadow-sm'
                          : 'bg-white/[0.03] border-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 truncate max-w-[240px]">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                              index === 0
                                ? 'bg-amber-400 text-slate-950 shadow-sm'
                                : index === 1
                                ? 'bg-slate-300 text-slate-950'
                                : index === 2
                                ? 'bg-amber-700 text-amber-100'
                                : 'bg-white/10 text-slate-400'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className={`truncate ${isMyFaculty ? 'font-bold text-amber-200' : 'text-slate-200'}`}>
                            {item.faculty}
                            {isMyFaculty && <span className="ml-1 text-[10px] text-amber-300/80 font-normal">(คณะคุณ)</span>}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-300">
                          {item.coins.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">เหรียญ</span>
                        </span>
                      </div>

                      {/* Mini progress bar */}
                      <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1.5 ml-7 max-w-[calc(100%-28px)]">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isMyFaculty ? 'bg-amber-400' : 'bg-gradient-to-r from-teal-400 to-cyan-400'
                          }`}
                          style={{ width: `${Math.max(5, percent * 3)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};