/**
 * Flint focus-scene constants.
 *
 * All numeric and palette values used by `<Fire />`, `<Bean />`, and
 * `<FocusScene />` live here. Magic numbers in the component files would
 * make a future palette/timing pass a nightmare — every dial sits in this
 * file so the visual designer can tune them in one place.
 */

import type { Easing } from "motion/react";

// ---------------------------------------------------------------------------
// Brand palette
// ---------------------------------------------------------------------------

export const BRAND_ORANGE = "#FF8C2A" as const;

export const FIRE_COLORS = {
  outer: "#D85A30", // coral, outermost layer
  mid: "#FF8C2A", // brand orange, middle layer
  core: "#FFD23F", // golden yellow, innermost layer
  ember: "#FFE8D6", // cream, particles
  smoke: "rgba(60, 40, 30, 0.15)", // appears stage 3+
  log: "#5F2E14", // base log under flame
} as const;

/**
 * Bean body-colour stops. Used as a `useTransform` interpolation array on
 * the shared intensity motion-value.
 */
export const BEAN_BODY_STOPS = {
  inputs: [0.0, 0.3, 0.6, 0.85, 1.0],
  outputs: ["#9FC5E8", "#D4E4F2", "#FFE0BD", "#FFC890", "#FFB07A"],
} as const;

export const BEAN_CHEEK_COLOR = "#FF8C7A";
export const BEAN_EYE_COLOR_COLD = "#1F3A5F";
export const BEAN_EYE_COLOR_WARM = "#2C1810";

// ---------------------------------------------------------------------------
// Fire stages
// ---------------------------------------------------------------------------

export type FireStageId = 1 | 2 | 3 | 4 | 5;

export type FireStage = {
  id: FireStageId;
  /** Lower-bound intensity (inclusive). */
  min: number;
  flameHeightPx: number;
  particlesPerSecond: number;
  /** Layers shown by id from outer → core. */
  layers: ReadonlyArray<"outer" | "mid" | "core">;
  hasSideLicks: boolean;
  hasCrownWisp: boolean;
};

export const FIRE_STAGES: ReadonlyArray<FireStage> = [
  {
    id: 1,
    min: 0.0,
    flameHeightPx: 12,
    particlesPerSecond: 0,
    layers: ["core"],
    hasSideLicks: false,
    hasCrownWisp: false,
  },
  {
    id: 2,
    min: 0.15,
    flameHeightPx: 28,
    particlesPerSecond: 2,
    layers: ["mid", "core"],
    hasSideLicks: false,
    hasCrownWisp: false,
  },
  {
    id: 3,
    min: 0.35,
    flameHeightPx: 56,
    particlesPerSecond: 6,
    layers: ["outer", "mid", "core"],
    hasSideLicks: false,
    hasCrownWisp: false,
  },
  {
    id: 4,
    min: 0.6,
    flameHeightPx: 88,
    particlesPerSecond: 12,
    layers: ["outer", "mid", "core"],
    hasSideLicks: true,
    hasCrownWisp: false,
  },
  {
    id: 5,
    min: 0.85,
    flameHeightPx: 120,
    particlesPerSecond: 20,
    layers: ["outer", "mid", "core"],
    hasSideLicks: true,
    hasCrownWisp: true,
  },
] as const;

// ---------------------------------------------------------------------------
// Bean thresholds
// ---------------------------------------------------------------------------

export const BEAN_THRESHOLDS = {
  /** Below this, eyes are sad arcs and shiver is active. */
  shiverMax: 0.2,
  /** Below this, mouth is frown. */
  frownMax: 0.3,
  /** Above this, mouth is smile. */
  smileMin: 0.6,
  /** Ice crystals fully visible below this, gone by `iceGoneAt`. */
  iceVisibleMax: 0.3,
  iceGoneAt: 0.5,
  /** Cheek blush appears between these. */
  blushStart: 0.5,
  blushFull: 0.85,
  /** One-shot "warm sigh" trigger. */
  sighAt: 0.85,
  /** Eye colour transition. */
  eyeWarmAt: 0.6,
  /** Bob duration interpolation. */
  bobSlowAt: 0.7,
  shiverLineVisibleMax: 0.25,
  shiverLineGoneAt: 0.4,
} as const;

// ---------------------------------------------------------------------------
// Motion timings
// ---------------------------------------------------------------------------

/** Bezier matching the brief's cubic-bezier(.25,.46,.45,.94). */
export const STAGE_TRANSITION_EASE: Easing = [0.25, 0.46, 0.45, 0.94];

export const STAGE_TRANSITION_MS = 600;
export const REDUCED_MOTION_FADE_MS = 200;

/** Soft overshoot for Bean's "warm sigh". */
export const SIGH_EASE: Easing = [0.34, 1.56, 0.64, 1];
export const SIGH_DURATION_MS = 800;

/** Breath translate amplitude in px (each flame layer ±2 px on x). */
export const BREATH_AMPLITUDE_PX = 2;
export const BREATH_BASE_DURATION_S = 1.6;
export const BREATH_JITTER_S = 0.4;

/** Flicker opacity range. */
export const FLICKER_OPACITY = { min: 0.92, max: 1.0 } as const;
export const FLICKER_DURATION_S = 0.4;

/** Bean idle bob. */
export const BEAN_BOB_AMPLITUDE_PX = 2;
export const BEAN_BOB_DURATION_COLD_S = 2.4;
export const BEAN_BOB_DURATION_WARM_S = 3.2;

/** Bean shiver. */
export const BEAN_SHIVER_AMPLITUDE_PX = 1;
/** 12 Hz tremor → half-cycle is 1000/12/2 ≈ 41 ms. */
export const BEAN_SHIVER_HALF_PERIOD_S = 1 / 12 / 2;

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

/**
 * The fire is drawn into a 160×160 SVG viewbox, with origin (80, 160) at the
 * base centre. Flame paths sweep upward (negative y).
 */
export const FIRE_VIEWBOX = { width: 160, height: 160 } as const;
export const FIRE_BASE_X = 80;
export const FIRE_BASE_Y = 160;

/** Log dimensions, drawn at the base. */
export const FIRE_LOG = {
  width: 60,
  height: 8,
  shadowWidth: 70,
  shadowHeight: 5,
} as const;

/** Bean SVG body box. Square viewBox + circular body. */
export const BEAN_VIEWBOX = { width: 120, height: 120 } as const;
export const BEAN_BODY = { cx: 60, cy: 60, r: 45 } as const;

/**
 * Discrete mood presets. The `intensity` value used to drive the
 * underlying transforms when `mood` is set explicitly on `<Bean />`.
 *
 * Keeping moods as "synthetic intensities" lets the same body-colour /
 * cheek-blush / ice-decor pipeline serve both modes — no parallel rendering
 * path required.
 */
export const BEAN_MOOD_INTENSITY = {
  cold: 0.05,
  ideal: 0.55,
  warm: 0.95,
  sleepy: 0.7,
} as const;

