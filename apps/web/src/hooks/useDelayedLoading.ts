import { useState, useEffect, useRef } from "react";
import { LOADING_CONFIG } from "../config/loading";

/**
 * Intelligent hook for displaying skeleton loading states.
 * - Fast content (<150ms): returns false (bypasses skeleton flash).
 * - Slow content (>150ms): returns true, ensuring a minimum display duration (250ms) to eliminate flickering.
 */
export function useDelayedLoading(
  isLoading: boolean,
  delay: number = LOADING_CONFIG.skeletonDelay,
  minDuration: number = LOADING_CONFIG.minimumSkeletonDuration
): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isLoading) {
      // Start delay timer before showing skeleton
      timerRef.current = setTimeout(() => {
        setShowSkeleton(true);
        startTimeRef.current = Date.now();
      }, delay);
    } else {
      clearTimeout(timerRef.current);
      if (showSkeleton && startTimeRef.current) {
        const elapsedTime = Date.now() - startTimeRef.current;
        const remainingTime = Math.max(0, minDuration - elapsedTime);
        const hideTimer = setTimeout(() => {
          setShowSkeleton(false);
          startTimeRef.current = null;
        }, remainingTime);
        return () => clearTimeout(hideTimer);
      } else {
        setShowSkeleton(false);
        startTimeRef.current = null;
      }
    }

    return () => clearTimeout(timerRef.current);
  }, [isLoading, delay, minDuration, showSkeleton]);

  return showSkeleton;
}
