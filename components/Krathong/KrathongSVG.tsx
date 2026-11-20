'use client';

import React from 'react';
import { KrathongBase, FlowerType, CandleSet, SacredItem } from '@/types';

interface KrathongSVGProps {
  base: KrathongBase;
  flower: FlowerType;
  candle: CandleSet;
  sacredItems?: SacredItem[];
  isLit?: boolean;
  onLightToggle?: () => void;
  className?: string;
  size?: number | string;
  showWaterRipples?: boolean;
  interactive?: boolean;
}

export const KrathongSVG: React.FC<KrathongSVGProps> = ({
  base = 'banana-leaf',
  flower = 'lotus',
  candle = 'traditional',
  sacredItems = [],
  isLit = false,
  onLightToggle,
  className = '',
  size = 280,
  showWaterRipples = true,
  interactive = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (interactive && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      onLightToggle?.();
    }
  };

  return (
    <svg
      viewBox="0 0 300 240"
      width={size}
      height={typeof size === 'number' ? size * 0.8 : size}
      className={`select-none overflow-visible ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`กระทงฐาน${base} ประดับดอก${flower} พร้อม${candle} (${isLit ? 'จุดเทียนแล้ว' : 'ยังไม่ได้จุดเทียน'})`}
    >
      <defs>
        {/* Glow & Shadow Filters */}
        <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="flameRadial" cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.8" />
        </radialGradient>

        <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>

        {/* Base Gradients */}
        {/* Banana Leaf */}
        <linearGradient id="bananaGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A8258" />
          <stop offset="100%" stopColor="#254C30" />
        </linearGradient>
        <linearGradient id="bananaGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5FA070" />
          <stop offset="100%" stopColor="#31633F" />
        </linearGradient>

        {/* Bread */}
        <radialGradient id="breadGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F6D4A0" />
          <stop offset="70%" stopColor="#D4A056" />
          <stop offset="100%" stopColor="#A46B2C" />
        </radialGradient>

        {/* Coconut Shell */}
        <radialGradient id="coconutGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#784A28" />
          <stop offset="70%" stopColor="#512E15" />
          <stop offset="100%" stopColor="#321A0A" />
        </radialGradient>

        {/* Lotus Base Petal */}
        <linearGradient id="lotusBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBCFE8" />
          <stop offset="40%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#9D174D" />
        </linearGradient>

        {/* Flower Gradients */}
        <linearGradient id="lotusFlowerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF1F2" />
          <stop offset="50%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        <radialGradient id="marigoldGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#FBBF24" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>

        <linearGradient id="roseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="60%" stopColor="#BE123C" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>

        <radialGradient id="globeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="70%" stopColor="#BE185D" />
          <stop offset="100%" stopColor="#831843" />
        </radialGradient>

        {/* Gear Base Gradients */}
        <linearGradient id="gearMetallicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="30%" stopColor="#D97706" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <radialGradient id="gearCoreGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#451A03" />
          <stop offset="65%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#270F03" />
        </radialGradient>

        {/* Golden Tray Base Gradient */}
        <linearGradient id="goldTrayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Chalkboard Teak Wood & Slate Gradients */}
        <linearGradient id="chalkboardWood" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="50%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
        <linearGradient id="chalkboardSlate" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E3A2F" />
          <stop offset="100%" stopColor="#0B1E16" />
        </linearGradient>

        {/* Stock Chart Bullish Gradient */}
        <linearGradient id="stockBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#064E3B" />
          <stop offset="100%" stopColor="#022C22" />
        </linearGradient>
        <linearGradient id="stockLineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Science Atom Cyan Glow Gradient */}
        <radialGradient id="atomCoreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#67E8F9" />
          <stop offset="75%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#083344" />
        </radialGradient>

        {/* Dictionary Leather & Gold Foil */}
        <linearGradient id="dictCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="50%" stopColor="#312E81" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="goldFoilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>

        {/* Gourmet Food Porcelain Platter */}
        <radialGradient id="porcelainDishGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </radialGradient>

        {/* Globe Ocean & Continents */}
        <radialGradient id="globeSphereGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="65%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0C4A6E" />
        </radialGradient>
      </defs>

      {/* 1. WATER RIPPLES UNDER KRATHONG */}
      {showWaterRipples && (
        <g opacity="0.6">
          <ellipse cx="150" cy="198" rx="105" ry="24" fill="#38BDF8" opacity="0.12" />
          <ellipse cx="150" cy="198" rx="85" ry="18" fill="none" stroke="#BAE6FD" strokeWidth="1.2" strokeOpacity="0.4" />
          <ellipse cx="150" cy="198" rx="60" ry="12" fill="none" stroke="#FDE68A" strokeWidth="1" strokeOpacity="0.3" />
        </g>
      )}

      {/* 2. KRATHONG BASE LAYER */}
      <g id="krathong-base" transform="translate(150, 190)">
        {base === 'banana-leaf' && (
          <g>
            {/* Outer Petals (กลีบพับจีบชั้นนอก) */}
            {[-95, -75, -55, -35, -15, 5, 25, 45, 65, 85].map((x, i) => (
              <polygon
                key={`outer-${i}`}
                points={`${x},-18 ${x + 12},-38 ${x + 24},-18`}
                fill="url(#bananaGrad1)"
                stroke="#1B3822"
                strokeWidth="0.8"
              />
            ))}
            {/* Center Disc Core */}
            <ellipse cx="0" cy="-6" rx="98" ry="22" fill="#2D5A37" />
            <ellipse cx="0" cy="-8" rx="94" ry="20" fill="url(#bananaGrad2)" />

            {/* Inner Folded Petals Layer (กลีบพับจีบชั้นใน) */}
            {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((x, i) => (
              <polygon
                key={`inner-${i}`}
                points={`${x - 10},-12 ${x},-30 ${x + 10},-12`}
                fill="#4D8B5D"
                stroke="#1E3E26"
                strokeWidth="0.8"
              />
            ))}
            <ellipse cx="0" cy="-12" rx="78" ry="16" fill="#3B7047" />
            <ellipse cx="0" cy="-13" rx="74" ry="14" fill="#5A946A" />
          </g>
        )}

        {base === 'bread' && (
          <g>
            {/* Soft Baked Bread Loaf Shape */}
            <ellipse cx="0" cy="-6" rx="96" ry="24" fill="#8C531B" />
            <ellipse cx="0" cy="-10" rx="92" ry="22" fill="url(#breadGrad)" />
            {/* Bread Braided / Scalloped Rim */}
            {[-78, -52, -26, 0, 26, 52, 78].map((bx, i) => (
              <ellipse key={i} cx={bx} cy="-18" rx="16" ry="10" fill="#E8B870" stroke="#9C5E20" strokeWidth="1" />
            ))}
            <ellipse cx="0" cy="-15" rx="72" ry="15" fill="#FDF3E3" />
            {/* Bread texture dots */}
            <circle cx="-35" cy="-16" r="2" fill="#9C5E20" opacity="0.4" />
            <circle cx="20" cy="-14" r="1.5" fill="#9C5E20" opacity="0.4" />
            <circle cx="45" cy="-18" r="2" fill="#9C5E20" opacity="0.4" />
          </g>
        )}

        {base === 'coconut' && (
          <g>
            {/* Coconut Shell Base */}
            <path
              d="M -90,-8 Q 0,40 90,-8 Q 0,22 -90,-8 Z"
              fill="#241206"
            />
            <ellipse cx="0" cy="-8" rx="90" ry="22" fill="#3E200D" />
            <ellipse cx="0" cy="-10" rx="86" ry="20" fill="url(#coconutGrad)" />
            {/* Inner Shell Flesh rim */}
            <ellipse cx="0" cy="-12" rx="76" ry="16" fill="#F3ECE4" />
            <ellipse cx="0" cy="-14" rx="70" ry="14" fill="#3D200E" />
            {/* Polished Rim highlight */}
            <path d="M -80,-10 Q 0,-24 80,-10" stroke="#A77448" strokeWidth="1.5" fill="none" opacity="0.5" />
          </g>
        )}

        {base === 'lotus-base' && (
          <g>
            {/* Tiered Pink Lotus Petal Base */}
            {[-85, -60, -35, -10, 15, 40, 65, 85].map((x, i) => (
              <path
                key={`lotus-base-${i}`}
                d={`M ${x - 14},-15 Q ${x},-42 ${x + 14},-15 Z`}
                fill="url(#lotusBaseGrad)"
                stroke="#831843"
                strokeWidth="0.8"
              />
            ))}
            <ellipse cx="0" cy="-8" rx="92" ry="20" fill="#9D174D" />
            <ellipse cx="0" cy="-10" rx="88" ry="18" fill="#BE185D" />

            {/* Inner Petal Tier */}
            {[-70, -45, -20, 5, 30, 55, 70].map((x, i) => (
              <path
                key={`inner-petals-${i}`}
                d={`M ${x - 12},-12 Q ${x},-32 ${x + 12},-12 Z`}
                fill="#F472B6"
                stroke="#9D174D"
                strokeWidth="0.6"
              />
            ))}
            <ellipse cx="0" cy="-14" rx="72" ry="14" fill="#FCE7F3" />
          </g>
        )}

        {/* =========================================================
            1. คณะวิศวกรรมศาสตร์: ฐานเกียร์วิศวะ (ฟันเฟืองทองเหลือง)
           ========================================================= */}
        {base === 'gear-base' && (
          <g>
            {/* 3D Gear Thickness / Shadow Base */}
            <ellipse cx="0" cy="0" rx="98" ry="24" fill="#2A1205" />
            <ellipse cx="0" cy="-4" rx="96" ry="22" fill="#522507" />

            {/* 8 Mechanical Gear Cogs around the rim */}
            {[-95, -70, -38, 0, 38, 70, 95].map((cx, i) => (
              <polygon
                key={`cog-${i}`}
                points={`${cx - 12},-10 ${cx - 8},-32 ${cx + 8},-32 ${cx + 12},-10`}
                fill="url(#gearMetallicGrad)"
                stroke="#451A03"
                strokeWidth="1.2"
              />
            ))}

            {/* Gear Outer Rim */}
            <ellipse cx="0" cy="-8" rx="92" ry="22" fill="url(#gearMetallicGrad)" stroke="#78350F" strokeWidth="1.5" />
            <ellipse cx="0" cy="-10" rx="88" ry="20" fill="#FBBF24" opacity="0.3" />

            {/* Recessed Gear Web / Core Hub */}
            <ellipse cx="0" cy="-11" rx="72" ry="16" fill="url(#gearCoreGrad)" stroke="#FEF08A" strokeWidth="1.8" />
            <ellipse cx="0" cy="-13" rx="46" ry="10" fill="#1C0A02" stroke="#F59E0B" strokeWidth="1.5" />

            {/* 4 Precision Mechanical Rivets / Spoke Holes */}
            <circle cx="-32" cy="-13" r="3.5" fill="#FEF08A" stroke="#78350F" strokeWidth="1" />
            <circle cx="32" cy="-13" r="3.5" fill="#FEF08A" stroke="#78350F" strokeWidth="1" />
            <circle cx="0" cy="-19" r="3.2" fill="#FEF08A" stroke="#78350F" strokeWidth="1" />
            <circle cx="0" cy="-7" r="3.2" fill="#FEF08A" stroke="#78350F" strokeWidth="1" />
          </g>
        )}

        {/* =========================================================
            2. คณะศิลปศาสตร์: ฐานดิกชั่นนารี (Dictionary เล่มหนา A-Z)
           ========================================================= */}
        {(base === 'dictionary-base' || base === 'book-lotus-base') && (
          <g>
            {/* Book Shadow & Leather Base Block */}
            <ellipse cx="0" cy="0" rx="96" ry="24" fill="#0F172A" />
            {/* Thick Dictionary Pages Block (ขอบกระดาษสีทองประกาย) */}
            <path
              d="M -88,-4 L -88,-16 Q 0,-2 88,-16 L 88,-4 Q 0,10 -88,-4 Z"
              fill="#FEF08A"
              stroke="#D97706"
              strokeWidth="1"
            />
            {/* Page Indentation Lines */}
            <path d="M -86,-8 Q 0,6 86,-8" stroke="#CA8A04" strokeWidth="0.8" fill="none" opacity="0.7" />
            <path d="M -86,-12 Q 0,2 86,-12" stroke="#CA8A04" strokeWidth="0.8" fill="none" opacity="0.7" />

            {/* Hardcover Outer Leather (ปกหนังน้ำเงินเข้มขลิบทอง) */}
            <path
              d="M -92,-14 Q 0,0 92,-14 L 88,-22 Q 0,-8 -88,-22 Z"
              fill="url(#dictCoverGrad)"
              stroke="#F59E0B"
              strokeWidth="1.5"
            />
            {/* Book Top Surface Base */}
            <ellipse cx="0" cy="-14" rx="86" ry="19" fill="#1E1B4B" stroke="#FEF08A" strokeWidth="1.2" />
            <ellipse cx="0" cy="-16" rx="80" ry="16" fill="#312E81" />

            {/* Gold Stamped Emblems: DICTIONARY & A-Z */}
            <g transform="translate(0, -17)">
              <rect x="-65" y="-9" width="130" height="18" rx="4" fill="#1E1B4B" stroke="#F59E0B" strokeWidth="1.2" />
              <rect x="-62" y="-7" width="124" height="14" rx="3" fill="#0F172A" />
              <text x="0" y="2" textAnchor="middle" fill="#FEF08A" fontSize="9" fontWeight="bold" letterSpacing="2.5" fontFamily="sans-serif">
                DICTIONARY
              </text>
              <text x="-48" y="2" textAnchor="middle" fill="#38BDF8" fontSize="6" fontWeight="bold" fontFamily="sans-serif">
                A-Z
              </text>
              <text x="48" y="2" textAnchor="middle" fill="#38BDF8" fontSize="6" fontWeight="bold" fontFamily="sans-serif">
                ก-ฮ
              </text>
            </g>

            {/* Red Silk Ribbon Bookmark (ริบบิ้นคั่นหน้าสีแดงสดห้อยลงมา) */}
            <path d="M -20,-16 Q -26,2 -18,14 L -12,12 Q -20,2 -14,-16 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="0.6" />
          </g>
        )}

        {/* =========================================================
            3. คณะวิทยาศาสตร์และเทคโนโลยี: ฐานอะตอมวิทย์ & หลอดทดลอง
           ========================================================= */}
        {(base === 'science-atom-base' || base === 'cyber-chip-base') && (
          <g>
            {/* Sci-Lab Platform Base */}
            <ellipse cx="0" cy="0" rx="98" ry="24" fill="#083344" />
            <ellipse cx="0" cy="-4" rx="94" ry="22" fill="#0E7490" stroke="#06B6D4" strokeWidth="1.5" />
            {/* High-tech Platform Top */}
            <ellipse cx="0" cy="-8" rx="88" ry="20" fill="#042F2E" stroke="#38BDF8" strokeWidth="1.2" />
            <ellipse cx="0" cy="-11" rx="80" ry="17" fill="#083344" />

            {/* Atomic Orbit 1 (Horizontal Orbit) */}
            <ellipse cx="0" cy="-14" rx="66" ry="14" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.9" />
            <circle cx="56" cy="-10" r="3.5" fill="#67E8F9" filter="url(#flameGlow)" />
            <circle cx="-56" cy="-18" r="3" fill="#67E8F9" />

            {/* Atomic Orbit 2 (Tilted 32 deg) */}
            <g transform="translate(0, -14) rotate(32)">
              <ellipse cx="0" cy="0" rx="64" ry="13" fill="none" stroke="#34D399" strokeWidth="1.5" opacity="0.85" />
              <circle cx="54" cy="0" r="3.2" fill="#6EE7B7" />
              <circle cx="-54" cy="0" r="3.2" fill="#6EE7B7" />
            </g>

            {/* Atomic Orbit 3 (Tilted -32 deg) */}
            <g transform="translate(0, -14) rotate(-32)">
              <ellipse cx="0" cy="0" rx="64" ry="13" fill="none" stroke="#F472B6" strokeWidth="1.2" opacity="0.8" />
              <circle cx="48" cy="0" r="3" fill="#F472B6" />
            </g>

            {/* Glowing Atomic Nucleus (แกนกลางอะตอมเรืองแสง) */}
            <circle cx="0" cy="-14" r="8" fill="url(#atomCoreGrad)" filter="url(#flameGlow)" />
            <circle cx="0" cy="-14" r="4.5" fill="#FFFFFF" />

            {/* Chemistry Laboratory Flasks on Base */}
            {/* Left Erlenmeyer Flask */}
            <g transform="translate(-62, -26)">
              <polygon points="10,0 14,0 16,10 24,24 0,24 8,10" fill="#06B6D4" opacity="0.85" stroke="#E0F2FE" strokeWidth="0.8" />
              <circle cx="12" cy="18" r="1.5" fill="#FFFFFF" />
              <circle cx="8" cy="21" r="1.2" fill="#FFFFFF" />
              <rect x="9" y="-2" width="6" height="3" fill="#E0F2FE" rx="0.5" />
            </g>
            {/* Right Beaker / Test Tube */}
            <g transform="translate(48, -26)">
              <rect x="0" y="2" width="14" height="22" rx="3" fill="#10B981" opacity="0.85" stroke="#D1FAE5" strokeWidth="0.8" />
              <circle cx="7" cy="16" r="1.5" fill="#FFFFFF" />
              <circle cx="5" cy="20" r="1.2" fill="#FFFFFF" />
              <line x1="1" y1="8" x2="6" y2="8" stroke="#D1FAE5" strokeWidth="0.8" />
              <line x1="1" y1="12" x2="6" y2="12" stroke="#D1FAE5" strokeWidth="0.8" />
            </g>
          </g>
        )}

        {/* =========================================================
            4. คณะครุศาสตร์อุตสาหกรรม: ฐานกระดานดำครู (ชอล์ก ไม้บรรทัดสามเหลี่ยม)
           ========================================================= */}
        {base === 'teacher-chalkboard-base' && (
          <g>
            {/* Wooden Chalkboard Base & Shadow */}
            <ellipse cx="0" cy="0" rx="98" ry="24" fill="#2E1005" />
            {/* Teak Wood Frame */}
            <rect x="-88" y="-32" width="176" height="26" rx="4" fill="url(#chalkboardWood)" stroke="#F59E0B" strokeWidth="1" />
            {/* Green Chalkboard Surface */}
            <rect x="-82" y="-28" width="164" height="20" rx="2" fill="url(#chalkboardSlate)" stroke="#064E3B" strokeWidth="0.8" />

            {/* Chalk Markings & Teaching Formula */}
            <text x="-64" y="-15" fill="#FFFFFF" fontSize="8" fontWeight="bold" opacity="0.9" fontFamily="monospace">
              ก ข ค
            </text>
            <text x="0" y="-15" textAnchor="middle" fill="#FEF08A" fontSize="9" fontWeight="bold" opacity="0.95" fontFamily="serif">
              E = mc²
            </text>
            <text x="48" y="-15" fill="#FFFFFF" fontSize="8" fontWeight="bold" opacity="0.9" fontFamily="monospace">
              1+1=2
            </text>
            {/* 3 Gold Reward Stars for Students */}
            <g transform="translate(0, -22)">
              <text x="-16" y="0" fill="#FBBF24" fontSize="7">★</text>
              <text x="0" y="0" textAnchor="middle" fill="#FBBF24" fontSize="8">★</text>
              <text x="16" y="0" textAnchor="end" fill="#FBBF24" fontSize="7">★</text>
            </g>

            {/* Chalkboard Platform Top Rim */}
            <ellipse cx="0" cy="-6" rx="88" ry="18" fill="url(#chalkboardSlate)" stroke="#78350F" strokeWidth="1.2" />

            {/* Wooden Chalk Tray & Chalk Sticks */}
            <rect x="-45" y="-12" width="90" height="7" rx="1.5" fill="#78350F" stroke="#B45309" strokeWidth="0.8" />
            {/* White, Yellow, Pink Chalk Sticks */}
            <rect x="-35" y="-11" width="14" height="4" rx="1" fill="#FFFFFF" />
            <rect x="-18" y="-11" width="14" height="4" rx="1" fill="#FEF08A" />
            <rect x="-1" y="-11" width="14" height="4" rx="1" fill="#F472B6" />
            {/* Chalk Eraser */}
            <rect x="18" y="-12" width="22" height="5" rx="1" fill="#D97706" stroke="#451A03" strokeWidth="0.6" />
            <rect x="18" y="-7" width="22" height="2" fill="#1C1917" />

            {/* Teacher's Triangular Yellow Geometry Ruler */}
            <polygon points="-75,-16 -50,-16 -75,-30" fill="#FBBF24" stroke="#B45309" strokeWidth="0.8" opacity="0.95" />
            <polygon points="-72,-18 -56,-18 -72,-26" fill="#1E3A2F" opacity="0.9" />

            {/* Teacher's Red Grading Pen */}
            <g transform="translate(56, -20) rotate(25)">
              <rect x="0" y="0" width="22" height="3.5" rx="1" fill="#DC2626" stroke="#7F1D1D" strokeWidth="0.5" />
              <polygon points="22,0 26,1.75 22,3.5" fill="#FBBF24" />
              <rect x="2" y="-1" width="5" height="1.5" fill="#FBBF24" />
            </g>
          </g>
        )}

        {/* =========================================================
            5. คณะบริหารธุรกิจ: ฐานกราฟหุ้นบริหาร (แท่งเทียนเขียวพุ่ง & เหรียญทอง)
           ========================================================= */}
        {(base === 'stock-graph-base' || base === 'gold-vault-base') && (
          <g>
            {/* Obsidian Financial Base & Market Grid */}
            <ellipse cx="0" cy="0" rx="98" ry="24" fill="#022C22" />
            <ellipse cx="0" cy="-4" rx="94" ry="22" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" />
            {/* Trading Platform Surface */}
            <ellipse cx="0" cy="-8" rx="88" ry="20" fill="url(#stockBgGrad)" stroke="#34D399" strokeWidth="1.2" />

            {/* Financial Grid Horizon Lines */}
            <path d="M -75,-10 Q 0,-2 75,-10" stroke="#059669" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.6" />
            <path d="M -70,-16 Q 0,-8 70,-16" stroke="#059669" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.6" />

            {/* Japanese Candlestick Chart Bars (แท่งเทียนหุ้นเขียวพุ่ง) */}
            <g transform="translate(-60, -18)">
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#34D399" strokeWidth="1" />
              <rect x="-4" y="-3" width="8" height="7" rx="1" fill="#22C55E" stroke="#15803D" strokeWidth="0.8" />
            </g>
            <g transform="translate(-35, -21)">
              <line x1="0" y1="-9" x2="0" y2="9" stroke="#34D399" strokeWidth="1" />
              <rect x="-4.5" y="-5" width="9" height="9" rx="1" fill="#22C55E" stroke="#15803D" strokeWidth="0.8" />
            </g>
            <g transform="translate(-10, -25)">
              <line x1="0" y1="-10" x2="0" y2="10" stroke="#34D399" strokeWidth="1" />
              <rect x="-5" y="-7" width="10" height="12" rx="1" fill="#22C55E" stroke="#15803D" strokeWidth="0.8" />
            </g>
            <g transform="translate(15, -30)">
              <line x1="0" y1="-11" x2="0" y2="11" stroke="#34D399" strokeWidth="1" />
              <rect x="-5.5" y="-9" width="11" height="15" rx="1" fill="#4ADE80" stroke="#15803D" strokeWidth="0.8" />
            </g>
            <g transform="translate(42, -36)">
              <line x1="0" y1="-12" x2="0" y2="12" stroke="#4ADE80" strokeWidth="1.2" />
              <rect x="-6" y="-11" width="12" height="18" rx="1" fill="#4ADE80" stroke="#166534" strokeWidth="0.8" />
            </g>

            {/* Glowing Bull Trend Line & Up Arrow ↗ */}
            <path
              d="M -70,-16 L -40,-22 L -15,-27 L 15,-33 L 50,-42"
              fill="none"
              stroke="#6EE7B7"
              strokeWidth="2.5"
              filter="url(#flameGlow)"
            />
            <polygon points="50,-46 58,-40 50,-38" fill="#4ADE80" stroke="#FFFFFF" strokeWidth="0.8" />

            {/* Stacks of Golden Wealth Coins on Base Perimeter */}
            {[-78, 64, 76].map((cx, i) => (
              <g key={`stock-coin-${i}`} transform={`translate(${cx}, -12)`}>
                <ellipse cx="0" cy="4" rx="8" ry="3.5" fill="#D97706" />
                <ellipse cx="0" cy="1" rx="8" ry="3.5" fill="#F59E0B" />
                <ellipse cx="0" cy="-2" rx="8" ry="3.5" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
                <text x="0" y="0.5" textAnchor="middle" fill="#78350F" fontSize="5" fontWeight="bold">฿</text>
              </g>
            ))}

            {/* Bull Market Badge */}
            <rect x="-24" y="-8" width="48" height="9" rx="3" fill="#14532D" stroke="#4ADE80" strokeWidth="0.8" />
            <text x="0" y="-1.5" textAnchor="middle" fill="#86EFAC" fontSize="6" fontWeight="bold" fontFamily="monospace">
              +99.9% ATH ↗
            </text>
          </g>
        )}

        {/* =========================================================
            6. คณะเทคโนโลยีคหกรรมศาสตร์: ฐานสำรับคหกรรม (อาหาร & ขนมไทย)
           ========================================================= */}
        {(base === 'gourmet-food-base' || base === 'craft-garland-base') && (
          <g>
            {/* Royal Ceramic Platter Base */}
            <ellipse cx="0" cy="0" rx="98" ry="24" fill="#0F172A" />
            <ellipse cx="0" cy="-4" rx="94" ry="22" fill="#B45309" stroke="#FEF08A" strokeWidth="1.5" />
            <ellipse cx="0" cy="-8" rx="88" ry="20" fill="url(#porcelainDishGrad)" stroke="#D97706" strokeWidth="1" />

            {/* Lotus-Folded Banana Leaf Platter Mat */}
            {[-76, -52, -26, 0, 26, 52, 76].map((lx, i) => (
              <polygon
                key={`food-leaf-${i}`}
                points={`${lx - 10},-8 ${lx},-24 ${lx + 10},-8`}
                fill="url(#bananaGrad1)"
                stroke="#1B3822"
                strokeWidth="0.8"
              />
            ))}
            <ellipse cx="0" cy="-11" rx="72" ry="15" fill="url(#bananaGrad2)" />

            {/* Traditional Thai Delicacies */}
            {[-36, -18, 0, 18, 36].map((dx, i) => (
              <g key={`treat-${i}`} transform={`translate(${dx}, -16)`}>
                <circle cx="0" cy="0" r="5" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
                <circle cx="0" cy="-1" r="2.5" fill="#FEF08A" />
                <circle cx="0" cy="-1" r="0.8" fill="#B45309" />
              </g>
            ))}

            {/* Carved Royal Watermelon Rose */}
            <g transform="translate(0, -23)">
              <circle cx="0" cy="0" r="7" fill="#EF4444" stroke="#991B1B" strokeWidth="0.8" />
              <path d="M -5,-2 Q 0,-7 5,-2 Q 0,4 -5,-2 Z" fill="#F87171" />
              <circle cx="0" cy="-1" r="2.5" fill="#FEF08A" />
            </g>

            {/* Crossed Golden Dinner Fork & Spoon */}
            <g transform="translate(-56, -14) rotate(-35)">
              <ellipse cx="0" cy="-8" rx="4.5" ry="7" fill="#FBBF24" stroke="#B45309" strokeWidth="0.8" />
              <rect x="-1" y="-2" width="2" height="18" rx="0.5" fill="#D97706" />
            </g>
            <g transform="translate(56, -14) rotate(35)">
              <rect x="-3" y="-12" width="6" height="5" rx="0.5" fill="#FBBF24" stroke="#B45309" strokeWidth="0.6" />
              <line x1="-2" y1="-12" x2="-2" y2="-6" stroke="#78350F" strokeWidth="0.8" />
              <line x1="0" y1="-12" x2="0" y2="-6" stroke="#78350F" strokeWidth="0.8" />
              <line x1="2" y1="-12" x2="2" y2="-6" stroke="#78350F" strokeWidth="0.8" />
              <rect x="-1" y="-5" width="2" height="18" rx="0.5" fill="#D97706" />
            </g>
          </g>
        )}

        {/* =========================================================
            7. คณะอุตสาหกรรมสิ่งทอ: ฐานชุดผ้าไทยสิ่งทอ (ผ้าไหมไทยยกดอก & สายวัด)
           ========================================================= */}
        {(base === 'thai-fabric-base' || base === 'textile-silk-base') && (
          <g>
            <ellipse cx="0" cy="0" rx="98" ry="24" fill="#4A044E" />

            {/* Pleated Royal Thai Silk Sabai */}
            {[-86, -66, -46, -26, -6, 14, 34, 54, 74, 86].map((sx, i) => (
              <path
                key={`thai-silk-${i}`}
                d={`M ${sx - 10},-8 Q ${sx},-34 ${sx + 10},-8 Z`}
                fill={i % 2 === 0 ? '#9D174D' : '#D97706'}
                stroke="#581C87"
                strokeWidth="0.8"
              />
            ))}

            {/* Golden Thai Brocade Band */}
            <ellipse cx="0" cy="-8" rx="90" ry="21" fill="#701A75" stroke="#FEF08A" strokeWidth="1.5" />
            <ellipse cx="0" cy="-10" rx="86" ry="19" fill="#831843" />
            <ellipse cx="0" cy="-12" rx="74" ry="15" fill="#FFF1F2" stroke="#F59E0B" strokeWidth="1.2" />

            {/* Designer Tailor's Measuring Tape */}
            <g transform="translate(0, 0)">
              <path
                d="M -78,-7 Q 0,10 78,-7"
                fill="none"
                stroke="#FDE047"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M -70,-6 Q 0,9 70,-6"
                fill="none"
                stroke="#18181B"
                strokeWidth="4"
                strokeDasharray="1 3"
              />
            </g>

            {/* Golden Sewing Needle & Silk Spool */}
            <g transform="translate(-48, -19) rotate(-20)">
              <rect x="-5" y="-7" width="10" height="14" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="0.6" />
              <rect x="-4" y="-5" width="8" height="10" fill="#EC4899" />
              <line x1="-3" y1="0" x2="3" y2="0" stroke="#FCE7F3" strokeWidth="0.8" />
            </g>

            <g transform="translate(42, -18) rotate(35)">
              <polygon points="0,-14 2,10 -2,10" fill="#FEF08A" stroke="#B45309" strokeWidth="0.5" />
              <ellipse cx="0" cy="8" rx="0.8" ry="1.5" fill="#78350F" />
              <path d="M 0,8 Q 8,14 16,10" fill="none" stroke="#F43F5E" strokeWidth="1" strokeDasharray="2 1" />
            </g>
          </g>
        )}

        {/* =========================================================
            8. วิทยาลัยนานาชาติ: ฐานลูกโลกสากล (ลูกโลก เข็มทิศ & ธง)
           ========================================================= */}
        {base === 'inter-globe-base' && (
          <g>
            {/* Global Navigational Base Stand */}
            <ellipse cx="0" cy="0" rx="98" ry="24" fill="#082F49" />
            <ellipse cx="0" cy="-4" rx="94" ry="22" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />
            <ellipse cx="0" cy="-8" rx="88" ry="20" fill="#0C4A6E" stroke="#FEF08A" strokeWidth="1.2" />

            {/* World Globe Sphere */}
            <g transform="translate(0, -18)">
              <circle cx="0" cy="0" r="28" fill="url(#globeSphereGrad)" stroke="#38BDF8" strokeWidth="1.2" />
              <ellipse cx="0" cy="0" rx="28" ry="10" fill="none" stroke="#7DD3FC" strokeWidth="0.8" opacity="0.6" />
              <ellipse cx="0" cy="0" rx="14" ry="28" fill="none" stroke="#7DD3FC" strokeWidth="0.8" opacity="0.6" />
              <line x1="-28" y1="0" x2="28" y2="0" stroke="#BAE6FD" strokeWidth="0.8" opacity="0.7" />

              {/* Continents Silhouettes */}
              <path d="M 2,-8 Q 8,-12 14,-6 Q 18,2 10,8 Q 2,12 -2,4 Z" fill="#22C55E" opacity="0.85" />
              <path d="M -16,-10 Q -8,-14 -4,-6 Q -6,4 -14,8 Q -20,0 -16,-10 Z" fill="#22C55E" opacity="0.85" />
              <path d="M -24,-2 Q -22,-8 -18,-4 Q -20,6 -24,4 Z" fill="#FBBF24" opacity="0.8" />

              {/* Miniature Passenger Airplane & Flight Contrail */}
              <path d="M -28,8 Q 0,-20 32,-12" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.9" />
              <g transform="translate(24, -14) rotate(-15)">
                <polygon points="0,-4 3,4 0,2 -3,4" fill="#FFFFFF" stroke="#0284C7" strokeWidth="0.6" />
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#FFFFFF" strokeWidth="1.2" />
              </g>

              {/* Meridian Brass Stand Ring */}
              <path d="M -30,0 A 30 30 0 0 0 30 0" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
            </g>

            {/* Brass Navigational Compass Rose */}
            <g transform="translate(-62, -12)">
              <circle cx="0" cy="0" r="10" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
              <polygon points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2" fill="#FEF08A" />
              <polygon points="0,-8 2,-2 0,0 -2,-2" fill="#EF4444" />
              <text x="0" y="-9" textAnchor="middle" fill="#FEF08A" fontSize="4" fontWeight="bold">N</text>
            </g>

            {/* International Badge */}
            <g transform="translate(56, -12)">
              <rect x="-14" y="-6" width="28" height="12" rx="3" fill="#0369A1" stroke="#38BDF8" strokeWidth="0.8" />
              <text x="0" y="2" textAnchor="middle" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">
                GLOBAL
              </text>
            </g>
          </g>
        )}
      </g>

      {/* 3. FLOWER ARRANGEMENT LAYER */}
      <g id="krathong-flowers" transform="translate(150, 160)">
        {flower === 'lotus' && (
          <g>
            {/* Center Majestic Lotus Bloom */}
            <ellipse cx="0" cy="0" rx="42" ry="18" fill="#FBCFE8" />
            {/* Outer Petals */}
            <path d="M -35,5 Q -50,-18 -22,-28 Q -10,-10 -5,5 Z" fill="url(#lotusFlowerGrad)" />
            <path d="M 35,5 Q 50,-18 22,-28 Q 10,-10 5,5 Z" fill="url(#lotusFlowerGrad)" />
            {/* Center Petals */}
            <path d="M -22,8 Q -25,-32 0,-42 Q 25,-32 22,8 Z" fill="url(#lotusFlowerGrad)" stroke="#BE123C" strokeWidth="0.5" />
            <path d="M -12,8 Q 0,-36 12,8 Z" fill="#FFF1F2" />
            {/* Golden Lotus Stamens (เกสรดอกบัวสีทอง) */}
            <circle cx="0" cy="-6" r="8" fill="#FBBF24" />
            <circle cx="-4" cy="-7" r="2.5" fill="#D97706" />
            <circle cx="4" cy="-7" r="2.5" fill="#D97706" />
            <circle cx="0" cy="-3" r="2.5" fill="#D97706" />
          </g>
        )}

        {flower === 'marigold' && (
          <g>
            {/* Dense Golden Marigold Blossoms (พวงดอกดาวเรืองทอง) */}
            {/* Left Blossom */}
            <g transform="translate(-36, 2) scale(0.85)">
              <circle cx="0" cy="0" r="22" fill="url(#marigoldGrad)" />
              {[-12, -6, 0, 6, 12].map((ox, i) => (
                <circle key={i} cx={ox} cy="-4" r="7" fill="#FBBF24" opacity="0.9" />
              ))}
              <circle cx="0" cy="0" r="12" fill="#D97706" />
            </g>

            {/* Right Blossom */}
            <g transform="translate(36, 2) scale(0.85)">
              <circle cx="0" cy="0" r="22" fill="url(#marigoldGrad)" />
              {[-12, -6, 0, 6, 12].map((ox, i) => (
                <circle key={i} cx={ox} cy="-4" r="7" fill="#FBBF24" opacity="0.9" />
              ))}
              <circle cx="0" cy="0" r="12" fill="#D97706" />
            </g>

            {/* Center Prime Blossom */}
            <circle cx="0" cy="-6" r="26" fill="url(#marigoldGrad)" />
            {[-16, -8, 0, 8, 16].map((ox, i) => (
              <circle key={i} cx={ox} cy="-10" r="9" fill="#FEF08A" opacity="0.9" />
            ))}
            <circle cx="0" cy="-6" r="14" fill="#F59E0B" />
            <circle cx="0" cy="-6" r="7" fill="#B45309" />
          </g>
        )}

        {flower === 'rose' && (
          <g>
            {/* Crimson Roses with Velvet Petals */}
            <g transform="translate(-30, 2) scale(0.8)">
              <circle cx="0" cy="0" r="20" fill="url(#roseGrad)" />
              <path d="M -10,-5 Q 0,-15 10,-5 Q 12,10 -10,-5" fill="#E11D48" stroke="#881337" strokeWidth="1" />
            </g>
            <g transform="translate(30, 2) scale(0.8)">
              <circle cx="0" cy="0" r="20" fill="url(#roseGrad)" />
              <path d="M -10,-5 Q 0,-15 10,-5 Q 12,10 -10,-5" fill="#E11D48" stroke="#881337" strokeWidth="1" />
            </g>

            {/* Center Rose */}
            <circle cx="0" cy="-6" r="25" fill="url(#roseGrad)" />
            <path d="M -14,-10 Q 0,-24 14,-10 Q 18,10 -14,-10" fill="#E11D48" stroke="#881337" strokeWidth="1.2" />
            <circle cx="0" cy="-7" r="8" fill="#9F1239" />
            <circle cx="0" cy="-7" r="4" fill="#FB7185" />
          </g>
        )}

        {flower === 'globe-amaranth' && (
          <g>
            {/* Traditional Magenta Globe-Amaranth (ดอกบานไม่รู้โรย) */}
            {[-40, -20, 0, 20, 40].map((gx, i) => (
              <g key={i} transform={`translate(${gx}, ${i % 2 === 0 ? 0 : -8})`}>
                <circle cx="0" cy="0" r="14" fill="url(#globeGrad)" />
                {/* Globe texture spicules */}
                <circle cx="-5" cy="-5" r="2.5" fill="#F472B6" />
                <circle cx="5" cy="-4" r="2.5" fill="#F472B6" />
                <circle cx="0" cy="4" r="2.5" fill="#F472B6" />
                <circle cx="0" cy="-1" r="2.5" fill="#FCE7F3" />
              </g>
            ))}
          </g>
        )}
      </g>

      {/* 4. CANDLE & INCENSE LAYER */}
      <g id="krathong-candles" transform="translate(150, 140)">
        {/* TRADITIONAL CANDLE & 3 INCENSE STICKS */}
        {candle === 'traditional' && (
          <g>
            {/* 3 Incense Sticks (ธูป 3 ดอก) */}
            {/* Stick 1 (Left) */}
            <line x1="-12" y1="-8" x2="-22" y2="-90" stroke="#78350F" strokeWidth="2.5" />
            <line x1="-20" y1="-70" x2="-22" y2="-90" stroke="#B45309" strokeWidth="3" />
            {/* Glowing Embers */}
            <circle cx="-22" cy="-90" r="2.2" fill={isLit ? '#EF4444' : '#451A03'} />

            {/* Stick 2 (Center) */}
            <line x1="-4" y1="-8" x2="-10" y2="-96" stroke="#78350F" strokeWidth="2.5" />
            <line x1="-8" y1="-75" x2="-10" y2="-96" stroke="#B45309" strokeWidth="3" />
            <circle cx="-10" cy="-96" r="2.2" fill={isLit ? '#EF4444' : '#451A03'} />

            {/* Stick 3 (Right) */}
            <line x1="4" y1="-8" x2="2" y2="-92" stroke="#78350F" strokeWidth="2.5" />
            <line x1="3" y1="-72" x2="2" y2="-92" stroke="#B45309" strokeWidth="3" />
            <circle cx="2" cy="-92" r="2.2" fill={isLit ? '#EF4444' : '#451A03'} />

            {/* Incense Rising Smoke Wisps */}
            {isLit && (
              <g opacity="0.6" className="animate-smoke">
                <path d="M -22,-92 Q -30,-115 -18,-130" stroke="#E2E8F0" strokeWidth="1.2" fill="none" />
                <path d="M -10,-98 Q -16,-120 -4,-138" stroke="#E2E8F0" strokeWidth="1.2" fill="none" />
                <path d="M 2,-94 Q 12,-116 0,-132" stroke="#E2E8F0" strokeWidth="1.2" fill="none" />
              </g>
            )}

            {/* Yellow Traditional Candle */}
            <g
              className={interactive ? 'cursor-pointer group' : ''}
              onClick={onLightToggle}
              onKeyDown={handleKeyDown}
              tabIndex={interactive ? 0 : -1}
              role={interactive ? 'button' : undefined}
              aria-label={isLit ? 'เทียนกำลังส่องสว่าง (คลิกเพื่อดับ)' : 'แตะที่เทียนเพื่อจุดไฟ'}
            >
              <rect x="8" y="-62" width="14" height="60" rx="3" fill="#F59E0B" />
              <rect x="10" y="-62" width="4" height="60" fill="#FEF08A" opacity="0.6" />
              {/* Candle Wick */}
              <line x1="15" y1="-62" x2="15" y2="-72" stroke="#1F2937" strokeWidth="2" />

              {/* Lit Candle Flame */}
              {isLit ? (
                <g className="animate-flicker">
                  {/* Outer Warm Halo */}
                  <circle cx="15" cy="-84" r="32" fill="url(#haloGlow)" />
                  {/* Animated Teardrop Flame */}
                  <path
                    d="M 15,-68 C 9,-72 8,-84 15,-98 C 22,-84 21,-72 15,-68 Z"
                    fill="url(#flameRadial)"
                    filter="url(#flameGlow)"
                  />
                  <ellipse cx="15" cy="-76" rx="3.5" ry="7" fill="#FFFFFF" />
                </g>
              ) : (
                interactive && (
                  <g className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                    <circle cx="15" cy="-78" r="16" fill="#FDE68A" fillOpacity="0.4" stroke="#F59E0B" strokeDasharray="3,3" />
                  </g>
                )
              )}
            </g>
          </g>
        )}

        {/* PASTEL MINIMAL CANDLE */}
        {candle === 'pastel-minimal' && (
          <g
            className={interactive ? 'cursor-pointer group' : ''}
            onClick={onLightToggle}
            onKeyDown={handleKeyDown}
            tabIndex={interactive ? 0 : -1}
            role={interactive ? 'button' : undefined}
            aria-label={isLit ? 'เทียนมินิมอลจุดแล้ว' : 'แตะเพื่อจุดเทียนมินิมอล'}
          >
            {/* Sleek Minimalist Off-White Pillar Candle */}
            <rect x="-8" y="-70" width="16" height="68" rx="4" fill="#FAF5EF" stroke="#E7DFD5" strokeWidth="1.2" />
            <ellipse cx="0" cy="-70" rx="8" ry="3" fill="#EFE8DD" />
            <line x1="0" y1="-70" x2="0" y2="-80" stroke="#374151" strokeWidth="2" />

            {isLit ? (
              <g className="animate-flicker">
                <circle cx="0" cy="-90" r="30" fill="url(#haloGlow)" />
                <path
                  d="M 0,-76 C -6,-80 -6,-92 0,-104 C 6,-92 6,-80 0,-76 Z"
                  fill="url(#flameRadial)"
                  filter="url(#flameGlow)"
                />
                <ellipse cx="0" cy="-84" rx="3" ry="6" fill="#FFFFFF" />
              </g>
            ) : (
              interactive && (
                <g className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                  <circle cx="0" cy="-86" r="15" fill="#FDE68A" fillOpacity="0.4" stroke="#F59E0B" strokeDasharray="3,3" />
                </g>
              )
            )}
          </g>
        )}

        {/* TWIN LOVE CANDLES (เทียนคู่สำหรับโหมดคู่รัก) */}
        {candle === 'twin-love' && (
          <g
            className={interactive ? 'cursor-pointer group' : ''}
            onClick={onLightToggle}
            onKeyDown={handleKeyDown}
            tabIndex={interactive ? 0 : -1}
            role={interactive ? 'button' : undefined}
            aria-label={isLit ? 'เทียนคู่จุดแล้ว' : 'แตะเพื่อจุดเทียนคู่'}
          >
            {/* Left Candle (Pastel Rose) */}
            <g transform="translate(-10, 0)">
              <rect x="-6" y="-64" width="12" height="62" rx="3" fill="#FDA4AF" />
              <line x1="0" y1="-64" x2="0" y2="-74" stroke="#1F2937" strokeWidth="1.8" />
              {isLit && (
                <g className="animate-flicker">
                  <circle cx="0" cy="-84" r="24" fill="url(#haloGlow)" />
                  <path
                    d="M 0,-70 C -5,-74 -5,-84 0,-94 C 5,-84 5,-74 0,-70 Z"
                    fill="url(#flameRadial)"
                    filter="url(#flameGlow)"
                  />
                  <ellipse cx="0" cy="-77" rx="2.5" ry="5" fill="#FFFFFF" />
                </g>
              )}
            </g>

            {/* Right Candle (Warm Gold) */}
            <g transform="translate(10, 0)">
              <rect x="-6" y="-64" width="12" height="62" rx="3" fill="#FDE047" />
              <line x1="0" y1="-64" x2="0" y2="-74" stroke="#1F2937" strokeWidth="1.8" />
              {isLit && (
                <g className="animate-flicker" style={{ animationDelay: '0.4s' }}>
                  <circle cx="0" cy="-84" r="24" fill="url(#haloGlow)" />
                  <path
                    d="M 0,-70 C -5,-74 -5,-84 0,-94 C 5,-84 5,-74 0,-70 Z"
                    fill="url(#flameRadial)"
                    filter="url(#flameGlow)"
                  />
                  <ellipse cx="0" cy="-77" rx="2.5" ry="5" fill="#FFFFFF" />
                </g>
              )}
            </g>

            {!isLit && interactive && (
              <g className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                <circle cx="0" cy="-80" r="20" fill="#FDE68A" fillOpacity="0.4" stroke="#F59E0B" strokeDasharray="3,3" />
              </g>
            )}
          </g>
        )}

        {/* 4. SACRED BELIEF ITEMS (ของสะเดาะเคราะห์และสิริมงคลตามความเชื่อคนไทย) */}
        {sacredItems && sacredItems.length > 0 && (
          <g id="krathong-sacred-items">
            {/* Coins: Golden/Silver Lucky Money (เหรียญนำโชค 9 บาท เรียกทรัพย์) */}
            {sacredItems.includes('coin') && (
              <g id="sacred-coins" transform="translate(24, 6)">
                {/* Coin 1 */}
                <circle cx="-5" cy="0" r="7.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
                <circle cx="-5" cy="0" r="5.5" fill="#FEF08A" stroke="#D97706" strokeWidth="0.6" />
                <rect x="-7" y="-2" width="4" height="4" fill="#B45309" rx="0.5" />
                {/* Coin 2 */}
                <circle cx="5" cy="2" r="7" fill="#FBBF24" stroke="#B45309" strokeWidth="0.8" />
                <circle cx="5" cy="2" r="5" fill="#FFFBEB" stroke="#D97706" strokeWidth="0.6" />
                <rect x="3" y="0" width="4" height="4" fill="#B45309" rx="0.5" />
                {/* Glimmer */}
                <circle cx="-3" cy="-3" r="1.5" fill="#FFFFFF" />
                <circle cx="7" cy="-1" r="1.2" fill="#FFFFFF" />
              </g>
            )}

            {/* Hair and/or Nail Sacred Pouch (กระทงน้อยใส่เส้นผมและเศษเล็บสะเดาะเคราะห์) */}
            {(sacredItems.includes('hair') || sacredItems.includes('nail')) && (
              <g id="sacred-packet" transform="translate(-24, 6)">
                {/* Folded Banana Leaf Triangular Packet */}
                <polygon points="-11,5 11,5 0,-10" fill="#15803D" stroke="#14532D" strokeWidth="0.8" />
                <polygon points="-8,4 8,4 0,-7" fill="#22C55E" />
                {/* White Sacred Thread (ด้ายสายสิญจน์มัดเคราะห์) */}
                <line x1="-9" y1="0" x2="9" y2="0" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2,1" />
                <circle cx="0" cy="0" r="1.8" fill="#FFFFFF" />
                {/* Tiny Hair Strands */}
                {sacredItems.includes('hair') && (
                  <path d="M -4,-3 Q -1,-7 2,-4 Q 4,-6 6,-3" stroke="#0F172A" strokeWidth="1" fill="none" />
                )}
                {/* Tiny Nail Clipping */}
                {sacredItems.includes('nail') && (
                  <path d="M -1,-5 A 3,2 0 0,1 4,-3" stroke="#FEF08A" strokeWidth="1.2" fill="none" />
                )}
              </g>
            )}
          </g>
        )}
      </g>
    </svg>
  );
};
