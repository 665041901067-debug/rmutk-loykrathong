'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { KrathongBase, FlowerType, CandleSet, SacredItem } from '@/types';
import { KrathongSVG } from '../Krathong/KrathongSVG';
import { X, Download, Copy, Check, Sparkles, QrCode } from 'lucide-react';
import { saveOrShareImage, waitForFonts } from '@/lib/imageExport';

interface InviteStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyCode: string;
  base?: KrathongBase;
  flower?: FlowerType;
  candle?: CandleSet;
  sacredItems?: SacredItem[];
  hostName?: string;
}

const INVITE_MESSAGE_PRESETS = [
  'มาลอยกระทงด้วยกันไหม',
  'ใครยังไม่มีคู่ มาลอยกับเรานะ',
  'เด็ก มทร. คืนนี้มาลอยกัน',
  'ลอยคนเดียวมันเหงา มาลอยคู่เราปะ',
  'ขอให้เทอมนี้ A ล้วน สาธุ!',
];

const THEME_COLORS = [
  { id: 'midnight', bg: '#0A1224', label: 'มิดไนท์' },
  { id: 'gold', bg: '#2A1F0D', label: 'ทองคำ' },
  { id: 'rose', bg: '#270F19', label: 'กุหลาบ' },
  { id: 'emerald', bg: '#0A2016', label: 'มรกต' },
  { id: 'purple', bg: '#1C0D2E', label: 'ม่วงคราม' },
];

export const InviteStoryModal: React.FC<InviteStoryModalProps> = ({
  isOpen,
  onClose,
  partyCode,
  base = 'gear-base',
  flower = 'lotus',
  candle = 'traditional',
  sacredItems = ['coin'],
  hostName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [customMessage, setCustomMessage] = useState<string>('มาลอยกระทงด้วยกันไหม');
  const [showQR, setShowQR] = useState<boolean>(true);
  const [themeColor, setThemeColor] = useState<string>('#0A1224');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const getInviteUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?party=${encodeURIComponent(partyCode)}`;
  }, [partyCode]);

  // Generate 9:16 Canvas Story Image
  const generateStoryCard = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);

    try {
      // Fast non-blocking font ready check (max 120ms timeout race)
      await waitForFonts(120);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const thaiFont = (weight: string | number, size: number) =>
        `${weight} ${size}px "Prompt", "Noto Sans Thai", "Kanit", -apple-system, sans-serif`;

      const width = 1080;
      const height = 1920;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#040711');
      bgGrad.addColorStop(0.35, themeColor);
      bgGrad.addColorStop(0.65, '#070D1B');
      bgGrad.addColorStop(1, '#020409');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Stars & Ambient Particles
      for (let i = 0; i < 70; i++) {
        const sx = (Math.sin(i * 99 + 17) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 33 + 71) * 0.5 + 0.5) * (height * 0.55);
        const sr = 1 + (i % 3);
        const sa = 0.25 + ((i % 5) * 0.15);
        ctx.fillStyle = `rgba(255, 255, 255, ${sa})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Glowing Full Moon (Positioned high in top-right sky so it never overlaps text)
      const moonX = width - 140;
      const moonY = 150;
      const moonRadius = 52;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, moonRadius * 2.8);
      moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      moonGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
      moonGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FEF9C3';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Moon craters
      ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
      ctx.beginPath();
      ctx.arc(moonX - 14, moonY - 10, 12, 0, Math.PI * 2);
      ctx.arc(moonX + 16, moonY + 12, 16, 0, Math.PI * 2);
      ctx.arc(moonX - 5, moonY + 18, 10, 0, Math.PI * 2);
      ctx.fill();

      // 4. Header Badge
      ctx.textAlign = 'center';
      ctx.font = thaiFont('500', 28);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.fillText('คืนลอยกระทงออนไลน์ • มทร.กรุงเทพ', width / 2, 160);

      // 5. Host Name Subtitle
      if (hostName) {
        ctx.font = thaiFont('600', 30);
        ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
        ctx.fillText(`ชวนโดย: ${hostName}`, width / 2, 215);
      }

      // 6. Custom Invite Message (Thai Word Wrapping with clear layout)
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
        return lines.slice(0, 3);
      };

      ctx.font = thaiFont('700', 56);
      ctx.fillStyle = '#FFFFFF';
      const msgLines = wrapThai(customMessage, 860);
      const startMsgY = hostName ? 310 : 280;
      msgLines.forEach((line, idx) => {
        ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
        ctx.shadowBlur = 16;
        ctx.fillText(line, width / 2, startMsgY + idx * 76);
      });
      ctx.shadowBlur = 0;

      // Squad Tag Pill (Clear position below message)
      const squadPillY = startMsgY + msgLines.length * 76 + 10;
      const squadPillW = 340;
      const squadPillH = 50;
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect((width - squadPillW) / 2, squadPillY, squadPillW, squadPillH, 25);
      } else {
        ctx.rect((width - squadPillW) / 2, squadPillY, squadPillW, squadPillH);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.font = thaiFont('600', 26);
      ctx.fillStyle = '#FDE68A';
      ctx.fillText(`ก๊วนชวนลอย: ${partyCode}`, width / 2, squadPillY + 34);

      // 7. Water Surface & Ripples
      const waterY = 660;
      const rippleGrad = ctx.createLinearGradient(0, waterY, 0, height);
      rippleGrad.addColorStop(0, 'rgba(14, 165, 233, 0.15)');
      rippleGrad.addColorStop(0.35, 'rgba(30, 58, 138, 0.4)');
      rippleGrad.addColorStop(1, 'rgba(3, 7, 18, 0.95)');
      ctx.fillStyle = rippleGrad;
      ctx.fillRect(0, waterY, width, height - waterY);

      // Water Ripple Ellipses
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(width / 2, 1020, 360, 42, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.16)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(width / 2, 1060, 440, 50, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 8. Render Krathong SVG into Canvas
      const offscreenDiv = document.getElementById('story-krathong-offscreen');
      if (offscreenDiv) {
        const svgEl = offscreenDiv.querySelector('svg');
        if (svgEl) {
          const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
          clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          const svgData = new XMLSerializer().serializeToString(clonedSvg);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const URLObj = window.URL || window.webkitURL || window;
          const blobUrl = URLObj.createObjectURL(svgBlob);

          const img = new Image();
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
              URLObj.revokeObjectURL(blobUrl);
              resolve();
            }, 600);

            img.onload = () => {
              clearTimeout(timeout);
              const kw = 460;
              const kh = (kw * 240) / 300;
              const kx = (width - kw) / 2;
              const ky = 720;
              ctx.drawImage(img, kx, ky, kw, kh);
              URLObj.revokeObjectURL(blobUrl);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timeout);
              URLObj.revokeObjectURL(blobUrl);
              resolve();
            };
            img.src = blobUrl;
          });
        }
      }

      // 9. QR Code Box (If enabled, nicely separated at bottom)
      if (showQR) {
        const inviteUrl = getInviteUrl();
        const qrDataUrl = await QRCode.toDataURL(inviteUrl, {
          width: 240,
          margin: 1,
          color: {
            dark: '#0A1224',
            light: '#FFFFFF',
          },
        });

        const qrImg = new Image();
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, 600);
          qrImg.onload = () => {
            clearTimeout(timeout);
            const qrSize = 220;
            const qrX = (width - qrSize) / 2;
            const qrY = 1280;

            // White rounded box background for QR
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 24);
            } else {
              ctx.rect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
            }
            ctx.fill();

            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            resolve();
          };
          qrImg.onerror = () => {
            clearTimeout(timeout);
            resolve();
          };
          qrImg.src = qrDataUrl;
        });

        // Scan Subtitle
        ctx.font = thaiFont('500', 26);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText('สแกน QR Code หรือแตะลิงก์ มาลอยด้วยกันนะ', width / 2, 1575);
      } else {
        ctx.font = thaiFont('500', 28);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText('สระน้ำแห่งคำอธิษฐาน มทร.กรุงเทพ', width / 2, 1450);
      }

      // 10. University Watermark Footer
      ctx.font = thaiFont('400', 22);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.fillText('มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ • #RMUTKLoyKrathong', width / 2, height - 75);

      setPreviewUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.warn('Error generating story card:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [customMessage, showQR, themeColor, partyCode, hostName, getInviteUrl]);

  // Debounced card generation when user edits text/theme
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      generateStoryCard();
    }, 120);
    return () => clearTimeout(timer);
  }, [isOpen, generateStoryCard]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!previewUrl || !canvasRef.current) return;
    setIsSaving(true);
    try {
      await saveOrShareImage(
        canvasRef.current,
        `RMUTK-LoyKrathong-Story-${partyCode}.png`,
        `ชวนลอยกระทงออนไลน์ มทร.กรุงเทพ ก๊วน ${partyCode}`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getInviteUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-modal-title"
    >
      {/* Hidden offscreen SVG container for canvas rendering */}
      <div id="story-krathong-offscreen" className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
        <KrathongSVG
          base={base}
          flower={flower}
          candle={candle}
          sacredItems={sacredItems}
          isLit={true}
          size={300}
          showWaterRipples={true}
        />
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 w-full max-w-sm rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col max-h-[92dvh] text-slate-100 overflow-hidden relative">
        {/* Header - Pinned at Top */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 flex-shrink-0">
          <div>
            <h3 id="story-modal-title" className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>แชร์เป็นรูป (ลงสตอรี่ IG / TikTok)</span>
            </h3>
            <p className="text-[11px] text-slate-400">ชวนเพื่อนหรือคนรู้ใจมาร่วมก๊วน</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto p-3.5 sm:p-4 space-y-3.5 flex-1 font-thai no-scrollbar">
          {/* 1. Custom Message Input */}
          <div>
            <label htmlFor="custom-story-msg" className="block text-xs font-semibold text-slate-300 mb-1">
              ข้อความบนรูป (แก้ไขได้อิสระ):
            </label>
            <input
              id="custom-story-msg"
              type="text"
              maxLength={40}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="เช่น มาลอยกระทงด้วยกันไหม"
              className="w-full h-10 bg-white/[0.04] border border-white/15 rounded-xl px-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 font-thai"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {INVITE_MESSAGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCustomMessage(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    customMessage === preset
                      ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 font-medium'
                      : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Visual Story Preview (Compact 9:16 aspect ratio box) */}
          <div className="relative w-full max-w-[210px] sm:max-w-[230px] aspect-[9/16] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black/40 flex items-center justify-center">
            {isGenerating || !previewUrl ? (
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>กำลังสร้างรูปสตอรี่...</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Story Preview"
                className="w-full h-full object-cover select-all pointer-events-auto cursor-pointer"
                title="แตะค้างเพื่อบันทึกรูปภาพ"
              />
            )}
          </div>

          {/* Mobile tip: Tap and hold image */}
          <p className="text-[11px] text-slate-400 text-center leading-normal">
            💡 บนมือถือ: แตะปุ่ม <span className="text-amber-300">บันทึกรูปภาพ</span> ด้านล่าง หรือแตะค้างที่รูปเพื่อเซฟลงเครื่อง
          </p>

          {/* 3. Controls: QR Code Toggle & Color Themes */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
            {/* QR Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showQR}
                onChange={(e) => setShowQR(e.target.checked)}
                className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 bg-black/40 border-white/20 cursor-pointer"
              />
              <span className="font-semibold text-slate-200 flex items-center gap-1 text-[11px] sm:text-xs">
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>ใส่ QR Code</span>
              </span>
            </label>

            {/* Theme Color Dots */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">โทนสี:</span>
              {THEME_COLORS.map((thm) => (
                <button
                  key={thm.id}
                  type="button"
                  onClick={() => setThemeColor(thm.bg)}
                  title={thm.label}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border transition-all cursor-pointer ${
                    themeColor === thm.bg
                      ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 border-white scale-110'
                      : 'border-white/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: thm.bg }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 4. Action Buttons (PINNED AT BOTTOM, Never Cut Off) */}
        <div className="p-3 sm:p-3.5 border-t border-white/10 bg-slate-900/95 grid grid-cols-2 gap-2 flex-shrink-0 z-20">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating || !previewUrl || isSaving}
            className="h-11 px-3 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400/90 via-amber-300/90 to-amber-400/90 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-200/50 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกรูปภาพ'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="h-11 px-3 rounded-full font-semibold text-xs sm:text-sm bg-white/8 hover:bg-white/15 border border-white/12 text-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">คัดลอกแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>คัดลอกลิงก์</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
