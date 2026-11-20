'use client';

import { useState, useEffect, useCallback } from 'react';

interface DeviceMotionHookOptions {
  onShake?: () => void;
  threshold?: number;
  timeout?: number;
}

export function useDeviceMotion({
  onShake,
  threshold = 15,
  timeout = 1000,
}: DeviceMotionHookOptions) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [needsPermissionRequest, setNeedsPermissionRequest] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setIsSupported(true);
      // ตรวจสอบว่าระบบเป็น iOS 13+ ที่ต้องการการอนุญาตล่วงหน้าหรือไม่
      const deviceMotionEvent = window.DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof deviceMotionEvent.requestPermission === 'function') {
        setNeedsPermissionRequest(true);
      } else {
        setHasPermission(true);
      }
    }
  }, []);

  /**
   * ฟังก์ชันขออนุญาตเซนเซอร์ความเคลื่อนไหว (ต้องเกิดจากการแตะปุ่มของผู้ใช้เท่านั้น)
   */
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    const deviceMotionEvent = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof deviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await deviceMotionEvent.requestPermission();
        if (response === 'granted') {
          setHasPermission(true);
          setNeedsPermissionRequest(false);
          return true;
        } else {
          setHasPermission(false);
          return false;
        }
      } catch (err) {
        console.warn('DeviceMotion permission error:', err);
        setHasPermission(false);
        return false;
      }
    } else {
      setHasPermission(true);
      return true;
    }
  }, [isSupported]);

  useEffect(() => {
    if (!hasPermission || !onShake) return;

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastTime = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if (currentTime - lastTime < 100) return;

      const diffTime = currentTime - lastTime;
      lastTime = currentTime;

      const x = current.x || 0;
      const y = current.y || 0;
      const z = current.z || 0;

      const speed = (Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime) * 10000;

      if (speed > threshold * 40) {
        onShake();
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [hasPermission, onShake, threshold, timeout]);

  return {
    isSupported,
    hasPermission,
    needsPermissionRequest,
    requestPermission,
  };
}
