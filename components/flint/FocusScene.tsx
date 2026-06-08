"use client";

/**
 * `<FocusScene />` - composition only.
 *
 * Stacks Fire above Bean in a single vertical column and forwards the
 * shared `intensity` to both. No business logic, no timer, no clock. The
 * caller computes intensity (e.g. `elapsed / total` from a Pomodoro
 * session) and passes it straight in.
 *
 * `reducedMotion` is forwarded as an explicit override; if not supplied,
 * each child honours `prefers-reduced-motion` on its own.
 */

import { Fire } from "./Fire";
import { Bean } from "./Bean";
import type { FocusSceneProps } from "@/lib/flint/types";

type Props = FocusSceneProps & { reducedMotion?: boolean };

export function FocusScene({ intensity, paused, reducedMotion, className }: Props) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-4 ${className ?? ""}`}
    >
      <Fire
        intensity={intensity}
        paused={paused}
        reducedMotion={reducedMotion}
        className="w-40 sm:w-48"
      />
      <Bean
        intensity={intensity}
        reducedMotion={reducedMotion}
        className="w-28 sm:w-32"
      />
    </div>
  );
}
