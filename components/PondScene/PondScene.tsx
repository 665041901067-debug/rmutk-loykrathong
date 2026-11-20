'use client';

import React, { useMemo } from 'react';
import { TimeOfDay } from '@/types';

interface PondSceneProps {
  timeOfDay: TimeOfDay;
  children?: React.ReactNode;
}

export const PondScene: React.FC<PondSceneProps> = ({ timeOfDay, children }) => {
  // Theme palette for Day, Twilight, Moonlight, Late-night
  const theme = useMemo(() => {
    switch (timeOfDay) {
      case 'day':
        return {
          skyGradient: ['#3A82B8', '#63A2CF', '#95C5E4', '#D4E9F7'],
          sunOpacity: 0.95,
          moonOpacity: 0,
          lanternsOpacity: 0,
          starsOpacity: 0,
          cloudsOpacity: 0.85,
          cityOpacity: 0.35,
          cityColor: '#537188',
          waterGradient: ['#1A4843', '#25655D', '#37877C', '#4EA497'],
          waterSurfaceOpacity: 0.92,
          pavilionRoof: '#A32829',
          pavilionRoofHighlight: '#C0392B',
          pavilionGold: '#F59E0B',
          pavilionWall: '#FFFFFF',
          pavilionStep: '#E2E8F0',
          buildingRoof: '#8E2426',
          buildingWall: '#F1F5F9',
          treeFar: '#1B3B2B',
          treeNear: '#2D6346',
          treeHighlight: '#438A62',
          fairLightsGlow: 0.25,
          fairTentColor1: '#E11D48',
          fairTentColor2: '#EA580C',
          fairTentColor3: '#F59E0B',
          bridgeColor: '#F8FAFC',
          pontoonColor: '#854D0E',
          pontoonFloat: '#1D4ED8',
          waterReflection: 0.45,
          glowColor: '#FEF08A',
        };
      case 'twilight':
        return {
          skyGradient: ['#1C1032', '#43194B', '#83284B', '#C9533B', '#F59E0B'],
          sunOpacity: 0.6,
          moonOpacity: 0.25,
          lanternsOpacity: 0.75,
          starsOpacity: 0.4,
          cloudsOpacity: 0.4,
          cityOpacity: 0.5,
          cityColor: '#2C1B3D',
          waterGradient: ['#131826', '#25203A', '#3C293D', '#583647'],
          waterSurfaceOpacity: 0.93,
          pavilionRoof: '#7F1D1D',
          pavilionRoofHighlight: '#991B1B',
          pavilionGold: '#FBBF24',
          pavilionWall: '#EDE9FE',
          pavilionStep: '#CBD5E1',
          buildingRoof: '#681819',
          buildingWall: '#B8ACB0',
          treeFar: '#13261C',
          treeNear: '#224430',
          treeHighlight: '#345E44',
          fairLightsGlow: 0.88,
          fairTentColor1: '#BE123C',
          fairTentColor2: '#C2410C',
          fairTentColor3: '#D97706',
          bridgeColor: '#E2E8F0',
          pontoonColor: '#713F12',
          pontoonFloat: '#1E3A8A',
          waterReflection: 0.68,
          glowColor: '#FDE68A',
        };
      case 'late-night':
        return {
          skyGradient: ['#02040A', '#050B18', '#0A152E', '#102347'],
          sunOpacity: 0,
          moonOpacity: 0.95,
          lanternsOpacity: 0.9,
          starsOpacity: 1,
          cloudsOpacity: 0.15,
          cityOpacity: 0.6,
          cityColor: '#091222',
          waterGradient: ['#030712', '#061324', '#0A203E', '#0E2F5A'],
          waterSurfaceOpacity: 0.96,
          pavilionRoof: '#4C1214',
          pavilionRoofHighlight: '#5E1719',
          pavilionGold: '#F59E0B',
          pavilionWall: '#94A3B8',
          pavilionStep: '#64748B',
          buildingRoof: '#3A0D0E',
          buildingWall: '#1E293B',
          treeFar: '#061109',
          treeNear: '#0E1F14',
          treeHighlight: '#163321',
          fairLightsGlow: 0.95,
          fairTentColor1: '#881337',
          fairTentColor2: '#7C2D12',
          fairTentColor3: '#78350F',
          bridgeColor: '#64748B',
          pontoonColor: '#451A03',
          pontoonFloat: '#172554',
          waterReflection: 0.8,
          glowColor: '#FEF08A',
        };
      case 'moonlight':
      default:
        return {
          skyGradient: ['#04091A', '#081635', '#0E2452', '#183870'],
          sunOpacity: 0,
          moonOpacity: 1,
          lanternsOpacity: 0.95,
          starsOpacity: 0.9,
          cloudsOpacity: 0.25,
          cityOpacity: 0.5,
          cityColor: '#0D1B36',
          waterGradient: ['#040D1D', '#081C38', '#0E2C56', '#143E74'],
          waterSurfaceOpacity: 0.94,
          pavilionRoof: '#7B1D20',
          pavilionRoofHighlight: '#991B1E',
          pavilionGold: '#FBBF24',
          pavilionWall: '#F1F5F9',
          pavilionStep: '#94A3B8',
          buildingRoof: '#551518',
          buildingWall: '#334155',
          treeFar: '#08170F',
          treeNear: '#13281B',
          treeHighlight: '#1F3F2B',
          fairLightsGlow: 0.95,
          fairTentColor1: '#9F1239',
          fairTentColor2: '#9A3412',
          fairTentColor3: '#92400E',
          bridgeColor: '#E2E8F0',
          pontoonColor: '#5B2C08',
          pontoonFloat: '#1E40AF',
          waterReflection: 0.78,
          glowColor: '#FEF08A',
        };
    }
  }, [timeOfDay]);

  // Stars in the night sky
  const stars = useMemo(
    () => [
      { x: 90, y: 45, r: 1.2, o: 0.85 },
      { x: 160, y: 80, r: 1.5, o: 0.95 },
      { x: 230, y: 35, r: 1.0, o: 0.75 },
      { x: 310, y: 110, r: 1.3, o: 0.8 },
      { x: 390, y: 55, r: 1.6, o: 0.9 },
      { x: 470, y: 95, r: 1.1, o: 0.7 },
      { x: 550, y: 40, r: 1.4, o: 0.85 },
      { x: 640, y: 75, r: 1.2, o: 0.8 },
      { x: 730, y: 30, r: 1.7, o: 0.95 },
      { x: 820, y: 90, r: 1.0, o: 0.7 },
      { x: 910, y: 50, r: 1.5, o: 0.9 },
      { x: 990, y: 105, r: 1.3, o: 0.8 },
      { x: 1080, y: 65, r: 1.1, o: 0.75 },
      { x: 1260, y: 45, r: 1.5, o: 0.9 },
      { x: 1340, y: 85, r: 1.2, o: 0.85 },
      { x: 1410, y: 40, r: 1.6, o: 0.95 },
    ],
    []
  );

  // String lights for the Loi Krathong festival fair
  const fairLights = useMemo(
    () => [
      { x: 1030, y: 390, c: '#FEF08A' },
      { x: 1060, y: 398, c: '#F43F5E' },
      { x: 1090, y: 403, c: '#38BDF8' },
      { x: 1120, y: 404, c: '#4ADE80' },
      { x: 1150, y: 401, c: '#F59E0B' },
      { x: 1180, y: 394, c: '#C084FC' },
      { x: 1210, y: 398, c: '#FEF08A' },
      { x: 1240, y: 403, c: '#F43F5E' },
      { x: 1270, y: 404, c: '#38BDF8' },
      { x: 1300, y: 401, c: '#4ADE80' },
      { x: 1330, y: 395, c: '#F59E0B' },
      { x: 1360, y: 391, c: '#FEF08A' },
    ],
    []
  );

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* ========================================================
          DESKTOP / TABLET SCENE (viewBox="0 0 1440 900")
          AUTHENTIC ARCHITECTURE BASED ON RMUTK PHOTOS:
          - Real Thai Mondop Chatumuk Pavilion with curved tiered roof,
            Chofa, Bai Raka, Hang Hong, golden pediment & tall spire
          - Distinctive white pointed lotus arches in the water
          - RMUTK heritage green & gold Swan/Kinnaree lampposts
          - White vintage cast-iron garden benches
          - Round sculpted bushes on the lawn
          - Gentle fountain spray in the pond
          - National flagpole & RMUTK academic buildings in background
         ======================================================== */}
      <svg
        className="hidden md:block w-full h-full object-cover pointer-events-none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="ทัศนียภาพศาลากลางน้ำและสระน้ำ มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            {theme.skyGradient.map((col, idx) => (
              <stop
                key={idx}
                offset={`${(idx / (theme.skyGradient.length - 1)) * 100}%`}
                stopColor={col}
              />
            ))}
          </linearGradient>

          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            {theme.waterGradient.map((col, idx) => (
              <stop
                key={idx}
                offset={`${(idx / (theme.waterGradient.length - 1)) * 100}%`}
                stopColor={col}
              />
            ))}
          </linearGradient>

          <linearGradient id="roofGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.pavilionRoofHighlight} />
            <stop offset="100%" stopColor={theme.pavilionRoof} />
          </linearGradient>

          <linearGradient id="spireGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFEE8" stopOpacity="1" />
            <stop offset="25%" stopColor="#FFF3B8" stopOpacity="0.8" />
            <stop offset="55%" stopColor="#F5C04A" stopOpacity="0.3" />
            <stop offset="80%" stopColor="#F5C04A" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#F5C04A" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="shrineAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
            <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#D97706" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="30%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#F59E0B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>

          {/* TRADITIONAL SKY LANTERN GRADIENTS & FILTERS (โคมลอยยี่เป็งเรืองแสง) */}
          <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF0" />
            <stop offset="40%" stopColor="#FBBF24" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#D97706" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="lanternPaperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF2" />
            <stop offset="35%" stopColor="#FEF3C7" />
            <stop offset="70%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <filter id="droneBloom" x="-30%" y="-40%" width="160%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* AUTHENTIC THAI SKY LANTERN TEMPLATES (โคมลอยกระดาษสา) */}
          {/* 1. Miniature Sky Lantern for Letter Construction */}
          <g id="sky-lantern-unit">
            <circle cx="0" cy="0" r="9" fill="url(#lanternGlow)" opacity="0.8" />
            <path
              d="M -3.5,-5.5 C -4.4,-1 -3.2,3 0,4 C 3.2,3 4.4,-1 3.5,-5.5 Z"
              fill="url(#lanternPaperGrad)"
              stroke="#D97706"
              strokeWidth="0.4"
            />
            <ellipse cx="0" cy="3.5" rx="2.5" ry="0.7" fill="#78350F" />
            <circle cx="0" cy="2" r="1.3" fill="#FEF08A" />
            <circle cx="0" cy="2" r="0.6" fill="#FFFFFF" />
          </g>

          {/* 2. Floating Atmospheric Sky Lantern */}
          <g id="floating-sky-lantern-med">
            <circle cx="0" cy="0" r="22" fill="url(#lanternGlow)" opacity="0.85" />
            <path
              d="M -8,-13 C -10.5,-2 -8,8 0,10.5 C 8,8 10.5,-2 8,-13 Z"
              fill="url(#lanternPaperGrad)"
              stroke="#D97706"
              strokeWidth="0.8"
            />
            <ellipse cx="0" cy="9.5" rx="5.5" ry="1.5" fill="#78350F" />
            <circle cx="0" cy="5.5" r="3" fill="#FEF08A" />
            <circle cx="0" cy="5.5" r="1.5" fill="#FFFFFF" />
          </g>

          {/* REALISTIC CHAO PHRAYA RIVER WATER GRADIENTS */}
          <linearGradient id="riverWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#081829" />
            <stop offset="16%" stopColor="#061A2E" />
            <stop offset="42%" stopColor="#0A223B" />
            <stop offset="72%" stopColor="#0B1A2C" />
            <stop offset="100%" stopColor="#040C16" />
          </linearGradient>

          <filter id="waterRippleBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* ========================================================
            LAYER 1: NIGHT SKY & FULL MOON
           ======================================================== */}
        <rect x="0" y="0" width="1440" height="900" fill="url(#skyGrad)" />

        {/* Twinkling Stars */}
        <g opacity={theme.starsOpacity}>
          {stars.map((s, idx) => (
            <circle key={idx} cx={s.x} cy={s.y} r={s.r} fill="#FFFDF0" opacity={s.o} />
          ))}
        </g>

        {/* FULL MOON (พระจันทร์วันเพ็ญ 15 ค่ำ เดือน 12) */}
        <g id="full-moon" opacity={theme.moonOpacity}>
          <circle cx="1180" cy="170" r="110" fill="url(#moonHalo)" />
          <circle cx="1180" cy="170" r="46" fill="#FFFDF4" />
          <circle cx="1165" cy="160" r="10" fill="#E2D4A3" opacity="0.22" />
          <circle cx="1195" cy="180" r="14" fill="#E2D4A3" opacity="0.18" />
          <circle cx="1175" cy="190" r="8" fill="#E2D4A3" opacity="0.15" />
        </g>

        {/* Ambient Sky Lanterns */}
        <g id="sky-lanterns" opacity={theme.lanternsOpacity}>
          {[
            { x: 190, y: 205, s: 0.65, o: 0.8 },
            { x: 265, y: 135, s: 0.5, o: 0.7 },
            { x: 420, y: 180, s: 0.55, o: 0.75 },
            { x: 500, y: 125, s: 0.45, o: 0.65 },
            { x: 610, y: 220, s: 0.4, o: 0.6 },
            { x: 920, y: 160, s: 0.5, o: 0.7 },
            { x: 1040, y: 110, s: 0.6, o: 0.85 },
            { x: 1330, y: 210, s: 0.55, o: 0.75 },
          ].map((l, idx) => (
            <g key={idx} transform={`translate(${l.x}, ${l.y}) scale(${l.s})`} opacity={l.o}>
              <circle cx="0" cy="0" r="32" fill="url(#lanternGlow)" />
              <path
                d="M -11,-16 C -14,2 -9,12 0,15 C 9,12 14,2 11,-16 Z"
                fill="#FEF3C7"
                stroke="#F59E0B"
                strokeWidth="1"
              />
              <circle cx="0" cy="8" r="4.5" fill="#F59E0B" />
              <circle cx="0" cy="8" r="2.2" fill="#FFFFFF" />
            </g>
          ))}
        </g>

        {/* ========================================================
            LAYER 1.5: THAI SKY LANTERNS IN CELESTIAL FORMATION
            (โคมลอยยี่เป็งเรืองแสงแปรอักษร "ลอยกระทง มทร.กรุงเทพ" บนท้องฟ้าราตรี)
           ======================================================== */}
        <g id="sky-lantern-formation" transform="translate(340, 150)" opacity={theme.lanternsOpacity}>
          <g className="animate-pulse">
            {/* Ambient Warm Golden Starlight Glow */}
            <ellipse cx="0" cy="20" rx="190" ry="54" fill="url(#lanternGlow)" opacity="0.45" />

            {/* FLOATING ATMOSPHERIC SKY LANTERNS (โคมลอยลอยขึ้นสู่ฟ้า) */}
            <use href="#floating-sky-lantern-med" x="-155" y="-35" transform="scale(0.85)" opacity="0.9" />
            <use href="#floating-sky-lantern-med" x="155" y="-40" transform="scale(0.9)" opacity="0.9" />
            <use href="#floating-sky-lantern-med" x="-95" y="-55" transform="scale(0.7)" opacity="0.8" />
            <use href="#floating-sky-lantern-med" x="85" y="-60" transform="scale(0.65)" opacity="0.75" />
            <use href="#floating-sky-lantern-med" x="0" y="-70" transform="scale(0.6)" opacity="0.7" />

            {/* Golden Celestial Arch of Lanterns above the phrase */}
            {[-140, -105, -70, -35, 0, 35, 70, 105, 140].map((lx, i) => {
              const arcY = -28 + Math.pow(lx / 140, 2) * 16;
              return (
                <use
                  key={`sky-arc-${i}`}
                  href="#sky-lantern-unit"
                  x={lx}
                  y={arcY}
                  transform="scale(0.95)"
                  opacity="0.9"
                />
              );
            })}

            {/* Golden Starlight Connecting Filaments (เส้นสายแสงแห่งความศรัทธา) */}
            <path
              d="M -160,10 Q -80,-8 0,-10 Q 80,-8 160,10"
              stroke="#FDE68A"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              fill="none"
              opacity="0.6"
            />

            {/* LINE 1: ลอยกระทง (Crafted with Luminous Rice-Paper Lantern Calligraphy) */}
            <text
              x="0"
              y="14"
              textAnchor="middle"
              fill="url(#lanternPaperGrad)"
              stroke="#B45309"
              strokeWidth="0.8"
              filter="url(#droneBloom)"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 20px rgba(245, 158, 11, 0.6))',
              }}
              fontFamily="'Prompt', 'Kanit', sans-serif"
              fontSize="28"
              fontWeight="700"
              letterSpacing="4"
            >
              ลอยกระทง
            </text>

            {/* Authentic Miniature Sky Lanterns (โคมลอยกระดาษสา) arranged on Line 1 */}
            {[
              { x: -76, y: -4 },
              { x: -58, y: 16 },
              { x: -32, y: 2 },
              { x: -6, y: -4 },
              { x: 12, y: 16 },
              { x: 36, y: 0 },
              { x: 58, y: -6 },
              { x: 76, y: 10 },
            ].map((pt, i) => (
              <use key={`lantern-L1-${i}`} href="#sky-lantern-unit" x={pt.x} y={pt.y} />
            ))}

            {/* LINE 2: มทร.กรุงเทพ (Sub-line in Royal Golden Lantern Calligraphy) */}
            <text
              x="0"
              y="42"
              textAnchor="middle"
              fill="url(#lanternPaperGrad)"
              stroke="#B45309"
              strokeWidth="0.6"
              filter="url(#droneBloom)"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 14px rgba(245, 158, 11, 0.5))',
              }}
              fontFamily="'Prompt', 'Kanit', sans-serif"
              fontSize="17"
              fontWeight="600"
              letterSpacing="3.2"
            >
              มทร.กรุงเทพ
            </text>

            {/* Miniature Sky Lanterns on Line 2 */}
            {[
              { x: -60, y: 38 },
              { x: -30, y: 38 },
              { x: -2, y: 32 },
              { x: 26, y: 38 },
              { x: 60, y: 38 },
            ].map((pt, i) => (
              <use key={`lantern-L2-${i}`} href="#sky-lantern-unit" x={pt.x} y={pt.y} transform="scale(0.85)" />
            ))}

            {/* Flanking Yee Peng Sky Lanterns with Warm Halo */}
            <g transform="translate(-140, 22)">
              <use href="#sky-lantern-unit" transform="scale(1.4)" />
            </g>
            <g transform="translate(140, 22)">
              <use href="#sky-lantern-unit" transform="scale(1.4)" />
            </g>
          </g>
        </g>

        {/* Distant Bangkok City Skyline */}
        <g id="city-skyline" fill={theme.cityColor} opacity={theme.cityOpacity}>
          <rect x="140" y="270" width="48" height="150" rx="2" />
          <rect x="195" y="240" width="58" height="180" rx="2" />
          <rect x="260" y="280" width="42" height="140" rx="2" />
          <rect x="780" y="260" width="38" height="160" rx="2" />
          <rect x="825" y="225" width="56" height="195" rx="2" />
          <rect x="888" y="270" width="45" height="150" rx="2" />
          <rect x="1230" y="265" width="52" height="155" rx="2" />
        </g>

        {/* ========================================================
            LAYER 2: RMUTK CAMPUS BUILDINGS & LUSH TREES
           ======================================================== */}
        <g id="campus-backdrop">
          {/* Deep Forest Trees Backdrop */}
          <path
            d="M 20,410 Q 120,330 260,370 Q 380,320 520,380 Q 640,340 760,375 Q 920,315 1080,365 Q 1240,325 1420,390 L 1420,430 L 20,430 Z"
            fill={theme.treeFar}
            opacity="0.88"
          />

          {/* RMUTK Academic Building (Left Wing - อาคารเรียน มทร.กรุงเทพ) */}
          <g id="building-left" transform="translate(80, 330)">
            <rect x="0" y="20" width="450" height="70" fill="#E2E8F0" rx="2" />
            {/* Salmon / Orange facade accent band matching real RMUTK building photo */}
            <rect x="0" y="20" width="450" height="8" fill="#EA580C" opacity="0.8" />
            <rect x="10" y="36" width="430" height="13" fill="#1E293B" opacity="0.7" />
            <rect x="10" y="58" width="430" height="13" fill="#1E293B" opacity="0.7" />
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={i}
                x1={12 + i * 27}
                y1="36"
                x2={12 + i * 27}
                y2="71"
                stroke="#E2E8F0"
                strokeWidth="2.5"
              />
            ))}
            <polygon points="-10,20 460,20 435,-8 15,-8" fill={theme.buildingRoof} />
          </g>

          {/* RMUTK Academic Building (Right Wing) */}
          <g id="building-right" transform="translate(910, 330)">
            <rect x="0" y="20" width="450" height="70" fill="#E2E8F0" rx="2" />
            <rect x="0" y="20" width="450" height="8" fill="#EA580C" opacity="0.8" />
            <rect x="10" y="36" width="430" height="13" fill="#1E293B" opacity="0.7" />
            <rect x="10" y="58" width="430" height="13" fill="#1E293B" opacity="0.7" />
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={i}
                x1={12 + i * 27}
                y1="36"
                x2={12 + i * 27}
                y2="71"
                stroke="#E2E8F0"
                strokeWidth="2.5"
              />
            ))}
            <polygon points="-10,20 460,20 435,-8 15,-8" fill={theme.buildingRoof} />
          </g>

          {/* Lush Green Trees framing the pavilion */}
          <ellipse cx="610" cy="360" rx="60" ry="40" fill={theme.treeNear} />
          <circle cx="590" cy="350" r="32" fill={theme.treeHighlight} opacity="0.85" />
          <ellipse cx="830" cy="360" rx="60" ry="40" fill={theme.treeNear} />
          <circle cx="850" cy="350" r="32" fill={theme.treeHighlight} opacity="0.85" />
        </g>

        {/* ========================================================
            LAYER 3: NATIONAL FLAGPOLE (เสาธงชาติไทย มทร.กรุงเทพ)
            Positioned to the right of the shrine pavilion as in real photo
           ======================================================== */}
        <g id="national-flagpole">
          <line x1="815" y1="100" x2="815" y2="380" stroke="#F1F5F9" strokeWidth="3.5" />
          <circle cx="815" cy="100" r="4.5" fill="#F59E0B" />
          <g transform="translate(818, 106)">
            {/* Flowing Tricolour Thai Flag */}
            <path
              d="M 0,0 Q 24,6 48,0 Q 72,-6 86,2 L 86,52 Q 72,44 48,50 Q 24,56 0,52 Z"
              fill="#B91C1C"
            />
            <path
              d="M 0,8.2 Q 24,14.2 48,8.2 Q 72,2.2 86,10.2 L 86,41.8 Q 72,33.8 48,39.8 Q 24,45.8 0,41.8 Z"
              fill="#FFFFFF"
            />
            <path
              d="M 0,16.4 Q 24,22.4 48,16.4 Q 72,10.4 86,18.4 L 86,33.6 Q 72,25.6 48,31.6 Q 24,37.6 0,33.6 Z"
              fill="#1E3A8A"
            />
          </g>
        </g>

        {/* ========================================================
            LAYER 4: FESTIVAL FAIR BOOTHS & STRING LIGHTS (ริมสระ)
           ======================================================== */}
        <g id="festival-fair-area">
          {[
            { x: 1040, c: theme.fairTentColor1 },
            { x: 1100, c: theme.fairTentColor2 },
            { x: 1160, c: theme.fairTentColor3 },
            { x: 1220, c: theme.fairTentColor1 },
            { x: 1280, c: theme.fairTentColor2 },
            { x: 1340, c: theme.fairTentColor3 },
          ].map((tent, i) => (
            <g key={i}>
              <polygon
                points={`${tent.x},418 ${tent.x + 30},380 ${tent.x + 60},418`}
                fill={tent.c}
              />
              <rect x={tent.x + 8} y="418" width="44" height="15" fill="#FFFFFF" opacity="0.9" />
              {theme.fairLightsGlow > 0 && (
                <ellipse
                  cx={tent.x + 30}
                  cy="425"
                  rx="18"
                  ry="8"
                  fill="#FEF08A"
                  opacity={theme.fairLightsGlow * 0.7}
                />
              )}
            </g>
          ))}

          <path
            d="M 1030,390 Q 1110,405 1190,390 Q 1270,405 1380,390"
            stroke="#475569"
            strokeWidth="1.2"
            fill="none"
          />
          {fairLights.map((b, i) => (
            <g key={i}>
              <circle cx={b.x} cy={b.y} r="3" fill={b.c} />
              {theme.fairLightsGlow > 0 && (
                <circle
                  cx={b.x}
                  cy={b.y}
                  r="12"
                  fill="url(#bulbGlow)"
                  opacity={theme.fairLightsGlow * 0.75}
                />
              )}
            </g>
          ))}
        </g>

        {/* ========================================================
            LAYER 5: WATERSIDE PATHWAY & BALUSTRADE WITH ARCHES
           ======================================================== */}
        <g id="waterside-perimeter">
          {/* Main walkway deck */}
          <rect x="30" y="412" width="1380" height="16" rx="2" fill={theme.bridgeColor} />
          <line x1="30" y1="412" x2="1410" y2="412" stroke="#CBD5E1" strokeWidth="1.5" />

          {/* Underwater arches along perimeter */}
          {[90, 160, 230, 300, 370, 440, 510, 930, 1000, 1070, 1140, 1210, 1280, 1350].map(
            (ax, i) => (
              <path
                key={i}
                d={`M ${ax - 24},428 Q ${ax},404 ${ax + 24},428 Z`}
                fill="#0A1626"
                opacity="0.88"
              />
            )
          )}

          {/* White balusters */}
          {Array.from({ length: 66 }).map((_, i) => {
            const bx = 45 + i * 21;
            if (bx > 590 && bx < 850) return null; // Opening for pavilion & central shrine
            return (
              <g key={i}>
                <rect x={bx} y="396" width="3.5" height="16" rx="1" fill={theme.bridgeColor} />
                <circle cx={bx + 1.7} cy="395" r="1.5" fill="#CBD5E1" />
              </g>
            );
          })}
          <rect x="30" y="393" width="1380" height="4" rx="1" fill={theme.bridgeColor} />

          {/* ========================================================
              AUTHENTIC DETAILS FROM USER PHOTOS (Attachment 7):
              1. White Vintage Cast-Iron Garden Benches (เก้าอี้สนามสีขาว ลายฉลุ)
              2. RMUTK Green & Gold Swan Lampposts (เสาไฟประติมากรรมหงส์ทอง)
             ======================================================== */}
          {/* White Vintage Benches beside the pond */}
          {[
            { x: 260, y: 398 },
            { x: 480, y: 398 },
            { x: 960, y: 398 },
            { x: 1250, y: 398 },
          ].map((bench, i) => (
            <g key={`bench-${i}`} transform={`translate(${bench.x}, ${bench.y})`}>
              {/* Bench backrest with ornate lace/filigree */}
              <rect x="-18" y="-12" width="36" height="11" rx="1.5" fill="none" stroke="#FFFFFF" strokeWidth="1.4" />
              <path d="M -15,-2 Q -12,-8 -9,-2 Q -6,-8 -3,-2 Q 0,-8 3,-2 Q 6,-8 9,-2 Q 12,-8 15,-2" stroke="#E2E8F0" strokeWidth="1" fill="none" />
              {/* Seat */}
              <rect x="-20" y="-1" width="40" height="3" rx="1" fill="#FFFFFF" />
              {/* Curved cast legs */}
              <path d="M -18,2 Q -22,8 -16,14" stroke="#FFFFFF" strokeWidth="2" fill="none" />
              <path d="M 18,2 Q 22,8 16,14" stroke="#FFFFFF" strokeWidth="2" fill="none" />
              <line x1="-14" y1="7" x2="14" y2="7" stroke="#E2E8F0" strokeWidth="1.5" />
            </g>
          ))}

          {/* RMUTK Iconic Swan Lampposts (เสาไฟหงส์ทอง มทร.กรุงเทพ) */}
          {[
            { x: 180, y: 394 },
            { x: 380, y: 394 },
            { x: 1060, y: 394 },
            { x: 1330, y: 394 },
          ].map((lamp, i) => (
            <g key={`lamp-${i}`} transform={`translate(${lamp.x}, ${lamp.y})`}>
              {/* Forest green fluted pole */}
              <rect x="-2" y="-36" width="4" height="36" fill="#143A27" rx="0.8" />
              {/* Gold decorative rings */}
              <rect x="-3.5" y="-5" width="7" height="4" fill="#F59E0B" rx="0.5" />
              <circle cx="0" cy="-18" r="2.5" fill="#F59E0B" />
              <circle cx="0" cy="-34" r="2.5" fill="#F59E0B" />
              {/* Golden Swan (หงส์ทอง) curving at the top */}
              <path d="M 0,-36 C -3,-42 2,-47 6,-45 C 9,-43 8,-38 5,-37 Z" fill="#F59E0B" />
              <path d="M 1,-42 C -4,-46 -8,-41 -6,-36 C -4,-33 0,-34 1,-37 Z" fill="#D97706" />
              {/* Lantern hung from swan beak */}
              <line x1="7" y1="-42" x2="7" y2="-34" stroke="#B45309" strokeWidth="0.8" />
              <circle cx="7" cy="-31" r="3.5" fill="#FEF08A" />
              {theme.fairLightsGlow > 0 && (
                <circle cx="7" cy="-31" r="14" fill="url(#bulbGlow)" opacity="0.8" />
              )}
            </g>
          ))}
        </g>

        {/* ========================================================
            LAYER 6: THE HERO - AUTHENTIC RMUTK THAI SHRINE PAVILION
            (ศาลากลางน้ำ จัตุรมุข มณฑป มทร.กรุงเทพ - ตามภาพถ่ายจริง Attachment 6)
           ======================================================== */}
        <g id="shrine-pavilion" transform="translate(720, 420)">
          {/* ========================================================
              1. DISTINCTIVE UNDERWATER POINTED ARCHES (ซุ้มโค้งกลีบบัวสีขาวในน้ำ)
              Prominent architectural signature from real photo Attachment 6
             ======================================================== */}
          <path d="M -125,6 L 125,6 L 115,30 L -115,30 Z" fill="#FFFFFF" />
          {/* 7 Pointed Arches across the foundation */}
          {[-96, -64, -32, 0, 32, 64, 96].map((ax, i) => (
            <path
              key={`pav-arch-${i}`}
              d={`M ${ax - 13},30 L ${ax - 13},16 Q ${ax},4 ${ax + 13},16 L ${ax + 13},30 Z`}
              fill="#061324"
              stroke="#F1F5F9"
              strokeWidth="2.5"
            />
          ))}

          {/* Pavilion Marble Deck Platform */}
          <rect x="-105" y="-4" width="210" height="10" rx="1.5" fill="#FFFFFF" />
          <line x1="-105" y1="-4" x2="105" y2="-4" stroke="#E2E8F0" strokeWidth="1.5" />

          {/* White Balustrade around pavilion deck with golden finial post caps */}
          <rect x="-102" y="-18" width="204" height="3" rx="0.8" fill="#FFFFFF" />
          {[-95, -75, -55, 55, 75, 95].map((bx, i) => (
            <g key={`pav-rail-${i}`}>
              <rect x={bx - 2} y="-17" width="4" height="13" fill="#FFFFFF" />
              <circle cx={bx} cy="-20" r="2.2" fill="#F59E0B" />
            </g>
          ))}

          {/* Swan Lamppost right on the Pavilion Deck (from real photo) */}
          <g transform="translate(85, -4)">
            <rect x="-1.5" y="-38" width="3" height="38" fill="#143A27" />
            <circle cx="0" cy="-20" r="2" fill="#F59E0B" />
            <path d="M 0,-38 C -2,-44 2,-48 5,-46 C 8,-44 6,-39 3,-38 Z" fill="#F59E0B" />
            <circle cx="6" cy="-33" r="3" fill="#FEF08A" />
            <circle cx="6" cy="-33" r="11" fill="url(#bulbGlow)" opacity="0.85" />
          </g>

          {/* ========================================================
              2. OPEN-AIR SANCTUARY & GLOWING DEITY / BUDDHA (พระพุทธรูปทองอร่าม)
             ======================================================== */}
          {/* Inner back wall */}
          <rect x="-70" y="-88" width="140" height="84" fill="#FEF3C7" opacity="0.9" />
          {/* Glowing Divine Aura */}
          <circle cx="0" cy="-44" r="42" fill="url(#shrineAura)" opacity="0.98" />

          {/* Golden Deity on Multi-tiered Throne */}
          {/* Tiered Lotus Throne */}
          <polygon points="-24,-4 24,-4 18,-14 -18,-14" fill="#D97706" />
          <rect x="-16" y="-17" width="32" height="4" fill="#F59E0B" rx="1" />
          {/* Body & Arms in Meditation posture */}
          <path d="M -15,-17 C -18,-32 -8,-38 0,-38 C 8,-38 18,-32 15,-17 Z" fill="#F59E0B" />
          {/* Head & Radiant Ushnisha / Spire */}
          <circle cx="0" cy="-44" r="8" fill="#F59E0B" />
          <polygon points="-2.5,-51 2.5,-51 0,-59" fill="#FEF08A" />

          {/* 4 White Columns with Golden Lotus Capitals (เสาสีขาว บัวหัวเสาทอง) */}
          {[-68, -24, 24, 68].map((px, i) => (
            <g key={`pav-col-${i}`}>
              <rect x={px - 4.5} y="-88" width="9" height="84" fill="#FFFFFF" />
              {/* Lotus capital in gold */}
              <polygon
                points={`${px - 6.5},-88 ${px + 6.5},-88 ${px + 5},-82 ${px - 5},-82`}
                fill="#F59E0B"
              />
              <rect x={px - 5.5} y="-4" width="11" height="4" fill="#E2E8F0" />
            </g>
          ))}

          {/* ========================================================
              3. AUTHENTIC MULTI-TIERED THAI ROOF (หลังคาไทยทรงจัตุรมุข)
              Features:
              - Curved flared eaves
              - Golden Chofa (ช่อฟ้า) at apex ridges
              - Golden Bai Raka (ใบระกา) along sloping edges
              - Hang Hong (หางหงส์) sweeping upward at lower corners
              - Intricate Golden Pediment (หน้าบันไม้แกะสลักปิดทอง)
             ======================================================== */}
          {/* TIER 1 ROOF (Lower wide eave) */}
          <path
            d="M -155,-84 Q -110,-92 0,-92 Q 110,-92 155,-84 Q 135,-106 100,-122 L -100,-122 Q -135,-106 -155,-84 Z"
            fill="url(#roofGrad1)"
          />
          {/* Gold eave trim & Hang Hong corners */}
          <path
            d="M -160,-81 Q -110,-92 0,-92 Q 110,-92 160,-81 Q 166,-84 161,-88 Q 110,-95 0,-95 Q -110,-95 -161,-88 Q -166,-84 -160,-81 Z"
            fill="#F59E0B"
          />
          {/* Hang Hong (หางหงส์งอนงาม) */}
          <path d="M -160,-81 Q -172,-94 -166,-102 Q -162,-92 -154,-87 Z" fill="#F59E0B" />
          <path d="M 160,-81 Q 172,-94 166,-102 Q 162,-92 154,-87 Z" fill="#F59E0B" />

          {/* Eave lights */}
          {[-142, 142].map((lx, i) => (
            <g key={`roof-light-${i}`}>
              <line x1={lx} y1="-82" x2={lx} y2="-72" stroke="#B45309" strokeWidth="1" />
              <circle cx={lx} cy="-68" r="4" fill="#FEF08A" />
              <circle cx={lx} cy="-68" r="12" fill="url(#bulbGlow)" opacity="0.8" />
            </g>
          ))}

          {/* TIER 2 ROOF (Middle eave) */}
          <path
            d="M -108,-122 Q -75,-128 0,-128 Q 75,-128 108,-122 Q 88,-148 58,-172 L -58,-172 Q -88,-148 -108,-122 Z"
            fill="url(#roofGrad1)"
          />
          <path
            d="M -112,-120 Q -75,-128 0,-128 Q 75,-128 112,-120 Q 116,-123 112,-126 Q 75,-131 0,-131 Q -75,-131 -112,-126 Q -116,-123 -112,-120 Z"
            fill="#F59E0B"
          />
          {/* Middle tier Hang Hong */}
          <path d="M -112,-120 Q -122,-132 -117,-139 Q -113,-130 -106,-125 Z" fill="#F59E0B" />
          <path d="M 112,-120 Q 122,-132 117,-139 Q 113,-130 106,-125 Z" fill="#F59E0B" />

          {/* TIER 3 ROOF & GOLDEN PEDIMENT (หน้าบันไม้แกะสลักปิดทอง) */}
          <path d="M -64,-172 L 0,-245 L 64,-172 Z" fill="url(#roofGrad1)" />
          {/* Ornate Gold Rakes & Chofa (ช่อฟ้า) */}
          <path
            d="M -68,-170 L 0,-250 L 68,-170 L 62,-168 L 0,-242 L -62,-168 Z"
            fill="#F59E0B"
          />
          {/* Chofa (ช่อฟ้า ยอดนกหัสดีลิงค์/พญานาค) */}
          <path d="M 0,-250 C -4,-262 2,-268 0,-274 C 4,-268 7,-262 2,-250 Z" fill="#FEF08A" />
          <path d="M -2,-258 C -7,-264 -2,-269 1,-265 Z" fill="#F59E0B" />

          {/* Intricate Golden Relief Carvings inside Gable (ลวดลายกนกหน้าบัน) */}
          <polygon points="0,-182 -24,-172 24,-172" fill="#F59E0B" />
          <circle cx="0,-195" r="7" fill="#FEF08A" />
          <path d="M -14,-178 Q 0,-205 14,-178 Z" fill="#D97706" opacity="0.6" />

          {/* ========================================================
              4. TALL GOLDEN SPIRE / MONDOP CHATRA (ยอดมณฑปประดับฉัตรทอง)
             ======================================================== */}
          {/* Spire stepped octagonal base */}
          <rect x="-18" y="-248" width="36" height="5" rx="1" fill="#F59E0B" />
          <rect x="-14" y="-253" width="28" height="5" rx="1" fill="#FEF08A" />
          <rect x="-10" y="-258" width="20" height="5" rx="1" fill="#F59E0B" />
          {/* Golden Lotus Urn */}
          <path
            d="M -9,-258 C -12,-272 -6,-280 0,-283 C 6,-280 12,-272 9,-258 Z"
            fill="url(#spireGoldGrad)"
          />
          {/* 5-Tier Royal Chatra (ฉัตร 5 ชั้นสีทองอร่าม) */}
          {[-285, -292, -299, -306, -313].map((sy, i) => (
            <ellipse key={`spire-tier-${i}`} cx="0" cy={sy} rx={9 - i * 1.5} ry="2.2" fill="#FEF08A" />
          ))}
          {/* Tapering Spire Needle */}
          <polygon points="-2,-313 2,-313 0.6,-348 -0.6,-348" fill="url(#spireGoldGrad)" />
          {/* Crystal Finial at Peak (ลูกแก้วยอดมณฑป) */}
          <circle cx="0" cy="-350" r="3.5" fill="#FFFFFF" />
          <circle cx="0" cy="-350" r="16" fill="url(#bulbGlow)" opacity="0.9" />

          {/* Semicircular Marble Steps into the Pond */}
          <path d="M -75,8 A 75,18 0 0,0 75,8 Z" fill="#FFFFFF" />
          <path d="M -92,16 A 92,22 0 0,0 92,16 Z" fill="#F1F5F9" />
          <path d="M -108,25 A 108,26 0 0,0 108,25 Z" fill="#E2E8F0" />
        </g>

        {/* ========================================================
            LAYER 7: ROUND TOPIARY BUSHES & FOUNTAIN IN THE POND
            (ต้นข่อยดัดพุ่มกลม & น้ำพุกลางสระ ตามภาพถ่ายจริง Attachment 5)
           ======================================================== */}
        {/* Lawn island with spherical topiary bushes flanking the approach */}
        <g id="topiary-bushes">
          {/* Left topiary bushes */}
          <ellipse cx="540" cy="428" rx="26" ry="18" fill="#143A27" />
          <circle cx="536" cy="422" r="14" fill="#1F563B" />
          <ellipse cx="585" cy="430" rx="20" ry="14" fill="#0D281B" />
          <circle cx="582" cy="426" r="10" fill="#143A27" />

          {/* Right topiary bushes */}
          <ellipse cx="900" cy="428" rx="26" ry="18" fill="#143A27" />
          <circle cx="904" cy="422" r="14" fill="#1F563B" />
          <ellipse cx="855" cy="430" rx="20" ry="14" fill="#0D281B" />
          <circle cx="858" cy="426" r="10" fill="#143A27" />
        </g>

        {/* Gentle Water Fountain in Pond (น้ำพุพุ่งเป็นสายน้ำในสระ จากภาพจริง) */}
        <g id="pond-fountain" transform="translate(430, 448)">
          <path d="M 0,0 Q -18,-38 -36,-4" fill="none" stroke="#BAE6FD" strokeWidth="1.8" opacity="0.8" />
          <path d="M 0,0 Q 18,-38 36,-4" fill="none" stroke="#BAE6FD" strokeWidth="1.8" opacity="0.8" />
          <path d="M 0,0 Q -9,-48 -18,-2" fill="none" stroke="#E0F2FE" strokeWidth="2.2" opacity="0.85" />
          <path d="M 0,0 Q 9,-48 18,-2" fill="none" stroke="#E0F2FE" strokeWidth="2.2" opacity="0.85" />
          <path d="M 0,0 Q 0,-60 0,-6" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.9" />
          <ellipse cx="0" cy="0" rx="24" ry="4.5" fill="#38BDF8" opacity="0.45" />
        </g>

        {/* ========================================================
            LAYER 8: SERENE CHAO PHRAYA RIVER WATER SURFACE & REFLECTIONS
            (ผิวน้ำเจ้าพระยาสะอาด สงบ ปลอดโปร่ง ไม่เกะกะสายตา)
           ======================================================== */}
        <g id="pond-water">
          {/* Deep Midnight Serene River Base */}
          <rect
            x="0"
            y="432"
            width="1440"
            height="468"
            fill="url(#riverWaterGrad)"
            opacity={theme.waterSurfaceOpacity}
          />

          {/* Soft, Subtle Inverted Reflection of Shrine Pavilion */}
          <g
            id="water-reflections"
            transform="translate(720, 440) scale(1, -0.6)"
            opacity={theme.waterReflection * 0.45}
            filter="url(#waterRippleBlur)"
          >
            <polygon points="-155,-84 155,-84 0,-245" fill={theme.pavilionRoof} opacity="0.6" />
            <rect x="-70" y="-88" width="140" height="84" fill="#FEF3C7" opacity="0.4" />
            <circle cx="0" cy="-44" r="48" fill="#F59E0B" opacity="0.7" />
            <polygon points="-6,-245 6,-245 0,-350" fill="#FEF08A" opacity="0.6" />
          </g>

          {/* Soft Golden Water Sheen under Pavilion Steps */}
          <ellipse cx="720" cy="445" rx="110" ry="8" fill="#FBBF24" opacity="0.32" filter="url(#waterRippleBlur)" />
          <ellipse cx="720" cy="460" rx="140" ry="10" fill="#F59E0B" opacity="0.18" filter="url(#waterRippleBlur)" />

          {/* Gentle Swan Lamppost Reflections */}
          {[180, 380, 1060, 1330].map((lx, idx) => (
            <ellipse key={`swan-ref-${idx}`} cx={lx + 7} cy="450" rx="16" ry="4" fill="#FEF08A" opacity="0.25" filter="url(#waterRippleBlur)" />
          ))}

          {/* Soft Festival Fair Warm Glow */}
          {theme.fairLightsGlow > 0 && (
            <ellipse cx="1190" cy="455" rx="130" ry="10" fill="#F59E0B" opacity="0.25" filter="url(#waterRippleBlur)" />
          )}

          {/* MOONBEAM REFLECTION */}
          {theme.moonOpacity > 0 && (
            <g opacity={theme.moonOpacity * 0.35} filter="url(#waterRippleBlur)">
              <ellipse cx="1180" cy="470" rx="40" ry="5" fill="#FEF08A" />
              <ellipse cx="1180" cy="510" rx="50" ry="6" fill="#FEF08A" />
              <ellipse cx="1180" cy="560" rx="60" ry="7" fill="#FEF08A" />
              <ellipse cx="1180" cy="620" rx="75" ry="8" fill="#FEF08A" />
              <ellipse cx="1180" cy="700" rx="90" ry="10" fill="#FEF08A" />
            </g>
          )}

          {/* FLOATING WOODEN PONTOON PIER (LEFT DOCK) */}
          <g id="pontoon-pier" transform="translate(60, 442)">
            <rect x="0" y="24" width="220" height="18" rx="5" fill={theme.pontoonFloat} />
            <polygon points="-20,24 230,24 210,6 0,6" fill={theme.pontoonColor} />
            {[20, 60, 100, 140, 180].map((px, i) => (
              <line
                key={i}
                x1={px}
                y1="24"
                x2={px - 15}
                y2="6"
                stroke="#3B1C08"
                strokeWidth="1.5"
              />
            ))}
            <rect x="200" y="-8" width="6" height="32" fill="#451A03" rx="1" />
            <circle cx="203" cy="-14" r="4" fill="#FEF08A" />
            {theme.fairLightsGlow > 0 && (
              <circle
                cx="203"
                cy="-14"
                r="16"
                fill="url(#bulbGlow)"
                opacity={theme.fairLightsGlow * 0.8}
              />
            )}
            <path d="M 203,12 Q 170,22 140,16" stroke="#FEF08A" strokeWidth="1.5" fill="none" opacity="0.6" />
          </g>

          {/* GENTLE RIVER CURRENT & TRANQUIL WATER RIPPLES */}
          <g stroke="#FEF08A" strokeOpacity="0.14" strokeWidth="1.2" fill="none">
            <path d="M 60,465 Q 240,458 420,465" />
            <path d="M 520,500 Q 720,494 920,500" />
            <path d="M 200,550 Q 480,542 760,550" />
            <path d="M 780,590 Q 1060,582 1340,590" />
            <path d="M 300,660 Q 720,650 1140,660" strokeWidth="1.6" strokeOpacity="0.12" />
            <path d="M 120,750 Q 560,740 1000,750" strokeWidth="1.8" strokeOpacity="0.1" />
            <path d="M 440,830 Q 880,820 1320,830" strokeWidth="2.2" strokeOpacity="0.08" />
          </g>

          {/* LOTUS PADS WITH PINK BLOSSOMS (PLACED SUBTLY AT FAR SIDES) */}
          <g id="lotus-pads" opacity="0.75">
            <ellipse cx="280" cy="495" rx="34" ry="12" fill="#143422" />
            <ellipse cx="320" cy="510" rx="26" ry="9" fill="#1E4D32" />
            <circle cx="318" cy="505" r="4" fill="#F43F5E" />
            <circle cx="318" cy="505" r="2" fill="#FEF08A" />

            <ellipse cx="1320" cy="490" rx="38" ry="13" fill="#143422" />
            <ellipse cx="1270" cy="505" rx="28" ry="10" fill="#1E4D32" />
            <circle cx="1275" cy="500" r="4.5" fill="#F43F5E" />
            <circle cx="1275" cy="500" r="2.2" fill="#FEF08A" />
          </g>
        </g>
      </svg>

      {/* ========================================================
          MOBILE TAILORED POND SCENE (viewBox="0 0 440 950")
          COMPOSED EXACTLY FROM REAL RMUTK ARCHITECTURE:
          - Shows 100% of landmarks without slice cropping
          - Authentic Thai Mondop Pavilion with Golden Spire
          - White pointed arches submerged in water
          - Thai National Flagpole
          - Vintage white garden benches & Swan lamppost
          - Topiary bushes & Pond fountain
          - Full Moon & Sky Lanterns
         ======================================================== */}
      <svg
        className="block md:hidden w-full h-full object-cover pointer-events-none"
        viewBox="0 0 440 950"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="ศาลากลางน้ำและสระน้ำ มทร.กรุงเทพ บนมือถือ"
      >
        <defs>
          <linearGradient id="skyGradMob" x1="0%" y1="0%" x2="0%" y2="100%">
            {theme.skyGradient.map((col, idx) => (
              <stop
                key={idx}
                offset={`${(idx / (theme.skyGradient.length - 1)) * 100}%`}
                stopColor={col}
              />
            ))}
          </linearGradient>

          <linearGradient id="waterGradMob" x1="0%" y1="0%" x2="0%" y2="100%">
            {theme.waterGradient.map((col, idx) => (
              <stop
                key={idx}
                offset={`${(idx / (theme.waterGradient.length - 1)) * 100}%`}
                stopColor={col}
              />
            ))}
          </linearGradient>

          <linearGradient id="roofGradMob" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.pavilionRoofHighlight} />
            <stop offset="100%" stopColor={theme.pavilionRoof} />
          </linearGradient>

          <linearGradient id="spireGoldGradMob" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <radialGradient id="moonHaloMob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFEE8" stopOpacity="1" />
            <stop offset="30%" stopColor="#FFF3B8" stopOpacity="0.75" />
            <stop offset="65%" stopColor="#F5C04A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F5C04A" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="bulbGlowMob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="35%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="shrineAuraMob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
            <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#D97706" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="lanternGlowMob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF0" />
            <stop offset="55%" stopColor="#FBBF24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>

          {/* MOBILE SKY LANTERN GRADIENTS (โคมลอยกระดาษสาบนมือถือ) */}
          <linearGradient id="lanternPaperGradMob" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF2" />
            <stop offset="35%" stopColor="#FEF3C7" />
            <stop offset="70%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <filter id="droneBloomMob" x="-30%" y="-40%" width="160%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Miniature Sky Lantern for Mobile Letters */}
          <g id="sky-lantern-unit-mob">
            <circle cx="0" cy="0" r="7" fill="url(#lanternGlowMob)" opacity="0.8" />
            <path
              d="M -2.8,-4.2 C -3.5,-0.8 -2.5,2.5 0,3.2 C 2.5,2.5 3.5,-0.8 2.8,-4.2 Z"
              fill="url(#lanternPaperGradMob)"
              stroke="#D97706"
              strokeWidth="0.35"
            />
            <ellipse cx="0" cy="2.8" rx="2" ry="0.6" fill="#78350F" />
            <circle cx="0" cy="1.6" r="1.0" fill="#FEF08A" />
            <circle cx="0" cy="1.6" r="0.5" fill="#FFFFFF" />
          </g>

          {/* Medium Floating Sky Lantern for Mobile */}
          <g id="floating-sky-lantern-mob">
            <circle cx="0" cy="0" r="18" fill="url(#lanternGlowMob)" opacity="0.85" />
            <path
              d="M -6.5,-10 C -8.5,-1.5 -6.5,6.5 0,8.5 C 6.5,6.5 8.5,-1.5 6.5,-10 Z"
              fill="url(#lanternPaperGradMob)"
              stroke="#D97706"
              strokeWidth="0.6"
            />
            <ellipse cx="0" cy="7.5" rx="4.5" ry="1.2" fill="#78350F" />
            <circle cx="0" cy="4.2" r="2.2" fill="#FEF08A" />
            <circle cx="0" cy="4.2" r="1.1" fill="#FFFFFF" />
          </g>

          {/* MOBILE RIVER WATER GRADIENTS */}
          <linearGradient id="riverWaterGradMob" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#081829" />
            <stop offset="16%" stopColor="#061A2E" />
            <stop offset="42%" stopColor="#0A223B" />
            <stop offset="72%" stopColor="#0B1A2C" />
            <stop offset="100%" stopColor="#040C16" />
          </linearGradient>

          <filter id="waterRippleBlurMob" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* 1. SKY */}
        <rect x="0" y="0" width="440" height="950" fill="url(#skyGradMob)" />

        {/* Stars */}
        <g opacity={theme.starsOpacity}>
          {[
            { x: 35, y: 40, r: 1.2, o: 0.8 },
            { x: 80, y: 85, r: 1.5, o: 0.9 },
            { x: 140, y: 35, r: 1.1, o: 0.7 },
            { x: 190, y: 65, r: 1.4, o: 0.85 },
            { x: 250, y: 40, r: 1.3, o: 0.75 },
            { x: 290, y: 80, r: 1.5, o: 0.85 },
            { x: 390, y: 45, r: 1.4, o: 0.9 },
          ].map((s, idx) => (
            <circle key={idx} cx={s.x} cy={s.y} r={s.r} fill="#FFFDF0" opacity={s.o} />
          ))}
        </g>

        {/* FULL MOON ON MOBILE (FRAMED BEAUTIFULLY AT UPPER RIGHT) */}
        <g opacity={theme.moonOpacity}>
          <circle cx="360" cy="115" r="55" fill="url(#moonHaloMob)" />
          <circle cx="360" cy="115" r="23" fill="#FFFDF4" />
          <circle cx="352" cy="110" r="5" fill="#E2D4A3" opacity="0.22" />
          <circle cx="366" cy="120" r="7" fill="#E2D4A3" opacity="0.18" />
        </g>

        {/* Floating Sky Lanterns */}
        <g opacity={theme.lanternsOpacity}>
          {[
            { x: 50, y: 125, s: 0.5, o: 0.8 },
            { x: 120, y: 75, s: 0.42, o: 0.65 },
            { x: 280, y: 65, s: 0.36, o: 0.6 },
            { x: 390, y: 165, s: 0.48, o: 0.75 },
          ].map((l, idx) => (
            <g key={idx} transform={`translate(${l.x}, ${l.y}) scale(${l.s})`} opacity={l.o}>
              <circle cx="0" cy="0" r="28" fill="url(#lanternGlowMob)" />
              <path
                d="M -9,-14 C -12,2 -8,11 0,13 C 8,11 12,2 9,-14 Z"
                fill="#FEF3C7"
                stroke="#F59E0B"
                strokeWidth="0.8"
              />
              <circle cx="0" cy="7" r="3.5" fill="#F59E0B" />
              <circle cx="0" cy="7" r="1.8" fill="#FFFFFF" />
            </g>
          ))}
        </g>

        {/* ========================================================
            LAYER 1.5 (MOBILE): THAI SKY LANTERNS IN CELESTIAL FORMATION
            (โคมลอยยี่เป็งแปรอักษร "ลอยกระทง มทร.กรุงเทพ" บนจอมือถือ - พ้นปุ่มหมวดหมู่)
           ======================================================== */}
        <g id="sky-lantern-formation-mob" transform="translate(130, 175)" opacity={theme.lanternsOpacity}>
          <g className="animate-pulse">
            {/* Ambient Warm Golden Starlight Glow */}
            <ellipse cx="0" cy="14" rx="100" ry="34" fill="url(#lanternGlowMob)" opacity="0.4" />

            {/* Floating Atmospheric Sky Lanterns drifting upwards */}
            <use href="#floating-sky-lantern-mob" x="-72" y="-28" transform="scale(0.7)" opacity="0.85" />
            <use href="#floating-sky-lantern-mob" x="72" y="-30" transform="scale(0.75)" opacity="0.9" />
            <use href="#floating-sky-lantern-mob" x="-36" y="-42" transform="scale(0.55)" opacity="0.75" />
            <use href="#floating-sky-lantern-mob" x="36" y="-44" transform="scale(0.55)" opacity="0.75" />
            <use href="#floating-sky-lantern-mob" x="0" y="-52" transform="scale(0.5)" opacity="0.7" />

            {/* Golden Celestial Arch of Miniature Lanterns above the phrase */}
            {[-70, -50, -30, -10, 10, 30, 50, 70].map((lx, i) => {
              const arcY = -18 + Math.pow(lx / 70, 2) * 10;
              return (
                <use
                  key={`mob-arc-${i}`}
                  href="#sky-lantern-unit-mob"
                  x={lx}
                  y={arcY}
                  transform="scale(0.85)"
                  opacity="0.85"
                />
              );
            })}

            {/* Golden Starlight Connecting Filaments */}
            <path
              d="M -75,8 Q -38,-4 0,-5 Q 38,-4 75,8"
              stroke="#FDE68A"
              strokeWidth="0.6"
              strokeDasharray="2.5 2.5"
              fill="none"
              opacity="0.6"
            />

            {/* Line 1: ลอยกระทง (Rice-paper lantern calligraphy) */}
            <text
              x="0"
              y="10"
              textAnchor="middle"
              fill="url(#lanternPaperGradMob)"
              stroke="#B45309"
              strokeWidth="0.6"
              filter="url(#droneBloomMob)"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 16px rgba(245, 158, 11, 0.6))',
              }}
              fontFamily="'Prompt', 'Kanit', sans-serif"
              fontSize="20"
              fontWeight="700"
              letterSpacing="2.8"
            >
              ลอยกระทง
            </text>

            {/* Sky Lantern units on Line 1 */}
            {[
              { x: -52, y: -4 },
              { x: -40, y: 12 },
              { x: -22, y: 2 },
              { x: -2, y: -4 },
              { x: 18, y: 10 },
              { x: 40, y: 0 },
              { x: 52, y: 8 },
            ].map((pt, i) => (
              <use key={`mob-l1-${i}`} href="#sky-lantern-unit-mob" x={pt.x} y={pt.y} />
            ))}

            {/* Line 2: มทร.กรุงเทพ */}
            <text
              x="0"
              y="32"
              textAnchor="middle"
              fill="url(#lanternPaperGradMob)"
              stroke="#B45309"
              strokeWidth="0.5"
              filter="url(#droneBloomMob)"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 12px rgba(245, 158, 11, 0.5))',
              }}
              fontFamily="'Prompt', 'Kanit', sans-serif"
              fontSize="13.5"
              fontWeight="600"
              letterSpacing="2"
            >
              มทร.กรุงเทพ
            </text>

            {/* Sky Lantern units on Line 2 */}
            {[
              { x: -46, y: 28 },
              { x: -22, y: 28 },
              { x: -1, y: 24 },
              { x: 20, y: 28 },
              { x: 46, y: 28 },
            ].map((pt, i) => (
              <use key={`mob-l2-${i}`} href="#sky-lantern-unit-mob" x={pt.x} y={pt.y} transform="scale(0.8)" />
            ))}

            {/* Flanking Yee Peng Sky Lanterns */}
            <g transform="translate(-80, 16)">
              <use href="#sky-lantern-unit-mob" transform="scale(1.25)" />
            </g>
            <g transform="translate(80, 16)">
              <use href="#sky-lantern-unit-mob" transform="scale(1.25)" />
            </g>
          </g>
        </g>

        {/* Campus Backdrop Trees & Academic Wings */}
        <g id="campus-backdrop-mob">
          <path
            d="M 0,432 Q 80,370 160,395 Q 220,365 280,395 Q 360,370 440,418 L 440,440 L 0,440 Z"
            fill={theme.treeFar}
            opacity="0.9"
          />

          {/* Left Wing */}
          <polygon points="10,380 25,360 115,360 115,380" fill={theme.buildingRoof} />
          <rect x="20" y="380" width="95" height="52" fill={theme.buildingWall} />
          <rect x="20" y="380" width="95" height="5" fill="#EA580C" opacity="0.8" />
          <rect x="25" y="388" width="85" height="7" fill="#1E293B" opacity="0.65" />
          <rect x="25" y="401" width="85" height="8" fill="#1E293B" opacity="0.65" />

          {/* Right Wing */}
          <polygon points="325,380 325,360 415,360 430,380" fill={theme.buildingRoof} />
          <rect x="325" y="380" width="95" height="52" fill={theme.buildingWall} />
          <rect x="325" y="380" width="95" height="5" fill="#EA580C" opacity="0.8" />
          <rect x="330" y="388" width="85" height="7" fill="#1E293B" opacity="0.65" />
          <rect x="330" y="401" width="85" height="8" fill="#1E293B" opacity="0.65" />

          {/* National Flagpole on Mobile */}
          <line x1="265" y1="170" x2="265" y2="350" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="265" cy="170" r="2.5" fill="#F59E0B" />
          <g transform="translate(267, 174)">
            <path d="M 0,0 Q 14,3 28,0 Q 42,-3 50,1 L 50,30 Q 42,26 28,29 Q 14,32 0,29 Z" fill="#B91C1C" />
            <path d="M 0,4.8 Q 14,7.8 28,4.8 Q 42,1.8 50,5.8 L 50,24.2 Q 42,20.2 28,23.2 Q 14,26.2 0,23.2 Z" fill="#FFFFFF" />
            <path d="M 0,9.6 Q 14,12.6 28,9.6 Q 42,6.6 50,10.6 L 50,19.4 Q 42,15.4 28,18.4 Q 14,21.4 0,18.4 Z" fill="#1E3A8A" />
          </g>
        </g>

        {/* White Balustrade Bridge on Mobile */}
        <g id="white-bridge-mob">
          <rect x="15" y="428" width="410" height="12" rx="1.5" fill={theme.bridgeColor} />
          {[45, 85, 125, 315, 355, 395].map((ax, i) => (
            <path
              key={i}
              d={`M ${ax - 14},440 Q ${ax},424 ${ax + 14},440 Z`}
              fill="#0A1626"
              opacity="0.85"
            />
          ))}
          {Array.from({ length: 28 }).map((_, i) => {
            const bx = 22 + i * 14.5;
            if (bx > 165 && bx < 275) return null;
            return <rect key={i} x={bx} y="416" width="2.5" height="12" fill={theme.bridgeColor} rx="0.5" />;
          })}
          <rect x="15" y="414" width="410" height="2.5" rx="1" fill={theme.bridgeColor} />

          {/* White Vintage Bench on Mobile */}
          <g transform="translate(85, 417)">
            <rect x="-10" y="-7" width="20" height="7" fill="none" stroke="#FFFFFF" strokeWidth="1" rx="1" />
            <rect x="-11" y="0" width="22" height="2" fill="#FFFFFF" rx="0.5" />
            <path d="M -9,2 L -8,9 M 9,2 L 8,9" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>

          {/* Swan Lampposts on Mobile */}
          {[140, 310].map((lx, i) => (
            <g key={`mob-swan-${i}`} transform={`translate(${lx}, 414)`}>
              <rect x="-1" y="-22" width="2" height="22" fill="#143A27" />
              <circle cx="0" cy="-10" r="1.5" fill="#F59E0B" />
              <path d="M 0,-22 C -1.5,-26 1.5,-29 4,-27 C 6,-25 4,-22 2,-21 Z" fill="#F59E0B" />
              <circle cx="4" cy="-19" r="2.5" fill="#FEF08A" />
              <circle cx="4" cy="-19" r="8" fill="url(#bulbGlowMob)" opacity="0.8" />
            </g>
          ))}
        </g>

        {/* HERO: CENTRAL THAI SHRINE PAVILION ON MOBILE (ศาลากลางน้ำ มทร.กรุงเทพ) */}
        <g id="shrine-pavilion-mob" transform="translate(220, 434)">
          {/* Distinctive Pointed Arches in the Water on Mobile */}
          <path d="M -75,6 L 75,6 L 68,22 L -68,22 Z" fill="#FFFFFF" />
          {[-54, -36, -18, 0, 18, 36, 54].map((ax, i) => (
            <path
              key={`mob-arch-${i}`}
              d={`M ${ax - 7},22 L ${ax - 7},12 Q ${ax},4 ${ax + 7},12 L ${ax + 7},22 Z`}
              fill="#061324"
              stroke="#F1F5F9"
              strokeWidth="1.8"
            />
          ))}

          {/* Deck platform */}
          <rect x="-64" y="-3" width="128" height="7" rx="1" fill="#FFFFFF" />

          {/* Sanctuary & Golden Deity */}
          <rect x="-44" y="-56" width="88" height="54" fill="#FEF3C7" opacity="0.9" />
          <circle cx="0" cy="-28" r="28" fill="url(#shrineAuraMob)" opacity="0.98" />
          {/* Throne & Buddha */}
          <polygon points="-14,-2 14,-2 10,-9 -10,-9" fill="#D97706" />
          <path d="M -9,-9 C -11,-19 -5,-23 0,-23 C 5,-23 11,-19 9,-9 Z" fill="#F59E0B" />
          <circle cx="0" cy="-27" r="5.5" fill="#F59E0B" />
          <polygon points="-1.5,-32 1.5,-32 0,-37" fill="#FEF08A" />

          {/* 4 White Columns with Golden Capitals on Mobile */}
          {[-40, -14, 14, 40].map((px, i) => (
            <g key={i}>
              <rect x={px - 2.8} y="-56" width="5.6" height="54" fill="#FFFFFF" />
              <polygon points={`${px - 4},-56 ${px + 4},-56 ${px + 3},-52 ${px - 3},-52`} fill="#F59E0B" />
              <rect x={px - 3.5} y="-2" width="7" height="2.5" fill="#CBD5E1" />
            </g>
          ))}

          {/* Tier 1 Thai Roof with Curved Eaves & Chofa */}
          <path
            d="M -92,-52 Q -66,-58 0,-58 Q 66,-58 92,-52 Q 80,-68 60,-82 L -60,-82 Q -80,-68 -92,-52 Z"
            fill="url(#roofGradMob)"
          />
          <path
            d="M -96,-50 Q -66,-58 0,-58 Q 66,-58 96,-50 Q 100,-52 96,-54 Q 66,-60 0,-60 Q -66,-60 -96,-54 Q -100,-52 -96,-50 Z"
            fill="#F59E0B"
          />
          {/* Hang Hong corners */}
          <path d="M -96,-50 Q -103,-57 -99,-62 Q -96,-56 -92,-53 Z" fill="#F59E0B" />
          <path d="M 96,-50 Q 103,-57 99,-62 Q 96,-56 92,-53 Z" fill="#F59E0B" />

          {/* Tier 2 Middle Roof */}
          <path
            d="M -64,-82 Q -45,-86 0,-86 Q 45,-86 64,-82 Q 52,-100 36,-116 L -36,-116 Q -52,-100 -64,-82 Z"
            fill="url(#roofGradMob)"
          />
          <path
            d="M -67,-80 Q -45,-86 0,-86 Q 45,-86 67,-80 Q 70,-82 67,-84 Q 45,-88 0,-88 Q -45,-88 -67,-84 Q -70,-82 -67,-80 Z"
            fill="#F59E0B"
          />

          {/* Tier 3 Pediment with Golden Carvings */}
          <path d="M -38,-116 L 0,-168 L 38,-116 Z" fill="url(#roofGradMob)" />
          <path d="M -41,-114 L 0,-172 L 41,-114 L 36,-112 L 0,-166 L -36,-112 Z" fill="#F59E0B" />
          <path d="M 0,-172 C -2,-180 1,-184 0,-188 C 2,-184 4,-180 1,-172 Z" fill="#FEF08A" />
          <polygon points="0,-124 -15,-116 15,-116" fill="#F59E0B" />
          <circle cx="0,-132" r="4.5" fill="#FEF08A" />

          {/* Golden Spire / Mondop Chatra on Mobile */}
          <rect x="-11" y="-170" width="22" height="3.5" rx="0.8" fill="#F59E0B" />
          <rect x="-8.5" y="-173.5" width="17" height="3.5" rx="0.8" fill="#FEF08A" />
          <path d="M -5.5,-177 C -7,-185 -4,-190 0,-192 C 4,-190 7,-185 5.5,-177 Z" fill="url(#spireGoldGradMob)" />
          {[-193, -197, -201, -205, -209].map((sy, i) => (
            <ellipse key={i} cx="0" cy={sy} rx={5 - i * 0.75} ry="1.2" fill="#FEF08A" />
          ))}
          <polygon points="-1.2,-209 1.2,-209 0.4,-232 -0.4,-232" fill="url(#spireGoldGradMob)" />
          <circle cx="0" cy="-234" r="2.5" fill="#FFFFFF" />
          <circle cx="0" cy="-234" r="10" fill="url(#bulbGlowMob)" opacity="0.85" />

          {/* Marble Steps */}
          <path d="M -44,5 A 44,11 0 0,0 44,5 Z" fill="#FFFFFF" />
          <path d="M -54,11 A 54,13 0 0,0 54,11 Z" fill="#F8FAFC" />
          <path d="M -64,17 A 64,16 0 0,0 64,17 Z" fill="#E2E8F0" />
        </g>

        {/* Fountain on Mobile */}
        <g id="fountain-mob" transform="translate(130, 452)">
          <path d="M 0,0 Q -10,-24 -20,-2" fill="none" stroke="#BAE6FD" strokeWidth="1.5" opacity="0.8" />
          <path d="M 0,0 Q 10,-24 20,-2" fill="none" stroke="#BAE6FD" strokeWidth="1.5" opacity="0.8" />
          <path d="M 0,0 Q 0,-36 0,-4" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.9" />
          <ellipse cx="0" cy="0" rx="14" ry="3" fill="#38BDF8" opacity="0.4" />
        </g>

        {/* ========================================================
            LAYER 8 (MOBILE): SERENE CHAO PHRAYA RIVER WATER SURFACE
            (ผิวน้ำเจ้าพระยาสะอาด สงบ ปลอดโปร่ง ไม่เกะกะบนมือถือ)
           ======================================================== */}
        <g id="pond-water-mob">
          {/* Deep Midnight Serene River Base */}
          <rect
            x="0"
            y="446"
            width="440"
            height="504"
            fill="url(#riverWaterGradMob)"
            opacity={theme.waterSurfaceOpacity}
          />

          {/* Inverted Pavilion Reflection on Mobile (Soft & Subtle) */}
          <g
            id="water-reflections-mob"
            transform="translate(220, 452) scale(1, -0.6)"
            opacity={theme.waterReflection * 0.45}
            filter="url(#waterRippleBlurMob)"
          >
            <polygon points="-92,-52 92,-52 0,-168" fill={theme.pavilionRoof} opacity="0.6" />
            <rect x="-44" y="-56" width="88" height="54" fill="#FEF3C7" opacity="0.4" />
            <circle cx="0" cy="-28" r="32" fill="#F59E0B" opacity="0.7" />
            <polygon points="-4,-168 4,-168 0,-232" fill="#FEF08A" opacity="0.6" />
          </g>

          {/* Soft Golden Water Sheen under Mobile Steps */}
          <ellipse cx="220" cy="454" rx="55" ry="5" fill="#FBBF24" opacity="0.3" filter="url(#waterRippleBlurMob)" />
          <ellipse cx="220" cy="466" rx="75" ry="7" fill="#F59E0B" opacity="0.18" filter="url(#waterRippleBlurMob)" />

          {/* Swan Lampposts on Mobile */}
          {[140, 310].map((lx, idx) => (
            <ellipse key={`mob-swan-ref-${idx}`} cx={lx + 4} cy="455" rx="10" ry="2.5" fill="#FEF08A" opacity="0.25" filter="url(#waterRippleBlurMob)" />
          ))}

          {/* Floating Pontoon on Mobile */}
          <g id="pontoon-pier-mob" transform="translate(20, 452)">
            <rect x="0" y="14" width="85" height="12" rx="3" fill={theme.pontoonFloat} />
            <polygon points="-8,14 90,14 80,4 0,4" fill={theme.pontoonColor} />
            <rect x="75" y="-5" width="4" height="22" fill="#451A03" rx="1" />
            <circle cx="77" cy="-9" r="3" fill="#FEF08A" />
            <circle cx="77" cy="-9" r="10" fill="url(#bulbGlowMob)" opacity="0.8" />
          </g>

          {/* Moonbeam Path on Mobile */}
          {theme.moonOpacity > 0 && (
            <g opacity={theme.moonOpacity * 0.35} filter="url(#waterRippleBlurMob)">
              <ellipse cx="360" cy="475" rx="28" ry="4" fill="#FEF08A" />
              <ellipse cx="360" cy="510" rx="35" ry="5" fill="#FEF08A" />
              <ellipse cx="360" cy="555" rx="42" ry="6" fill="#FEF08A" />
              <ellipse cx="360" cy="610" rx="50" ry="7" fill="#FEF08A" />
              <ellipse cx="360" cy="680" rx="60" ry="8" fill="#FEF08A" />
            </g>
          )}

          {/* Water Ripples */}
          <g stroke="#FEF08A" strokeOpacity="0.14" strokeWidth="1.2" fill="none">
            <path d="M 30,480 Q 120,474 210,480" />
            <path d="M 180,530 Q 300,524 420,530" />
            <path d="M 60,600 Q 220,592 380,600" strokeWidth="1.5" strokeOpacity="0.12" />
            <path d="M 90,700 Q 260,690 430,700" strokeWidth="1.8" strokeOpacity="0.1" />
            <path d="M 40,810 Q 240,800 440,810" strokeWidth="2.2" strokeOpacity="0.08" />
          </g>

          {/* Lotus Pads on Mobile (Subtly Placed) */}
          <g id="lotus-pads-mob" opacity="0.75">
            <ellipse cx="140" cy="505" rx="22" ry="8" fill="#143422" />
            <ellipse cx="165" cy="515" rx="16" ry="6" fill="#1E4D32" />
            <circle cx="163" cy="512" r="3" fill="#F43F5E" />
            <circle cx="163" cy="512" r="1.5" fill="#FEF08A" />
            <ellipse cx="380" cy="505" rx="24" ry="9" fill="#143422" />
            <circle cx="385" cy="500" r="3" fill="#F43F5E" />
          </g>
        </g>
      </svg>

      {/* KRATHONGS FLOATING CONTAINER */}
      <div className="absolute inset-0 pointer-events-auto">
        {children}
      </div>
    </div>
  );
};
