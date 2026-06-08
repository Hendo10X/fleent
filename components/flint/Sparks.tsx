"use client";

/**
 * Ember spark emitter. Split out from `Fire.tsx` so the parent stays under
 * the 250-line budget and so reduced-motion paths can omit tsParticles
 * entirely (no import = no engine load).
 *
 * Configured per the brief:
 *  - emits 4 px below the current flame tip
 *  - drift upward 30–50 px/s with ±20° angular variance
 *  - fade opacity 1 → 0 over 1.2 s
 *  - size 1–2 px, colour `FIRE_COLORS.ember`
 *  - fpsLimit 60, detectRetina, pauseOnBlur, pauseOnOutsideViewport
 */

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import {
  FIRE_BASE_Y,
  FIRE_COLORS,
  FIRE_VIEWBOX,
} from "@/lib/flint/constants";

/**
 * One-shot module-level init. The exception to the brief's "no useEffect"
 * rule is gated to the engine-bootstrap line below - there is no React-safe
 * way to await an engine outside an effect with `@tsparticles/react@3`.
 */
let enginePromise: Promise<void> | null = null;
function ensureEngineReady(): Promise<void> {
  if (!enginePromise) {
    enginePromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }
  return enginePromise;
}

type SparksProps = {
  /** Particles per second. 0 disables the emitter. */
  rate: number;
  /** Flame tip height in px (used to compute emitter position). */
  flameHeightPx: number;
  /** Pauses both the engine and our emitter. */
  paused: boolean;
  /** Unique DOM id so multiple Fire instances coexist. */
  id?: string;
};

export function Sparks({ rate, flameHeightPx, paused, id = "flint-sparks" }: SparksProps) {
  const [ready, setReady] = useState(false);

  // Bootstrap the engine once per JS bundle. (Brief permits effects for
  // listeners / one-shot triggers; this is the latter.)
  useEffect(() => {
    let cancelled = false;
    ensureEngineReady().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo<ISourceOptions>(() => {
    // 4 px below tip → larger y in SVG-down-positive coords.
    const tipY = FIRE_BASE_Y - flameHeightPx;
    const emitYpct = ((tipY + 4) / FIRE_VIEWBOX.height) * 100;
    const emitXpct = 50;

    return {
      fpsLimit: 60,
      detectRetina: true,
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
      fullScreen: { enable: false },
      background: { color: "transparent" },
      particles: {
        number: { value: 0 },
        color: { value: FIRE_COLORS.ember },
        opacity: {
          value: { min: 0, max: 1 },
          animation: {
            enable: true,
            speed: 1 / 1.2,
            startValue: "max",
            destroy: "min",
            sync: false,
          },
        },
        size: { value: { min: 1, max: 2 } },
        move: {
          enable: true,
          direction: "top",
          speed: { min: 30, max: 50 },
          outModes: { default: "destroy" },
          // 40° total spread (±20°).
          angle: { value: 40, offset: 0 },
        },
        life: { duration: { value: 1.2, sync: false }, count: 1 },
      },
      emitters:
        rate > 0
          ? [
              {
                direction: "top",
                rate: { delay: 1 / rate, quantity: 1 },
                position: { x: emitXpct, y: emitYpct },
                size: { width: 0, height: 0, mode: "precise" },
              },
            ]
          : [],
    };
  }, [rate, flameHeightPx]);

  if (!ready || rate <= 0 || paused) return null;

  return (
    <Particles
      id={id}
      options={options}
      className="pointer-events-none absolute inset-0"
    />
  );
}
