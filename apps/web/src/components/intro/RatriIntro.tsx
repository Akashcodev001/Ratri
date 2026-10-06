import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { RatriIntroBackground } from "./RatriIntroBackground";
import { RatriWordmark } from "./RatriWordmark";
import { buildRatriMasterTimeline } from "./RatriIntroAnimation";
import { useRatriIntro } from "../../hooks/useRatriIntro";

export function RatriIntro() {
  const {
    shouldShowIntro,
    prefersReducedMotion,
    completeIntro,
  } = useRatriIntro();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const emblemRef = useRef<SVGSVGElement | null>(null);
  const emblemStrokeRef = useRef<SVGPathElement | null>(null);
  const emblemFillRef = useRef<SVGPathElement | null>(null);
  const wordmarkSvgRef = useRef<SVGSVGElement | null>(null);
  const letterStrokesRef = useRef<(SVGPathElement | null)[]>([]);
  const letterFillsRef = useRef<(SVGPathElement | null)[]>([]);
  const sweepRef = useRef<HTMLDivElement | null>(null);
  const taglineRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (!shouldShowIntro) return;

    // Reduced Motion Fallback
    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        completeIntro();
      }, 400);
      return () => clearTimeout(timer);
    }

    // GSAP Context with clean unmount cleanup
    const ctx = gsap.context(() => {
      buildRatriMasterTimeline(
        {
          containerRef,
          bgRef,
          auraRef,
          emblemRef,
          emblemStrokeRef,
          emblemFillRef,
          wordmarkSvgRef,
          letterStrokesRef,
          letterFillsRef,
          sweepRef,
          taglineRef,
        },
        completeIntro
      );
    }, containerRef);

    // Keyboard Skip Handler (Escape Key)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        completeIntro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      ctx.revert();
    };
  }, [shouldShowIntro, prefersReducedMotion, completeIntro]);

  if (!shouldShowIntro) return null;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Application Loading Intro"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950 text-white overflow-hidden pointer-events-auto select-none"
    >
      {/* Background Layer */}
      <RatriIntroBackground bgRef={bgRef} auraRef={auraRef} />

      {/* Brand Wordmark & Emblem Layer */}
      <RatriWordmark
        emblemRef={emblemRef}
        emblemStrokeRef={emblemStrokeRef}
        emblemFillRef={emblemFillRef}
        wordmarkSvgRef={wordmarkSvgRef}
        letterStrokesRef={letterStrokesRef}
        letterFillsRef={letterFillsRef}
        sweepRef={sweepRef}
        taglineRef={taglineRef}
      />

      {/* Accessible Skip Button */}
      <button
        type="button"
        onClick={completeIntro}
        className="absolute bottom-6 right-6 z-30 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-mono font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500"
      >
        Skip Intro ↵
      </button>
    </div>
  );
}
