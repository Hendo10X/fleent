import confetti from "canvas-confetti";

const BRAND_COLORS = [
  "#FF8629", // orange
  "#FF4D8D", // pink
  "#3D8BFF", // blue
  "#1FC85A", // green
  "#7A4DFF", // violet
  "#E8A100", // amber
];

/**
 * Celebration burst for completing a *whole* task (a standalone task, or a
 * parent whose every step is now done).
 *
 * Fires two angled cannons from the lower corners so the spray fills the
 * middle of the screen - feels like a "yes!" without being a full-screen
 * takeover. No-ops safely on the server / before hydration.
 */
export function fireTaskConfetti() {
  if (typeof window === "undefined") return;

  const base = {
    spread: 70,
    startVelocity: 45,
    ticks: 220,
    gravity: 0.9,
    scalar: 0.9,
    colors: BRAND_COLORS,
    disableForReducedMotion: true,
  } as const;

  confetti({ ...base, particleCount: 60, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...base, particleCount: 60, angle: 120, origin: { x: 1, y: 0.7 } });
}
