import { useState, useEffect, useCallback } from "react";
import { INTRO_CONFIG } from "../config/intro.config";

export interface UseRatriIntroReturn {
  shouldShowIntro: boolean;
  isExiting: boolean;
  prefersReducedMotion: boolean;
  completeIntro: () => void;
  triggerExit: () => void;
}

export function useRatriIntro(): UseRatriIntroReturn {
  const [shouldShowIntro, setShouldShowIntro] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return true;
  });

  const [isExiting, setIsExiting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const completeIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_CONFIG.storageKey, "true");
    } catch (e) {
      // Storage error fallback
    }
    setShouldShowIntro(false);
    setIsExiting(false);
  }, []);

  const triggerExit = useCallback(() => {
    setIsExiting(true);
  }, []);

  // Safety maximum duration timeout to prevent user from being stuck
  useEffect(() => {
    if (!shouldShowIntro) return;

    const safetyTimer = setTimeout(() => {
      completeIntro();
    }, INTRO_CONFIG.maximumDuration);

    return () => clearTimeout(safetyTimer);
  }, [shouldShowIntro, completeIntro]);

  return {
    shouldShowIntro,
    isExiting,
    prefersReducedMotion,
    completeIntro,
    triggerExit,
  };
}
