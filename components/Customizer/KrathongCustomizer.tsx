'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FloatingMode,
  WishCategory,
  KrathongBase,
  FlowerType,
  CandleSet,
  SacredItem,
  KrathongInput,
  Krathong,
} from '@/types';
import { FACULTIES } from '@/data/faculties';
import { BASES, FLOWERS, CANDLES } from '@/data/krathongOptions';
import { KrathongSVG } from '../Krathong/KrathongSVG';
import { validateKrathongInput } from '@/lib/validation';
import { getRemainingCooldownSeconds } from '@/lib/storage';
import { sound } from '@/lib/sound';
import {
  X,
  Flame,
  Sparkles,
  AlertCircle,
  Clock,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Heart,
  Users,
  Image as ImageIcon,
  Share2,
  PenLine,
  ChevronDown,
} from 'lucide-react';

interface KrathongCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: KrathongInput) => Promise<{ success: boolean; krathong?: Krathong; error?: string }>;
  initialPartyCode?: string;
  onOpenStoryModal?: (
    partyCode: string,
    base: KrathongBase,
    flower: FlowerType,
    candle: CandleSet,
    sacredItems: SacredItem[],
    hostName: string
  ) => void;
}

// Gen-Z Quick Wish Presets (คำขอกลางๆ ยอดฮิต ทัชใจวัยรุ่น เห็นแล้วอยากกด)
const GENZ_WISH_PRESETS: Record<WishCategory, { label: string; presets: string[] }> = {
  study: {
    label: 'เรื่องเรียน',
    presets: [
      'สอบผ่านฉลุยทุกวิชา เกรดออกมาน่ารักสมความตั้งใจ',
      'อ่านตรงข้อสอบ จำแม่น ไม่มีหลุดโฟกัส',
      'โปรเจกต์และรายงานผ่านง่ายๆ อาจารย์ใจดี มีเมตตา',
      'ขอให้รอดพ้นช่วงไฟนอล คว้าเกรด A มาครอง',
      'งานกลุ่มราบรื่น ทุกคนช่วยกันเต็มที่ ไม่มีใครเท',
      'เรียนเข้าใจง่าย สมองไบรท์ สุขภาพจิตยังดี',
      'ขอให้เทอมนี้ใจดีกับเรา ไม่เหนื่อยจนเกินไป',
      'ขอให้ได้ทำในสิ่งที่ชอบ แล้วสำเร็จดั่งใจหวัง',
    ],
  },
  career: {
    label: 'การงาน',
    presets: [
      'เงินเข้าบัญชีรัวๆ มีใช้ไม่ขาดมือ เปย์ตัวเองได้ฟินๆ',
      'ได้ทำงานที่ชอบ สังคมเพื่อนร่วมงานน่ารัก สบายใจ',
      'งานราบรื่น ไร้อุปสรรค หัวหน้าเอ็นดู ลูกค้าใจดี',
      'ได้ที่ฝึกงานและงานในฝัน เติบโตอย่างมั่นใจ',
      'การเงินคล่องตัว สิ้นเดือนไม่สิ้นใจ มีเงินเก็บก้อนโต',
      'ทำงานแล้วไม่หมดไฟ มี Work-Life Balance ที่แท้จริง',
      'ขอให้ความพยายามของเรา ผลิดอกออกผลเป็นความสำเร็จ',
      'มีโชคลาภเข้ามาตลอด ถูกหวยรวยเบอร์ ปลดล็อกชีวิต',
    ],
  },
  love: {
    label: 'ความรัก',
    presets: [
      'ขอให้ได้เป็นคนโปรดของคนที่เรารักสักที',
      'เจอคนที่พอดี เข้าใจกัน และเป็นเซฟโซนให้กันเสมอ',
      'ขอให้คนคุยชัดเจน ไม่ดองแชท พัฒนาความสัมพันธ์ไปด้วยกัน',
      'รักตัวเองให้เก่ง มีความสุขกับตัวเองในทุกวัน',
      'มีมิตรภาพที่จริงใจ เพื่อนดี อยู่ข้างกันไปนานๆ',
      'ขอให้ความสัมพันธ์นี้สบายใจ ไม่เหนื่อย และไม่มีน้ำตา',
      'เจอคนจริงใจ เข้ามาเติมเต็ม รักเดียวใจเดียว',
      'คนมีคู่ขอให้รักกันยืนยาว เข้าใจและให้อภัยกันเสมอ',
    ],
  },
  health: {
    label: 'ปล่อยจอย',
    presets: [
      'ขอให้ใจฟูทุกวัน ยิ้มได้เยอะๆ ไม่เครียดเกินไป',
      'นอนหลับเต็มอิ่มทุกคืน ตื่นมารู้สึกสดชื่น มีพลัง',
      'ลอยเรื่องแย่ๆ ทิ้งไป ขอให้ต่อจากนี้มีแต่เรื่องดีๆ',
      'ไม่ปวดหลัง สุขภาพแข็งแรง ออฟฟิศซินโดรมหายไป',
      'ตัดคนท็อกซิกและพลังลบออกไป พบเจอแต่คนใจดี',
      'ขอให้ค้นพบความสุขง่ายๆ ในทุกๆ วันของชีวิต',
      'กินอะไรก็ไม่อ้วน สุขภาพกายและใจแข็งแรงสมบูรณ์',
      'ขอให้โลกใบนี้ใจดีกับเรา และคนที่เรารักเสมอ',
    ],
  },
};

// ==========================================
// Custom Clean Vector Mini Icons for Cards
// ==========================================
function BaseMiniIcon({ baseId }: { baseId: KrathongBase }) {
  switch (baseId) {
    case 'gear-base':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="14" fill="#F59E0B" fillOpacity="0.15" stroke="#F59E0B" strokeWidth="2" />
          <path
            d="M20 7V10M20 30V33M7 20H10M30 20H33M10.8 10.8L13 13M27 27L29.2 29.2M10.8 29.2L13 27M27 13L29.2 10.8"
            stroke="#FBBF24"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="20" cy="20" r="6" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="2.5" fill="#1E293B" />
        </svg>
      );
    case 'dictionary-base':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="10" width="24" height="20" rx="3" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="1.5" />
          <path d="M12 10V30" stroke="#3B82F6" strokeWidth="2" />
          <path d="M18 16H26M18 20H24M18 24H22" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M25 8V14L28 12L31 14V8" fill="#F59E0B" />
        </svg>
      );
    case 'science-atom-base':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="20" cy="20" rx="14" ry="5" transform="rotate(-30 20 20)" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 1" />
          <ellipse cx="20" cy="20" rx="14" ry="5" transform="rotate(30 20 20)" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 1" />
          <ellipse cx="20" cy="20" rx="14" ry="5" transform="rotate(90 20 20)" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 1" />
          <circle cx="20" cy="20" r="4.5" fill="#F59E0B" />
          <circle cx="20" cy="20" r="2" fill="#FEF08A" />
        </svg>
      );
    case 'teacher-chalkboard-base':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="7" y="11" width="26" height="18" rx="2" fill="#064E3B" stroke="#B45309" strokeWidth="2" />
          <path d="M11 16H17M11 20H21M11 24H15" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="25" cy="18" r="3" stroke="#FDE047" strokeWidth="1.2" />
          <path d="M22 28L31 28" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'stock-graph-base':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="24" height="24" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1" />
          <rect x="11" y="17" width="3" height="9" fill="#10B981" rx="0.5" />
          <path d="M12.5 14V28" stroke="#10B981" strokeWidth="1" />
          <rect x="18" y="13" width="3" height="11" fill="#10B981" rx="0.5" />
          <path d="M19.5 10V26" stroke="#10B981" strokeWidth="1" />
          <rect x="25" y="10" width="3" height="10" fill="#34D399" rx="0.5" />
          <path d="M26.5 7V22" stroke="#34D399" strokeWidth="1" />
          <path d="M10 24L17 18L23 19L29 11" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'gourmet-food-base':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="20" cy="27" rx="14" ry="4" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="1.5" />
          <path d="M9 25C9 18.5 13.9 13 20 13C26.1 13 31 18.5 31 25H9Z" fill="#FEF08A" fillOpacity="0.8" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="20" cy="11.5" r="2" fill="#F59E0B" />
          <path d="M14 21C16 19 24 19 26 21" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'thai-fabric-base':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 26C12 18 20 13 32 20C28 28 20 33 8 26Z" fill="#831843" stroke="#F472B6" strokeWidth="1.5" />
          <path d="M12 24L28 17M15 28L25 15M19 31L23 13" stroke="#FBBF24" strokeWidth="1" strokeDasharray="1.5 1.5" />
          <circle cx="20" cy="22" r="2.5" fill="#FBBF24" />
        </svg>
      );
    case 'inter-globe-base':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="12" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
          <ellipse cx="20" cy="20" rx="6" ry="12" stroke="#BAE6FD" strokeWidth="1" />
          <path d="M8.5 20H31.5M10.5 14H29.5M10.5 26H29.5" stroke="#BAE6FD" strokeWidth="1" />
          <path d="M12 32C15 34 25 34 28 32" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'banana-leaf':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="20" cy="24" rx="14" ry="7" fill="#15803D" stroke="#22C55E" strokeWidth="1.5" />
          <path d="M8 22C11 16 16 13 20 18C24 13 29 16 32 22" fill="#16A34A" stroke="#86EFAC" strokeWidth="1" />
          <path d="M11 23L20 27L29 23" stroke="#14532D" strokeWidth="1.5" />
        </svg>
      );
    case 'bread':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="16" width="22" height="12" rx="4" fill="#D97706" stroke="#F59E0B" strokeWidth="1.5" />
          <ellipse cx="20" cy="16" rx="11" ry="6" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
          <path d="M14 15C15 13 18 13 19 15M21 15C22 13 25 13 26 15" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'coconut':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 20C8 27 13.5 32 20 32C26.5 32 32 27 32 20H8Z" fill="#582C0E" stroke="#78350F" strokeWidth="1.5" />
          <ellipse cx="20" cy="20" rx="12" ry="5" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.5" />
          <ellipse cx="20" cy="20" rx="8" ry="3" fill="#FDE68A" />
        </svg>
      );
    case 'lotus-base':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="20" cy="26" rx="13" ry="5" fill="#9D174D" />
          <path d="M11 25C11 20 16 15 20 22C24 15 29 20 29 25C25 28 15 28 11 25Z" fill="#EC4899" stroke="#FBCFE8" strokeWidth="1" />
          <path d="M15 24C17 19 20 17 20 23C20 17 23 19 25 24" fill="#F472B6" />
        </svg>
      );
    default:
      return null;
  }
}

function FlowerMiniIcon({ flowerId }: { flowerId: FlowerType }) {
  switch (flowerId) {
    case 'lotus':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 9C17 15 15 22 20 28C25 22 23 15 20 9Z" fill="#F472B6" stroke="#DB2777" strokeWidth="1" />
          <path d="M14 17C12 21 13 26 17 28C16 23 16 19 14 17Z" fill="#FBCFE8" stroke="#DB2777" strokeWidth="0.8" />
          <path d="M26 17C28 21 27 26 23 28C24 23 24 19 26 17Z" fill="#FBCFE8" stroke="#DB2777" strokeWidth="0.8" />
          <circle cx="20" cy="26" r="2" fill="#FBBF24" />
        </svg>
      );
    case 'marigold':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="10" fill="#F59E0B" />
          <circle cx="20" cy="20" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="20" cy="20" r="3.5" fill="#FEF08A" />
        </svg>
      );
    case 'rose':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="10" fill="#991B1B" />
          <path d="M14 18C14 15 17 13 20 14C23 13 26 15 26 18C26 22 22 25 20 26C18 25 14 22 14 18Z" fill="#DC2626" />
          <path d="M17 19C17 17 19 16 20 17C21 16 23 17 23 19C23 21 21 22 20 23C19 22 17 21 17 19Z" fill="#EF4444" />
        </svg>
      );
    case 'globe-amaranth':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="9" fill="#831843" />
          <circle cx="20" cy="20" r="7" fill="#BE185D" stroke="#F472B6" strokeWidth="1" strokeDasharray="1.5 1.5" />
          <circle cx="20" cy="20" r="3.5" fill="#F472B6" />
        </svg>
      );
  }
}

function CandleMiniIcon({ candleId }: { candleId: CandleSet }) {
  switch (candleId) {
    case 'traditional':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="14" width="4" height="18" rx="1" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          <path d="M20 14V11" stroke="#475569" strokeWidth="1" />
          <ellipse cx="20" cy="9" rx="2" ry="3" fill="#EF4444" />
          <ellipse cx="20" cy="9.5" rx="1.2" ry="2" fill="#FEF08A" />
          <path d="M13 32L15 13M15 32L17 12M25 32L23 13" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="15" cy="13" r="1" fill="#EF4444" />
          <circle cx="17" cy="12" r="1" fill="#EF4444" />
          <circle cx="23" cy="13" r="1" fill="#EF4444" />
        </svg>
      );
    case 'pastel-minimal':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="16" y="16" width="8" height="16" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M20 16V13" stroke="#475569" strokeWidth="1.2" />
          <ellipse cx="20" cy="10" rx="2.5" ry="4" fill="#F59E0B" />
          <ellipse cx="20" cy="11" rx="1.3" ry="2.2" fill="#FEF08A" />
        </svg>
      );
    case 'twin-love':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="17" width="5" height="15" rx="1" fill="#F43F5E" stroke="#BE123C" strokeWidth="1" />
          <rect x="21" y="17" width="5" height="15" rx="1" fill="#FB7185" stroke="#BE123C" strokeWidth="1" />
          <ellipse cx="16.5" cy="12" rx="2" ry="3.5" fill="#F59E0B" />
          <ellipse cx="23.5" cy="12" rx="2" ry="3.5" fill="#F59E0B" />
          <path d="M20 7C20 7 18 5 16.5 6C15 7 16 9 20 11C24 9 25 7 23.5 6C22 5 20 7 20 7Z" fill="#FDA4AF" />
        </svg>
      );
  }
}

function SacredMiniIcon({ itemId }: { itemId: SacredItem }) {
  switch (itemId) {
    case 'coin':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="11" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="8" stroke="#D97706" strokeWidth="1" strokeDasharray="2 1" />
          <text x="20" y="24" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            ๙
          </text>
        </svg>
      );
    case 'nail':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 26C12 18 16 13 20 13C24 13 28 18 28 26" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 26C15 21 17 18 20 18C23 18 25 21 25 26" fill="#CBD5E1" />
          <path d="M20 10V14" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'hair':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 11C18 13 22 21 18 29M20 11C24 14 26 22 22 29M26 13C29 17 28 24 25 29" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

export const KrathongCustomizer: React.FC<KrathongCustomizerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialPartyCode,
  onOpenStoryModal,
}) => {
  // Step 1: เลือกฐาน | Step 2: ตกแต่ง | Step 3: อธิษฐาน & ลอย
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Sub-categories for Step 1 & Step 2
  const [baseCategory, setBaseCategory] = useState<'faculty' | 'eco'>('faculty');
  const [decorCategory, setDecorCategory] = useState<'flower' | 'candle' | 'sacred'>('flower');

  // Form States
  const [mode, setMode] = useState<FloatingMode>('solo');
  const [senderName, setSenderName] = useState<string>('');
  const [secondaryName, setSecondaryName] = useState<string>('');
  const [partyCode, setPartyCode] = useState<string>(
    () => 'RMUTK-' + Math.floor(100 + Math.random() * 900)
  );
  const [isCopiedPartyLink, setIsCopiedPartyLink] = useState<boolean>(false);
  const [faculty, setFaculty] = useState<string>('');
  const [wishCategory, setWishCategory] = useState<WishCategory>('study');
  const [wish, setWish] = useState<string>(GENZ_WISH_PRESETS.study.presets[0]);

  // Design Options
  const [base, setBase] = useState<KrathongBase>('gear-base');
  const [flower, setFlower] = useState<FlowerType>('lotus');
  const [candle, setCandle] = useState<CandleSet>('traditional');
  const [sacredItems, setSacredItems] = useState<SacredItem[]>(['coin']);
  const [isLit, setIsLit] = useState<boolean>(true); // จุดเทียนสว่างไสวอัตโนมัติ ไม่ต้องคอยกดจุดเอง

  // Status & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Hold-to-Pray & Float States (ลูกเล่นกดค้างอธิษฐาน & กระทงดุกดิก)
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [isFloatingCeremony, setIsFloatingCeremony] = useState<boolean>(false);
  const [showHoldTip, setShowHoldTip] = useState<boolean>(false);
  const holdStartTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Reset to Step 1 whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setBaseCategory('faculty');
      setDecorCategory('flower');
      setErrors({});
      setServerError(null);
      setHoldProgress(0);
      setIsHolding(false);
      setIsFloatingCeremony(false);
      setShowHoldTip(false);
      setIsLit(true); // จุดเทียนอัตโนมัติตั้งแต่เริ่ม
      setFaculty(''); // เริ่มต้นให้ผู้ใช้เลือกคณะจริงของตนเอง
    }
  }, [isOpen]);

  // Cleanup hold animation frame on unmount or step switch
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setHoldProgress(0);
    setIsHolding(false);
    setIsFloatingCeremony(false);
    if (step === 3) {
      setIsLit(true); // จุดเทียนอัตโนมัติเมื่อถึงขั้นตอนอธิษฐาน
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, [step]);

  // Sync initial party code from props/invite link
  useEffect(() => {
    if (initialPartyCode) {
      setPartyCode(initialPartyCode);
      setMode('group');
    }
  }, [initialPartyCode, isOpen]);

  // Check 30s Cooldown
  useEffect(() => {
    if (!isOpen) return;
    const checkCooldown = () => {
      const remaining = getRemainingCooldownSeconds();
      setCooldownRemaining(remaining);
    };

    checkCooldown();
    const timer = setInterval(checkCooldown, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const toggleSacredItem = (item: SacredItem) => {
    setSacredItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleModeChange = (newMode: FloatingMode) => {
    setMode(newMode);
    if (newMode === 'couple') {
      setCandle('twin-love');
      setWishCategory('love');
      setWish(GENZ_WISH_PRESETS.love.presets[0]);
      if (!partyCode) {
        setPartyCode('RMUTK-' + Math.floor(100 + Math.random() * 900));
      }
    } else if (newMode === 'group') {
      if (!partyCode) {
        setPartyCode('RMUTK-' + Math.floor(100 + Math.random() * 900));
      }
      if (candle === 'twin-love') {
        setCandle('traditional');
      }
    } else if (candle === 'twin-love') {
      setCandle('traditional');
    }
  };

  // When user picks a faculty base, intelligently sync recommended faculty
  const handleSelectBase = (selectedBase: KrathongBase) => {
    setBase(selectedBase);
    const facultyMap: Partial<Record<KrathongBase, string>> = {
      'gear-base': 'คณะวิศวกรรมศาสตร์',
      'dictionary-base': 'คณะศิลปศาสตร์',
      'science-atom-base': 'คณะวิทยาศาสตร์และเทคโนโลยี',
      'teacher-chalkboard-base': 'คณะครุศาสตร์อุตสาหกรรม',
      'stock-graph-base': 'คณะบริหารธุรกิจ',
      'gourmet-food-base': 'คณะเทคโนโลยีคหกรรมศาสตร์',
      'thai-fabric-base': 'คณะอุตสาหกรรมสิ่งทอ',
      'inter-globe-base': 'วิทยาลัยนานาชาติ',
    };
    if (facultyMap[selectedBase]) {
      setFaculty(facultyMap[selectedBase]!);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.faculty;
        return next;
      });
    }
  };

  const handleCategoryChange = (cat: WishCategory) => {
    setWishCategory(cat);
    setWish(GENZ_WISH_PRESETS[cat].presets[0]);
  };

  const handleLightCandle = () => {
    setIsLit((prev) => !prev);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.candle;
      return next;
    });
  };

  const submitKrathong = async () => {
    setServerError(null);

    const remaining = getRemainingCooldownSeconds();
    if (remaining > 0) {
      setCooldownRemaining(remaining);
      setServerError(`รออีก ${remaining} วินาที ก่อนปล่อยกระทงใบถัดไป`);
      setIsFloatingCeremony(false);
      setHoldProgress(0);
      return;
    }

    const effectivePartyCode = mode !== 'solo' ? (partyCode.trim() || undefined) : undefined;

    const payload: KrathongInput = {
      sender_name: senderName.trim(),
      secondary_name: mode === 'couple' ? secondaryName.trim() : undefined,
      mode,
      faculty,
      wish: wish.trim(),
      wish_category: wishCategory,
      base_type: base,
      flower_type: flower,
      candle_type: candle,
      sacred_items: sacredItems,
      party_code: effectivePartyCode,
    };

    const validation = validateKrathongInput(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      setStep(3);
      if (validation.errors.sender_name) {
        setTimeout(() => {
          const el = document.getElementById('sender-name');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
        }, 100);
      } else if (validation.errors.faculty) {
        setTimeout(() => {
          const el = document.getElementById('faculty-select');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
        }, 100);
      }
      setIsFloatingCeremony(false);
      setHoldProgress(0);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await onSubmit(payload);
      if (result.success) {
        onClose();
      } else {
        setServerError(result.error || 'ไม่สามารถปล่อยกระทงได้ ลองใหม่อีกครั้งนะ');
        setIsFloatingCeremony(false);
        setHoldProgress(0);
      }
    } catch {
      setServerError('ไม่สามารถเชื่อมต่อได้ในขณะนี้');
      setIsFloatingCeremony(false);
      setHoldProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const HOLD_DURATION_MS = 1600;

  const startHolding = (e: React.MouseEvent | React.TouchEvent) => {
    if ('button' in e && e.button !== 0) return;
    if (isSubmitting || cooldownRemaining > 0 || isFloatingCeremony) return;

    // Validate inputs first! If invalid, highlight errors immediately and do not start holding
    const effectivePartyCode = mode !== 'solo' ? (partyCode.trim() || undefined) : undefined;
    const testPayload: KrathongInput = {
      sender_name: senderName.trim(),
      secondary_name: mode === 'couple' ? secondaryName.trim() : undefined,
      mode,
      faculty,
      wish: wish.trim(),
      wish_category: wishCategory,
      base_type: base,
      flower_type: flower,
      candle_type: candle,
      sacred_items: sacredItems,
      party_code: effectivePartyCode,
    };
    const validation = validateKrathongInput(testPayload);
    if (!validation.valid) {
      setErrors(validation.errors);
      // เลื่อนขึ้นไปเตือนตรงช่องที่ยังไม่ได้กรอกทันที (โดยเฉพาะช่องชื่อ)
      if (validation.errors.sender_name) {
        const el = document.getElementById('sender-name');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      } else if (validation.errors.secondary_name) {
        const el = document.getElementById('secondary-name');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      } else if (validation.errors.wish) {
        const el = document.getElementById('wish-textarea');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }
      return;
    }
    setErrors({});

    setIsHolding(true);
    setIsLit(true);
    setShowHoldTip(false);
    sound.playWaterDrop();
    holdStartTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!holdStartTimeRef.current) return;
      const elapsed = now - holdStartTimeRef.current;
      const p = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(p);

      if (p >= 100) {
        handleHoldComplete();
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  const stopHolding = () => {
    if (isFloatingCeremony) return;
    if (isHolding && holdProgress < 100) {
      setShowHoldTip(true);
      setTimeout(() => setShowHoldTip(false), 2500);
    }
    setIsHolding(false);
    holdStartTimeRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setHoldProgress(0);
  };

  const handleHoldComplete = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(100);
    setIsFloatingCeremony(true);
    sound.playTempleBell();
    sound.playWaterDrop();

    // 850ms ceremony transition before resolving submit
    setTimeout(() => {
      submitKrathong();
    }, 850);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || cooldownRemaining > 0 || isFloatingCeremony) return;
    handleHoldComplete();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 font-thai transition-all duration-500 ${
        isHolding || isFloatingCeremony
          ? 'bg-black/35 backdrop-blur-[2px]'
          : 'bg-black/75 backdrop-blur-md'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="customizer-modal-title"
    >
      <div
        className={`bg-slate-900/80 backdrop-blur-2xl border border-white/15 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col h-[88vh] sm:h-[730px] max-h-[92vh] sm:max-h-[760px] text-slate-100 overflow-hidden transition-all duration-700 ${
          isFloatingCeremony
            ? 'opacity-0 scale-90 translate-y-12 pointer-events-none'
            : 'opacity-100 scale-100'
        }`}
      >
        {/* ========================================================
            TOP PREVIEW AREA: กระทงลอยบนผิวน้ำแบบเรียลไทม์ (Live Floating)
           ======================================================== */}
        <div className="relative w-full h-[180px] sm:h-[210px] bg-gradient-to-b from-[#050b17]/90 via-[#0a152e]/80 to-[#0e2142]/70 flex items-center justify-center overflow-hidden border-b border-white/10 flex-shrink-0">
          {/* Subtle Water Shimmer Background */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-sky-500/5 to-transparent pointer-events-none" />

          {/* Close Button Top-Right */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white backdrop-blur-md border border-white/15 transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Floating Krathong SVG */}
          <div className="relative z-10 flex items-center justify-center pt-2">
            <div
              className={`transition-all duration-300 ${
                isHolding
                  ? 'animate-krathongWiggle scale-110 drop-shadow-[0_0_25px_rgba(251,191,36,0.85)]'
                  : ''
              }`}
            >
              <KrathongSVG
                base={base}
                flower={flower}
                candle={candle}
                sacredItems={sacredItems}
                isLit={isLit || isHolding}
                onLightToggle={handleLightCandle}
                interactive={true}
                size={185}
                showWaterRipples={true}
              />
            </div>
          </div>

          {/* Flame Status Pill or Active Prayer Status (จุดเทียนสว่างไสวอัตโนมัติ) */}
          {isHolding ? (
            <div className="absolute bottom-2.5 z-20 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-400/25 text-amber-200 border border-amber-300/60 shadow-lg shadow-amber-400/30 flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>เทียนสว่างไสว • กำลังตั้งจิตอธิษฐาน... ✨</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLightCandle}
              className={`absolute bottom-2.5 z-20 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                isLit
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/50 shadow-amber-400/20'
                  : 'bg-black/40 text-slate-300 border border-white/15 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${isLit ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span>{isLit ? 'เทียนส่องสว่างนำทางแล้ว ✨' : 'แตะเพื่อจุดไฟใหม่'}</span>
            </button>
          )}
        </div>

        {/* ========================================================
            STEPPER NAVIGATION BAR: 3 ขั้นตอน สไตล์ Gen-Z เรียบหรู
           ======================================================== */}
        <div className="px-4 sm:px-6 py-2.5 bg-white/[0.02] border-b border-white/10 flex-shrink-0">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 1 as const, num: '1', label: 'เลือกฐาน' },
              { id: 2 as const, num: '2', label: 'ตกแต่ง' },
              { id: 3 as const, num: '3', label: 'อธิษฐาน & ลอย' },
            ].map((s) => {
              const isActive = step === s.id;
              const isPast = step > s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`h-11 px-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-amber-400/90 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/15'
                      : isPast
                      ? 'bg-white/[0.08] text-amber-300 border border-white/10 hover:bg-white/[0.12]'
                      : 'bg-white/[0.04] text-slate-400 border border-white/10 hover:bg-white/[0.08] hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isActive
                        ? 'bg-slate-950 text-amber-400'
                        : isPast
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                  </span>
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            DRAWER BODY: 3 ขั้นตอนแบบคลีน มินิมอล
           ======================================================== */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {/* --------------------------------------------------------
              STEP 1: เลือกตัวกระทง (ฐานประจำคณะ & รักษ์โลก)
             -------------------------------------------------------- */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn flex flex-col min-h-full justify-between">
              <div className="space-y-4">
                <div>
                  <h3 id="customizer-modal-title" className="text-base sm:text-lg font-bold text-white">
                    เลือกฐานกระทง
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    ฐานที่ของแต่งทุกชิ้นจะวางอยู่ — ไฮไลท์ประจำคณะ มทร.กรุงเทพ หรือฐานธรรมชาติ
                  </p>
                </div>

                {/* Sub-Category Filter Pills */}
                <div className="flex gap-2 border-b border-white/10 pb-2.5">
                  <button
                    type="button"
                    onClick={() => setBaseCategory('faculty')}
                    className={`h-9 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      baseCategory === 'faculty'
                        ? 'bg-amber-400/18 border border-amber-400/60 text-amber-200'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>ฐานประจำคณะ (มทร.กรุงเทพ)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBaseCategory('eco')}
                    className={`h-9 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      baseCategory === 'eco'
                        ? 'bg-amber-400/18 border border-amber-400/60 text-amber-200'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>ฐานธรรมชาติ รักษ์โลก</span>
                  </button>
                </div>

                {/* Bases Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(baseCategory === 'faculty'
                    ? [
                        BASES['gear-base'],
                        BASES['dictionary-base'],
                        BASES['science-atom-base'],
                        BASES['teacher-chalkboard-base'],
                        BASES['stock-graph-base'],
                        BASES['gourmet-food-base'],
                        BASES['thai-fabric-base'],
                        BASES['inter-globe-base'],
                      ]
                    : [
                        BASES['banana-leaf'],
                        BASES['bread'],
                        BASES['coconut'],
                        BASES['lotus-base'],
                      ]
                  ).map((item) => {
                    const isSelected = base === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectBase(item.id)}
                        className={`relative p-3.5 rounded-2xl transition-all border flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer min-h-[108px] group ${
                          isSelected
                            ? 'bg-amber-400/15 border-2 border-amber-400 ring-2 ring-amber-400/20 text-white shadow-[0_0_18px_rgba(251,191,36,0.15)]'
                            : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                        <div className="transform group-hover:scale-105 transition-transform">
                          <BaseMiniIcon baseId={item.id} />
                        </div>
                        <div className="w-full">
                          <div className="text-xs sm:text-sm font-semibold truncate leading-tight">
                            {item.name}
                          </div>
                          <div className="text-[10px] sm:text-xs text-amber-300 font-medium truncate mt-0.5">
                            {item.badge}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sticky Action for Step 1 */}
              <div className="pt-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full h-11 sm:h-12 rounded-full font-bold text-sm bg-gradient-to-r from-amber-400/90 via-amber-300/95 to-amber-500/90 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ถัดไป: ไปตกแต่งกระทง</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------
              STEP 2: ตกแต่งกระทง (ดอกไม้ ธูปเทียน สะเดาะเคราะห์)
             -------------------------------------------------------- */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn flex flex-col min-h-full justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    ตกแต่งกระทง
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    เลือกดอกไม้ ธูปเทียน และสิ่งมงคลสะเดาะเคราะห์เพื่อใส่ลงกระทง
                  </p>
                </div>

              {/* Sub-Category Filter Pills */}
              <div className="flex gap-2 border-b border-white/10 pb-2.5">
                {[
                  { id: 'flower' as const, label: 'ดอกไม้บูชา' },
                  { id: 'candle' as const, label: 'ธูปเทียน' },
                  { id: 'sacred' as const, label: 'สะเดาะเคราะห์ & ทานบารมี' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDecorCategory(tab.id)}
                    className={`h-9 px-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      decorCategory === tab.id
                        ? 'bg-amber-400/18 border border-amber-400/60 text-amber-200'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Sub-Tab 1: Flowers */}
              {decorCategory === 'flower' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fadeIn">
                  {(Object.keys(FLOWERS) as FlowerType[]).map((fKey) => {
                    const item = FLOWERS[fKey];
                    const isSelected = flower === fKey;
                    return (
                      <button
                        key={fKey}
                        type="button"
                        onClick={() => setFlower(fKey)}
                        className={`relative p-3.5 rounded-2xl transition-all border flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer min-h-[108px] group ${
                          isSelected
                            ? 'bg-amber-400/15 border-2 border-amber-400 ring-2 ring-amber-400/20 text-white shadow-[0_0_18px_rgba(251,191,36,0.15)]'
                            : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                        <div className="transform group-hover:scale-105 transition-transform">
                          <FlowerMiniIcon flowerId={fKey} />
                        </div>
                        <div className="w-full">
                          <div className="text-xs sm:text-sm font-semibold truncate leading-tight">
                            {item.name}
                          </div>
                          <div className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
                            {item.meaning}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sub-Tab 2: Candles */}
              {decorCategory === 'candle' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-fadeIn">
                  {(Object.keys(CANDLES) as CandleSet[]).map((cKey) => {
                    const item = CANDLES[cKey];
                    const isSelected = candle === cKey;
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => setCandle(cKey)}
                        className={`relative p-3.5 rounded-2xl transition-all border flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer min-h-[108px] group ${
                          isSelected
                            ? 'bg-amber-400/15 border-2 border-amber-400 ring-2 ring-amber-400/20 text-white shadow-[0_0_18px_rgba(251,191,36,0.15)]'
                            : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                        <div className="transform group-hover:scale-105 transition-transform">
                          <CandleMiniIcon candleId={cKey} />
                        </div>
                        <div className="w-full">
                          <div className="text-xs sm:text-sm font-semibold truncate leading-tight">
                            {item.name}
                          </div>
                          <div className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
                            {item.meaning}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sub-Tab 3: Sacred Items */}
              {decorCategory === 'sacred' && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>แตะเพื่อเลือกใส่ในกระทง (เลือกได้หลายอย่าง):</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'coin' as SacredItem, name: 'เหรียญ 9 บาท', desc: 'ทานบารมี มั่งคั่ง' },
                      { id: 'nail' as SacredItem, name: 'ตัดเล็บ', desc: 'ตัดเคราะห์ โรคภัย' },
                      { id: 'hair' as SacredItem, name: 'ตัดผม', desc: 'ลอยความทุกข์โศก' },
                    ].map((item) => {
                      const isSelected = sacredItems.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleSacredItem(item.id)}
                          className={`relative p-3.5 rounded-2xl transition-all border flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer min-h-[108px] group ${
                            isSelected
                              ? 'bg-amber-400/15 border-2 border-amber-400 ring-2 ring-amber-400/20 text-white shadow-[0_0_18px_rgba(251,191,36,0.15)]'
                              : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-slate-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          <div className="transform group-hover:scale-105 transition-transform">
                            <SacredMiniIcon itemId={item.id} />
                          </div>
                          <div className="w-full">
                            <div className="text-xs sm:text-sm font-semibold truncate leading-tight">
                              {item.name}
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              </div>

              {/* Bottom Sticky Actions for Step 2 */}
              <div className="pt-3 mt-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 sm:h-12 px-5 rounded-full font-semibold text-xs sm:text-sm bg-white/8 hover:bg-white/15 border border-white/12 text-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ย้อนกลับ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsLit(true);
                    setStep(3);
                  }}
                  className="flex-1 h-11 sm:h-12 rounded-full font-bold text-sm bg-gradient-to-r from-amber-400/90 via-amber-300/95 to-amber-500/90 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-200/50 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ถัดไป: เขียนคำอธิษฐาน</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------
              STEP 3: คำอธิษฐาน & ผู้ลอย (เขียนคำขอ & ปล่อยกระทง)
             -------------------------------------------------------- */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn flex flex-col min-h-full justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {initialPartyCode ? `ร่วมก๊วนกระทง: ${initialPartyCode}` : 'คำอธิษฐาน & ผู้ลอย'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    {initialPartyCode
                      ? 'เพื่อนชวนคุณมาร่วมลอยกระทงเคียงข้างกันในสระ มทร.กรุงเทพ'
                      : 'ระบุชื่อ คณะ และความในใจก่อนส่งกระทงลงสู่สายน้ำ มทร.กรุงเทพ'}
                  </p>
                </div>

              {/* 1. Floating Mode Tabs (ถามว่าลอยคนเดียว หรือชวนใครมาลอยด้วย) */}
              {!initialPartyCode && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                    สไตล์การลอย
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'solo' as const, label: 'ลอยคนเดียว', icon: User },
                      { id: 'couple' as const, label: 'ลอยกับแฟน', icon: Heart },
                      { id: 'group' as const, label: 'ชวนเพื่อนลอย', icon: Users },
                    ].map((item) => {
                      const isSelected = mode === item.id;
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleModeChange(item.id)}
                          className={`h-11 px-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400/90 text-slate-950 font-bold shadow-md shadow-amber-500/15'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Squad Share Card (เฉพาะเมื่อเลือกชวนเพื่อนกลุ่ม) */}
              {mode === 'group' && (
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ชวนเพื่อนลอย</span>
                    </span>
                    <span className="text-[11px] text-cyan-300/80">กระทงจะลงไปลอยเคียงข้างกันในสระ</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-cyan-400/20">
                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const origin = typeof window !== 'undefined' ? window.location.origin : '';
                        const link = `${origin}?party=${encodeURIComponent(partyCode)}`;
                        navigator.clipboard.writeText(link);
                        setIsCopiedPartyLink(true);
                        setTimeout(() => setIsCopiedPartyLink(false), 2500);
                      }}
                      className="h-10 px-3 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      {isCopiedPartyLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>คัดลอกลิงก์ชวน</span>
                        </>
                      )}
                    </button>

                    {/* Story Image Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenStoryModal?.(
                          partyCode,
                          base,
                          flower,
                          candle,
                          sacredItems,
                          senderName.trim() || 'เพื่อน มทร.'
                        );
                      }}
                      className="h-10 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                      <span>รูปชวนลงสตอรี่</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Sender Name Inputs */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="sender-name" className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1">
                      <span>{mode === 'group' ? 'ชื่อของคุณ (ในก๊วนเพื่อน)' : 'ชื่อของคุณ'}</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                        errors.sender_name
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                          : 'bg-amber-400/15 text-amber-300 border-amber-300/30'
                      }`}
                    >
                      จำเป็นต้องระบุชื่อ
                    </span>
                  </div>
                  <input
                    id="sender-name"
                    type="text"
                    maxLength={50}
                    value={senderName}
                    onChange={(e) => {
                      setSenderName(e.target.value);
                      if (errors.sender_name && e.target.value.trim()) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.sender_name;
                          return next;
                        });
                      }
                    }}
                    placeholder="ระบุชื่อหรือชื่อเล่น เช่น โอม, มินนี่"
                    className={`w-full h-11 bg-white/[0.04] rounded-2xl px-4 text-xs sm:text-sm text-white focus:outline-none transition-all placeholder-slate-400 ${
                      errors.sender_name
                        ? 'border-2 border-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.35)] ring-2 ring-rose-500/40 bg-rose-500/10'
                        : 'border border-white/15 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50'
                    }`}
                  />
                  {errors.sender_name && (
                    <div className="mt-1.5 p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5 animate-bounce">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                      <span>{errors.sender_name || 'กรุณากรอกชื่อของคุณตรงนี้ก่อนปล่อยกระทงนะ'}</span>
                    </div>
                  )}
                </div>

                {mode === 'couple' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="secondary-name" className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1">
                        <span>ชื่อคนรู้ใจ</span>
                        <span className="text-rose-400 font-bold">*</span>
                      </label>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          errors.secondary_name
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                            : 'bg-rose-400/15 text-rose-300 border-rose-300/30'
                        }`}
                      >
                        จำเป็นต้องระบุชื่อ
                      </span>
                    </div>
                    <input
                      id="secondary-name"
                      type="text"
                      maxLength={50}
                      value={secondaryName}
                      onChange={(e) => {
                        setSecondaryName(e.target.value);
                        if (errors.secondary_name && e.target.value.trim()) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.secondary_name;
                            return next;
                          });
                        }
                      }}
                      placeholder="ระบุชื่อคนรู้ใจ"
                      className={`w-full h-11 bg-white/[0.04] rounded-2xl px-4 text-xs sm:text-sm text-white focus:outline-none transition-all placeholder-slate-400 ${
                        errors.secondary_name
                          ? 'border-2 border-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.35)] ring-2 ring-rose-500/40 bg-rose-500/10'
                          : 'border border-white/15 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50'
                      }`}
                    />
                    {errors.secondary_name && (
                      <div className="mt-1.5 p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5 animate-bounce">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                        <span>{errors.secondary_name || 'กรุณากรอกชื่อคนรู้ใจตรงนี้ด้วยนะ'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Faculty Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="faculty-select" className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1">
                    <span>คณะของคุณใน มทร.กรุงเทพ</span>
                    <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                      errors.faculty
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                        : faculty
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                        : 'bg-amber-400/15 text-amber-300 border-amber-300/30'
                    }`}
                  >
                    {faculty ? 'เลือกแล้ว' : 'จำเป็นต้องเลือกคณะ'}
                  </span>
                </div>
                <div className="relative">
                  <select
                    id="faculty-select"
                    value={faculty}
                    onChange={(e) => {
                      setFaculty(e.target.value);
                      if (errors.faculty && e.target.value) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.faculty;
                          return next;
                        });
                      }
                    }}
                    className={`w-full h-11 rounded-2xl px-4 pr-10 text-xs sm:text-sm transition-all cursor-pointer appearance-none ${
                      errors.faculty
                        ? 'bg-rose-500/10 border-2 border-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.35)] ring-2 ring-rose-500/40'
                        : !faculty
                        ? 'bg-amber-400/10 border-2 border-amber-400/60 text-amber-200 font-medium'
                        : 'bg-slate-900/90 border border-white/15 text-white focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50'
                    }`}
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">
                      -- กรุณาเลือกคณะของคุณ (แตะเพื่อเลือก) --
                    </option>
                    {FACULTIES.map((fac) => (
                      <option key={fac} value={fac} className="bg-slate-900 text-white py-1.5">
                        {fac}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.faculty && (
                  <div className="mt-1.5 p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5 animate-bounce">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                    <span>{errors.faculty || 'กรุณาเลือกคณะของคุณก่อนปล่อยกระทงนะ'}</span>
                  </div>
                )}
              </div>

              {/* 4. Wish Category Pills */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  หมวดคำขอ
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(GENZ_WISH_PRESETS) as WishCategory[]).map((catKey) => {
                    const cat = GENZ_WISH_PRESETS[catKey];
                    const isSelected = wishCategory === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => handleCategoryChange(catKey)}
                        className={`h-9 px-1 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400/90 text-slate-950 font-bold shadow-sm'
                            : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Gen-Z Wish Selector - Minimal Clean Dropdown */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">คำขอยอดฮิตประจำหมวด ({GENZ_WISH_PRESETS[wishCategory].label}):</span>
                  <span className="text-[11px] text-amber-300/70">แตะเพื่อดึงลงช่องพิมพ์</span>
                </div>
                <div className="relative">
                  <select
                    value={GENZ_WISH_PRESETS[wishCategory].presets.includes(wish) ? wish : ''}
                    onChange={(e) => {
                      if (e.target.value) setWish(e.target.value);
                    }}
                    className="w-full h-10.5 bg-slate-800/90 border border-white/20 hover:border-amber-400/50 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-amber-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">
                      -- แตะเพื่อเลือกคำขอด่วนยอดฮิตในหมวดนี้ --
                    </option>
                    {GENZ_WISH_PRESETS[wishCategory].presets.map((preset, idx) => (
                      <option key={idx} value={preset} className="bg-slate-900 text-white py-1.5">
                        {preset}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Wish Textarea - Prominent & Clearly Editable */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="wish-input" className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <PenLine className="w-3.5 h-3.5 text-amber-400" />
                    <span>เขียนคำอธิษฐานของคุณ (แตะพิมพ์ที่นี่ได้เลย)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-xs text-amber-300/80 font-semibold">{wish.length}/140</span>
                </div>
                <textarea
                  id="wish-input"
                  rows={3}
                  maxLength={140}
                  value={wish}
                  onChange={(e) => setWish(e.target.value)}
                  placeholder="แตะที่นี่เพื่อพิมพ์คำขอของคุณ เช่น ขอให้สอบผ่านฉลุย เกรด 4.00, มีแฟนน่ารัก..."
                  className="w-full p-3.5 rounded-2xl bg-slate-800/95 border-2 border-amber-400/60 hover:border-amber-400 focus:border-amber-400 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-400/25 resize-none font-thai shadow-[0_0_18px_rgba(251,191,36,0.15)] font-medium leading-relaxed"
                />
                {errors.wish && <p className="text-xs text-rose-400 mt-1">{errors.wish}</p>}
                <p className="text-[11px] text-slate-400">
                  คำอธิษฐานจะถูกสลักและลอยไปพร้อมกระทงในสระน้ำ มทร.กรุงเทพ แบบเรียลไทม์
                </p>
              </div>

                {/* Server Error Message */}
                {serverError && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}
              </div>

              {/* Hold to Pray Gentle Tip on Tap */}
              {showHoldTip && (
                <div className="text-center animate-bounce pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-400/20 border border-amber-400/40 px-3 py-1 rounded-full font-medium shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>แตะค้างปุ่มวงกลมไว้ให้เต็มวง เพื่อตั้งจิตอธิษฐานนะ ✨</span>
                  </span>
                </div>
              )}

              {/* Bottom Sticky Action Buttons */}
              <div className="pt-3 mt-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isHolding || isFloatingCeremony}
                  className="h-14 sm:h-16 px-4 sm:px-5 rounded-2xl sm:rounded-3xl font-semibold text-xs sm:text-sm bg-white/8 hover:bg-white/15 border border-white/12 text-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap flex-shrink-0 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ย้อนกลับ</span>
                </button>

                {/* Main Hold-to-Pray & Float Button (ปุ่มวงกลมกดค้างอธิษฐาน) */}
                <div
                  role="button"
                  tabIndex={0}
                  onMouseDown={startHolding}
                  onMouseUp={stopHolding}
                  onMouseLeave={stopHolding}
                  onTouchStart={startHolding}
                  onTouchEnd={stopHolding}
                  onTouchCancel={stopHolding}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`flex-1 h-14 sm:h-16 px-3.5 sm:px-4 rounded-2xl sm:rounded-3xl relative overflow-hidden select-none transition-all cursor-pointer border-2 flex items-center gap-3 ${
                    cooldownRemaining > 0 || isSubmitting
                      ? 'opacity-60 pointer-events-none border-white/10 bg-white/5'
                      : isHolding
                      ? 'border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.5)] scale-[0.99] bg-slate-900/95'
                      : 'border-amber-400/50 hover:border-amber-300 shadow-lg shadow-amber-500/15 bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15'
                  }`}
                >
                  {/* Background Progress Fill Sweep */}
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500/35 via-amber-400/50 to-amber-300/40 pointer-events-none transition-all duration-75 ease-linear"
                    style={{ width: `${holdProgress}%` }}
                  />

                  {/* Circular Progress Ring */}
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center z-10">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 44 44">
                      {/* Background Track Circle */}
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        stroke="currentColor"
                        strokeWidth="3.2"
                        fill="none"
                        className="text-white/15"
                      />
                      {/* Animated Golden Progress Arc */}
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        stroke="url(#holdGoldGrad)"
                        strokeWidth="3.8"
                        strokeDasharray="113.1"
                        strokeDashoffset={113.1 - (holdProgress / 100) * 113.1}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-75 ease-linear"
                      />
                      <defs>
                        <linearGradient id="holdGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FEF08A" />
                          <stop offset="50%" stopColor="#FBBF24" />
                          <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {holdProgress >= 100 ? (
                        <Check className="w-5 h-5 text-amber-300 stroke-[3] animate-bounce" />
                      ) : isHolding ? (
                        <span className="text-[10px] font-black text-amber-200">
                          {Math.round(holdProgress)}%
                        </span>
                      ) : (
                        <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
                      )}
                    </div>
                  </div>

                  {/* Button Text Details */}
                  <div className="flex-1 min-w-0 z-10 text-left">
                    <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 leading-tight truncate">
                      {isSubmitting ? (
                        <span>กำลังส่งคำขอลงสู่สายน้ำ...</span>
                      ) : isFloatingCeremony || holdProgress >= 100 ? (
                        <span className="text-amber-200 flex items-center gap-1">
                          <span>อธิษฐานสำเร็จ! กำลังลอยสู่สระ...</span>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                        </span>
                      ) : isHolding ? (
                        <span className="text-amber-200">
                          กำลังตั้งจิตอธิษฐาน... ({Math.round(holdProgress)}%)
                        </span>
                      ) : cooldownRemaining > 0 ? (
                        <span>รออีก {cooldownRemaining} วินาที</span>
                      ) : initialPartyCode ? (
                        <span>กดค้างเพื่ออธิษฐาน & เข้าก๊วนเพื่อน</span>
                      ) : mode !== 'solo' ? (
                        <span>กดค้างเพื่ออธิษฐาน & ชวนเพื่อน</span>
                      ) : (
                        <span>กดค้างเพื่อตั้งจิตอธิษฐาน & ลอย</span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-300/85 truncate mt-0.5">
                      {isHolding
                        ? 'อย่าเพิ่งปล่อยมือนะ กำลังส่งพลังใจ... ✨'
                        : isFloatingCeremony
                        ? 'ขอให้คำอธิษฐานสมปรารถนาทุกประการ'
                        : 'แตะค้างปุ่มวงกลมไว้สักครู่เพื่อปล่อยกระทงลงน้ำ'}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ========================================================
          IMMERSIVE FLOATING CEREMONY OVERLAY ("เหมือนลอยจริงๆ")
          กระทงดุกดิกแล้วลอยลงสู่ผิวน้ำ พร้อมพื้นหลังสระน้ำ มทร.กรุงเทพ
         ======================================================== */}
      {isFloatingCeremony && (
        <div className="fixed inset-0 z-[60] pointer-events-none flex flex-col items-center justify-center animate-fadeIn">
          {/* Ambient Moonlight Halo */}
          <div className="absolute w-[450px] h-[450px] rounded-full bg-amber-400/20 blur-3xl pointer-events-none animate-pulse" />

          {/* Floating Krathong drifting into water */}
          <div className="relative flex flex-col items-center animate-floatInWater scale-115 sm:scale-130">
            {/* Expanding Water Ripple Rings on River Surface */}
            <div className="absolute -bottom-4 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-24 rounded-full border-2 border-amber-300/80 animate-waterExpandPulse" />
              <div className="absolute w-36 h-18 rounded-full border border-amber-400/60 animate-waterTouchRipple" />
              <div className="absolute w-20 h-10 bg-amber-400/30 rounded-full blur-md" />
            </div>

            <div className="animate-krathongWiggle drop-shadow-[0_0_35px_rgba(251,191,36,0.9)]">
              <KrathongSVG
                base={base}
                flower={flower}
                candle={candle}
                sacredItems={sacredItems}
                isLit={true}
                interactive={false}
                size={200}
                showWaterRipples={false}
              />
            </div>
          </div>

          {/* Ceremony Sacred Text Banner */}
          <div className="mt-8 px-6 py-2.5 rounded-full bg-slate-900/90 backdrop-blur-xl border border-amber-300/50 text-amber-200 text-sm sm:text-base font-bold shadow-2xl animate-bounce flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>คำอธิษฐานส่งถึงพระแม่แล้ว... กำลังลอยสู่สายน้ำ ✨</span>
          </div>
        </div>
      )}
    </div>
  );
};
