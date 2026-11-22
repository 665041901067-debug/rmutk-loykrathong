'use client';

import React, { useState, useRef } from 'react';
import { FortuneStick } from '@/types';
import { FORTUNES } from '@/data/fortunes';
import { useDeviceMotion } from '@/hooks/useDeviceMotion';
import { sound } from '@/lib/sound';
import { X, Sparkles, Smartphone, RotateCcw, Download, Copy, Check } from 'lucide-react';

interface FortuneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FortuneModal: React.FC<FortuneModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedFortune, setSelectedFortune] = useState<FortuneStick | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleDrawFortune = () => {
    if (isShaking) return;
    setIsShaking(true);
    setSelectedFortune(null);
    sound.playTempleBell();

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * FORTUNES.length);
      setSelectedFortune(FORTUNES[randomIndex]);
      setIsShaking(false);
      sound.playSparkle();
    }, 1100);
  };

  const handleCopyText = async () => {
    if (!selectedFortune) return;
    const text = `[เซียมซีเด็ก มทร. ใบที่ ${selectedFortune.number}: ${selectedFortune.title} (${selectedFortune.level})]\n\n${selectedFortune.prediction}\n\n(ลอยกระทงออนไลน์ มทร.กรุงเทพ • #RMUTKLoyKrathong)`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSaveFortuneStory = async () => {
    if (!canvasRef.current || !selectedFortune) return;
    setIsSaving(true);

    try {
      if (typeof document !== 'undefined' && 'fonts' in document) {
        try {
          await document.fonts.load('bold 60px "Prompt"');
          await document.fonts.load('34px "Prompt"');
          await document.fonts.load('24px "Prompt"');
          await document.fonts.ready;
        } catch {
          // Fallback if font promise fails
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
        `${weight} ${size}px "Prompt", "Noto Sans Thai", "Kanit", -apple-system, sans-serif`;

      // Helper: Thai word wrap
      const wrapThai = (text: string, maxWidth: number): string[] => {
        if (!text) return [];
        let words: string[] = [];
        if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
          try {
            const segmenter = new (Intl as any).Segmenter('th', { granularity: 'word' });
            words = Array.from(segmenter.segment(text), (s: any) => s.segment);
          } catch {
            words = text.split(' ');
          }
        } else {
          words = text.split(' ');
        }
        const lines: string[] = [];
        let cur = '';
        for (const w of words) {
          const test = cur + w;
          if (ctx.measureText(test).width > maxWidth && cur.length > 0) {
            lines.push(cur.trim());
            cur = w;
          } else {
            cur = test;
          }
        }
        if (cur.trim().length > 0) lines.push(cur.trim());
        return lines;
      };

      // Helper: Rounded rect
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

      // 1. Cosmic Night Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.3, '#071638');
      bgGrad.addColorStop(0.7, '#0B2354');
      bgGrad.addColorStop(1, '#020510');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient Starlight
      for (let i = 0; i < 70; i++) {
        const sx = (Math.sin(i * 123 + 47) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 61 + 89) * 0.5 + 0.5) * height;
        const sr = 1 + (i % 3);
        const sa = 0.2 + ((i % 5) * 0.15);
        ctx.fillStyle = `rgba(254, 240, 138, ${sa})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glowing Full Moon
      const mx = width * 0.82;
      const my = 260;
      const moonGlow = ctx.createRadialGradient(mx, my, 20, mx, my, 220);
      moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      moonGlow.addColorStop(0.6, 'rgba(245, 158, 11, 0.08)');
      moonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(mx, my, 220, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FEF9C3';
      ctx.beginPath();
      ctx.arc(mx, my, 65, 0, Math.PI * 2);
      ctx.fill();

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

      // Star Accents on corners
      const drawStar = (x: number, y: number) => {
        ctx.save();
        ctx.fillStyle = '#FDE68A';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 10;
        ctx.fillText('✦', x, y);
        ctx.restore();
      };
      drawStar(85, 85);
      drawStar(width - 85, 85);
      drawStar(width - 85, height - 85);
      drawStar(85, height - 85);

      // Header Tag
      ctx.fillStyle = '#FBBF24';
      ctx.font = thaiFont('600', 26);
      ctx.textAlign = 'center';
      ctx.fillText('✦ ORACLE CARD • เซียมซีคืนวันเพ็ญ ✦', width / 2, 190);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = thaiFont('400', 22);
      ctx.fillText('ลอยกระทงออนไลน์ มทร.กรุงเทพ', width / 2, 235);

      // Center Oracle Card Container
      const cardY = 340;
      const cardW = width - 160;
      const cardH = 1200;
      const cardX = 80;

      // Card Gradient Fill
      const cardGrad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
      cardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
      cardGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');

      drawRoundedRect(cardX, cardY, cardW, cardH, 32, cardGrad, 'rgba(245, 158, 11, 0.35)', 2);

      // Pill: Fortune Number & Level
      const pillW = 420;
      const pillH = 54;
      const pillX = width / 2 - pillW / 2;
      const pillY = cardY + 60;
      drawRoundedRect(pillX, pillY, pillW, pillH, 27, 'rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.5)', 1.5);

      ctx.fillStyle = '#FDE68A';
      ctx.font = thaiFont('bold', 24);
      ctx.textAlign = 'center';
      ctx.fillText(`ใบที่ ${selectedFortune.number}  •  ${selectedFortune.level}`, width / 2, pillY + 36);

      // Fortune Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = thaiFont('bold', 54);
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 12;
      ctx.fillText(selectedFortune.title, width / 2, cardY + 200);
      ctx.shadowBlur = 0;

      // Divider Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + 60, cardY + 250);
      ctx.lineTo(cardX + cardW - 60, cardY + 250);
      ctx.stroke();

      // Prediction Box
      const predBoxY = cardY + 300;
      const predBoxH = 680;
      drawRoundedRect(
        cardX + 40,
        predBoxY,
        cardW - 80,
        predBoxH,
        24,
        'rgba(255, 255, 255, 0.04)',
        'rgba(255, 255, 255, 0.1)',
        1
      );

      ctx.font = thaiFont('400', 36);
      ctx.fillStyle = '#F1F5F9';
      ctx.textAlign = 'center';
      const predLines = wrapThai(selectedFortune.prediction, cardW - 160);
      let textY = predBoxY + 90;
      for (const line of predLines) {
        ctx.fillText(line, width / 2, textY);
        textY += 64;
      }

      // Footnote inside card
      ctx.fillStyle = '#FBBF24';
      ctx.font = thaiFont('bold', 24);
      ctx.fillText('✦ RMUTK 2026 • ขอให้พบเจอแต่ความสุขและความโชคดี ✦', width / 2, cardY + cardH - 60);

      // Bottom Watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = thaiFont('500', 22);
      ctx.textAlign = 'center';
      ctx.fillText('ประเพณีลอยกระทงออนไลน์ • มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ', width / 2, height - 120);

      ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.font = thaiFont('400', 20);
      ctx.fillText('แชร์ลงสตอรี่เพื่อรับความเป็นสิริมงคล • #RMUTKLoyKrathong', width / 2, height - 85);

      // Export to PNG and trigger browser download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `rmutk-fortune-${selectedFortune.number}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.warn('Error saving fortune card:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const { isSupported, hasPermission, needsPermissionRequest, requestPermission } =
    useDeviceMotion({
      onShake: handleDrawFortune,
    });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fortune-title"
    >
      {/* Hidden Canvas for High-Res PNG Export */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 w-full max-w-sm sm:max-w-md rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden text-slate-100 relative flex flex-col max-h-[92dvh]">
        {/* Subtle Top Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 relative z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h3 id="fortune-title" className="text-sm sm:text-base font-bold text-white font-thai">
              เซียมซีคำทำนายคืนวันเพ็ญ • RMUTK
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="ปิดเซียมซี"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex flex-col items-center text-center font-thai relative z-10 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
          {!selectedFortune ? (
            <div className="w-full flex flex-col items-center py-2">
              {/* Bamboo Stick Cylinder Graphic */}
              <div
                className={`relative w-24 h-36 bg-gradient-to-b from-amber-700 to-amber-900 rounded-t-xl rounded-b-2xl border-2 border-amber-400/60 shadow-2xl flex items-center justify-center transition-transform ${
                  isShaking ? 'animate-bounce' : ''
                }`}
              >
                {/* Bamboo Stripes */}
                <div className="absolute inset-x-0 top-3 h-0.5 bg-amber-400/30" />
                <div className="absolute inset-x-0 bottom-5 h-0.5 bg-amber-400/30" />

                {/* Sticking Fortune Slips */}
                <div className="absolute -top-7 flex gap-1.5">
                  <div className="w-2.5 h-14 bg-rose-600 rounded-t-sm shadow -rotate-12" />
                  <div className="w-2.5 h-16 bg-rose-600 rounded-t-sm shadow -rotate-3" />
                  <div className="w-2.5 h-18 bg-amber-200 rounded-t-sm shadow rotate-6" />
                  <div className="w-2.5 h-14 bg-rose-600 rounded-t-sm shadow rotate-12" />
                </div>

                <span className="text-amber-200 font-bold text-xs tracking-widest uppercase">
                  เซียมซี
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 mt-5 max-w-xs leading-relaxed">
                เสี่ยงทายเซียมซีเช็กดวงเรื่องเรียน ความรัก และชีวิต คืนลอยกระทง มทร.กรุงเทพ
              </p>

              {/* Draw Button (Uniform Standard Height h-12) */}
              <button
                type="button"
                onClick={handleDrawFortune}
                disabled={isShaking}
                className="w-full h-12 mt-5 px-6 rounded-full font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center"
              >
                {isShaking ? 'กำลังเขย่าเซียมซี...' : 'เสี่ยงทายใบคำทำนาย'}
              </button>

              {/* Motion Sensor Shake Option */}
              {isSupported && (
                <div className="mt-3">
                  {needsPermissionRequest && !hasPermission ? (
                    <button
                      type="button"
                      onClick={requestPermission}
                      className="text-xs text-amber-300 flex items-center gap-1.5 hover:underline"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>เปิดระบบเขย่ามือถือเพื่อเสี่ยงทาย</span>
                    </button>
                  ) : hasPermission ? (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>เขย่ามือถือของคุณเพื่อดูดวงได้เลย</span>
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-fadeIn space-y-4">
              {/* Sleek Gen-Z Frosted Glass Oracle Card */}
              <div className="w-full bg-white/[0.05] border border-amber-400/30 text-slate-100 p-5 sm:p-6 rounded-3xl shadow-xl backdrop-blur-xl text-left relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

                {/* Capsule Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    ใบที่ {selectedFortune.number}
                  </span>
                  <span className="bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                    {selectedFortune.level}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-base sm:text-lg font-bold text-white mb-2.5">
                  {selectedFortune.title}
                </h4>

                {/* Prediction Text */}
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                  {selectedFortune.prediction}
                </p>

                {/* Footer Tag */}
                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-amber-300/80 text-center font-medium">
                  ✦ RMUTK 2026 • ขอให้สมหวังดั่งใจในคืนลอยกระทง ✦
                </div>
              </div>

              {/* Action Buttons: Save Story, Copy, Redraw (Standardized Uniform Heights) */}
              <div className="w-full space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveFortuneStory}
                  disabled={isSaving}
                  className="w-full h-12 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>{isSaving ? 'กำลังสร้างรูปสตอรี่...' : 'บันทึกภาพลงเครื่อง (สตอรี่)'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="h-11 rounded-full text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span className="text-emerald-300 font-bold">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>คัดลอกคำทำนาย</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDrawFortune}
                    className="h-11 rounded-full text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                    <span>เสี่ยงทายอีกรอบ</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
