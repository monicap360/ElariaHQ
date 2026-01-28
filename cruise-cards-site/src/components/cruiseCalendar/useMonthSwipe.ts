"use client";

import { useEffect, useRef } from "react";

export function useMonthSwipe(onPrev: () => void, onNext: () => void, threshold = 60) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    function onTouchStart(event: TouchEvent) {
      if (event.touches.length !== 1) return;
      startX.current = event.touches[0].clientX;
      startY.current = event.touches[0].clientY;
    }

    function onTouchEnd(event: TouchEvent) {
      if (startX.current == null || startY.current == null) return;

      const dx = event.changedTouches[0].clientX - startX.current;
      const dy = event.changedTouches[0].clientY - startY.current;

      if (Math.abs(dy) > Math.abs(dx)) {
        startX.current = null;
        startY.current = null;
        return;
      }

      if (dx > threshold) onPrev();
      if (dx < -threshold) onNext();

      startX.current = null;
      startY.current = null;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onPrev, onNext, threshold]);
}
