/**
 * Universal Mobile-Ready Image Export & Sharing Utility
 * Handles cross-platform saving (iOS Safari, Android, LINE/FB in-app browsers, Desktop)
 */

export const waitForFonts = async (timeoutMs: number = 150): Promise<void> => {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  } catch {
    // Ignore font loading errors and proceed with fallback fonts
  }
};

export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality?: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob failed'));
        }
      },
      type,
      quality
    );
  });
};

export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

export interface SaveShareResult {
  action: 'shared' | 'downloaded' | 'cancelled' | 'opened' | 'failed';
  error?: string;
}

export const saveOrShareImage = async (
  source: HTMLCanvasElement | string,
  filename: string,
  title: string = 'ลอยกระทงออนไลน์ มทร.กรุงเทพ'
): Promise<SaveShareResult> => {
  try {
    let blob: Blob;
    if (typeof source === 'string') {
      blob = await dataUrlToBlob(source);
    } else {
      blob = await canvasToBlob(source, 'image/png');
    }

    const file = new File([blob], filename, { type: 'image/png' });

    // 1. Try Web Share API with Files (Standard for iOS Safari 15+ and Android Chrome)
    // This allows users to directly tap "Save Image" to their Camera Roll / Photos or share to IG/LINE.
    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title,
          text: title,
        });
        return { action: 'shared' };
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return { action: 'cancelled' };
        }
        // If navigator.share fails for any other reason, continue to fallback
        console.warn('navigator.share failed, falling back to download:', err);
      }
    }

    // 2. Fallback to standard Blob URL download (Desktop Chrome/Firefox/Edge/Safari)
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Keep blob URL alive briefly for mobile downloads
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 5000);

    return { action: 'downloaded' };
  } catch (err: any) {
    console.error('saveOrShareImage error:', err);
    return { action: 'failed', error: err?.message || 'Unknown error' };
  }
};
