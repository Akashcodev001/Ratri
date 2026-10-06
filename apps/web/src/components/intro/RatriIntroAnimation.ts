import { gsap } from "gsap";
import { INTRO_CONFIG } from "../../config/intro.config";
import { RATRI_LETTERS } from "./RatriWordmark";

export interface AnimationRefs {
  containerRef: React.RefObject<HTMLDivElement | null>;
  bgRef: React.RefObject<HTMLDivElement | null>;
  auraRef: React.RefObject<HTMLDivElement | null>;
  emblemRef: React.RefObject<SVGSVGElement | null>;
  emblemStrokeRef: React.RefObject<SVGPathElement | null>;
  emblemFillRef: React.RefObject<SVGPathElement | null>;
  wordmarkSvgRef: React.RefObject<SVGSVGElement | null>;
  letterStrokesRef: React.MutableRefObject<(SVGPathElement | null)[]>;
  letterFillsRef: React.MutableRefObject<(SVGPathElement | null)[]>;
  sweepRef: React.RefObject<HTMLDivElement | null>;
  taglineRef: React.RefObject<HTMLParagraphElement | null>;
}

export function buildRatriMasterTimeline(
  refs: AnimationRefs,
  onComplete: () => void
): gsap.core.Timeline {
  const {
    containerRef,
    auraRef,
    emblemRef,
    emblemStrokeRef,
    emblemFillRef,
    letterStrokesRef,
    letterFillsRef,
    sweepRef,
    taglineRef,
  } = refs;

  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete: () => {
      onComplete();
    },
  });

  // 1. Ambient Background Reveal
  if (auraRef.current) {
    tl.to(
      auraRef.current,
      {
        opacity: 0.9,
        scale: 1,
        duration: INTRO_CONFIG.backgroundRevealDuration,
      },
      0
    );
  }

  // 2. Emblem Stroke Writing & Fill Ignite
  if (emblemRef.current && emblemStrokeRef.current) {
    const strokeEl = emblemStrokeRef.current;
    const length = strokeEl.getTotalLength ? strokeEl.getTotalLength() : 250;
    
    // Set initial dasharray and offset
    gsap.set(strokeEl, {
      strokeDasharray: `${length} ${length}`,
      strokeDashoffset: length,
    });

    // Fade in emblem container
    tl.to(
      emblemRef.current,
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.4)",
      },
      0.1
    );

    // Draw emblem stroke
    tl.to(
      strokeEl,
      {
        strokeDashoffset: 0,
        duration: INTRO_CONFIG.emblemStrokeDuration,
        ease: "power2.inOut",
      },
      0.15
    );

    // Ignite emblem solid fill
    if (emblemFillRef.current) {
      tl.to(
        emblemFillRef.current,
        {
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
        },
        0.55
      );
    }
  }

  // 3. Slow Vector Handwriting / Laser Writing Animation for "R A T R I"
  const strokesList = letterStrokesRef.current || [];
  const fillsList = letterFillsRef.current || [];

  // Setup dashoffset for all letter strokes
  strokesList.forEach((strokeEl) => {
    if (strokeEl && strokeEl.getTotalLength) {
      const len = strokeEl.getTotalLength();
      gsap.set(strokeEl, {
        strokeDasharray: `${len + 2} ${len + 2}`,
        strokeDashoffset: len + 2,
      });
    }
  });

  let currentTimelineTime = 0.55;

  // Iterate letter by letter (R -> A -> T -> R -> I)
  let globalStrokeIndexCounter = 0;
  RATRI_LETTERS.forEach((letterDef, letterIdx) => {
    const letterStrokesCount = letterDef.strokes.length;
    const letterStrokes: SVGPathElement[] = [];

    for (let i = 0; i < letterStrokesCount; i++) {
      const strokeEl = strokesList[globalStrokeIndexCounter];
      if (strokeEl) {
        letterStrokes.push(strokeEl);
      }
      globalStrokeIndexCounter++;
    }

    const fillEl = fillsList[letterIdx];

    // Animate strokes sequentially within this letter
    letterStrokes.forEach((strokeEl) => {
      if (strokeEl && strokeEl.getTotalLength) {
        const len = strokeEl.getTotalLength();
        const strokeDuration = Math.max(0.12, (len / 180) * 0.35);

        tl.to(
          strokeEl,
          {
            strokeDashoffset: 0,
            duration: strokeDuration,
            ease: "power1.inOut",
          },
          currentTimelineTime
        );

        currentTimelineTime += strokeDuration * 0.85; // Natural continuous stroke writing pace!
      }
    });

    // Dissolve solid letter fill with glowing bloom right as letter strokes complete
    if (fillEl) {
      tl.to(
        fillEl,
        {
          opacity: 1,
          scale: 1,
          duration: 0.28,
          ease: "back.out(1.5)",
        },
        currentTimelineTime - 0.05
      );
    }

    currentTimelineTime += 0.06; // Small pause before starting next letter!
  });

  // 4. Color Light Sweep Across Complete Wordmark
  if (sweepRef.current) {
    tl.fromTo(
      sweepRef.current,
      { x: "-100%", opacity: 0 },
      {
        x: "100%",
        opacity: 0.85,
        duration: INTRO_CONFIG.colorSweepDuration,
        ease: "power2.inOut",
      },
      currentTimelineTime + 0.1
    );
  }

  // 5. Tagline Subtitle Reveal
  if (taglineRef.current) {
    tl.to(
      taglineRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
      },
      currentTimelineTime + 0.35
    );
  }

  // 6. Hold Settle
  tl.to({}, { duration: INTRO_CONFIG.holdDuration });

  // 7. Exit Transition
  if (containerRef.current) {
    tl.to(containerRef.current, {
      opacity: 0,
      scale: 1.03,
      duration: INTRO_CONFIG.exitDuration,
      ease: "power2.inOut",
    });
  }

  return tl;
}
