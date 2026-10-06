import type React from "react";

export interface LetterGroup {
  char: string;
  strokes: string[];
  fillPath: string;
}

export const RATRI_LETTERS: LetterGroup[] = [
  {
    char: "R",
    strokes: [
      "M 28,102 L 28,18",
      "M 28,18 C 76,18 98,24 98,46 C 98,68 76,72 28,72",
      "M 56,68 L 94,102",
    ],
    fillPath:
      "M 20,102 L 20,12 C 20,12 78,12 104,46 C 104,72 80,78 44,78 L 44,102 Z M 44,28 L 44,62 C 64,62 84,58 84,46 C 84,34 64,28 44,28 Z M 58,68 L 98,102 L 78,102 L 44,68 Z",
  },
  {
    char: "A",
    strokes: [
      "M 118,102 L 157,18",
      "M 157,18 L 196,102",
      "M 132,70 L 182,70",
    ],
    fillPath:
      "M 112,102 L 150,12 L 164,12 L 202,102 L 182,102 L 171,76 L 143,76 L 132,102 Z M 148,60 L 166,60 L 157,36 Z",
  },
  {
    char: "T",
    strokes: [
      "M 216,18 L 294,18",
      "M 255,18 L 255,102",
    ],
    fillPath:
      "M 210,12 L 300,12 L 300,28 L 267,28 L 267,102 L 243,102 L 243,28 L 210,28 Z",
  },
  {
    char: "R",
    strokes: [
      "M 318,102 L 318,18",
      "M 318,18 C 366,18 388,24 388,46 C 388,68 366,72 318,72",
      "M 346,68 L 384,102",
    ],
    fillPath:
      "M 310,102 L 310,12 C 310,12 368,12 394,46 C 394,72 370,78 334,78 L 334,102 Z M 334,28 L 334,62 C 354,62 374,58 374,46 C 374,34 354,28 334,28 Z M 348,68 L 388,102 L 368,102 L 334,68 Z",
  },
  {
    char: "I",
    strokes: [
      "M 412,18 L 458,18",
      "M 435,18 L 435,102",
      "M 412,102 L 458,102",
    ],
    fillPath:
      "M 406,12 L 464,12 L 464,28 L 447,28 L 447,92 L 464,92 L 464,102 L 406,102 L 406,92 L 423,92 L 423,28 L 406,28 Z",
  },
];

interface RatriWordmarkProps {
  emblemRef: React.RefObject<SVGSVGElement | null>;
  emblemStrokeRef: React.RefObject<SVGPathElement | null>;
  emblemFillRef: React.RefObject<SVGPathElement | null>;
  wordmarkSvgRef: React.RefObject<SVGSVGElement | null>;
  letterStrokesRef: React.MutableRefObject<(SVGPathElement | null)[]>;
  letterFillsRef: React.MutableRefObject<(SVGPathElement | null)[]>;
  sweepRef: React.RefObject<HTMLDivElement | null>;
  taglineRef: React.RefObject<HTMLParagraphElement | null>;
}

export function RatriWordmark({
  emblemRef,
  emblemStrokeRef,
  emblemFillRef,
  wordmarkSvgRef,
  letterStrokesRef,
  letterFillsRef,
  sweepRef,
  taglineRef,
}: RatriWordmarkProps) {
  return (
    <div
      aria-label="RATRI Real-Time Social Platform"
      className="flex flex-col items-center justify-center space-y-6 select-none text-center relative z-20 px-4 w-full max-w-2xl"
    >
      {/* 1. Emblem SVG (Vector Stroke Draw + Fill Ignite) */}
      <div className="relative flex items-center justify-center">
        {/* Glow Aura behind Emblem */}
        <div className="absolute w-24 h-24 sm:w-32 sm:h-32 bg-rose-600/35 rounded-full blur-2xl pointer-events-none" />

        <svg
          ref={emblemRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 46"
          className="w-16 h-16 sm:w-24 sm:h-24 relative z-10 opacity-0 transform scale-75 filter drop-shadow-[0_0_35px_rgba(225,29,72,0.85)]"
        >
          {/* Animated Stroke Outline */}
          <path
            ref={emblemStrokeRef}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07-1.498 0-3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
          />
          {/* Solid Gradient Fill (Reveals on completion) */}
          <path
            ref={emblemFillRef}
            fill="url(#emblem-gradient)"
            className="opacity-0"
            d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07-1.498 0-3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
          />
          <defs>
            <linearGradient id="emblem-gradient" x1="0" y1="0" x2="48" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 2. Slow Vector Stroke Handwriting / Laser Writing SVG Wordmark */}
      <div className="relative overflow-visible px-2 py-2 w-full flex justify-center items-center">
        <svg
          ref={wordmarkSvgRef}
          viewBox="0 0 475 118"
          className="w-full max-w-[320px] sm:max-w-[540px] md:max-w-[620px] h-auto overflow-visible filter drop-shadow-[0_0_30px_rgba(225,29,72,0.5)]"
        >
          <defs>
            {/* Glowing Laser Stroke Gradient */}
            <linearGradient id="laser-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            {/* Premium Gold/Rose Text Fill Gradient */}
            <linearGradient id="text-solid-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            {/* Intense Laser Glow Filter */}
            <filter id="laser-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur1" />
              <feGaussianBlur stdDeviation="8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Letter Groups */}
          {RATRI_LETTERS.map((letter, letterIdx) => (
            <g key={letter.char + letterIdx} id={`letter-group-${letterIdx}`}>
              {/* Background Guide Line (Ghost Outlines) */}
              {letter.strokes.map((d, strokeIdx) => (
                <path
                  key={`guide-${letterIdx}-${strokeIdx}`}
                  d={d}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Animated Laser Stroke Writing Paths */}
              {letter.strokes.map((d, strokeIdx) => {
                const globalStrokeIndex =
                  RATRI_LETTERS.slice(0, letterIdx).reduce(
                    (acc, l) => acc + l.strokes.length,
                    0
                  ) + strokeIdx;

                return (
                  <path
                    key={`stroke-${letterIdx}-${strokeIdx}`}
                    ref={(el) => {
                      if (letterStrokesRef.current) {
                        letterStrokesRef.current[globalStrokeIndex] = el;
                      }
                    }}
                    d={d}
                    fill="none"
                    stroke="url(#laser-stroke)"
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#laser-glow)"
                    className="opacity-95"
                  />
                );
              })}

              {/* Solid Rich Letter Fill (Dissolves in upon stroke completion) */}
              <path
                ref={(el) => {
                  if (letterFillsRef.current) {
                    letterFillsRef.current[letterIdx] = el;
                  }
                }}
                d={letter.fillPath}
                fill="url(#text-solid-fill)"
                className="opacity-0 filter drop-shadow-[0_0_20px_rgba(225,29,72,0.7)]"
              />
            </g>
          ))}
        </svg>

        {/* 3. Light Sweep Overlay */}
        <div
          ref={sweepRef}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-400 to-amber-300 opacity-0 pointer-events-none mix-blend-screen transform -translate-x-full"
        />
      </div>

      {/* 4. Subtitle Tagline */}
      <p
        ref={taglineRef}
        className="text-xs sm:text-sm font-bold tracking-[0.35em] text-neutral-400 uppercase opacity-0 transform translate-y-3 font-mono"
      >
        Watch • Talk • Hang Out
      </p>
    </div>
  );
}
