'use client';

import React, { useState } from 'react';
import { X, Users, Copy, Check, Sparkles, Send, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomizerWithParty: (partyCode: string) => void;
  onOpenStoryModal?: (partyCode: string) => void;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen,
  onClose,
  onStartCustomizerWithParty,
  onOpenStoryModal,
}) => {
  // Generate a clean unique party token under the hood without burdening the user with codes
  const [partyCode] = useState<string>(
    () => 'RMUTK-' + Math.floor(1000 + Math.random() * 9000)
  );
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const getInviteUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?party=${encodeURIComponent(
      partyCode
    )}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getInviteUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleCreateNow = () => {
    onClose();
    onStartCustomizerWithParty(partyCode);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 font-thai animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/15 w-full max-w-md rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden text-slate-100 flex flex-col relative">
        {/* Top Glow Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 id="invite-modal-title" className="text-base font-bold text-white">
                ชวนเพื่อนมาลอยด้วยกัน
              </h3>
              <p className="text-xs text-slate-400">สระน้ำ มทร.กรุงเทพ (ชวนได้ไม่จำกัดคน)</p>
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

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Highlight Info Card */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/25 space-y-2 text-center">
            <div className="flex items-center justify-center gap-1.5 text-cyan-300 font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>ลอยเคียงข้างกันในสระเดียวกับเพื่อน</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              แชร์ลิงก์นี้ให้เพื่อนในกลุ่ม หรือโพสต์ลงสตอรี่ IG/TikTok เมื่อเพื่อนแตะเข้ามาร่วม กระทงจะลงไปลอยคู่กันในสระน้ำแบบเรียลไทม์ทันที!
            </p>
          </div>

          {/* Clean Invite Link Box */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>ลิงก์ชวนเพื่อนของคุณ</span>
              </span>
              <span className="text-[11px] text-cyan-300">ชวนได้ไม่จำกัด</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-11 bg-white/5 border border-white/10 rounded-xl px-3.5 flex items-center text-xs text-slate-300 font-mono truncate select-all">
                {getInviteUrl() || 'กำลังสร้างลิงก์...'}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="h-11 px-4 rounded-xl bg-cyan-400/90 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer flex-shrink-0 shadow-md shadow-cyan-500/20"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>คัดลอกแล้ว!</span>
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

          {/* Social Story Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenStoryModal?.(partyCode);
            }}
            className="w-full h-11 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-amber-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>สร้างรูปชวนลงสตอรี่ (IG / TikTok พร้อม QR Code)</span>
          </button>

          {/* Primary Action Button: Create Krathong */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCreateNow}
              className="w-full h-11 sm:h-12 rounded-full font-bold text-sm bg-gradient-to-r from-amber-400/90 via-amber-300/95 to-amber-500/90 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ไปสร้างกระทงของฉันกันเลย</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
