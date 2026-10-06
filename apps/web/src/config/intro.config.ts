export const INTRO_CONFIG = {
  /** Minimum visual intro duration in ms */
  minimumDuration: 2200,
  /** Maximum safety timeout in ms (forces exit if app loading is delayed) */
  maximumDuration: 3800,
  /** Session storage key to track if user has seen intro in current browser session */
  storageKey: "ratri_intro_seen_session",

  // Timeline durations in seconds (GSAP unit)
  backgroundRevealDuration: 0.3,
  emblemStrokeDuration: 0.8,
  wordmarkRevealDuration: 0.6,
  colorSweepDuration: 0.8,
  settleDuration: 0.3,
  holdDuration: 0.2,
  exitDuration: 0.5,
};
