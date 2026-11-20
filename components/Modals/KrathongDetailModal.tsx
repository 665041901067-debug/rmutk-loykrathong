'use client';

import React, { useState, useEffect } from 'react';
import { Krathong } from '@/types';
import { KrathongSVG } from '../Krathong/KrathongSVG';
import { WISH_CATEGORIES } from '@/data/wishes';
import { hasVotedKrathong } from '@/lib/storage';
import { sound } from '@/lib/sound';
import { X, Heart, Share2, Check, Sparkles, Droplets } from 'lucide-react';

interface KrathongDetailModalProps {
  krathong: Krathong | null;
  onClose: () => void;
  onBless: (id: string) => Promise<{ success: boolean; message: string; bless_count: number }>;
  onOpenKhongkhaBlessing?: (krathong: Krathong) => void;
}

export const KrathongDetailModal: React.FC<KrathongDetailModalProps> = ({
  krathong,
  onClose,
  onBless,
  onOpenKhongkhaBlessing,
}) => {
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [blessCount, setBlessCount] = useState<number>(0);
  const [isBlessing, setIsBlessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showHearts, setShowHearts] = useState<boolean>(false);

  useEffect(() => {
    if (krathong) {
      setBlessCount(krathong.bless_count || 0);
      setHasVoted(hasVotedKrathong(krathong.id));
      setCopied(false);
      setShowHearts(false);
    }
  }, [krathong]);

  if (!krathong) return null;

  const handleBless = async () => {
    if (hasVoted || isBlessing) return;
    setIsBlessing(true);

    try {
      const result = await onBless(krathong.id);
      if (result.success) {
        setHasVoted(true);
        setBlessCount(result.bless_count);
        setShowHearts(true);
        sound.playTempleBell();
        sound.playSparkle();
        setTimeout(() => setShowHearts(false), 2500);
      }
    } catch {
      // Ignore
    } finally {
      setIsBlessing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}?id=${krathong.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const categoryInfo = WISH_CATEGORIES[krathong.wish_category];

  const displayName =
    krathong.mode === 'couple' && krathong.secondary_name
      ? `${krathong.sender_name} & ${krathong.secondary_name}`
      : krathong.sender_name;

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-thai"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/15 w-full max-w-sm rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden text-slate-100 relative">
        {/* Floating Heart Shower Animation upon giving heart */}
        {showHearts && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-petalFall text-rose-400 pointer-events-none"
                style={{
                  left: `${15 + (i * 17) % 75}%`,
                  top: `${(i * 10) % 25}%`,
                  animationDelay: `${(i % 5) * 0.15}s`,
                  animationDuration: `${1.5 + (i % 3) * 0.3}s`,
                }}
              >
                <Heart className="w-5 h-5 fill-rose-400 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span id="detail-modal-title" className="text-xs font-semibold text-slate-300">
              กระทงของเพื่อนในสระ มทร.กรุงเทพ
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: Clean Gen-Z Wish Focus */}
        <div className="p-5 flex flex-col items-center">
          {/* Miniature Krathong Preview */}
          <div className="py-1">
            <KrathongSVG
              base={krathong.base_type}
              flower={krathong.flower_type}
              candle={krathong.candle_type}
              sacredItems={krathong.sacred_items}
              isLit={true}
              size={135}
              showWaterRipples={true}
            />
          </div>

          {/* User Name & Faculty Badges */}
          <div className="text-center mt-1">
            <span className="text-[11px] font-semibold tracking-wider text-amber-300/90 block">
              กระทงของ
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">{displayName}</h4>
            <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-slate-400">
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {krathong.faculty}
              </span>
              {categoryInfo && (
                <span className="bg-amber-400/15 text-amber-200 px-3 py-1 rounded-full border border-amber-400/25 font-medium">
                  {categoryInfo.name}
                </span>
              )}
            </div>

            {/* Squad Badge */}
            {krathong.party_code && (
              <div className="mt-1.5">
                <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 font-medium">
                  ก๊วน: {krathong.party_code}
                </span>
              </div>
            )}
          </div>

          {/* Clean Wish Box (Frosted Glass Container with Candle Aura Effect) */}
          <div className="w-full mt-3.5 p-4 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.03] border border-amber-300/30 text-center backdrop-blur-md relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            {/* Ambient Candle Aura */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none animate-pulse" />

            <div className="relative z-10 max-h-48 overflow-y-auto pr-0.5 no-scrollbar [scrollbar-width:none]">
              <p className="text-sm sm:text-base leading-relaxed font-thai font-medium whitespace-pre-wrap break-words [overflow-wrap:anywhere] break-all text-amber-100 drop-shadow-[0_0_10px_rgba(251,191,36,0.35)]">
                <span className="text-amber-400/90 text-lg mr-1 font-serif select-none">“</span>
                {krathong.wish}
                <span className="text-amber-400/90 text-lg ml-1 font-serif select-none">”</span>
              </p>
            </div>
          </div>

          {/* Sacred items badges (if any) */}
          {krathong.sacred_items && krathong.sacred_items.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-slate-400">
              <span>เครื่องสะเดาะเคราะห์:</span>
              {krathong.sacred_items.map((it) => (
                <span key={it} className="text-amber-300 font-medium bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  {it === 'coin' ? 'เหรียญ 9บ.' : it === 'nail' ? 'ตัดเล็บ' : 'ตัดผม'}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons: Clean & Gen-Z (Translucent Glassmorphism) */}
          <div className="flex items-center gap-2 w-full mt-4">
            {/* Bless / Give Heart Button */}
            <button
              type="button"
              onClick={handleBless}
              disabled={hasVoted || isBlessing}
              className={`flex-1 h-11 px-4 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                hasVoted
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : 'bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 border border-rose-400/35 shadow-[0_4px_16px_rgba(244,63,94,0.15)] active:scale-95'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${hasVoted ? 'fill-rose-400 text-rose-400' : 'text-rose-300'}`}
              />
              <span>{hasVoted ? `ให้ใจแล้ว (${blessCount})` : `ให้ใจกระทงนี้ (${blessCount})`}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-full font-semibold text-xs sm:text-sm bg-white/8 hover:bg-white/15 border border-white/12 text-slate-200 transition-all active:scale-95 cursor-pointer"
            >
              <span>ปิด</span>
            </button>
          </div>

          {/* Secondary Options: Copy Link / พระแม่คงคา */}
          <div className="flex items-center justify-between w-full mt-3 pt-2.5 border-t border-white/10 text-xs">
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors py-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">คัดลอกลิงก์แล้ว</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>แชร์กระทงนี้</span>
                </>
              )}
            </button>

            {onOpenKhongkhaBlessing && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenKhongkhaBlessing(krathong);
                }}
                className="text-amber-300/90 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer transition-colors py-1"
              >
                <Droplets className="w-3.5 h-3.5 text-amber-300" />
                <span>สดับพรพระแม่</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
