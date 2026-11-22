'use client';

import React, { useEffect, useRef, useState } from 'react';

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
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

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
    if (isIframeLoaded) {
      if (isPlaying) {
        sendCommand('playVideo');
      } else {
        sendCommand('pauseVideo');
      }
    }
  }, [isPlaying, isIframeLoaded]);

  const handleIframeLoad = () => {
    setIsIframeLoaded(true);
    if (isPlaying) {
      // Small timeout to allow YouTube internal player script initialization
      setTimeout(() => {
        sendCommand('playVideo');
      }, 300);
    }
  };

  return (
    <div
      className="fixed -top-96 -left-96 w-10 h-10 opacity-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <iframe
        ref={iframeRef}
        id="loykrathong-yt-player"
        title="เพลงรำวงวันลอยกระทง ดนตรีไทยบรรเลง ระนาดเอก Fino the Ranad"
        src="https://www.youtube-nocookie.com/embed/X80o4uXSkOs?enablejsapi=1&playsinline=1&controls=0&loop=1&playlist=X80o4uXSkOs"
        allow="autoplay; encrypted-media"
        width="100"
        height="100"
        onLoad={handleIframeLoad}
      />
    </div>
  );
};
