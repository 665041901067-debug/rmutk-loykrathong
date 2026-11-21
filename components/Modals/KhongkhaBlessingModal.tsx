'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Krathong, WishCategory } from '@/types';
import {
  generateKhongkhaBlessing,
  generateDailyKhongkhaBlessing,
  getRandomWaterVirtue,
  KhongkhaBlessing,
} from '@/lib/khongkhaBlessing';
import { sound } from '@/lib/sound';
import {
  X,
  Download,
  Check,
  Sparkles,
  Droplets,
  RefreshCw,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface KhongkhaBlessingModalProps {
  krathong: Krathong | null;
  isOpen: boolean;
  onClose: () => void;
  myKrathongs?: Krathong[];
  onOpenCustomizer?: () => void;
  onLocateKrathong?: (krathong: Krathong) => void;
}

export const KhongkhaBlessingModal: React.FC<KhongkhaBlessingModalProps> = ({
  krathong,
  isOpen,
  onClose,
  myKrathongs = [],
  onOpenCustomizer,
  onLocateKrathong,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeKrathong, setActiveKrathong] = useState<Krathong | null>(krathong);
  const [blessing, setBlessing] = useState<KhongkhaBlessing | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Visitor Mode States (สำหรับคนที่ยังไม่ได้ลอยกระทง)
  const [visitorCategory, setVisitorCategory] = useState<WishCategory | 'all'>('all');
  const [isCardRevealed, setIsCardRevealed] = useState<boolean>(false);

  // Interactive Blessings / Sprinkling Water States (ลูกเล่นพรมน้ำมนต์ & สลับข้อคิด)
  const [isSprinkling, setIsSprinkling] = useState<boolean>(false);
  const [hasSprinkled, setHasSprinkled] = useState<boolean>(false);
  const [customWaterVirtue, setCustomWaterVirtue] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHasSprinkled(false);
      setCustomWaterVirtue(null);
      if (krathong) {
        setActiveKrathong(krathong);
        const generated = generateKhongkhaBlessing(krathong);
        setBlessing(generated);
        setIsCardRevealed(true);
      } else {
        setActiveKrathong(null);
        const daily = generateDailyKhongkhaBlessing('all');
        setBlessing(daily);
        setVisitorCategory('all');
        setIsCardRevealed(false);
      }
      sound.playTempleBell();
    }
  }, [krathong, isOpen]);

  // Switch between user's multiple floated krathongs
  const handleSelectMyKrathong = (k: Krathong) => {
    setActiveKrathong(k);
    const generated = generateKhongkhaBlessing(k);
    setBlessing(generated);
    setCustomWaterVirtue(null);
    setHasSprinkled(false);
    setIsCardRevealed(true);
    sound.playWaterDrop();
  };

  // Change category in Visitor Mode
  const handleSelectVisitorCategory = (cat: WishCategory | 'all') => {
    setVisitorCategory(cat);
    const newDaily = generateDailyKhongkhaBlessing(cat);
    setBlessing(newDaily);
    setCustomWaterVirtue(null);
    setIsCardRevealed(true);
    sound.playWaterDrop();
  };

  // Reveal card in Visitor Mode
  const handleRevealCard = () => {
    setIsCardRevealed(true);
    sound.playWaterDrop();
    sound.playTempleBell();
  };

  // Draw another random card in Visitor Mode
  const handleDrawNewCard = () => {
    const newDaily = generateDailyKhongkhaBlessing(visitorCategory);
    setBlessing(newDaily);
    setCustomWaterVirtue(null);
    sound.playWaterDrop();
  };

  // Interactive Holy Water Sprinkle Effect
  const handleSprinkleWater = () => {
    setIsSprinkling(true);
    setHasSprinkled(true);
    sound.playWaterDrop();
    sound.playSparkle();
    setTimeout(() => {
      setIsSprinkling(false);
    }, 2200);
  };

  // Interactive Wisdom Quote Shuffle
  const handleShuffleVirtue = () => {
    const v = getRandomWaterVirtue();
    setCustomWaterVirtue(v);
    sound.playWaterDrop();
  };

  if (!isOpen || !blessing) return null;

  const activeVirtue = customWaterVirtue || blessing.waterVirtue;
  const isOwner = Boolean(
    activeKrathong && myKrathongs.some((k) => k.id === activeKrathong.id)
  );

  const handleCopy = async () => {
    const fullText = `[โองการพระแม่คงคา ถึง ${blessing.recipientName} (${blessing.faculty})]\n\nคำขอของคุณ: "${blessing.wish}"\n\n${blessing.headline}\n${blessing.cleansingWord}\n\n${blessing.wishBlessing}\n\n${blessing.sacredOfferingWord ? blessing.sacredOfferingWord + '\n\n' : ''}---\nข้อคิดเตือนใจ: ${activeVirtue}\n(ประเพณีลอยกระทงออนไลน์ มทร.กรุงเทพ)`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadParchment = async () => {
    if (!canvasRef.current || !blessing) return;
    setIsDownloading(true);

    try {
      if (typeof document !== 'undefined' && 'fonts' in document) {
        try {
          await document.fonts.load('bold 54px "Prompt"');
          await document.fonts.load('bold 32px "Prompt"');
          await document.fonts.load('28px "Prompt"');
          await document.fonts.load('24px "Prompt"');
          await document.fonts.ready;
        } catch {
          // Fallback if font loading promise fails
        }
      }

      const canvas = canvasRef.current;
      const width = 1080;
      const height = 1920;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const thaiFont = (weight: string | number, size: number) =>
        `${weight} ${size}px "Prompt", "Noto Sans Thai", "Kanit", -apple-system, BlinkMacSystemFont, sans-serif`;

      // Helper: Thai word-boundary text wrapping using Intl.Segmenter
      const wrapCanvasThai = (text: string, maxWidth: number): string[] => {
        if (!text) return [];
        let segments: string[] = [];
        if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
          try {
            const segmenter = new (Intl as any).Segmenter('th', { granularity: 'word' });
            segments = Array.from(segmenter.segment(text), (s: any) => s.segment);
          } catch {
            segments = text.split(' ');
          }
        } else {
          segments = text.split(' ');
        }

        const lines: string[] = [];
        let currentLine = '';

        for (let i = 0; i < segments.length; i++) {
          const seg = segments[i];
          if (seg === '\n') {
            lines.push(currentLine.trim());
            currentLine = '';
            continue;
          }
          const testLine = currentLine + seg;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine.length > 0) {
            lines.push(currentLine.trim());
            currentLine = seg.startsWith(' ') ? seg.trimStart() : seg;
          } else if (metrics.width > maxWidth && currentLine.length === 0) {
            // Single unbroken word exceeding maxWidth: break by character safely
            let subWord = '';
            for (const char of seg) {
              if (ctx.measureText(subWord + char).width > maxWidth) {
                if (subWord) lines.push(subWord);
                subWord = char;
              } else {
                subWord += char;
              }
            }
            currentLine = subWord;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine.trim().length > 0) {
          lines.push(currentLine.trim());
        }
        return lines;
      };

      // Helper: Draw Rounded Rectangle with fallback
      const drawRoundedRect = (
        x: number,
        y: number,
        w: number,
        h: number,
        radius: number,
        fillStyle?: string | CanvasGradient,
        strokeStyle?: string,
        lineWidth?: number
      ) => {
        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, w, h, radius);
        } else {
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + w - radius, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
          ctx.lineTo(x + w, y + h - radius);
          ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
          ctx.lineTo(x + radius, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
        }
        ctx.closePath();
        if (fillStyle) {
          ctx.fillStyle = fillStyle;
          ctx.fill();
        }
        if (strokeStyle && lineWidth) {
          ctx.strokeStyle = strokeStyle;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        }
        ctx.restore();
      };

      // 1. Deep Midnight & Water Sapphire Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.2, '#06152F');
      bgGrad.addColorStop(0.65, '#0A234E');
      bgGrad.addColorStop(1, '#020510');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Radial Golden Light Glow behind Header
      const halo = ctx.createRadialGradient(width / 2, 280, 40, width / 2, 280, 500);
      halo.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
      halo.addColorStop(0.5, 'rgba(245, 158, 11, 0.06)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);

      // Floating Ambient Starlight / Golden Dust
      for (let i = 0; i < 60; i++) {
        const sx = (Math.sin(i * 97 + 23) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 47 + 61) * 0.5 + 0.5) * height;
        const sr = 1 + (i % 3);
        const sa = 0.2 + ((i % 5) * 0.12);
        ctx.fillStyle = `rgba(254, 240, 138, ${sa})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outer Rounded Story Frame
      drawRoundedRect(
        50,
        50,
        width - 100,
        height - 100,
        36,
        undefined,
        'rgba(255, 255, 255, 0.12)',
        1.5
      );

      // Inner Subtle Gold Frame
      drawRoundedRect(
        66,
        66,
        width - 132,
        height - 132,
        28,
        undefined,
        'rgba(245, 158, 11, 0.25)',
        1
      );

      // Celestial Minimalist Star Accents in Corners
      const drawStarAccent = (cx: number, cy: number) => {
        ctx.save();
        ctx.fillStyle = '#FDE68A';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 10;
        ctx.fillText('✦', cx, cy);
        ctx.restore();
      };
      drawStarAccent(85, 85);
      drawStarAccent(width - 85, 85);
      drawStarAccent(width - 85, height - 85);
      drawStarAccent(85, height - 85);

      // 3. Header Section
      ctx.fillStyle = '#FBBF24';
      ctx.font = thaiFont('600', 22);
      ctx.textAlign = 'center';
      ctx.letterSpacing = '3px';
      ctx.fillText('✦ SACRED BLESSING • RMUTK 2026 ✦', width / 2, 145);

      // Main Title
      ctx.fillStyle = '#FEF08A';
      ctx.font = thaiFont('bold', 52);
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 16;
      ctx.fillText('โองการพระแม่คงคา', width / 2, 215);
      ctx.shadowBlur = 0;

      // Subtitle
      ctx.fillStyle = '#CBD5E1';
      ctx.font = thaiFont('normal', 23);
      ctx.fillText('ประสาทพรออนไลน์ • มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ', width / 2, 260);

      // Divider Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 160, 288);
      ctx.lineTo(width / 2 + 160, 288);
      ctx.stroke();

      // Glowing Center Pip
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(width / 2, 288, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 4. Recipient Badge
      drawRoundedRect(
        120,
        320,
        width - 240,
        64,
        32,
        'rgba(255, 255, 255, 0.05)',
        'rgba(245, 158, 11, 0.45)',
        1.5
      );
      ctx.fillStyle = '#FDE68A';
      ctx.font = thaiFont('bold', 26);
      ctx.textAlign = 'center';
      ctx.fillText(
        `ผู้รับพร: ${blessing.recipientName}   •   ${blessing.faculty}`,
        width / 2,
        361
      );

      let currentY = 425;

      // 5. User Wish Card
      ctx.font = thaiFont('500', 26);
      const wishLines = wrapCanvasThai(`“${blessing.wish}”`, 740);
      const wishBoxH = Math.max(110, wishLines.length * 40 + 70);

      drawRoundedRect(
        100,
        currentY,
        width - 200,
        wishBoxH,
        24,
        'rgba(0, 0, 0, 0.45)',
        'rgba(255, 255, 255, 0.15)',
        1
      );

      // Wish Box Header
      ctx.fillStyle = '#94A3B8';
      ctx.font = thaiFont('normal', 20);
      ctx.textAlign = 'center';
      ctx.fillText('คำอธิษฐานคืนลอยกระทง', width / 2, currentY + 36);

      // Wish Lines
      ctx.fillStyle = '#FEF08A';
      ctx.font = thaiFont('500', 26);
      let wishY = currentY + 76;
      for (const line of wishLines) {
        ctx.fillText(line, width / 2, wishY);
        wishY += 40;
      }

      currentY += wishBoxH + 40;

      // 6. Goddess's Headline Message
      ctx.fillStyle = '#FBBF24';
      ctx.font = thaiFont('bold', 32);
      ctx.textAlign = 'center';
      const headlineLines = wrapCanvasThai(blessing.headline, 820);
      for (const line of headlineLines) {
        ctx.fillText(line, width / 2, currentY);
        currentY += 46;
      }
      currentY += 15;

      // 7. Cleansing Message
      ctx.fillStyle = '#E2E8F0';
      ctx.font = thaiFont('normal', 25);
      const cleanseLines = wrapCanvasThai(blessing.cleansingWord, 820);
      for (const line of cleanseLines) {
        ctx.fillText(line, width / 2, currentY);
        currentY += 38;
      }
      currentY += 25;

      // 8. Main Wish Blessing (Glass Container Card)
      ctx.font = thaiFont('normal', 26);
      const blessingLines = wrapCanvasThai(blessing.wishBlessing, 780);
      const blessingBoxH = blessingLines.length * 42 + 48;

      drawRoundedRect(
        100,
        currentY,
        width - 200,
        blessingBoxH,
        24,
        'rgba(255, 255, 255, 0.04)',
        'rgba(245, 158, 11, 0.3)',
        1
      );

      ctx.fillStyle = '#FFFFFF';
      ctx.font = thaiFont('normal', 26);
      let bY = currentY + 44;
      for (const line of blessingLines) {
        ctx.fillText(line, width / 2, bY);
        bY += 42;
      }

      currentY += blessingBoxH + 30;

      // 9. Sacred Offering Acknowledgment (if provided)
      if (blessing.sacredOfferingWord) {
        ctx.font = thaiFont('normal', 22);
        const offLines = wrapCanvasThai(blessing.sacredOfferingWord, 760);
        const offBoxH = offLines.length * 34 + 36;

        drawRoundedRect(
          120,
          currentY,
          width - 240,
          offBoxH,
          18,
          'rgba(245, 158, 11, 0.12)',
          'rgba(245, 158, 11, 0.35)',
          1
        );

        ctx.fillStyle = '#FDE68A';
        ctx.font = thaiFont('normal', 22);
        let offY = currentY + 30;
        for (const line of offLines) {
          ctx.fillText(line, width / 2, offY);
          offY += 34;
        }
        currentY += offBoxH + 30;
      }

      // 10. Water Virtue Banner Box (ข้อคิดเตือนใจ)
      ctx.font = thaiFont('bold', 27);
      const punchLines = wrapCanvasThai(activeVirtue, 740);
      const punchBoxH = Math.max(130, punchLines.length * 44 + 70);

      const punchGrad = ctx.createLinearGradient(0, currentY, 0, currentY + punchBoxH);
      punchGrad.addColorStop(0, 'rgba(180, 83, 9, 0.35)');
      punchGrad.addColorStop(1, 'rgba(120, 53, 15, 0.55)');

      drawRoundedRect(
        100,
        currentY,
        width - 200,
        punchBoxH,
        24,
        punchGrad,
        '#F59E0B',
        2
      );

      // Mini Header inside Punchline Box
      ctx.fillStyle = '#FBBF24';
      ctx.font = thaiFont('bold', 20);
      ctx.textAlign = 'center';
      ctx.fillText('✦ ข้อคิดเตือนใจพระแม่คงคา • สิริมงคลคืนวันเพ็ญ ✦', width / 2, currentY + 36);

      // Punchline Text Lines
      ctx.fillStyle = '#FEF08A';
      ctx.font = thaiFont('bold', 27);
      let punchY = currentY + 82;
      for (const line of punchLines) {
        ctx.fillText(line, width / 2, punchY);
        punchY += 44;
      }

      // 11. Footer & University Branding
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(180, height - 130);
      ctx.lineTo(width - 180, height - 130);
      ctx.stroke();

      ctx.fillStyle = '#CBD5E1';
      ctx.font = thaiFont('500', 22);
      ctx.textAlign = 'center';
      ctx.fillText(
        'ประเพณีลอยกระทงออนไลน์ • มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ',
        width / 2,
        height - 90
      );

      ctx.fillStyle = '#94A3B8';
      ctx.font = thaiFont('normal', 19);
      ctx.fillText(
        'แชร์ลงสตอรี่เพื่อรับความเป็นสิริมงคล • #RMUTKLoyKrathong',
        width / 2,
        height - 56
      );

      // Convert to high-resolution PNG image and trigger browser download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `khongkha-blessing-${blessing.recipientName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // Fallback
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-5 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="khongkha-modal-title"
    >
      {/* Hidden Canvas for High-Resolution Export */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/15 w-full max-w-lg rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden text-slate-100 relative">
        {/* Divine Golden Water Ripple Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-amber-300 animate-pulse" />
            <span id="khongkha-modal-title" className="text-sm font-bold text-amber-300">
              พระแม่คงคาประสาทพร
            </span>
            {hasSprinkled && (
              <span className="hidden sm:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
                ✨ พรมน้ำมนต์แล้ว
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Selector Pills if User has Floated Multiple Krathongs */}
        {myKrathongs.length > 1 && (
          <div className="px-5 pt-3 pb-1 border-b border-white/5 bg-white/[0.02] flex items-center gap-1.5 overflow-x-auto no-scrollbar relative z-10">
            <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium mr-1">
              กระทงของฉัน:
            </span>
            {myKrathongs.map((k) => {
              const isSelected = activeKrathong?.id === k.id;
              const label =
                k.mode === 'couple' && k.secondary_name
                  ? `${k.sender_name} & ${k.secondary_name}`
                  : k.sender_name;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => handleSelectMyKrathong(k)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-400/90 text-slate-950 shadow-sm border border-amber-300/50'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  <span>🪷</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto font-thai space-y-4 text-left relative z-10">
          {/* =========================================================================
              SCENARIO 1: VISITOR MODE (ยังไม่ได้ลอยกระทงในค่ำคืนนี้)
              มีลูกเล่นเสี่ยงทายเปิดการ์ดพรศักดิ์สิทธิ์ + พรมน้ำมนต์ + สะพานสู่การลอยกระทง
             ========================================================================= */}
          {!activeKrathong ? (
            <div className="space-y-4">
              {/* Altar Welcome Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-400/10 to-amber-500/5 border border-amber-300/25 text-center relative overflow-hidden">
                <div className="w-11 h-11 rounded-full border border-amber-400/40 bg-amber-400/15 flex items-center justify-center shadow-lg shadow-amber-500/10 mx-auto mb-2">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-amber-200">
                  โองการพระแม่คงคา • วันเพ็ญ มทร.กรุงเทพ
                </h3>
                <p className="text-xs text-slate-300/90 mt-1 max-w-sm mx-auto leading-relaxed">
                  คืนนี้เจ้ายังมิได้ลอยกระทงสู่สระน้ำ แต่พระแม่คงคาสถิต ณ สระน้ำแห่งนี้ พร้อมมอบพลังใจดีๆ และความสิริมงคลให้เธอเสมอ ✨
                </p>
              </div>

              {/* Category Pills for Daily Blessing */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>เลือกพลังงานที่คุณอยากเปิดรับในค่ำคืนนี้:</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {[
                    { id: 'all' as const, label: '🍀 สุ่มรวมมิตร' },
                    { id: 'study' as const, label: '📚 เรื่องเรียน/สอบ' },
                    { id: 'career' as const, label: '💼 การงาน/การเงิน' },
                    { id: 'love' as const, label: '💖 ความรัก/คนโปรด' },
                    { id: 'health' as const, label: '🧘‍♀️ สุขภาพใจ/ปล่อยจอย' },
                  ].map((cat) => {
                    const isSelected = visitorCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectVisitorCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center flex-shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400/90 text-slate-950 font-bold border border-amber-300/50 shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Card: Unrevealed State (Mystery Card) vs Revealed State */}
              {!isCardRevealed ? (
                <div
                  onClick={handleRevealCard}
                  className="group cursor-pointer p-6 rounded-3xl bg-slate-900/60 border-2 border-dashed border-amber-300/40 hover:border-amber-300/80 transition-all duration-300 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden shadow-xl"
                >
                  {/* Subtle pulsing background glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-400/10 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                  {/* Sacred Water Ripple Center */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-amber-300/40 animate-ping opacity-60" />
                    <div className="absolute inset-2 rounded-full border border-amber-400/60 animate-pulse" />
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300/25 to-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-400/20 group-hover:scale-110 transition-transform">
                      <Droplets className="w-7 h-7 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-1">
                    <div className="text-sm font-bold text-amber-200 group-hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5">
                      <span>แตะผิวน้ำ เพื่อเปิดโองการรับพรพระแม่</span>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <p className="text-xs text-slate-400">
                      สัมผัสสายน้ำศักดิ์สิทธิ์ เสี่ยงทายรับพรพลังบวกประจำวัน ฉบับ Gen-Z
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 animate-fadeIn">
                  {/* Headline Message from Goddess */}
                  <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/25 text-amber-100 text-xs sm:text-sm leading-relaxed text-center font-bold">
                    {blessing.headline}
                  </div>

                  {/* Main Blessing & Real-Talk Advice */}
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                    <p className="text-slate-300 font-medium">{blessing.cleansingWord}</p>
                    <p className="text-amber-100 leading-relaxed">{blessing.wishBlessing}</p>
                  </div>

                  {/* Punchline Virtue Card */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-center text-xs sm:text-sm text-amber-200 font-bold">
                    {activeVirtue}
                  </div>

                  {/* Interactive Utility Row for Visitor Card */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDrawNewCard}
                      className="h-8 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                      <span>สุ่มเปิดใบใหม่</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSprinkleWater}
                      className="h-8 px-3 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-300/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Droplets className="w-3.5 h-3.5 text-amber-300" />
                      <span>แตะพรมน้ำมนต์</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShuffleVirtue}
                      className="h-8 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>สลับข้อคิด</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bridge to Floating Krathong (CTA สร้างกระทง) */}
              {onOpenCustomizer && (
                <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 border border-amber-300/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-200 block">
                      อยากได้พรเฉพาะตัวของคุณโดยเฉพาะไหม?
                    </span>
                    <span className="text-[11px] text-slate-300 block">
                      สร้างกระทงของคุณ ระบุคำขอ แล้วปล่อยสู่สระน้ำเพื่อรับโองการเฉพาะตัว
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenCustomizer}
                    className="w-full sm:w-auto h-9 px-4 rounded-full font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <span>🪷 ปล่อยกระทงของฉัน</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* =========================================================================
               SCENARIO 2: SPECIFIC KRATHONG MODE (มีกระทงของตัวเอง หรือเปิดดูจากสระ)
               ========================================================================= */
            <div className="space-y-3.5">
              {/* Emblem & Title */}
              <div className="flex flex-col items-center text-center pb-1">
                <div className="w-12 h-12 rounded-full border border-amber-400/40 bg-amber-400/10 flex items-center justify-center shadow-lg shadow-amber-500/10 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-amber-200">
                  โองการพระแม่คงคา • RMUTK 2026
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ประสาทพรอวยชัยในค่ำคืนวันเพ็ญ มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ
                </p>
                {isOwner && (
                  <span className="mt-1.5 inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
                    ✦ กระทงของคุณในสระน้ำ ✦
                  </span>
                )}
              </div>

              {/* Recipient Details Pill */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 text-xs block">ผู้รับพร</span>
                  <span className="font-bold text-amber-300">{blessing.recipientName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-xs block">สังกัด</span>
                  <span className="text-slate-200">{blessing.faculty}</span>
                </div>
              </div>

              {/* User's Original Wish */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <span className="text-xs text-slate-400 block mb-0.5">คำขอของคุณคืนนี้:</span>
                <p className="text-xs sm:text-sm text-amber-200 font-medium whitespace-pre-wrap break-words [overflow-wrap:anywhere] break-all drop-shadow-[0_0_8px_rgba(251,191,36,0.25)]">
                  “{blessing.wish}”
                </p>
              </div>

              {/* Headline Message from Goddess */}
              <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/25 text-amber-100 text-xs sm:text-sm leading-relaxed text-center font-bold">
                {blessing.headline}
              </div>

              {/* Main Blessing & Real-Talk Advice */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <p className="text-slate-300 font-medium">{blessing.cleansingWord}</p>
                <p className="text-amber-100 leading-relaxed">{blessing.wishBlessing}</p>

                {/* Sacred Offering Acknowledgement */}
                {blessing.sacredOfferingWord && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/25 text-amber-200 text-xs leading-relaxed">
                    {blessing.sacredOfferingWord}
                  </div>
                )}
              </div>

              {/* Punchline Card */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-center text-xs sm:text-sm text-amber-200 font-bold">
                {activeVirtue}
              </div>

              {/* Interactive Utility Row for Krathong Blessing */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSprinkleWater}
                  className="h-8 px-3 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-300/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Droplets className="w-3.5 h-3.5 text-amber-300" />
                  <span>แตะพรมน้ำมนต์</span>
                </button>

                <button
                  type="button"
                  onClick={handleShuffleVirtue}
                  className="h-8 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>สลับข้อคิด</span>
                </button>

                {isOwner && onLocateKrathong && (
                  <button
                    type="button"
                    onClick={() => onLocateKrathong(activeKrathong)}
                    className="h-8 px-3 rounded-full bg-cyan-400/15 hover:bg-cyan-400/25 border border-cyan-300/30 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-cyan-300" />
                    <span>ดูกระทงในสระ</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons (Uniform Standard Heights) */}
        <div className="p-4 sm:p-5 border-t border-white/10 flex items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={handleDownloadParchment}
            disabled={isDownloading}
            className="flex-1 h-11 sm:h-12 px-4 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400/90 via-amber-300/90 to-amber-400/90 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-200/50 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'กำลังสร้างใบพร...' : 'บันทึกใบพรลงเครื่อง'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="h-11 sm:h-12 px-5 rounded-full font-semibold text-xs sm:text-sm bg-white/8 hover:bg-white/15 border border-white/12 text-slate-200 flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer flex-shrink-0"
          >
            {copied ? (
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> คัดลอกแล้ว
              </span>
            ) : (
              <span>คัดลอกพร</span>
            )}
          </button>
        </div>

        {/* Holy Water Sprinkle Animation Overlay */}
        {isSprinkling && (
          <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-amber-400/10 backdrop-blur-[2px] animate-fadeIn">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-amber-300/80 animate-ping" />
              <div className="absolute inset-3 rounded-full border border-amber-200/90 animate-waterExpandPulse" />
              <div className="w-16 h-16 rounded-full bg-amber-300/30 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-amber-400/50">
                <Droplets className="w-8 h-8 text-amber-200 animate-bounce" />
              </div>
            </div>
            <div className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-300/50 text-amber-200 text-xs font-bold shadow-xl animate-bounce">
              ✨ พรมน้ำมนต์ศักดิ์สิทธิ์ • เสริมสิริมงคล พลังบวกเต็ม 100% ✨
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

