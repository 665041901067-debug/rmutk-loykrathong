'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { Krathong, StoryCardFormat } from '@/types';
import { KrathongSVG } from '../Krathong/KrathongSVG';
import { BASES, FLOWERS, CANDLES } from '@/data/krathongOptions';
import { X, Download, Share2, Sparkles, Check, AlertCircle, Smartphone, Square, Droplets } from 'lucide-react';
import { saveOrShareImage, waitForFonts } from '@/lib/imageExport';

interface WishCardModalProps {
  krathong: Krathong | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFortune?: () => void;
  onOpenKhongkhaBlessing?: (krathong: Krathong) => void;
}

export const WishCardModal: React.FC<WishCardModalProps> = ({
  krathong,
  isOpen,
  onClose,
  onOpenFortune,
  onOpenKhongkhaBlessing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cardFormat, setCardFormat] = useState<StoryCardFormat>('story');
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const generateCard = useCallback(async () => {
    if (!krathong || !canvasRef.current) return;
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Fast non-blocking font ready check (max 120ms timeout race)
      await waitForFonts(120);

      const canvas = canvasRef.current;
      const isStory = cardFormat === 'story';
      const width = 1080;
      const height = isStory ? 1920 : 1080;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get 2d context');

      const thaiFont = (weight: string, size: number) =>
        `${weight} ${size}px "Prompt", "Noto Sans Thai", "Kanit", -apple-system, sans-serif`;

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

      // Helper: Rounded Rectangle
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

      // 1. NIGHT SKY & POND WATER BACKGROUND (Aesthetic Gen-Z Midnight Gradient)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(0.3, '#071530');
      bgGrad.addColorStop(0.65, '#0A2046');
      bgGrad.addColorStop(1, '#020611');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Starlight Particles
      for (let i = 0; i < (isStory ? 60 : 35); i++) {
        const sx = (Math.sin(i * 127 + 31) * 0.5 + 0.5) * (width - 100) + 50;
        const sy = (Math.cos(i * 47 + 89) * 0.5 + 0.5) * (height * 0.5) + 40;
        const sr = 1 + (i % 3) * 0.6;
        const sa = 0.2 + (i % 4) * 0.15;
        ctx.fillStyle = `rgba(255, 255, 255, ${sa})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // FULL MOON WITH SOFT CELESTIAL AURA
      const moonX = isStory ? 860 : 880;
      const moonY = isStory ? 200 : 140;
      const moonHalo = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, isStory ? 160 : 110);
      moonHalo.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
      moonHalo.addColorStop(0.5, 'rgba(245, 158, 11, 0.1)');
      moonHalo.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = moonHalo;
      ctx.beginPath();
      ctx.arc(moonX, moonY, isStory ? 160 : 110, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FEFCE8';
      ctx.beginPath();
      ctx.arc(moonX, moonY, isStory ? 48 : 36, 0, Math.PI * 2);
      ctx.fill();

      // 2. MINIMALIST CARD BORDER (Clean rounded hairline, No Clunky Temple Corners!)
      drawRoundedRect(
        36,
        36,
        width - 72,
        height - 72,
        36,
        undefined,
        'rgba(255, 255, 255, 0.14)',
        1.5
      );

      // Subtle Corner Sparkles
      ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
      ctx.font = '22px sans-serif';
      ctx.fillText('✦', 64, 76);
      ctx.fillText('✦', width - 64, height - 60);

      // 3. HEADER TITLES (Modern Editorial Sans-Serif)
      ctx.textAlign = 'center';

      if (isStory) {
        // STORY 9:16 LAYOUT
        ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.font = thaiFont('600', 22);
        ctx.fillText('RMUTK ONLINE LOY KRATHONG • สระน้ำแห่งคำอธิษฐาน', 540, 130);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = thaiFont('bold', 48);
        ctx.fillText('ลอยกระทงคืนวันเพ็ญ', 540, 190);

        if (krathong.party_code) {
          drawRoundedRect(
            540 - 200,
            220,
            400,
            44,
            22,
            'rgba(6, 182, 212, 0.15)',
            'rgba(6, 182, 212, 0.4)',
            1.2
          );
          ctx.fillStyle = '#67E8F9';
          ctx.font = thaiFont('600', 20);
          ctx.fillText(`ก๊วนเพื่อน: ${krathong.party_code}`, 540, 248);
        }
      } else {
        // SQUARE 1:1 LAYOUT
        ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.font = thaiFont('600', 18);
        ctx.fillText('RMUTK ONLINE LOY KRATHONG', 540, 95);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = thaiFont('bold', 36);
        ctx.fillText('ลอยกระทง มทร.กรุงเทพ', 540, 140);
      }

      // 4. DRAW ACTUAL KRATHONG SVG (Centered with Water Ripple Waves)
      const container = document.getElementById('wish-card-svg-container');
      const svgElement = container?.querySelector('svg');

      if (svgElement) {
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const targetW = isStory ? 520 : 400;
        const targetH = isStory ? 416 : 320;
        clonedSvg.setAttribute('width', String(targetW));
        clonedSvg.setAttribute('height', String(targetH));

        const svgString = new XMLSerializer().serializeToString(clonedSvg);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const img = new Image();

        await new Promise<void>((resolve) => {
          img.onload = () => {
            const krathongCenterX = 540;
            const krathongBaseY = isStory ? 680 : 425;

            // Water Surface Ambient Glow
            const waterGlow = ctx.createRadialGradient(
              krathongCenterX,
              krathongBaseY,
              20,
              krathongCenterX,
              krathongBaseY,
              isStory ? 290 : 210
            );
            waterGlow.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
            waterGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
            waterGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = waterGlow;
            ctx.beginPath();
            ctx.ellipse(
              krathongCenterX,
              krathongBaseY,
              isStory ? 290 : 220,
              isStory ? 46 : 36,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Concentric Ripples
            [1, 0.7].forEach((scale, idx) => {
              ctx.strokeStyle = idx === 0 ? 'rgba(251, 191, 36, 0.35)' : 'rgba(56, 189, 248, 0.25)';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.ellipse(
                krathongCenterX,
                krathongBaseY + idx * 8,
                (isStory ? 260 : 190) * scale,
                (isStory ? 32 : 24) * scale,
                0,
                0,
                Math.PI * 2
              );
              ctx.stroke();
            });

            // Candle Flame Warm Glow
            const candleGlowY = isStory ? 440 : 240;
            const candleGlow = ctx.createRadialGradient(
              krathongCenterX,
              candleGlowY,
              8,
              krathongCenterX,
              candleGlowY,
              isStory ? 170 : 130
            );
            candleGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
            candleGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.12)');
            candleGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = candleGlow;
            ctx.beginPath();
            ctx.arc(krathongCenterX, candleGlowY, isStory ? 170 : 130, 0, Math.PI * 2);
            ctx.fill();

            // Draw Krathong SVG Image
            const imgX = krathongCenterX - targetW / 2;
            const imgY = isStory ? 335 : 155;
            ctx.drawImage(img, imgX, imgY, targetW, targetH);

            URL.revokeObjectURL(svgUrl);
            resolve();
          };
          img.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            resolve();
          };
          img.src = svgUrl;
        });
      }

      // 5. KRATHONG SPECS BADGE (Sleek Minimalist Capsule)
      const baseName = BASES[krathong.base_type]?.name || 'กระทงประณีต';
      const flowerName = FLOWERS[krathong.flower_type]?.name || 'ดอกไม้บูชา';
      const candleName = CANDLES[krathong.candle_type]?.name || 'เทียนประทีป';

      const specsY = isStory ? 755 : 465;
      const specsText = `${baseName} • ${flowerName} • ${candleName}`;

      drawRoundedRect(
        160,
        specsY,
        width - 320,
        isStory ? 42 : 36,
        isStory ? 21 : 18,
        'rgba(255, 255, 255, 0.06)',
        'rgba(255, 255, 255, 0.15)',
        1
      );
      ctx.fillStyle = '#FDE68A';
      ctx.font = thaiFont('500', isStory ? 19 : 16);
      ctx.textAlign = 'center';
      ctx.fillText(specsText, 540, specsY + (isStory ? 27 : 23));

      // 6. SENDER NAME & FACULTY
      const displayName =
        krathong.mode === 'couple' && krathong.secondary_name
          ? `${krathong.sender_name} และ ${krathong.secondary_name}`
          : krathong.sender_name;

      const nameY = isStory ? 840 : 525;
      const facultyY = isStory ? 882 : 558;

      ctx.fillStyle = '#FFFFFF';
      ctx.font = thaiFont('bold', isStory ? 40 : 28);
      ctx.fillText(displayName, 540, nameY);

      // Faculty subtitle & Sacred Items
      ctx.fillStyle = '#94A3B8';
      ctx.font = thaiFont('500', isStory ? 22 : 17);
      let subtitle = krathong.faculty;
      if (krathong.sacred_items && krathong.sacred_items.length > 0) {
        const itemNames = krathong.sacred_items
          .map((i) => (i === 'coin' ? 'เหรียญ 9 บาท' : i === 'hair' ? 'เศษผม' : 'เศษเล็บ'))
          .join(' • ');
        subtitle += ` | ใส่: ${itemNames}`;
      }
      ctx.fillText(subtitle, 540, facultyY);

      // 7. WISH BOX (Modern Minimalist Frosted Glass Quote)
      const wishBoxY = isStory ? 925 : 590;
      ctx.font = thaiFont('500', isStory ? 26 : 20);
      const wishLines = wrapCanvasThai(`“${krathong.wish}”`, isStory ? 760 : 700);
      const wishBoxH = Math.max(
        isStory ? 130 : 95,
        wishLines.length * (isStory ? 42 : 30) + (isStory ? 60 : 44)
      );

      drawRoundedRect(
        110,
        wishBoxY,
        width - 220,
        wishBoxH,
        24,
        'rgba(255, 255, 255, 0.05)',
        'rgba(255, 255, 255, 0.15)',
        1.2
      );

      ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.font = thaiFont('600', isStory ? 17 : 13);
      ctx.fillText('คำอธิษฐานคืนลอยกระทง', 540, wishBoxY + (isStory ? 30 : 22));

      ctx.fillStyle = '#FFFFFF';
      ctx.font = thaiFont('400', isStory ? 26 : 19);
      let curWishY = wishBoxY + (isStory ? 72 : 54);
      for (const line of wishLines) {
        ctx.fillText(line, 540, curWishY);
        curWishY += isStory ? 42 : 30;
      }

      // 8. QR CODE & INVITATION CALL TO ACTION
      const targetUrl = krathong.party_code
        ? `${window.location.origin}${window.location.pathname}?party=${encodeURIComponent(krathong.party_code)}`
        : `${window.location.origin}${window.location.pathname}?id=${krathong.id}`;

      const qrSize = isStory ? 190 : 125;
      const qrDataUrl = await QRCode.toDataURL(targetUrl, {
        width: qrSize,
        margin: 1,
        color: {
          dark: '#0A1224',
          light: '#FFFFFF',
        },
      });

      const qrImg = new Image();
      await new Promise<void>((resolve) => {
        qrImg.onload = () => {
          const qrY = isStory ? 1360 : 775;

          // Clean White Card Frame around QR
          drawRoundedRect(
            540 - qrSize / 2 - 12,
            qrY - 12,
            qrSize + 24,
            qrSize + 24,
            20,
            '#FFFFFF'
          );

          ctx.drawImage(qrImg, 540 - qrSize / 2, qrY, qrSize, qrSize);
          resolve();
        };
        qrImg.onerror = () => resolve();
        qrImg.src = qrDataUrl;
      });

      // QR Code footnote text
      ctx.fillStyle = '#FDE68A';
      ctx.font = thaiFont('600', isStory ? 24 : 17);
      const ctaY = isStory ? 1620 : 955;
      const ctaText = krathong.party_code
        ? `สแกน QR Code มาร่วมก๊วน [${krathong.party_code}] ด้วยกัน!`
        : 'สแกน QR Code เพื่อร่วมลอยกระทง ณ สระน้ำ มทร.กรุงเทพ';
      ctx.fillText(ctaText, 540, ctaY);

      if (isStory) {
        ctx.fillStyle = '#64748B';
        ctx.font = thaiFont('400', 18);
        ctx.fillText('มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ • #RMUTKLoyKrathong', 540, 1800);
      } else {
        ctx.fillStyle = '#64748B';
        ctx.font = thaiFont('400', 14);
        ctx.fillText('มทร.กรุงเทพ • #RMUTKLoyKrathong', 540, 1005);
      }

      // Export canvas to Object URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCardImageUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
        setIsGenerating(false);
      }, 'image/png');
    } catch (err) {
      console.error('Error generating wish card:', err);
      setGenerationError('ไม่สามารถสร้างรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
      setIsGenerating(false);
    }
  }, [krathong, cardFormat]);

  useEffect(() => {
    if (isOpen && krathong) {
      const timer = setTimeout(() => {
        generateCard();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, krathong, cardFormat, generateCard]);

  useEffect(() => {
    return () => {
      if (cardImageUrl) {
        URL.revokeObjectURL(cardImageUrl);
      }
    };
  }, [cardImageUrl]);

  if (!isOpen || !krathong) return null;

  const handleDownload = async () => {
    if (!canvasRef.current && !cardImageUrl) return;
    setIsSaving(true);
    try {
      const filename =
        cardFormat === 'story'
          ? `story-rmutk-${krathong.id.substring(0, 8)}.png`
          : `krathong-rmutk-${krathong.id.substring(0, 8)}.png`;
      const title = `การ์ดคำขอคืนลอยกระทง มทร.กรุงเทพ • ${krathong.sender_name}`;
      await saveOrShareImage(canvasRef.current || cardImageUrl!, filename, title);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = krathong.party_code
        ? `${window.location.origin}${window.location.pathname}?party=${encodeURIComponent(krathong.party_code)}`
        : `${window.location.origin}${window.location.pathname}?id=${krathong.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-thai animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
    >
      {/* Hidden off-screen canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Offscreen SVG Source Container */}
      <div
        id="wish-card-svg-container"
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: -9999,
          top: -9999,
          width: 500,
          height: 400,
          pointerEvents: 'none',
          opacity: 0,
          zIndex: -1,
        }}
      >
        <KrathongSVG
          base={krathong.base_type}
          flower={krathong.flower_type}
          candle={krathong.candle_type}
          sacredItems={krathong.sacred_items}
          isLit={true}
          size={500}
          showWaterRipples={false}
        />
      </div>

      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/15 w-full max-w-sm rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h3 id="card-modal-title" className="text-sm font-bold text-white">
              การ์ดคำขอ & ชวนเพื่อน
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="ปิดการ์ด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Tabs (IG Story 9:16 vs Square 1:1) */}
        <div className="px-5 pt-3.5 pb-1 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCardFormat('story')}
            className={`h-10 px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              cardFormat === 'story'
                ? 'bg-amber-400/90 text-slate-950 font-bold border border-amber-300/40 shadow-md shadow-amber-400/20'
                : 'bg-white/[0.04] border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>สตอรี่ IG / FB (9:16)</span>
          </button>

          <button
            type="button"
            onClick={() => setCardFormat('square')}
            className={`h-10 px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              cardFormat === 'square'
                ? 'bg-amber-400/90 text-slate-950 font-bold border border-amber-300/40 shadow-md shadow-amber-400/20'
                : 'bg-white/[0.04] border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>จัตุรัส (1:1)</span>
          </button>
        </div>

        {/* Card Preview Body */}
        <div className="p-4 sm:p-5 flex flex-col items-center overflow-y-auto">
          {/* Card Preview Container */}
          <div
            className={`w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 flex items-center justify-center relative ${
              cardFormat === 'story' ? 'aspect-[9/16] max-h-[380px]' : 'aspect-square max-h-[320px]'
            }`}
          >
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs sm:text-sm">
                <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>กำลังสร้างการ์ด...</span>
              </div>
            ) : generationError ? (
              <div className="p-4 text-center text-rose-400 text-xs sm:text-sm flex flex-col items-center gap-1.5">
                <AlertCircle className="w-5 h-5" />
                <span>{generationError}</span>
              </div>
            ) : cardImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={cardImageUrl}
                alt="การ์ดคำขอลอยกระทง มทร.กรุงเทพ"
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>

          {/* Mobile tip */}
          <p className="text-[11px] text-slate-400 text-center mt-2.5">
            💡 บนมือถือ: แตะปุ่มบันทึก หรือแตะค้างที่รูปภาพเพื่อบันทึกลงเครื่อง
          </p>

          {/* Action Buttons: Download & Copy Link */}
          <div className="grid grid-cols-2 gap-2.5 w-full mt-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating || !cardImageUrl || isSaving}
              className="h-11 sm:h-12 px-4 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400/90 via-amber-300/90 to-amber-400/90 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-200/50 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกลงเครื่อง'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="h-11 sm:h-12 px-4 rounded-full font-semibold text-xs sm:text-sm bg-white/8 hover:bg-white/15 border border-white/12 text-slate-200 flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-amber-300" />
                  <span>{krathong.party_code ? 'ชวนเพื่อนร่วมก๊วน' : 'แชร์ลิงก์'}</span>
                </>
              )}
            </button>
          </div>

          {/* Action: Receive Goddess Khongkha Blessing */}
          {onOpenKhongkhaBlessing && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenKhongkhaBlessing(krathong);
              }}
              className="w-full mt-3 h-11 sm:h-12 px-4 rounded-full font-bold text-xs sm:text-sm bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/35 text-amber-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5 text-amber-300" />
              <span>สดับพรพระแม่คงคา</span>
            </button>
          )}

          {/* Secondary Action: Fortune Sticks */}
          {onOpenFortune && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFortune();
              }}
              className="mt-3 text-xs text-amber-300/90 hover:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ไปเสี่ยงทายเซียมซีต่อ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
