/**
 * Public types for the Flint focus scene.
 *
 * The scene is a pure function of `intensity ∈ [0, 1]`. No timer logic, no
 * session state, no clock — just the visual.
 */

export type FireProps = {
  /** Clamped internally to [0, 1]. */
  intensity: number;
  /** Freezes breath/flicker and stops sparks; stage stays current. */
  paused?: boolean;
  /** Explicit override; otherwise honours `prefers-reduced-motion`. */
  reducedMotion?: boolean;
  /** For positioning only — do not pass decorative styles. */
  className?: string;
};

/**
 * Discrete mascot variants. When provided, `mood` short-circuits the
 * intensity-driven appearance and renders a known, named expression.
 *
 *  - `cold`   — frozen blue, sad eyes, frown, snowflakes + shiver lines
 *  - `ideal`  — neutral cream, happy eyes, soft smile (the "in the zone" look)
 *  - `warm`   — cosy peach, smile + cheek blush
 *  - `sleepy` — closed eyes, drowsy smile (used for breaks / paused state)
 */
export type BeanMood = "cold" | "ideal" | "warm" | "sleepy";

export type BeanProps = {
  /** Clamped internally to [0, 1]. Ignored when `mood` is set. */
  intensity: number;
  /** Optional explicit mood override. */
  mood?: BeanMood;
  reducedMotion?: boolean;
  className?: string;
};

export type FocusSceneProps = {
  intensity: number;
  paused?: boolean;
  className?: string;
};
