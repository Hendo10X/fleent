"use client";

import { motion } from "motion/react";

/**
 * Tiny celebratory burst that fires when a task is marked complete.
 *
 * Six dust particles radiate outward in a wide arc with brand-flavored
 * colors. CSS-only (motion's `keyframes` + transform) — no canvas, no deps,
 * unmounts cleanly via the parent's `AnimatePresence`.
 *
 * Designed to feel like a small "yes!" — not a parade.
 */
const PARTICLES = [
  { angle: -90, color: "#FF8629" },
  { angle: -45, color: "#FF4D8D" },
  { angle: 0, color: "#3D8BFF" },
  { angle: 45, color: "#1FC85A" },
  { angle: 90, color: "#7A4DFF" },
  { angle: 135, color: "#E8A100" },
];

const DISTANCE = 22; // px

export function CompletionBurst() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {PARTICLES.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * DISTANCE;
        const y = Math.sin(rad) * DISTANCE;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, scale: 0.4, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1, x, y }}
            transition={{ duration: 0.55, ease: [0.2, 0.7, 0.3, 1] }}
            style={{ backgroundColor: p.color }}
            className="absolute size-1.5 rounded-full"
          />
        );
      })}
    </span>
  );
}
