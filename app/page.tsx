'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Krathong,
  WishCategory,
  TimeOfDay,
  KrathongInput,
  KrathongBase,
  FlowerType,
  CandleSet,
  SacredItem,
} from '@/types';
import {
  fetchLatestKrathongs,
  fetchKrathongById,
  createKrathong,
  blessKrathong,
  mapRowToKrathong,
} from '@/lib/api';
import { supabase, isDemoMode } from '@/lib/supabase';
import {
  getFontSizePreference,
  saveFontSizePreference,
  getMyKrathongIds,
} from '@/lib/storage';
import { sound } from '@/lib/sound';
import { relaxKrathongPositions } from '@/lib/krathongLayout';

// Components
import { PondScene } from '@/components/PondScene/PondScene';
import { KrathongFloatingItem } from '@/components/Krathong/KrathongFloatingItem';
import { KrathongCustomizer } from '@/components/Customizer/KrathongCustomizer';
import { KrathongDetailModal } from '@/components/Modals/KrathongDetailModal';
import { FortuneModal } from '@/components/Modals/FortuneModal';
import { SearchStatsDrawer } from '@/components/Modals/SearchStatsDrawer';
import { WishCardModal } from '@/components/Modals/WishCardModal';
import { InviteFriendsModal } from '@/components/Modals/InviteFriendsModal';
import { InviteStoryModal } from '@/components/Modals/InviteStoryModal';
import { GroupWaitingModal } from '@/components/Modals/GroupWaitingModal';
import { SkyLanternModal } from '@/components/Modals/SkyLanternModal';
import { KhongkhaBlessingModal } from '@/components/Modals/KhongkhaBlessingModal';
import { TurtlePondModal } from '@/components/Modals/TurtlePondModal';
import { SparklerModal } from '@/components/Modals/SparklerModal';
import { YouTubeBgmPlayer } from '@/components/Audio/YouTubeBgmPlayer';
import { saveTurtleProfile } from '@/lib/turtleStats';

// Icons
import {
  Plus,
  Search,
  Sparkles,
  User,
  BarChart3,
  Bell,
  Users,
  Volume2,
  VolumeX,
  Flame,
  Droplets,
  Image as ImageIcon,
  Coins,
  X,
} from 'lucide-react';
import {
  broadcastPartyLaunch,
  broadcastMemberJoined,
  broadcastSkyLantern,
  subscribeSkyLanterns,
  broadcastBlessUpdate,
  subscribeBlessUpdates,
} from '@/lib/partySync';

function LoyKrathongApp() {
  const searchParams = useSearchParams();

  // Always set to the magical Full Moon Night (คืนวันเพ็ญ) theme
  const timeOfDay: TimeOfDay = 'moonlight';

  // Complete Krathong Database (for Search, My Krathongs, and Stats - NEVER LOSES ITEMS)
  const [allKrathongsDatabase, setAllKrathongsDatabase] = useState<Krathong[]>([]);

  // Active Pond Krathongs (Displayed visually in the water)
  const [pondKrathongs, setPondKrathongs] = useState<Krathong[]>([]);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<WishCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Drawers
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isLanternModalOpen, setIsLanternModalOpen] = useState<boolean>(false);
  const [activePartyCode, setActivePartyCode] = useState<string | undefined>(undefined);
  const [activePartyTime, setActivePartyTime] = useState<string | undefined>(undefined);
  const [isFortuneOpen, setIsFortuneOpen] = useState<boolean>(false);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState<boolean>(false);
  const [searchDrawerInitialTab, setSearchDrawerInitialTab] = useState<'search' | 'stats' | 'my-krathongs'>('search');
  const [selectedKrathong, setSelectedKrathong] = useState<Krathong | null>(null);
  const [focusedKrathongId, setFocusedKrathongId] = useState<string | null>(null);
  const [justLaunchedId, setJustLaunchedId] = useState<string | null>(null);
  const [showLaunchCelebrationDock, setShowLaunchCelebrationDock] = useState<boolean>(false);
  const [newlyCreatedKrathong, setNewlyCreatedKrathong] = useState<Krathong | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [isKhongkhaModalOpen, setIsKhongkhaModalOpen] = useState<boolean>(false);
  const [blessingKrathong, setBlessingKrathong] = useState<Krathong | null>(null);
  const [isTurtleModalOpen, setIsTurtleModalOpen] = useState<boolean>(false);
  const [isSparklerOpen, setIsSparklerOpen] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(true);

  const handleToggleMusic = () => {
    const nextPlaying = !isMusicPlaying;
    setIsMusicPlaying(nextPlaying);
    if (nextPlaying) {
      setNotification('เปิดเสียงเพลง: รำวงวันลอยกระทง (ระนาดเอก • Fino the Ranad)');
      setTimeout(() => setNotification(null), 3000);
    } else {
      setNotification('ปิดเสียงเพลงแล้ว');
      setTimeout(() => setNotification(null), 2500);
    }
  };

  // Group Waiting Room & Story Generator Modals
  const [isGroupWaitingOpen, setIsGroupWaitingOpen] = useState<boolean>(false);
  const [groupWaitingPartyCode, setGroupWaitingPartyCode] = useState<string>('RMUTK-789');
  const [isGroupWaitingHost, setIsGroupWaitingHost] = useState<boolean>(true);

  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [storyParams, setStoryParams] = useState<{
    partyCode: string;
    base: KrathongBase;
    flower: FlowerType;
    candle: CandleSet;
    sacredItems: SacredItem[];
    hostName?: string;
  }>({
    partyCode: 'RMUTK-789',
    base: 'gear-base',
    flower: 'lotus',
    candle: 'traditional',
    sacredItems: ['coin'],
    hostName: 'เด็ก มทร.',
  });

  // Sound Mute State
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Interactive Touch Water Ripples
  const [touchRipples, setTouchRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Released Sky Lanterns
  const [releasedLanterns, setReleasedLanterns] = useState<
    { id: string; sender: string; wish: string; x: number }[]
  >([]);

  // Overcrowding Prevention: Drifting away krathongs set
  const [driftingAwayIds, setDriftingAwayIds] = useState<Set<string>>(new Set());

  // Minimal Toast Notification
  const [notification, setNotification] = useState<string | null>(null);

  // Check URL params for invite party link or fresh start reset
  useEffect(() => {
    // Fresh start reset: ล้างแคชกระทงทดสอบในเครื่องทันทีเมื่อเปิดด้วย ?reset=1
    if (searchParams?.get('reset') === '1' || searchParams?.get('cleardata') === 'true') {
      try {
        localStorage.removeItem('rmutk_loykrathong_custom_items');
        localStorage.removeItem('rmutk_loykrathong_my_ids');
        localStorage.removeItem('rmutk_loykrathong_voted_ids');
        localStorage.removeItem('rmutk_loykrathong_last_submit');
        localStorage.removeItem('rmutk_turtle_coins_real');
        localStorage.removeItem('rmutk_turtle_profile');
        window.location.replace(window.location.pathname);
        return;
      } catch {}
    }

    const partyParam = searchParams?.get('party');
    const timeParam = searchParams?.get('time');
    if (partyParam) {
      setActivePartyCode(partyParam);
      setGroupWaitingPartyCode(partyParam);
      if (timeParam) setActivePartyTime(timeParam);
      setNotification(`เพื่อนชวนคุณมาร่วมก๊วน "${partyParam}" ลอยกระทงด้วยกัน!`);
      setTimeout(() => setNotification(null), 6000);
    }
  }, [searchParams]);

  // Font Size Mode
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  useEffect(() => {
    const pref = getFontSizePreference();
    setFontSize(pref);
    if (pref === 'large') {
      document.documentElement.classList.add('text-mode-large');
    }
  }, []);

  const handleToggleFontSize = () => {
    const nextSize = fontSize === 'normal' ? 'large' : 'normal';
    setFontSize(nextSize);
    saveFontSizePreference(nextSize);
    if (nextSize === 'large') {
      document.documentElement.classList.add('text-mode-large');
    } else {
      document.documentElement.classList.remove('text-mode-large');
    }
  };

  const handleToggleSound = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sound.playSparkle();
    }
  };

  const handleKrathongItemClick = useCallback((item: Krathong) => {
    setSelectedKrathong(item);
  }, []);

  // 1. Fetch Latest Krathongs
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { krathongs: data, isDemo: demoActive } = await fetchLatestKrathongs();

      // Merge into allKrathongsDatabase so no items are ever lost from Search/Stats
      setAllKrathongsDatabase((prev) => {
        const map = new Map<string, Krathong>();
        data.forEach((k) => map.set(k.id, k));
        prev.forEach((k) => {
          if (!map.has(k.id)) map.set(k.id, k);
        });
        return Array.from(map.values());
      });

      // Update pond krathongs smoothly without sudden disappearing
      setPondKrathongs((prev) => {
        if (prev.length === 0) return data;
        const currentIds = new Set(prev.map((k) => k.id));
        const newItems = data.filter((k) => !currentIds.has(k.id));
        return [...newItems, ...prev];
      });

      setIsDemo(demoActive);
    } catch (err) {
      console.warn('Error loading krathongs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Handle ?id=UUID query parameter
  useEffect(() => {
    const idParam = searchParams?.get('id');
    if (!idParam) return;

    const findInState = allKrathongsDatabase.find((k) => k.id === idParam);
    if (findInState) {
      setSelectedKrathong(findInState);
      setFocusedKrathongId(findInState.id);
    } else {
      fetchKrathongById(idParam).then((item) => {
        if (item) {
          setAllKrathongsDatabase((prev) => (prev.some((k) => k.id === item.id) ? prev : [item, ...prev]));
          setPondKrathongs((prev) => (prev.some((k) => k.id === item.id) ? prev : [item, ...prev]));
          setSelectedKrathong(item);
          setFocusedKrathongId(item.id);
        } else {
          setNotification('ไม่พบกระทงที่ค้นหา');
          setTimeout(() => setNotification(null), 3500);
        }
      });
    }
  }, [searchParams, allKrathongsDatabase]);

  // 3. Supabase Realtime Subscription (Rock-solid persistent channel)
  useEffect(() => {
    if (isDemoMode() || !supabase) return;
    const client = supabase;

    const channel = client
      .channel('public:krathongs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'krathongs' },
        (payload) => {
          const newRow = mapRowToKrathong(payload.new as Record<string, unknown>);
          setAllKrathongsDatabase((prev) => [newRow, ...prev.filter((k) => k.id !== newRow.id)]);
          setPondKrathongs((prev) => [newRow, ...prev.filter((k) => k.id !== newRow.id)]);

          setNotification(`${newRow.sender_name} ปล่อยกระทงลงสู่สระแล้ว`);
          setTimeout(() => setNotification(null), 4000);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'krathongs' },
        (payload) => {
          const updatedRow = mapRowToKrathong(payload.new as Record<string, unknown>);
          setAllKrathongsDatabase((prev) =>
            prev.map((k) => (k.id === updatedRow.id ? { ...k, ...updatedRow } : k))
          );
          setPondKrathongs((prev) =>
            prev.map((k) => (k.id === updatedRow.id ? { ...k, ...updatedRow } : k))
          );
          setSelectedKrathong((prev) => (prev && prev.id === updatedRow.id ? { ...prev, ...updatedRow } : prev));
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  // 3.1 Cross-tab Realtime Sync (BroadcastChannel & LocalStorage Event)
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (
        e.key === 'rmutk_party_member_ping' ||
        e.key === 'rmutk_loykrathong_custom_items' ||
        e.key === 'rmutk_party_event_ping' ||
        e.key?.startsWith('rmutk_party_launch_')
      ) {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('rmutk_party_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'MEMBER_JOINED' || event.data?.type === 'PARTY_LAUNCH') {
            loadData();
          }
        };
      } catch {
        bc = null;
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      if (bc) bc.close();
    };
  }, [loadData]);

  // 3.2 Real-time Active Member Polling while GroupWaitingModal is Open (Instant Sync for Host & Joiners)
  useEffect(() => {
    if (!isGroupWaitingOpen) return;

    // Immediately fetch latest members upon opening
    loadData();

    // Fast polling every 1.5s while waiting room is open so newly joined friends appear immediately without manual refresh
    const pollInterval = setInterval(() => {
      loadData();
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [isGroupWaitingOpen, loadData]);

  // 3.3 Real-time Sky Lanterns Sync across all connected users (โคมลอยซิงค์สด ไม่เกะกะ ไม่บั๊ก)
  useEffect(() => {
    const unsubscribe = subscribeSkyLanterns((incomingLantern) => {
      setReleasedLanterns((prev) => {
        // Prevent duplicate lanterns
        if (prev.some((l) => l.id === incomingLantern.id)) return prev;
        // Keep up to 6 concurrent lanterns on screen so the sky remains peaceful and clean
        return [...prev.slice(-5), incomingLantern];
      });

      // Automatically remove when floated out of viewport (12.5s)
      setTimeout(() => {
        setReleasedLanterns((prev) => prev.filter((l) => l.id !== incomingLantern.id));
      }, 12500);
    });

    return () => unsubscribe();
  }, []);

  // 3.4 Real-time Heart / Blessings Sync across all connected users
  useEffect(() => {
    const unsubscribe = subscribeBlessUpdates((update) => {
      setAllKrathongsDatabase((prev) =>
        prev.map((k) => (k.id === update.krathongId ? { ...k, bless_count: update.blessCount } : k))
      );
      setPondKrathongs((prev) =>
        prev.map((k) => (k.id === update.krathongId ? { ...k, bless_count: update.blessCount } : k))
      );
      setSelectedKrathong((prev) =>
        prev && prev.id === update.krathongId ? { ...prev, bless_count: update.blessCount } : prev
      );
    });

    return () => unsubscribe();
  }, []);

  // 4. Handle Create Krathong
  const handleCreateKrathong = async (input: KrathongInput) => {
    const result = await createKrathong(input);
    if (result.success && result.krathong) {
      const created = result.krathong;

      setAllKrathongsDatabase((prev) => [created, ...prev.filter((k) => k.id !== created.id)]);
      setPondKrathongs((prev) => [created, ...prev.filter((k) => k.id !== created.id)]);
      setNewlyCreatedKrathong(created);
      setFocusedKrathongId(created.id);
      setJustLaunchedId(created.id);

      // ซิงค์ชื่อและคณะที่ผู้ใช้เลือกเข้าสู่ระบบโปรไฟล์บ่อเต่าและจุดไฟเย็นอัตโนมัติ
      if (created.faculty) {
        saveTurtleProfile({ faculty: created.faculty, nickname: created.sender_name });
      }

      if (input.mode === 'group') {
        const code = input.party_code || activePartyCode || 'RMUTK-' + Math.floor(100 + Math.random() * 900);
        setActivePartyCode(code);
        setGroupWaitingPartyCode(code);

        // Host tracking: if created the room or has host storage token
        const isFromUrl = Boolean(searchParams?.get('party'));
        let hostStatus = false;
        try {
          if (!isFromUrl || localStorage.getItem('party_host_' + code) === 'true') {
            hostStatus = true;
            localStorage.setItem('party_host_' + code, 'true');
          }
        } catch {
          hostStatus = !isFromUrl;
        }
        setIsGroupWaitingHost(hostStatus);
        setIsGroupWaitingOpen(true);
        setIsCustomizerOpen(false);

        // Broadcast that a new member joined this party!
        broadcastMemberJoined(code, created);
      } else {
        // SOLO or COUPLE: Float directly into pond without blocking modals!
        setIsCustomizerOpen(false);

        // Water ripple at krathong location
        if (typeof window !== 'undefined') {
          const rx = (window.innerWidth * created.pos_x) / 100;
          const ry = (window.innerHeight * created.pos_y) / 100;
          setTouchRipples((prev) => [...prev.slice(-6), { id: Date.now(), x: rx, y: ry }]);
        }

        const msg =
          input.mode === 'couple'
            ? `กระทงคู่ของคุณและ ${created.secondary_name || 'คนรู้ใจ'} ลงไปลอยในสระน้ำแล้ว`
            : 'กระทงของคุณลงไปลอยในสระน้ำ มทร.กรุงเทพ แล้ว';
        setNotification(msg);
        setTimeout(() => setNotification(null), 4500);

        // Auto-clear focus and highlight pulse after 4.5s so the water returns to clean, serene beauty
        setTimeout(() => {
          setJustLaunchedId((current) => (current === created.id ? null : current));
          setFocusedKrathongId((current) => (current === created.id ? null : current));
        }, 4500);
      }
    }
    return result;
  };

  const handleGroupLaunchAll = () => {
    // 1. Broadcast launch signal to all peer tabs/devices immediately!
    broadcastPartyLaunch(groupWaitingPartyCode);

    // 2. Close waiting room modal
    setIsGroupWaitingOpen(false);

    // 3. Highlight newly launched krathong briefly (4.5s) then fade away cleanly
    setFocusedKrathongId(newlyCreatedKrathong?.id || null);
    setJustLaunchedId(newlyCreatedKrathong?.id || 'party-' + groupWaitingPartyCode);

    setTimeout(() => {
      setJustLaunchedId(null);
      setFocusedKrathongId(null);
    }, 4500);

    // 4. Reload krathongs so all members in this party are visible in the pond!
    loadData();

    setNotification(`ก๊วน ${groupWaitingPartyCode} ปล่อยกระทงลงสู่สายน้ำ มทร.กรุงเทพ พร้อมกันแล้ว!`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenStoryModal = (
    code: string,
    base: KrathongBase = 'gear-base',
    flower: FlowerType = 'lotus',
    candle: CandleSet = 'traditional',
    sacredItems: SacredItem[] = ['coin'],
    hostName?: string
  ) => {
    setStoryParams({
      partyCode: code,
      base,
      flower,
      candle,
      sacredItems,
      hostName: hostName || (newlyCreatedKrathong ? newlyCreatedKrathong.sender_name : undefined),
    });
    setIsStoryModalOpen(true);
  };

  // 5. Handle Bless Krathong
  const handleBless = async (id: string) => {
    const res = await blessKrathong(id);
    if (res.success) {
      setAllKrathongsDatabase((prev) =>
        prev.map((k) => (k.id === id ? { ...k, bless_count: res.bless_count } : k))
      );
      setPondKrathongs((prev) =>
        prev.map((k) => (k.id === id ? { ...k, bless_count: res.bless_count } : k))
      );
      if (selectedKrathong && selectedKrathong.id === id) {
        setSelectedKrathong((prev) => (prev ? { ...prev, bless_count: res.bless_count } : null));
      }
      broadcastBlessUpdate(id, res.bless_count);
    }
    return res;
  };

  // 6. Interactive Touch Water Ripple in the Pond
  const handlePondClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickX = e.clientX - rect.left;

    // Trigger ripples when clicking on the pond water area (lower 55% of viewport)
    if (clickY > rect.height * 0.44) {
      sound.playWaterDrop();
      const newRipple = { id: Date.now() + Math.random(), x: clickX, y: clickY };
      setTouchRipples((prev) => [...prev.slice(-6), newRipple]);
      setTimeout(() => {
        setTouchRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 1200);
    }
  };

  // 7. Handle Release Sky Lantern
  const handleReleaseLantern = (wish: string, senderName: string) => {
    const newLantern = {
      id: `lantern-${Date.now()}-${Math.random()}`,
      sender: senderName,
      wish,
      x: 18 + Math.random() * 64, // Random horizontal position 18% - 82%
    };
    setReleasedLanterns((prev) => [...prev.slice(-5), newLantern]);
    broadcastSkyLantern(newLantern);
    setNotification(`โคมลอยคำอธิษฐานของ "${senderName}" ลอยขึ้นสู่ท้องฟ้าแล้ว`);
    setTimeout(() => setNotification(null), 5000);

    // Auto-remove after floating out of screen (12s)
    setTimeout(() => {
      setReleasedLanterns((prev) => prev.filter((l) => l.id !== newLantern.id));
    }, 12500);
  };

  // 8. Handle Open Khongkha Blessing Modal
  const handleOpenKhongkhaBlessing = (k?: Krathong | null) => {
    setBlessingKrathong(k || null);
    setIsKhongkhaModalOpen(true);
  };

  // User's own floated krathongs (from localStorage + newly created in session)
  const myKrathongs = useMemo(() => {
    const myIds = new Set(getMyKrathongIds());
    const list = allKrathongsDatabase.filter((k) => myIds.has(k.id));
    if (newlyCreatedKrathong && !list.some((k) => k.id === newlyCreatedKrathong.id)) {
      list.unshift(newlyCreatedKrathong);
    }
    return list;
  }, [allKrathongsDatabase, newlyCreatedKrathong]);

  // 9. Party Filter & Pond Krathongs
  const [focusPartyOnly, setFocusPartyOnly] = useState<boolean>(false);

  const partyKrathongsCount = useMemo(() => {
    if (!activePartyCode) return 0;
    return allKrathongsDatabase.filter((k) => k.party_code === activePartyCode).length;
  }, [allKrathongsDatabase, activePartyCode]);

  const filteredKrathongs = useMemo(() => {
    let list = pondKrathongs;
    if (activePartyCode && focusPartyOnly) {
      list = list.filter((k) => k.party_code === activePartyCode);
    } else if (selectedCategory !== 'all') {
      list = list.filter((k) => k.wish_category === selectedCategory);
    }
    return list;
  }, [pondKrathongs, selectedCategory, activePartyCode, focusPartyOnly]);

  // Responsive check for mobile vs desktop spacing
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Natural River Flow & Gentle Drift Downstream:
  // Krathongs stay in the water for an extended, relaxing time.
  // Old items drift downstream peacefully with 9s animation, but NEVER get deleted from allKrathongsDatabase (Search & My Krathongs keep everything!)
  useEffect(() => {
    const interval = setInterval(() => {
      const maxAllowed = isMobile ? 22 : 36;
      if (filteredKrathongs.length > maxAllowed) {
        const myIds = new Set(getMyKrathongIds());
        const candidate = [...filteredKrathongs]
          .reverse()
          .find(
            (k) =>
              k.id !== focusedKrathongId &&
              k.id !== newlyCreatedKrathong?.id &&
              !myIds.has(k.id) &&
              (!activePartyCode || k.party_code !== activePartyCode) &&
              !driftingAwayIds.has(k.id)
          );

        if (candidate) {
          setDriftingAwayIds((prev) => {
            const next = new Set(prev);
            next.add(candidate.id);
            return next;
          });
          // Remove from the pond surface only after the 9-second drifting animation completes
          // Note: never deleted from allKrathongsDatabase!
          setTimeout(() => {
            setPondKrathongs((prev) => prev.filter((item) => item.id !== candidate.id));
            setDriftingAwayIds((prev) => {
              const next = new Set(prev);
              next.delete(candidate.id);
              return next;
            });
          }, 9200);
        }
      }
    }, 55000); // Check every 55 seconds to give plenty of time for krathongs to float serenely

    return () => clearInterval(interval);
  }, [filteredKrathongs, isMobile, focusedKrathongId, newlyCreatedKrathong, driftingAwayIds, activePartyCode]);

  // Visible Krathongs with Collision Avoidance & Depth Staggering (Anti-Overlap Physics)
  // รับประกันว่ากระทงของตนเอง และกระทงที่เพิ่งปล่อย หรือกระทงในก๊วนเพื่อน จะต้องปรากฏในสระเสมอ ไม่โดนเบียดหายเด็ดขาด
  const visibleKrathongs = useMemo(() => {
    const limit = isMobile ? 15 : 24;
    const myIds = new Set(getMyKrathongIds());

    // 1. แยกกระทงลำดับความสำคัญสูงสุด (กระทงของฉัน, กระทงที่เพิ่งปล่อย, กระทงที่กำลังโฟกัส, กระทงในปาร์ตี้)
    const priorityItems = filteredKrathongs.filter(
      (k) =>
        k.id === focusedKrathongId ||
        k.id === newlyCreatedKrathong?.id ||
        myIds.has(k.id) ||
        Boolean(activePartyCode && k.party_code === activePartyCode)
    );

    // 2. กระทงของคนอื่นๆ ในสระน้ำ
    const otherItems = filteredKrathongs.filter(
      (k) => !priorityItems.some((p) => p.id === k.id)
    );

    // 3. รวมให้พอดีกับลิมิตผิวน้ำ เพื่อความลื่นไหล 60fps และไม่รกตา
    const slotsRemaining = Math.max(0, limit - priorityItems.length);
    const combined = [...priorityItems, ...otherItems.slice(0, slotsRemaining)];

    return relaxKrathongPositions(combined, isMobile);
  }, [filteredKrathongs, isMobile, focusedKrathongId, newlyCreatedKrathong, activePartyCode]);

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-rmutk-midnight text-rmutk-ivory select-none flex flex-col font-thai">
      {/* 1. IMMERSIVE FULL-SCREEN POND BACKGROUND WITH INTERACTIVE WATER RIPPLES */}
      <div
        className="absolute inset-0 z-0 cursor-pointer"
        onClick={handlePondClick}
      >
        <PondScene timeOfDay={timeOfDay}>
          {/* Interactive Touch Water Ripples */}
          {touchRipples.map((rip) => (
            <div
              key={rip.id}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/70 bg-amber-400/15 animate-waterTouchRipple"
              style={{
                left: `${rip.x}px`,
                top: `${rip.y}px`,
                width: '64px',
                height: '64px',
              }}
            />
          ))}

          {/* Released Sky Lanterns Ascending into the Night Sky (Gen-Z Aesthetic Yee Peng Glow) */}
          {releasedLanterns.map((lan) => (
            <div
              key={lan.id}
              className="absolute pointer-events-none z-20 animate-lanternAscend flex flex-col items-center"
              style={{
                left: `${lan.x}%`,
                bottom: '18%',
              }}
            >
              {/* Authentic Glowing Yee Peng Lantern Silhouette */}
              <div className="relative flex flex-col items-center filter drop-shadow-[0_0_28px_rgba(251,191,36,0.9)]">
                <div className="w-16 h-22 sm:w-20 sm:h-26 bg-gradient-to-t from-amber-500 via-amber-300 to-amber-100 rounded-t-3xl rounded-b-md border border-amber-300/80 shadow-[0_0_35px_rgba(251,191,36,0.85)] flex flex-col items-center justify-center p-2 text-center overflow-hidden relative">
                  {/* Inner ambient flame pulse */}
                  <div className="absolute bottom-2 w-7 h-7 bg-amber-200/90 rounded-full blur-md animate-pulse" />
                  <div className="absolute bottom-3 w-2 h-2 bg-white rounded-full blur-[1px] animate-ping" />
                  
                  {/* Subtle wish snippet inscribed on rice paper */}
                  <p className="relative z-10 text-[10px] sm:text-[11px] text-slate-950 font-bold leading-tight font-thai line-clamp-3 px-1">
                    {lan.wish}
                  </p>
                </div>
                {/* Bamboo base rim */}
                <div className="w-9 h-1.5 bg-amber-800 rounded-full mt-0.5 shadow-sm" />
              </div>

              {/* Legible Frosted Glass Wish Tag (อ่านง่าย ไม่บัง ไม่โดนตัดสั้น) */}
              <div className="mt-2 max-w-[220px] bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-amber-300/40 text-[11px] sm:text-xs text-amber-100 font-medium text-center shadow-lg truncate">
                {lan.sender}: {lan.wish}
              </div>
            </div>
          ))}

          {/* Floating Krathongs with Natural River Current Flow */}
          {visibleKrathongs.map((k) => (
            <KrathongFloatingItem
              key={k.id}
              krathong={k}
              onClick={handleKrathongItemClick}
              isFocused={focusedKrathongId === k.id}
              isDriftingAway={driftingAwayIds.has(k.id)}
              isPartyMatch={Boolean(activePartyCode && k.party_code === activePartyCode)}
              isNewlyFloated={justLaunchedId === k.id}
            />
          ))}

          {/* Subtle RMUTK Turtle on the Bridge / Pier (ไม่เกะกะ ไม่บังกระทง) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsTurtleModalOpen(true);
            }}
            className="absolute left-[4.5%] sm:left-[5.5%] top-[42.2%] z-20 cursor-pointer pointer-events-auto group transition-transform hover:scale-115 active:scale-95"
            title="เต่าสระ มทร.กรุงเทพ (แตะเพื่อโยนเหรียญแก้เคล็ด)"
            aria-label="บ่อเต่าแก้เคล็ด"
          >
            <div className="relative flex items-center justify-center filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              <svg
                width="28"
                height="24"
                viewBox="0 0 100 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform group-hover:-translate-y-0.5"
              >
                <ellipse cx="24" cy="26" rx="14" ry="7" fill="#1e3a34" transform="rotate(-25 24 26)" />
                <ellipse cx="76" cy="26" rx="14" ry="7" fill="#1e3a34" transform="rotate(25 76 26)" />
                <ellipse cx="26" cy="56" rx="12" ry="6" fill="#172e29" transform="rotate(25 26 56)" />
                <ellipse cx="74" cy="56" rx="12" ry="6" fill="#172e29" transform="rotate(-25 74 56)" />
                <ellipse cx="50" cy="14" rx="9" ry="12" fill="#2d584e" />
                <polygon points="50,72 47,62 53,62" fill="#1e3a34" />
                <ellipse cx="50" cy="42" rx="28" ry="24" fill="#204b40" stroke="#52be9f" strokeWidth="2.5" />
                <polygon points="50,26 59,32 59,42 50,48 41,42 41,32" fill="#295f52" stroke="#52be9f" strokeWidth="1.5" />
                <circle cx="50" cy="37" r="4" fill="#fbbf24" />
              </svg>
              <div className="absolute -inset-1 rounded-full border border-teal-400/0 group-hover:border-teal-400/50 transition-colors pointer-events-none" />
            </div>
          </div>
        </PondScene>
      </div>

      {/* 2. MINIMALIST FLOATING TOP CONTROLS (TRANSLUCENT FROSTED GLASS CAPSULES สไตล์ GEN-Z) */}
      <header className="relative z-20 flex items-center justify-end px-3.5 sm:px-6 py-2.5 sm:py-3 pointer-events-none">
        {/* Top Right Quick Actions: Translucent Frosted Glass Pills (เรียง: ไอคอนเปิดปิดเสียง, ค้นหา, ของฉัน, สถิติ, ขนาดตัวอักษร ก) */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {/* 1. Music Toggle: Icon Only (ไอคอนเปิดปิดเสียง ไม่ต้องมีข้อความ) */}
          <button
            type="button"
            onClick={handleToggleMusic}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all shadow-sm backdrop-blur-md flex items-center justify-center cursor-pointer active:scale-95 ${
              isMusicPlaying
                ? 'bg-amber-400/25 text-amber-200 border-amber-300/50 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                : 'bg-white/10 text-white/80 border-white/20 hover:text-white hover:bg-white/20'
            }`}
            title={isMusicPlaying ? 'ปิดเพลงบรรเลง' : 'เปิดเพลงบรรเลง (Fino the Ranad)'}
            aria-label="เปิดปิดเพลง"
          >
            {isMusicPlaying ? (
              <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/70" />
            )}
          </button>

          {/* 2. Search (ค้นหา) */}
          <button
            type="button"
            onClick={() => {
              setSearchDrawerInitialTab('search');
              setIsSearchDrawerOpen(true);
            }}
            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-xs sm:text-sm font-medium text-white transition-all shadow-sm backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
            aria-label="ค้นหากระทง"
          >
            <Search className="w-3.5 h-3.5 text-white/80" />
            <span>ค้นหา</span>
          </button>

          {/* 3. My Krathongs (ของฉัน) */}
          <button
            type="button"
            onClick={() => {
              setSearchDrawerInitialTab('my-krathongs');
              setIsSearchDrawerOpen(true);
            }}
            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-xs sm:text-sm font-medium text-white transition-all shadow-sm backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
            aria-label="กระทงของฉัน"
          >
            <User className="w-3.5 h-3.5 text-amber-300" />
            <span>ของฉัน</span>
          </button>

          {/* 4. Stats (สถิติ) */}
          <button
            type="button"
            onClick={() => {
              setSearchDrawerInitialTab('stats');
              setIsSearchDrawerOpen(true);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white/90 hover:text-white transition-all shadow-sm backdrop-blur-md flex items-center justify-center cursor-pointer"
            title="สถิติสระน้ำ"
            aria-label="ดูสถิติสระน้ำ"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>

          {/* 5. Font Size Toggle (ขนาดตัวอักษร ก) */}
          <button
            type="button"
            onClick={handleToggleFontSize}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-amber-300 text-xs font-bold transition-all shadow-sm backdrop-blur-md flex items-center justify-center cursor-pointer"
            title="ปรับขนาดตัวอักษร"
            aria-label="ปรับขนาดตัวอักษร"
          >
            <span>{fontSize === 'large' ? 'ก+' : 'ก'}</span>
          </button>
        </div>
      </header>

      {/* 3. SUBTLE FLOATING CATEGORY FILTER PILLS (TRANSLUCENT FROSTED GLASS - สีใสไม่บังรูปด้านหลัง) */}
      <div className="relative z-20 flex justify-center px-2 sm:px-3 py-1 pointer-events-auto">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-sm max-w-full overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'all' as const, label: 'ทั้งหมด' },
            { id: 'study' as const, label: 'เรียน' },
            { id: 'career' as const, label: 'การงาน' },
            { id: 'love' as const, label: 'ความรัก' },
            { id: 'health' as const, label: 'ปล่อยจอย' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`h-7 sm:h-8 px-3 sm:px-3.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center justify-center flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400/25 text-amber-200 font-bold border border-amber-300/40 shadow-sm backdrop-blur-md'
                    : 'text-white/75 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer to push floating dock to bottom */}
      <div className="flex-1" />

      {/* 4. GEN-Z FLOATING ACTION DOCK AT BOTTOM (BALANCED & STANDARDIZED SIZES) */}
      <div className="relative z-20 flex flex-col items-center pb-4 sm:pb-6 px-3 sm:px-4 pointer-events-none pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2">
        {/* Active Party Squad Pill */}
        {activePartyCode && (
          <div className="text-xs text-cyan-200 bg-slate-900/70 backdrop-blur-2xl px-3.5 py-1.5 rounded-full border border-cyan-400/30 pointer-events-auto shadow-lg flex items-center gap-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>ลอยกับเพื่อนในกลุ่ม ({partyKrathongsCount} ใบ)</span>
            <button
              type="button"
              onClick={() => setFocusPartyOnly(!focusPartyOnly)}
              className="ml-1 px-2.5 py-0.5 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {focusPartyOnly ? 'ดูทั้งสระ' : 'ดูกลุ่มนี้'}
            </button>
          </div>
        )}

        {/* Primary Hero Action: ปล่อยกระทง (Clean Text, No Emojis, Standard Height) */}
        <div className="pointer-events-auto w-full max-w-xs sm:max-w-sm flex justify-center">
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="w-full h-11 sm:h-12 px-8 rounded-full font-bold text-sm sm:text-base bg-gradient-to-r from-amber-400/90 via-amber-300/90 to-amber-400/90 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-200/50 shadow-[0_4px_24px_rgba(251,191,36,0.35)] active:scale-95 transition-all flex items-center justify-center cursor-pointer tracking-wide"
          >
            <span>ปล่อยกระทง</span>
          </button>
        </div>

        {/* Secondary Actions: Individual Standalone Gen-Z Glassmorphism Pills (เรียง: ปล่อยโคม, จุดไฟเย็น, บ่อเต่า, พรพระแม่, เซียมซี) */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-xl px-2">
          {/* 1. ปล่อยโคม */}
          <button
            type="button"
            onClick={() => setIsLanternModalOpen(true)}
            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-full bg-slate-900/75 hover:bg-slate-800/90 active:scale-95 border border-white/10 hover:border-amber-400/30 text-xs sm:text-sm font-medium text-slate-200 transition-all shadow-md backdrop-blur-xl flex items-center justify-center cursor-pointer"
          >
            <span>ปล่อยโคม</span>
          </button>

          {/* 2. จุดไฟเย็น */}
          <button
            type="button"
            onClick={() => setIsSparklerOpen(true)}
            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-full bg-slate-900/75 hover:bg-slate-800/90 active:scale-95 border border-amber-400/40 hover:border-amber-300 text-xs sm:text-sm font-semibold text-amber-200 transition-all shadow-md backdrop-blur-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>จุดไฟเย็น</span>
          </button>

          {/* 3. บ่อเต่า (แก้เคล็ด F • แข่งคะแนนคณะ) */}
          <button
            type="button"
            onClick={() => setIsTurtleModalOpen(true)}
            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-full bg-slate-900/75 hover:bg-teal-500/20 active:scale-95 border border-teal-500/30 hover:border-teal-400 text-xs sm:text-sm font-semibold text-teal-200 transition-all shadow-md backdrop-blur-xl flex items-center justify-center cursor-pointer"
          >
            <span>บ่อเต่า</span>
          </button>

          {/* 4. พรพระแม่ */}
          <button
            type="button"
            onClick={() => {
              if (myKrathongs.length > 0) {
                handleOpenKhongkhaBlessing(myKrathongs[0]);
              } else {
                setBlessingKrathong(null);
                setIsKhongkhaModalOpen(true);
              }
            }}
            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-full bg-slate-900/75 hover:bg-slate-800/90 active:scale-95 border border-white/10 hover:border-amber-400/30 text-xs sm:text-sm font-medium text-slate-200 transition-all shadow-md backdrop-blur-xl flex items-center justify-center cursor-pointer"
          >
            <span>พรพระแม่</span>
          </button>

          {/* 5. เซียมซี */}
          <button
            type="button"
            onClick={() => setIsFortuneOpen(true)}
            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-full bg-slate-900/75 hover:bg-slate-800/90 active:scale-95 border border-white/10 hover:border-amber-400/30 text-xs sm:text-sm font-medium text-slate-200 transition-all shadow-md backdrop-blur-xl flex items-center justify-center cursor-pointer"
          >
            <span>เซียมซี</span>
          </button>

          {/* 6. ชวนเพื่อน (คงการทำงานเดิม 100%) */}
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-full bg-slate-900/75 hover:bg-slate-800/90 active:scale-95 border border-white/10 hover:border-amber-400/30 text-xs sm:text-sm font-medium text-slate-200 transition-all shadow-md backdrop-blur-xl flex items-center justify-center cursor-pointer"
          >
            <span>ชวนเพื่อน</span>
          </button>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md border border-amber-400/40 text-amber-200 text-xs sm:text-sm px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-fadeIn pointer-events-none">
          <Bell className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Background Loy Krathong Music Player (YouTube Fino the Ranad) */}
      <YouTubeBgmPlayer isPlaying={isMusicPlaying} />

      {/* Modals & Drawers */}
      <KrathongCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onSubmit={handleCreateKrathong}
        initialPartyCode={activePartyCode}
        onOpenStoryModal={(code, b, f, c, s, name) => {
          handleOpenStoryModal(code, b, f, c, s, name);
        }}
      />

      <InviteFriendsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onStartCustomizerWithParty={(code) => {
          setActivePartyCode(code);
          try {
            localStorage.setItem('party_host_' + code, 'true');
          } catch {}
          setIsGroupWaitingHost(true);
          setIsCustomizerOpen(true);
        }}
        onOpenStoryModal={(code) => {
          handleOpenStoryModal(code);
        }}
      />

      <InviteStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        partyCode={storyParams.partyCode}
        base={storyParams.base}
        flower={storyParams.flower}
        candle={storyParams.candle}
        sacredItems={storyParams.sacredItems}
        hostName={storyParams.hostName}
      />

      <GroupWaitingModal
        isOpen={isGroupWaitingOpen}
        onClose={() => setIsGroupWaitingOpen(false)}
        partyCode={groupWaitingPartyCode}
        isHost={isGroupWaitingHost}
        myKrathong={newlyCreatedKrathong}
        allPartyKrathongs={allKrathongsDatabase}
        onLaunchAll={handleGroupLaunchAll}
        onOpenStoryModal={() => {
          if (newlyCreatedKrathong) {
            handleOpenStoryModal(
              groupWaitingPartyCode,
              newlyCreatedKrathong.base_type,
              newlyCreatedKrathong.flower_type,
              newlyCreatedKrathong.candle_type,
              newlyCreatedKrathong.sacred_items || [],
              newlyCreatedKrathong.sender_name
            );
          } else {
            handleOpenStoryModal(groupWaitingPartyCode);
          }
        }}
      />

      <SkyLanternModal
        isOpen={isLanternModalOpen}
        onClose={() => setIsLanternModalOpen(false)}
        onReleaseLantern={handleReleaseLantern}
      />

      <KrathongDetailModal
        krathong={selectedKrathong}
        onClose={() => {
          setSelectedKrathong(null);
          setFocusedKrathongId(null);
        }}
        onBless={handleBless}
        onOpenKhongkhaBlessing={handleOpenKhongkhaBlessing}
      />

      <FortuneModal
        isOpen={isFortuneOpen}
        onClose={() => setIsFortuneOpen(false)}
      />

      <SearchStatsDrawer
        isOpen={isSearchDrawerOpen}
        onClose={() => setIsSearchDrawerOpen(false)}
        krathongs={allKrathongsDatabase}
        onSelectKrathong={(k) => {
          setSelectedKrathong(k);
          setFocusedKrathongId(k.id);
        }}
        initialTab={searchDrawerInitialTab}
        onBless={handleBless}
      />

      <WishCardModal
        krathong={newlyCreatedKrathong}
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        onOpenFortune={() => setIsFortuneOpen(true)}
        onOpenKhongkhaBlessing={handleOpenKhongkhaBlessing}
      />

      <KhongkhaBlessingModal
        krathong={blessingKrathong}
        isOpen={isKhongkhaModalOpen}
        onClose={() => setIsKhongkhaModalOpen(false)}
        myKrathongs={myKrathongs}
        onOpenCustomizer={() => {
          setIsKhongkhaModalOpen(false);
          setIsCustomizerOpen(true);
        }}
        onLocateKrathong={(k) => {
          setIsKhongkhaModalOpen(false);
          setFocusedKrathongId(k.id);
          setSelectedKrathong(k);
        }}
      />

      <TurtlePondModal
        isOpen={isTurtleModalOpen}
        onClose={() => setIsTurtleModalOpen(false)}
        krathongs={allKrathongsDatabase}
        onSelectKrathong={(k) => {
          setSelectedKrathong(k);
          setFocusedKrathongId(k.id);
        }}
      />

      <SparklerModal
        isOpen={isSparklerOpen}
        onClose={() => setIsSparklerOpen(false)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-rmutk-midnight flex items-center justify-center text-amber-300 text-sm">
          <span>กำลังเปิดสระน้ำ มทร.กรุงเทพ...</span>
        </div>
      }
    >
      <LoyKrathongApp />
    </Suspense>
  );
}
