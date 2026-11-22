'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface YouTubeBgmPlayerProps {
  isPlaying: boolean;
}

/**
 * YouTube Background Music Player
 * แทร็ก: "รำวงวันลอยกระทง ดนตรีไทยบรรเลงยาว ๆ | ระนาดเอก (+ดนตรีไทย) | Fino the Ranad"
 * URL: https://www.youtube.com/watch?v=X80o4uXSkOs
 * เล่นอัตโนมัติตั้งแต่เปิดเว็บ พร้อมรองรับ User Interaction Fallback สำหรับบราวเซอร์มือถือ
 */
export const YouTubeBgmPlayer: React.FC<YouTubeBgmPlayerProps> = ({ isPlaying }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  const sendCommand = useCallback((func: string, args: unknown[] = []) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    } catch {}
  }, []);

  const startPlayback = useCallback(() => {
    sendCommand('unMute');
    sendCommand('setVolume', [75]);
    sendCommand('playVideo');
  }, [sendCommand]);

  const pausePlayback = useCallback(() => {
    sendCommand('pauseVideo');
  }, [sendCommand]);

  // Sync state changes from parent
  useEffect(() => {
    if (isIframeLoaded) {
      if (isPlaying) {
        startPlayback();
      } else {
        pausePlayback();
      }
    }
  }, [isPlaying, isIframeLoaded, startPlayback, pausePlayback]);

  // Handle iframe initial load + immediate play
  const handleIframeLoad = () => {
    setIsIframeLoaded(true);
    if (isPlaying) {
      startPlayback();
      // Retry in case YouTube player script takes a moment to initialize
      setTimeout(startPlayback, 400);
      setTimeout(startPlayback, 1200);
    }
  };

  // Browser Autoplay Policy Fallback:
  // สำหรับบราวเซอร์มือถือ (iOS/Android Safari/Chrome) ที่บล็อกเสียงอัตโนมัติหากยังไม่มีการสัมผัสหน้าจอ
  // ทันทีที่ผู้ใช้แตะหรือคลิกส่วนใดๆ ของหน้าจอครั้งแรก (แตะผิวน้ำ, เลือกลอยกระทง ฯลฯ) เสียงเพลงจะเริ่มเล่นทันทีอัตโนมัติ
  useEffect(() => {
    if (!isPlaying) return;

    const handleFirstUserGesture = () => {
      startPlayback();
      window.removeEventListener('pointerdown', handleFirstUserGesture);
      window.removeEventListener('touchstart', handleFirstUserGesture);
      window.removeEventListener('click', handleFirstUserGesture);
    };

    window.addEventListener('pointerdown', handleFirstUserGesture, { passive: true, once: true });
    window.addEventListener('touchstart', handleFirstUserGesture, { passive: true, once: true });
    window.addEventListener('click', handleFirstUserGesture, { passive: true, once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstUserGesture);
      window.removeEventListener('touchstart', handleFirstUserGesture);
      window.removeEventListener('click', handleFirstUserGesture);
    };
  }, [isPlaying, startPlayback]);

  return (
    <div
      className="fixed -top-96 -left-96 w-10 h-10 opacity-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <iframe
        ref={iframeRef}
        id="loykrathong-yt-player"
        title="เพลงรำวงวันลอยกระทง ดนตรีไทยบรรเลง ระนาดเอก Fino the Ranad"
        src="https://www.youtube-nocookie.com/embed/X80o4uXSkOs?enablejsapi=1&autoplay=1&playsinline=1&controls=0&loop=1&playlist=X80o4uXSkOs"
        allow="autoplay; encrypted-media"
        width="100"
        height="100"
        onLoad={handleIframeLoad}
      />
    </div>
  );
};
