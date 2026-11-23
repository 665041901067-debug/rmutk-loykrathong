'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Krathong } from '@/types';
import { KrathongSVG } from '../Krathong/KrathongSVG';
import { sound } from '@/lib/sound';
import { broadcastPartyLaunch, subscribePartyLaunch } from '@/lib/partySync';
import { X, Users, Share2, Copy, Check, Sparkles, Flame, Image as ImageIcon } from 'lucide-react';

interface GroupWaitingModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyCode: string;
  isHost: boolean;
  myKrathong?: Krathong | null;
  allPartyKrathongs: Krathong[];
  onLaunchAll: () => void;
  onOpenStoryModal: () => void;
}

export const GroupWaitingModal: React.FC<GroupWaitingModalProps> = ({
  isOpen,
  onClose,
  partyCode,
  isHost,
  myKrathong,
  allPartyKrathongs,
  onLaunchAll,
  onOpenStoryModal,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Check if effective host from prop or local storage
  const isEffectiveHost =
    isHost ||
    (typeof window !== 'undefined' && localStorage.getItem('party_host_' + partyCode) === 'true');

  // Filter or construct members in this party (reactive merge with own krathong)
  const partyMembers = useMemo(() => {
    const list = allPartyKrathongs.filter((k) => k.party_code === partyCode);
    if (myKrathong && myKrathong.party_code === partyCode && !list.some((k) => k.id === myKrathong.id)) {
      list.push(myKrathong);
    }
    return list;
  }, [allPartyKrathongs, partyCode, myKrathong]);
  const totalCount = Math.max(1, partyMembers.length);
  const prayedCount = partyMembers.filter((k) => Boolean(k.wish)).length;

  // Real-time synchronization: Listen for launch signal from host or any party member across tabs/devices
  useEffect(() => {
    if (!isOpen || !partyCode) return;

    const unsubscribe = subscribePartyLaunch(partyCode, () => {
      if (isLaunching) return;
      setIsLaunching(true);
      setCountdown(3);
      sound.playSparkle();

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            sound.playTempleBell();
            onLaunchAll();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, partyCode, isLaunching, onLaunchAll]);

  const getInviteUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?party=${encodeURIComponent(partyCode)}`;
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

  const handleTriggerLaunch = () => {
    if (isLaunching) return;
    setIsLaunching(true);

    // Broadcast launch signal to all peer tabs & devices immediately!
    broadcastPartyLaunch(partyCode, isHost ? 'host' : 'member');

    setCountdown(3);
    sound.playSparkle();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          sound.playTempleBell();
          onLaunchAll();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-thai"
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-waiting-title"
    >
      <div className="bg-slate-900/95 sm:bg-slate-900/90 backdrop-blur-xl border border-white/15 w-full max-w-md rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden text-slate-100 relative transform-gpu">
        {/* Countdown Overlay Animation */}
        {countdown !== null && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center animate-fadeIn">
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
            <div className="text-6xl font-extrabold text-amber-400 my-4 animate-bounce">
              {countdown}
            </div>
            <p className="text-base font-bold text-white tracking-wider">
              กำลังปล่อยกระทงพร้อมกันสู่สายน้ำ...
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-cyan-300 font-bold block tracking-wider">
                ลอยกระทงกับเพื่อน (ชวนได้ไม่จำกัด)
              </span>
              <h3 id="group-waiting-title" className="text-base font-bold text-white">
                {isEffectiveHost ? 'พร้อมปล่อยเมื่อไหร่ก็กดได้เลย' : 'พร้อมแล้ว! รอเพื่อนกดปล่อยสู่สระน้ำ...'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Krathong Showcase */}
        <div className="p-5 flex flex-col items-center">
          <div className="relative w-full h-[160px] bg-gradient-to-b from-sky-950/20 via-slate-900/40 to-black/30 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />
            {myKrathong && (
              <KrathongSVG
                base={myKrathong.base_type}
                flower={myKrathong.flower_type}
                candle={myKrathong.candle_type}
                sacredItems={myKrathong.sacred_items}
                isLit={true}
                size={160}
                showWaterRipples={true}
              />
            )}
          </div>

          {/* Group Status Pill */}
          <div className="mt-4 px-4 py-1.5 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-300" />
            <span>
              มีเพื่อนในกลุ่มแล้ว {totalCount} คน • อธิษฐานแล้ว {prayedCount} คน
            </span>
          </div>

          {/* Members List */}
          <div className="w-full mt-3.5 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {partyMembers.length > 0 ? (
              partyMembers.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">{member.sender_name}</span>
                    <span className="text-slate-400">({member.faculty})</span>
                  </div>
                  <span className="text-emerald-300 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>อธิษฐานแล้ว</span>
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-2 text-xs text-slate-400">
                ยังไม่มีเพื่อนเข้ามาร่วม ส่งลิงก์ชวนเพื่อนด้านล่างได้เลย
              </div>
            )}
          </div>

          {/* Quick Party Badge Info */}
          <div className="w-full mt-3 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">รหัสกลุ่มเพื่อน:</span>
            <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-400/15 border border-cyan-400/30">
              {partyCode}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-3.5 space-y-2.5">
            {isEffectiveHost ? (
              <button
                type="button"
                onClick={handleTriggerLaunch}
                disabled={isLaunching}
                className="w-full h-11 sm:h-12 rounded-full font-bold text-sm bg-gradient-to-r from-amber-400/90 via-amber-300/95 to-amber-500/90 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>ปล่อยพร้อมกัน</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTriggerLaunch}
                disabled={isLaunching}
                className="w-full h-11 sm:h-12 rounded-full font-bold text-sm bg-white/10 hover:bg-white/15 border border-white/15 text-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ไม่รอแล้ว ลอยเลย</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="h-11 px-3 rounded-full font-semibold text-xs bg-white/8 hover:bg-white/15 border border-white/12 text-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>ส่งลิงก์ชวนอีกครั้ง</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenStoryModal}
                className="h-11 px-3 rounded-full font-semibold text-xs bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-300" />
                <span>รูปชวนลงสตอรี่</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
