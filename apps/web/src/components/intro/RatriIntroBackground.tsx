import type React from "react";

interface RatriIntroBackgroundProps {
  bgRef: React.RefObject<HTMLDivElement | null>;
  auraRef: React.RefObject<HTMLDivElement | null>;
}

export function RatriIntroBackground({ bgRef, auraRef }: RatriIntroBackgroundProps) {
  return (
    <div
      ref={bgRef}
      className="absolute inset-0 bg-neutral-950 flex items-center justify-center overflow-hidden pointer-events-none z-10"
    >
      {/* Soft Ambient Radial Light Field */}
      <div
        ref={auraRef}
        className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-rose-600/20 via-amber-500/10 to-transparent blur-3xl opacity-0 transform scale-75 transition-all duration-700 pointer-events-none"
      />
    </div>
  );
}
