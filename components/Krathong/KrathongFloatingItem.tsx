'use client';

import React, { memo } from 'react';
import { Krathong } from '@/types';
import { KrathongSVG } from './KrathongSVG';
import { sound } from '@/lib/sound';

interface KrathongFloatingItemProps {
  krathong: Krathong;
  onClick: (krathong: Krathong) => void;
  isFocused?: boolean;
  isDriftingAway?: boolean;
  isPartyMatch?: boolean;
  isNewlyFloated?: boolean;
}

export const KrathongFloatingItem: React.FC<KrathongFloatingItemProps> = memo(
  ({ krathong, onClick, isFocused = false, isDriftingAway = false, isPartyMatch = false, isNewlyFloated = false }) => {
    // กำหนดแอนิเมชันกระแสน้ำไหลเอื่อยๆ ให้สลับกันเพื่อความเป็นธรรมชาติเสมือนลอยในสระน้ำจริง
    const animClass =
      krathong.id.charCodeAt(krathong.id.length - 1) % 3 === 0
        ? 'animate-float'
        : krathong.id.charCodeAt(krathong.id.length - 1) % 3 === 1
        ? 'animate-floatSlow'
        : 'animate-floatFast';

    const displayName =
      krathong.mode === 'couple' && krathong.secondary_name
        ? `${krathong.sender_name} & ${krathong.secondary_name}`
        : krathong.sender_name;

    const handleClick = () => {
      onClick(krathong);
    };

    const baseZIndex = Math.round(krathong.pos_y * 10);
    const zIndex = isNewlyFloated ? 9999 : isFocused ? 999 : isPartyMatch ? baseZIndex + 50 : baseZIndex;

    return (
      <button
        type="button"
        onClick={handleClick}
        className={`absolute group cursor-pointer focus:outline-none rounded-full transition-all duration-700 hover:scale-110 active:scale-95 ${
          isDriftingAway ? 'animate-driftAway pointer-events-none' : ''
        } ${isNewlyFloated ? 'animate-floatInWater scale-105' : ''} ${
          isFocused ? 'ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-115' : ''
        }`}
        style={{
          left: `${krathong.pos_x}%`,
          top: `${Math.min(71, krathong.pos_y)}%`,
          transform: `translate(-50%, -50%) scale(${krathong.scale || 1})`,
          zIndex,
          minWidth: '48px',
          minHeight: '48px',
        }}
        aria-label={`กระทงของ ${displayName} จาก ${krathong.faculty} กดเพื่ออ่านคำอธิษฐาน`}
      >
        {/* Dynamic Water Ripples when Newly Launched into the River */}
        {isNewlyFloated && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
            {/* Outer expanding water ring */}
            <div className="absolute w-24 h-24 rounded-full border-2 border-amber-300/80 animate-waterExpandPulse" />
            <div className="absolute w-16 h-16 rounded-full border border-amber-400/50 animate-waterTouchRipple" />
            <div className="absolute w-10 h-5 bg-amber-400/25 rounded-full blur-md animate-pulse" />
          </div>
        )}

        {/* Floating Animation Wrapper */}
        <div className={`relative ${animClass}`}>
          {/* Candlelight Water Reflection under Krathong */}
          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full blur-sm pointer-events-none ${
            krathong.mode === 'couple'
              ? 'bg-rose-400/45'
              : isPartyMatch
              ? 'bg-cyan-400/35'
              : 'bg-amber-400/40'
          }`} />

          {/* Golden Glow for Focused, Highly Blessed, or Newly Floated Krathongs */}
          {((krathong.bless_count || 0) > 10 || isFocused || isNewlyFloated) && (
            <div className="absolute -inset-2 bg-amber-400/25 rounded-full blur-md pointer-events-none animate-pulse" />
          )}

          {/* SVG Krathong Render */}
          <KrathongSVG
            base={krathong.base_type}
            flower={krathong.flower_type}
            candle={krathong.candle_type}
            sacredItems={krathong.sacred_items}
            isLit={true}
            size={76}
            showWaterRipples={false}
          />
        </div>

        {/* Hover / Focus Tooltip (ป้ายชื่อ & คำอธิษฐานเรืองแสง - แสดงชื่อเต็ม ไม่โดนตัดสั้น) */}
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:flex group-focus:flex flex-col items-center z-40 animate-fadeIn min-w-[150px] max-w-[280px] w-max">
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-amber-300/35 text-white text-xs px-3.5 py-2 rounded-2xl shadow-2xl flex flex-col items-center text-center">
            {/* Full Sender Name */}
            <div className="font-bold text-amber-300 text-xs sm:text-sm leading-tight break-words [overflow-wrap:anywhere]">
              {displayName}
            </div>
            {/* Faculty Subtitle */}
            <div className="text-slate-300/90 text-[10px] sm:text-[11px] font-medium mt-0.5 break-words">
              {krathong.faculty}
            </div>
            {/* Wish snippet */}
            {krathong.wish && (
              <p className="text-[11px] text-amber-100/90 mt-1 line-clamp-2 break-words [overflow-wrap:anywhere] break-all leading-snug drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]">
                “{krathong.wish}”
              </p>
            )}
          </div>
        </div>
      </button>
    );
  }
);

KrathongFloatingItem.displayName = 'KrathongFloatingItem';
