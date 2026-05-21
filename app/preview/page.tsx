"use client";

/**
 * Engineering preview for the Flint focus scene.
 *
 * Not a production surface. Provides a slider that drives `intensity`
 * 0 → 1, a "force reduced motion" toggle, and a one-shot 0 → 1 ramp button
 * for smoke-testing stage transitions.
 */

import { useEffect, useRef, useState } from "react";
import { FocusScene } from "@/components/flint/FocusScene";
import { BRAND_ORANGE } from "@/lib/flint/constants";

export default function PreviewPage() {
  const [intensity, setIntensity] = useState(0);
  const [forceReduced, setForceReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const rampRef = useRef<number | null>(null);

  // Cancel an in-flight ramp on unmount.
  useEffect(() => {
    return () => {
      if (rampRef.current !== null) {
        window.cancelAnimationFrame(rampRef.current);
      }
    };
  }, []);

  function runRamp(durationMs = 10_000) {
    if (rampRef.current !== null) {
      window.cancelAnimationFrame(rampRef.current);
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setIntensity(t);
      if (t < 1) {
        rampRef.current = window.requestAnimationFrame(tick);
      } else {
        rampRef.current = null;
      }
    };
    rampRef.current = window.requestAnimationFrame(tick);
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between gap-8 p-6"
      style={{ backgroundColor: BRAND_ORANGE }}
    >
      <div className="flex w-full max-w-md flex-1 items-center justify-center">
        <FocusScene
          intensity={intensity}
          paused={paused}
          reducedMotion={forceReduced}
        />
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white/95 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <label htmlFor="intensity" className="text-sm font-medium text-neutral-900">
            intensity
          </label>
          <span className="font-mono text-sm tabular-nums text-neutral-700">
            {intensity.toFixed(2)}
          </span>
        </div>
        <input
          id="intensity"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={intensity}
          onChange={(e) => setIntensity(parseFloat(e.target.value))}
          className="mt-2 w-full"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-900">
            <input
              type="checkbox"
              checked={forceReduced}
              onChange={(e) => setForceReduced(e.target.checked)}
            />
            Force reduced motion
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-900">
            <input
              type="checkbox"
              checked={paused}
              onChange={(e) => setPaused(e.target.checked)}
            />
            Paused
          </label>

          <button
            type="button"
            onClick={() => runRamp(10_000)}
            className="ml-auto rounded-full bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            Animate 0 → 1 over 10s
          </button>
        </div>
      </div>
    </main>
  );
}
