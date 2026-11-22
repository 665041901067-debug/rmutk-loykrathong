'use client';

import React, { useEffect, useRef } from 'react';

interface YouTubeBgmPlayerProps {
  isPlaying: boolean;
}

/**
 * YouTube Background Music Player
 * แทร็ก: "รำวงวันลอยกระทง ดนตรีไทยบรรเลงยาว ๆ | ระนาดเอก (+ดนตรีไทย) | Fino the Ranad"
 * URL: https://www.youtube.com/watch?v=X80o4uXSkOs
 */
export const YouTubeBgmPlayer: React.FC<YouTubeBgmPlayerProps> = ({ isPlaying }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const sendCommand = (func: 'playVideo' | 'pauseVideo') => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args: [] }),
        '*'
      );
    } catch {}
  };

  useEffect(() => {
    if (isPlaying) {
      sendCommand('playVideo');
    } else {
      sendCommand('pauseVideo');
    }
  }, [isPlaying]);

  return (
    <div
      className="fixed -top-96 -left-96 w-10 h-10 opacity-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <iframe
        ref={iframeRef}
        id="loykrathong-yt-player"
        title="เพลงรำวงวันลอยกระทง ดนตรีไทยบรรเลง ระนาดเอก"
        src="https://www.youtube-nocookie.com/embed/X80o4uXSkOs?enablejsapi=1&playsinline=1&controls=0&loop=1&playlist=X80o4uXSkOs&origin=https://rmutk-loykrathong.vercel.app"
        allow="autoplay; encrypted-media"
        width="100"
        height="100"
      />
    </div>
  );
};
