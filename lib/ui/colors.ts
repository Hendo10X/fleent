/**
 * Deterministic, ADHD-friendly accent palette for task rows.
 *
 * Goals:
 *  - Each task always gets the same color (variety, no chaos).
 *  - The palette is gentle (pastel) so dense lists never feel noisy.
 *  - Six hues give enough perceived variety while keeping the grid familiar.
 */
export type TaskAccent = {
  /** Soft background tint, e.g. for left stripes or hover. */
  soft: string;
  /** Saturated dot / text, used for the leading bullet. */
  dot: string;
  /** Tailwind ring color (used for focus / completion burst). */
  ring: string;
};

const PALETTE: TaskAccent[] = [
  { soft: "#FFE9DA", dot: "#FF8629", ring: "rgba(255,134,41,0.35)" }, // orange
  { soft: "#FFE0E9", dot: "#FF4D8D", ring: "rgba(255,77,141,0.35)" }, // pink
  { soft: "#E6F1FF", dot: "#3D8BFF", ring: "rgba(61,139,255,0.35)" }, // blue
  { soft: "#E5FBEA", dot: "#1FC85A", ring: "rgba(31,200,90,0.35)" }, // green
  { soft: "#F0E9FF", dot: "#7A4DFF", ring: "rgba(122,77,255,0.35)" }, // violet
  { soft: "#FFF6D8", dot: "#E8A100", ring: "rgba(232,161,0,0.35)" }, // amber
];

/** Tiny FNV-1a hash → palette index. Stable across renders. */
function indexFor(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return Math.abs(h) % PALETTE.length;
}

export function accentFor(seed: string): TaskAccent {
  return PALETTE[indexFor(seed)];
}

/** Difficulty 1–3 mapped to perceivable colors + names. */
export const DIFFICULTY_META: Record<
  number,
  { label: string; dot: string; soft: string }
> = {
  1: { label: "Easy", dot: "#1FC85A", soft: "#E5FBEA" },
  2: { label: "Medium", dot: "#3D8BFF", soft: "#E6F1FF" },
  3: { label: "Hard", dot: "#FF4D8D", soft: "#FFE0E9" },
};
