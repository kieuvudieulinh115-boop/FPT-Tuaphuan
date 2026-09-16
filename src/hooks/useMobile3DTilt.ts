import React, { useEffect, useRef, useCallback } from 'react';
import { useMotionValue, useSpring, useTransform, MotionValue } from 'motion/react';

interface UseMobile3DTiltOptions {
  maxTilt?: number; // Maximum tilt in degrees (default: 12)
  enableGyro?: boolean;
}

export interface UseMobile3DTiltReturn {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  touchAndMouseProps: {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => void;
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchEnd: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchCancel: (e: React.TouchEvent<HTMLElement>) => void;
  };
}

/**
 * Ultra-smooth 60/120fps hardware-accelerated 3D tilt hook.
 * Uses MotionValues and spring physics to bypass React component re-renders completely!
 */
export function useMobile3DTilt(options: UseMobile3DTiltOptions = {}): UseMobile3DTiltReturn {
  const { maxTilt = 7, enableGyro = true } = options;

  // MotionValues hold values without triggering React component re-renders
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Gentle, soft, cinematic spring solver on GPU matrix
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 85,
    damping: 24,
    mass: 0.7
  });

  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 85,
    damping: 24,
    mass: 0.7
  });

  const isTouchRef = useRef<boolean>(false);
  const interactingRef = useRef<boolean>(false);

  // Update normalized coordinates & CSS variables for specular glow directly on DOM
  const updatePointer = useCallback((clientX: number, clientY: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const normX = (clientX - rect.left) / rect.width - 0.5;
    const normY = (clientY - rect.top) / rect.height - 0.5;

    rawX.set(Math.max(-0.5, Math.min(0.5, normX)));
    rawY.set(Math.max(-0.5, Math.min(0.5, normY)));

    const percentX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    // Zero-overhead CSS variables on the container
    target.style.setProperty('--glow-x', `${percentX}%`);
    target.style.setProperty('--glow-y', `${percentY}%`);
    target.style.setProperty('--glow-opacity', '1');
  }, [rawX, rawY]);

  // Touch Handlers for Mobile Phones
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    isTouchRef.current = true;
    interactingRef.current = true;
    if (e.touches.length > 0) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
    }
  }, [updatePointer]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length > 0) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
    }
  }, [updatePointer]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLElement>) => {
    interactingRef.current = false;
    rawX.set(0);
    rawY.set(0);
    e.currentTarget.style.setProperty('--glow-opacity', '0');
  }, [rawX, rawY]);

  // Desktop Mouse Handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (isTouchRef.current) return;
    interactingRef.current = true;
    updatePointer(e.clientX, e.clientY, e.currentTarget);
  }, [updatePointer]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (isTouchRef.current) return;
    interactingRef.current = false;
    rawX.set(0);
    rawY.set(0);
    e.currentTarget.style.setProperty('--glow-opacity', '0');
  }, [rawX, rawY]);

  // DeviceOrientation for Mobile Handheld 3D Tilt with rAF throttle
  useEffect(() => {
    if (!enableGyro || typeof window === 'undefined') return;

    let gyroRaf: number | null = null;
    let lastGamma = 0;
    let lastBeta = 0;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (interactingRef.current) return;

      const gamma = e.gamma ?? 0;
      const beta = e.beta ?? 0;

      // Throttle minimal jitter
      if (Math.abs(gamma - lastGamma) > 0.4 || Math.abs(beta - lastBeta) > 0.4) {
        lastGamma = gamma;
        lastBeta = beta;

        if (gyroRaf === null) {
          gyroRaf = requestAnimationFrame(() => {
            gyroRaf = null;
            if (interactingRef.current) return;

            // Clamped normalized range
            const normX = Math.max(-0.5, Math.min(0.5, gamma / 35));
            const normY = Math.max(-0.5, Math.min(0.5, (beta - 45) / 35));
            rawX.set(normX);
            rawY.set(normY);
          });
        }
      }
    };

    try {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    } catch {}

    return () => {
      if (gyroRaf !== null) {
        cancelAnimationFrame(gyroRaf);
      }
      try {
        window.removeEventListener('deviceorientation', handleOrientation);
      } catch {}
    };
  }, [enableGyro, rawX, rawY]);

  return {
    rotateX,
    rotateY,
    touchAndMouseProps: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd
    }
  };
}
