'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Krathong, PondStats, WishCategory } from '@/types';
import { WISH_CATEGORIES } from '@/data/wishes';
import { getMyKrathongIds } from '@/lib/storage';
import { calculatePondStats } from '@/lib/api';
import { X, Search, BarChart3, User, Sparkles, Heart, ChevronDown } from 'lucide-react';

interface SearchStatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  krathongs: Krathong[];
  onSelectKrathong: (krathong: Krathong) => void;
  initialTab?: 'search' | 'stats' | 'my-krathongs';
}

export const SearchStatsDrawer: React.FC<SearchStatsDrawerProps> = ({
  isOpen,
  onClose,
  krathongs,
  onSelectKrathong,
  initialTab = 'search',
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'stats' | 'my-krathongs'>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<WishCategory | 'all'>('all');
  const [visibleLimit, setVisibleLimit] = useState<number>(25);

  useEffect(() => {
    setActiveTab(initialTab);
    setVisibleLimit(25);
  }, [initialTab, isOpen]);

  // Debounce search query 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
      setVisibleLimit(25);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pond Statistics
  const stats: PondStats = useMemo(() => {
    return calculatePondStats(krathongs);
  }, [krathongs]);

  // Filtered search results across entire database
  const searchResults = useMemo(() => {
    let list = krathongs;

    if (filterCategory !== 'all') {
      list = list.filter((k) => k.wish_category === filterCategory);
    }

    if (!debouncedQuery) return list;

    return list.filter((k) => {
      const matchName = k.sender_name.toLowerCase().includes(debouncedQuery);
      const matchSecondary = k.secondary_name ? k.secondary_name.toLowerCase().includes(debouncedQuery) : false;
      const matchFaculty = k.faculty.toLowerCase().includes(debouncedQuery);
      const matchWish = k.wish.toLowerCase().includes(debouncedQuery);
      const matchParty = k.party_code ? k.party_code.toLowerCase().includes(debouncedQuery) : false;
      return matchName || matchSecondary || matchFaculty || matchWish || matchParty;
    });
  }, [krathongs, debouncedQuery, filterCategory]);

  // Displayed slice for high performance & silky smooth 60fps scrolling
  const displayedResults = useMemo(() => {
    return searchResults.slice(0, visibleLimit);
  }, [searchResults, visibleLimit]);

  // My Krathongs
  const myKrathongs = useMemo(() => {
    const myIds = getMyKrathongIds();
    return krathongs.filter((k) => myIds.includes(k.id));
  }, [krathongs]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl border-l border-white/15 h-full shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col text-slate-100 animate-slideLeft">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <h3 id="drawer-title" className="text-sm sm:text-base font-bold text-white">
              ค้นหา & สถิติกระทง
            </h3>
            <span className="text-[11px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              {krathongs.length} ใบในระบบ
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่างสืบค้น"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.02] text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`h-10 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'search'
                ? 'border-amber-400 text-amber-200 bg-white/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>ค้นหา ({searchResults.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-krathongs')}
            className={`h-10 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'my-krathongs'
                ? 'border-amber-400 text-amber-200 bg-white/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ของฉัน ({myKrathongs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`h-10 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'border-amber-400 text-amber-200 bg-white/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>สถิติ</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              {/* Search Bar Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อผู้ลอย, คณะ, คำอธิษฐาน..."
                  className="w-full bg-white/[0.04] border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              {/* Minimal Gen-Z Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'all' as const, label: 'ทั้งหมด' },
                  { id: 'study' as const, label: 'เรื่องเรียน' },
                  { id: 'career' as const, label: 'การงาน' },
                  { id: 'love' as const, label: 'ความรัก' },
                  { id: 'health' as const, label: 'ปล่อยจอย' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setFilterCategory(chip.id);
                      setVisibleLimit(25);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      filterCategory === chip.id
                        ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 font-semibold'
                        : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/5'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Results Count Info */}
              <div className="text-[11px] text-slate-400 flex justify-between items-center px-1">
                <span>
                  แสดง {displayedResults.length} จาก {searchResults.length} รายการ
                </span>
                {debouncedQuery && <span>ค้นหา: &quot;{debouncedQuery}&quot;</span>}
              </div>

              {/* List of Krathongs: Compact, Sleek Gen-Z Cards */}
              <div className="space-y-2">
                {searchResults.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    ไม่พบกระทงที่ตรงกับคำค้นหา
                  </div>
                ) : (
                  displayedResults.map((k) => (
                    <div
                      key={k.id}
                      onClick={() => onSelectKrathong(k)}
                      className="w-full text-left p-2.5 sm:px-3 sm:py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-400/35 hover:bg-white/[0.06] transition-all flex flex-col gap-1.5 cursor-pointer relative group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-amber-200 text-xs sm:text-sm truncate max-w-[65%]">
                          {k.mode === 'couple' && k.secondary_name
                            ? `${k.sender_name} & ${k.secondary_name}`
                            : k.sender_name}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {k.party_code && (
                            <span className="text-[10px] text-cyan-200 bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-400/30">
                              {k.party_code}
                            </span>
                          )}
                          <span className="text-[10px] sm:text-[11px] bg-white/5 px-2 py-0.5 rounded text-slate-300 truncate max-w-[130px]">
                            {k.faculty}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200/90 line-clamp-2 leading-snug break-words [overflow-wrap:anywhere] break-all">
                        {k.wish}
                      </p>

                      <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 pt-1 border-t border-white/5">
                        <span className="text-amber-200/70 font-medium">
                          {WISH_CATEGORIES[k.wish_category]?.name}
                        </span>
                        <span className="flex items-center gap-1 text-rose-300">
                          <Heart className="w-3 h-3 fill-rose-400/80" />
                          <span>{k.bless_count || 0}</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Load More Button for Silky Smooth Browsing */}
              {searchResults.length > visibleLimit && (
                <div className="pt-2 pb-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleLimit((prev) => prev + 25)}
                    className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/15 text-xs text-amber-200 font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      ดูเพิ่มเติม (+25 ใบ) • เหลืออีก {searchResults.length - visibleLimit} ใบ
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY KRATHONGS */}
          {activeTab === 'my-krathongs' && (
            <div className="space-y-3">
              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10 text-xs text-slate-300 leading-relaxed">
                กระทงที่คุณประกอบและลอยสู่สระน้ำ มทร.กรุงเทพ ในบราวเซอร์เครื่องนี้
              </div>

              {myKrathongs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <p className="text-xs sm:text-sm">คุณยังไม่ได้ลอยกระทงในค่ำคืนนี้</p>
                  <p className="text-[11px] text-slate-500">
                    กดปุ่ม &quot;ปล่อยกระทง&quot; ที่หน้าหลักเพื่อร่วมประเพณีลอยกระทง
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myKrathongs.map((k) => (
                    <div
                      key={k.id}
                      onClick={() => onSelectKrathong(k)}
                      className="w-full text-left p-2.5 sm:px-3 sm:py-2.5 rounded-xl bg-white/[0.04] border border-amber-400/35 hover:border-amber-400/60 hover:bg-white/[0.08] transition-all flex flex-col gap-1.5 cursor-pointer"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-semibold text-amber-200 text-xs sm:text-sm truncate">
                          {k.mode === 'couple' && k.secondary_name
                            ? `${k.sender_name} & ${k.secondary_name}`
                            : k.sender_name}
                        </span>
                        <span className="text-[10px] sm:text-xs text-emerald-300 flex items-center gap-1 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-400/30 flex-shrink-0">
                          <Sparkles className="w-3 h-3" />
                          <span>กระทงของคุณ</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-200/90 line-clamp-2 leading-snug break-words [overflow-wrap:anywhere] break-all">
                        {k.wish}
                      </p>
                      <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 pt-1 border-t border-white/5">
                        <span>{k.faculty}</span>
                        <span className="text-rose-300 flex items-center gap-1 font-medium bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-400/20">
                          <Heart className="w-3 h-3 fill-rose-400" />
                          <span>{k.bless_count || 0} คนร่วมอธิษฐาน</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STATISTICS (MINIMALIST GEN-Z FROSTED DASHBOARD) */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-gradient-to-br from-amber-500/15 via-white/[0.04] to-transparent border border-amber-400/25 p-3.5 rounded-2xl text-center backdrop-blur-md shadow-lg shadow-amber-500/5">
                  <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider block mb-0.5">
                    กระทงในสระทั้งหมด
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-thai">
                      {stats.totalKrathongs}
                    </span>
                    <span className="text-xs text-amber-200/80">ใบ</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-rose-500/15 via-white/[0.04] to-transparent border border-rose-400/25 p-3.5 rounded-2xl text-center backdrop-blur-md shadow-lg shadow-rose-500/5">
                  <span className="text-[10px] text-rose-300 font-semibold uppercase tracking-wider block mb-0.5">
                    ยอดให้ใจทั้งหมด
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-thai">
                      {stats.totalBlessings}
                    </span>
                    <span className="text-xs text-rose-200/80">ครั้ง</span>
                  </div>
                </div>
              </div>

              {/* Wish Category Breakdown */}
              <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl space-y-3 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    สัดส่วนคำอธิษฐานยอดฮิต
                  </h4>
                  <span className="text-[10px] text-slate-400">Gen-Z Vibes</span>
                </div>
                <div className="space-y-2.5">
                  {stats.categoryDistribution.map((item) => {
                    const catInfo = WISH_CATEGORIES[item.category];
                    const percent =
                      stats.totalKrathongs > 0
                        ? Math.round((item.count / stats.totalKrathongs) * 100)
                        : 0;

                    const barGrad =
                      item.category === 'study'
                        ? 'from-amber-400 via-amber-300 to-amber-400'
                        : item.category === 'career'
                        ? 'from-emerald-400 to-teal-300'
                        : item.category === 'love'
                        ? 'from-rose-400 to-pink-300'
                        : 'from-cyan-400 to-sky-300';

                    return (
                      <div key={item.category} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-200 font-medium">{catInfo?.name}</span>
                          <span className="text-slate-400 text-[11px]">
                            {item.count} ใบ ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full bg-gradient-to-r ${barGrad} rounded-full transition-all duration-700`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Faculty Breakdown */}
              <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl space-y-3 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    อันดับการมีส่วนร่วมตามคณะ
                  </h4>
                  <span className="text-[10px] text-slate-400">เด็ก มทร.กรุงเทพ</span>
                </div>
                <div className="space-y-2">
                  {stats.facultyDistribution.slice(0, 8).map((item, index) => {
                    const percent =
                      stats.totalKrathongs > 0
                        ? Math.round((item.count / stats.totalKrathongs) * 100)
                        : 0;

                    const rankBadge =
                      index === 0
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : index === 1
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                        : index === 2
                        ? 'bg-amber-700/20 text-amber-400 border border-amber-600/40'
                        : 'bg-white/5 text-slate-400 border border-white/5';

                    return (
                      <div key={item.faculty} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2 truncate max-w-[240px]">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${rankBadge}`}>
                              {index + 1}
                            </span>
                            <span className="text-slate-200 truncate">{item.faculty}</span>
                          </div>
                          <span className="text-slate-400 font-medium text-[11px]">{item.count} ใบ</span>
                        </div>
                        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden ml-6 max-w-[calc(100%-24px)]">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};