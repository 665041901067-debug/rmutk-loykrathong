'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Sparkles, Flame, RotateCcw, Users, GraduationCap, ChevronDown, Check } from 'lucide-react';
import { generateUUID } from '@/lib/storage';
import { getTurtleProfile, saveTurtleProfile, TurtleProfile } from '@/lib/turtleStats';
import { FACULTIES } from '@/data/faculties';
import {
  broadcastSparklerMove,
  subscribeLiveSparklers,
  getSparklerCampusTotal,
  incrementSparklerCampusTotal,
  LiveSparkler,
} from '@/lib/sparklerSync';

interface SparklerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
}

export const SparklerModal: React.FC<SparklerModalProps> = ({ isOpen, onClose }) => {
  const [isLit, setIsLit] = useState<boolean>(false);
  const [isBurnedOut, setIsBurnedOut] = useState<boolean>(false);
  const [burnProgress, setBurnProgress] = useState<number>(0); // 0 (full) to 100 (fully burned out)
  const [otherSparklers, setOtherSparklers] = useState<Map<string, LiveSparkler>>(new Map());
  const [campusTotal, setCampusTotal] = useState<number>(0);

  // Position of sparkler tip (default near center bottom)
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Faculty and Profile State (Allows user to choose their real faculty!)
  const [profile, setProfile] = useState<TurtleProfile>(() => getTurtleProfile());
  const [isFacultyPickerOpen, setIsFacultyPickerOpen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const myIdRef = useRef<string>(generateUUID());
  const profileRef = useRef(profile);
  const lastBroadcastRef = useRef<number>(0);

  // Keep profileRef in sync
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Sound generator for crackling sparkler using Web Audio API
  const startCrackleSound = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Generate soft crackling white noise with bandpass filter
      const bufferSize = audioCtxRef.current.sampleRate * 2;
      const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtxRef.current.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = audioCtxRef.current.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1800, audioCtxRef.current.currentTime);

      const gain = audioCtxRef.current.createGain();
      gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime); // Soft gentle crackle

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
    } catch {}
  };

  const stopCrackleSound = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop();
      } catch {}
      noiseNodeRef.current = null;
    }
  };

  // Initialize position and fetch campus sparkler total
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined') {
      setStickPos({
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.55,
      });
      const p = getTurtleProfile();
      setProfile(p);
      profileRef.current = p;
    }

    getSparklerCampusTotal().then((tot) => setCampusTotal(tot));

    // Listen to other players waving sparklers
    const unsubscribe = subscribeLiveSparklers((remote) => {
      if (remote.id === myIdRef.current) return;
      setOtherSparklers((prev) => {
        const next = new Map(prev);
        if (remote.isBurning) {
          next.set(remote.id, remote);
        } else {
          next.delete(remote.id);
        }
        return next;
      });
    });

    return () => {
      unsubscribe();
      stopCrackleSound();
    };
  }, [isOpen]);

  // Clean stale remote sparklers every 5s
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setOtherSparklers((prev) => {
        const next = new Map(prev);
        next.forEach((s, id) => {
          if (now - s.lastUpdated > 4500) {
            next.delete(id);
          }
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Burning countdown timer (takes ~25 seconds per stick)
  useEffect(() => {
    if (!isLit || isBurnedOut) return;

    startCrackleSound();
    const interval = setInterval(() => {
      setBurnProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(interval);
          setIsBurnedOut(true);
          setIsLit(false);
          stopCrackleSound();

          // Broadcast burned event
          broadcastSparklerMove({
            id: myIdRef.current,
            x: 50,
            y: 50,
            playerName: profileRef.current.nickname,
            faculty: profileRef.current.faculty,
            isBurning: false,
            burnProgress: 100,
            lastUpdated: Date.now(),
          });
          return 100;
        }
        return next;
      });
    }, 250);

    return () => {
      clearInterval(interval);
      stopCrackleSound();
    };
  }, [isLit, isBurnedOut]);

  // Handle Faculty Change
  const handleSelectFaculty = (selectedFac: string) => {
    const updated = saveTurtleProfile({ faculty: selectedFac });
    setProfile(updated);
    profileRef.current = updated;
    setIsFacultyPickerOpen(false);

    // If currently burning, update broadcast immediately
    if (isLit && !isBurnedOut) {
      broadcastSparklerMove({
        id: myIdRef.current,
        x: (stickPos.x / (window.innerWidth || 1)) * 100,
        y: (stickPos.y / (window.innerHeight || 1)) * 100,
        playerName: updated.nickname,
        faculty: updated.faculty,
        isBurning: true,
        burnProgress,
        lastUpdated: Date.now(),
      });
    }
  };

  // Light up sparkler
  const handleIgnite = async () => {
    if (isLit) return;
    setIsLit(true);
    setIsBurnedOut(false);
    setBurnProgress(0);

    const updated = await incrementSparklerCampusTotal();
    setCampusTotal(updated);

    // Initial broadcast
    broadcastSparklerMove({
      id: myIdRef.current,
      x: (stickPos.x / (window.innerWidth || 1)) * 100,
      y: (stickPos.y / (window.innerHeight || 1)) * 100,
      playerName: profileRef.current.nickname,
      faculty: profileRef.current.faculty,
      isBurning: true,
      burnProgress: 0,
      lastUpdated: Date.now(),
    });
  };

  // Reset to a new sparkler
  const handleNewSparkler = () => {
    setIsLit(false);
    setIsBurnedOut(false);
    setBurnProgress(0);
    stopCrackleSound();
  };

  // Movement handler (Touch or Mouse drag)
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    setStickPos({ x: clientX, y: clientY });

    if (isLit && !isBurnedOut) {
      const now = Date.now();
      if (now - lastBroadcastRef.current > 120) {
        lastBroadcastRef.current = now;
        broadcastSparklerMove({
          id: myIdRef.current,
          x: (clientX / (window.innerWidth || 1)) * 100,
          y: (clientY / (window.innerHeight || 1)) * 100,
          playerName: profileRef.current.nickname,
          faculty: profileRef.current.faculty,
          isBurning: true,
          burnProgress,
          lastUpdated: now,
        });
      }
    }
  }, [isLit, isBurnedOut, burnProgress]);

  // Particle Canvas Animation Loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Emit sparks from active burning sparkler tip
      if (isLit && !isBurnedOut) {
        // Calculate dynamic burning tip height along the stick
        // Total stick length is 220px, pyrotechnic section is top 145px
        const currentBurnOffset = (burnProgress / 100) * 145;
        const currentTipX = stickPos.x;
        const currentTipY = stickPos.y - 120 + currentBurnOffset;

        // Emit 5-8 sparks per frame
        for (let i = 0; i < 7; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 6.5;
          const colors = ['#FEF08A', '#FDE047', '#F59E0B', '#F97316', '#FFFFFF'];
          particlesRef.current.push({
            x: currentTipX + (Math.random() - 0.5) * 6,
            y: currentTipY + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed + 0.8, // Gravity pull
            size: 1.2 + Math.random() * 2.2,
            alpha: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            decay: 0.02 + Math.random() * 0.035,
          });
        }

        // Draw local player label above burning tip
        ctx.save();
        ctx.font = 'bold 11px Tahoma, sans-serif';
        ctx.fillStyle = 'rgba(254, 240, 138, 0.95)';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(`${profileRef.current.nickname} (${profileRef.current.faculty})`, currentTipX, currentTipY - 24);
        ctx.restore();
      }

      // 2. Render other players' live remote sparklers
      otherSparklers.forEach((remote) => {
        const rx = (remote.x / 100) * canvas.width;
        const ry = (remote.y / 100) * canvas.height;

        // Subtle remote glow and spark spray
        ctx.save();
        const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, 35);
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
        grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.3)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(rx, ry, 35, 0, Math.PI * 2);
        ctx.fill();

        // Remote sparkler mini sparks
        for (let j = 0; j < 3; j++) {
          const a = Math.random() * Math.PI * 2;
          const dist = Math.random() * 22;
          ctx.fillStyle = '#FEF08A';
          ctx.beginPath();
          ctx.arc(rx + Math.cos(a) * dist, ry + Math.sin(a) * dist, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Remote player label
        ctx.font = '10px Tahoma, sans-serif';
        ctx.fillStyle = 'rgba(253, 230, 138, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText(`${remote.playerName} (${remote.faculty})`, rx, ry - 18);
        ctx.restore();
      });

      // 3. Update and draw sparks
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isLit, isBurnedOut, burnProgress, stickPos, otherSparklers]);

  if (!isOpen) return null;

  // Active online sparkler count (self + others)
  const activeCount = otherSparklers.size + (isLit ? 1 : 0);

  // Sparkler stick dimensions:
  // Total stick length: 220px
  // Top 145px: Pyrotechnic grey chemical coating (like in Image 3)
  // Bottom 75px: Bare steel wire handle
  const burnOffset = (burnProgress / 100) * 145;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md select-none touch-none animate-fadeIn flex flex-col justify-between"
      onPointerMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        if (e.touches[0]) {
          handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
    >
      {/* Background Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* TOP HEADER CONTROLS */}
      <div className="relative z-30 p-3 sm:p-5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Title Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/10 text-xs text-amber-200 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">จุดไฟเย็นริมสระน้ำ มทร.</span>
          </div>

          {/* Active online players count */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300">
            <Users className="w-3 h-3 text-cyan-300" />
            <span>เพื่อนกำลังจุด {activeCount} คน</span>
          </div>

          {/* Faculty Selector Pill (เลือกคณะของตนเองได้) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFacultyPickerOpen(!isFacultyPickerOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-950/80 hover:bg-teal-900 border border-teal-400/50 hover:border-teal-300 text-xs text-teal-200 font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              title="แตะเพื่อเลือกคณะของคุณ"
            >
              <GraduationCap className="w-3.5 h-3.5 text-teal-300" />
              <span>{profile.faculty}</span>
              <ChevronDown className="w-3 h-3 text-teal-300" />
            </button>

            {/* Dropdown Menu */}
            {isFacultyPickerOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-60 max-h-64 overflow-y-auto bg-slate-900/95 backdrop-blur-2xl border border-teal-400/40 rounded-2xl p-1.5 shadow-2xl z-50 no-scrollbar">
                <div className="px-3 py-1.5 text-[11px] text-teal-300 font-bold border-b border-white/10 mb-1 flex items-center justify-between">
                  <span>เลือกคณะสังกัดของคุณ</span>
                  <span className="text-[10px] text-slate-400 font-normal">แตะเพื่อเปลี่ยน</span>
                </div>
                {FACULTIES.map((fac) => {
                  const isSelected = profile.faculty === fac;
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => handleSelectFaculty(fac)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-400/20 text-teal-200 font-bold'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{fac}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-300" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            stopCrackleSound();
            onClose();
          }}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* CENTER VISUAL: Realistic 7-inch Gold Sparkler Stick (เหมือนรูปที่ 3) */}
      <div
        className="absolute pointer-events-none z-20 transition-transform duration-75 ease-out"
        style={{
          left: `${stickPos.x}px`,
          top: `${stickPos.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width="60" height="250" viewBox="0 0 60 250" fill="none" className="overflow-visible">
          <defs>
            {/* Ambient Flame Glow */}
            <radialGradient id="sparklerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Full Bare Steel Wire from tip (Y=10) to handle (Y=240) */}
          <line
            x1="30"
            y1="10"
            x2="30"
            y2="240"
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Pyrotechnic Compound Coating (7" Gold Sparkler Section, Y=10 to Y=155) */}
          {/* As burnProgress increases, the top portion burns away downwards */}
          <line
            x1="30"
            y1={10 + burnOffset}
            x2="30"
            y2="155"
            stroke="#475569"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Sparkler Texture Marks (สารเคลือบดอกไม้ไฟสีเทา) */}
          <line
            x1="30"
            y1={10 + burnOffset}
            x2="30"
            y2="155"
            stroke="#64748B"
            strokeWidth="3.5"
            strokeDasharray="2 3"
          />

          {/* Burning Point Fire Head */}
          {isLit && !isBurnedOut && (
            <g>
              {/* Radial ambient bloom */}
              <circle cx="30" cy={10 + burnOffset} r="28" fill="url(#sparklerGlow)" />
              {/* Hot core */}
              <circle cx="30" cy={10 + burnOffset} r="4.5" fill="#FFFFFF" />
              <circle cx="30" cy={10 + burnOffset} r="7" fill="#FDE047" opacity="0.8" />
            </g>
          )}

          {/* Bare Metal Handle Grip (ก้านเหล็กเปลือยด้านล่าง เหมือนรูป 3) */}
          <line
            x1="30"
            y1="155"
            x2="30"
            y2="240"
            stroke="#CBD5E1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Action Prompt when Unlit */}
        {!isLit && !isBurnedOut && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/40 text-[11px] text-amber-200 shadow-lg animate-bounce">
            กดปุ่มด้านล่างเพื่อจุดไฟเย็น
          </div>
        )}

        {/* Burned Out Indicator */}
        {isBurnedOut && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] text-slate-300 shadow-lg">
            มอดลงเหลือเพียงก้านเหล็กแล้ว
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="relative z-30 pb-6 px-4 flex flex-col items-center space-y-2 pointer-events-auto">
        {/* Total Campus Lit Tally */}
        <div className="text-[11px] text-slate-400 bg-slate-900/60 backdrop-blur-xl px-3 py-1 rounded-full border border-white/10">
          จุดไฟเย็นในสระ มทร. แล้วสะสม {campusTotal.toLocaleString()} แท่ง
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {!isLit && !isBurnedOut && (
            <button
              type="button"
              onClick={handleIgnite}
              className="h-11 px-7 rounded-full font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-200/50 shadow-[0_0_20px_rgba(251,191,36,0.5)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>จุดไฟเย็น</span>
            </button>
          )}

          {isLit && !isBurnedOut && (
            <div className="h-11 px-6 rounded-full bg-slate-900/80 backdrop-blur-xl border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>ลากนิ้วหรือเมาส์เพื่อโบกไฟเย็น ({100 - burnProgress}%)</span>
            </div>
          )}

          {isBurnedOut && (
            <button
              type="button"
              onClick={handleNewSparkler}
              className="h-11 px-6 rounded-full font-bold text-sm bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/40 shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>หยิบแท่งใหม่</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
