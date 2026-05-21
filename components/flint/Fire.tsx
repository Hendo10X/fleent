"use client";

/**
 * `<Fire />` — the central focus-scene visual.
 *
 * Pure function of `intensity ∈ [0, 1]`. Renders a teardrop-shaped flame
 * (1–3 concentric layers, optional side licks + crown wisp), a static log
 * and shadow underneath, and an ember spark emitter pinned 4 px below the
 * flame tip.
 *
 * All looping motion (breath, flicker) is `transform`/`opacity` only and
 * driven by Framer Motion's `repeat: Infinity, repeatType: "mirror"` so the
 * compositor can hand it off to the GPU.
 *
 * Stage transitions animate the path `d` over 600 ms with a smooth easing —
 * all stage paths share the same `M, C, C, Z` structure so SVG-path
 * interpolation produces a clean morph rather than a snap.
 */

import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BREATH_AMPLITUDE_PX,
  BREATH_BASE_DURATION_S,
  BREATH_JITTER_S,
  FIRE_BASE_X,
  FIRE_BASE_Y,
  FIRE_COLORS,
  FIRE_LOG,
  FIRE_STAGES,
  FIRE_VIEWBOX,
  FLICKER_DURATION_S,
  FLICKER_OPACITY,
  REDUCED_MOTION_FADE_MS,
  STAGE_TRANSITION_EASE,
  STAGE_TRANSITION_MS,
  type FireStage,
} from "@/lib/flint/constants";
import type { FireProps } from "@/lib/flint/types";
import { Sparks } from "./Sparks";

// All paths share `M, C, C, Z` structure → smooth SVG path interpolation.
const FLAME_PATH_SPARK =
  "M 80 160 C 75 156, 73 152, 80 148 C 87 152, 85 156, 80 160 Z";
const FLAME_PATH_EMBER =
  "M 80 160 C 72 152, 70 140, 80 132 C 90 140, 88 152, 80 160 Z";
const FLAME_PATH_FLAME =
  "M 80 160 C 66 144, 64 122, 80 104 C 96 122, 94 144, 80 160 Z";
const FLAME_PATH_FIRE =
  "M 80 160 C 60 132, 58 100, 80 72 C 102 100, 100 132, 80 160 Z";
const FLAME_PATH_BLAZE =
  "M 80 160 C 56 116, 54 80, 80 40 C 106 80, 104 116, 80 160 Z";

const STAGE_PATH: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: FLAME_PATH_SPARK,
  2: FLAME_PATH_EMBER,
  3: FLAME_PATH_FLAME,
  4: FLAME_PATH_FIRE,
  5: FLAME_PATH_BLAZE,
};

const FLAME_PATH_LICK_LEFT =
  "M 58 150 C 50 142, 49 132, 58 124 C 67 132, 66 142, 58 150 Z";
const FLAME_PATH_LICK_RIGHT =
  "M 102 150 C 94 142, 93 132, 102 124 C 111 132, 110 142, 102 150 Z";
const FLAME_PATH_CROWN =
  "M 80 36 C 76 30, 75 22, 80 14 C 85 22, 84 30, 80 36 Z";

type LayerKind = "outer" | "mid" | "core";

const LAYER_COLOR: Record<LayerKind, string> = {
  outer: FIRE_COLORS.outer,
  mid: FIRE_COLORS.mid,
  core: FIRE_COLORS.core,
};

const LAYER_SCALE: Record<LayerKind, number> = {
  outer: 1.0,
  mid: 0.72,
  core: 0.48,
};

const LAYER_OFFSET: Record<LayerKind, number> = {
  outer: 0,
  mid: 1,
  core: 2,
};

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function stageFor(intensity: number): FireStage {
  let current = FIRE_STAGES[0];
  for (const s of FIRE_STAGES) {
    if (intensity >= s.min) current = s;
  }
  return current;
}

type FlameLayerProps = {
  layer: LayerKind;
  path: string;
  visible: boolean;
  paused: boolean;
  reducedMotion: boolean;
};

/**
 * One flame layer. Scales around the base so concentric layers share the
 * same anchor. The `<motion.g>` wrapper handles the breath translate, while
 * the `<motion.path>` animates the `d` attribute on stage change and
 * flickers opacity in steady state.
 */
function FlameLayer({
  layer,
  path,
  visible,
  paused,
  reducedMotion,
}: FlameLayerProps) {
  // Stable per-instance breath duration → layers visibly out of sync.
  const breathDuration = useMemo(
    () => BREATH_BASE_DURATION_S + Math.random() * BREATH_JITTER_S,
    [],
  );
  const breathDelay = LAYER_OFFSET[layer] * 0.15;
  const color = LAYER_COLOR[layer];
  const scale = LAYER_SCALE[layer];

  const scaleTransform = `translate(${FIRE_BASE_X} ${FIRE_BASE_Y}) scale(${scale}) translate(${-FIRE_BASE_X} ${-FIRE_BASE_Y})`;

  const stillBreath = paused || reducedMotion;
  const breathAnim = stillBreath
    ? { x: 0 }
    : { x: [-BREATH_AMPLITUDE_PX, BREATH_AMPLITUDE_PX] };
  const breathTransition = stillBreath
    ? { duration: 0 }
    : {
        duration: breathDuration,
        ease: "easeInOut" as const,
        repeat: Infinity,
        repeatType: "mirror" as const,
        delay: breathDelay,
      };

  const stillFlicker = paused || reducedMotion;

  return (
    <g transform={scaleTransform}>
      <motion.g
        aria-hidden
        animate={{ ...breathAnim, opacity: visible ? 1 : 0 }}
        transition={{
          x: breathTransition,
          opacity: {
            duration: STAGE_TRANSITION_MS / 1000,
            ease: STAGE_TRANSITION_EASE,
          },
        }}
      >
        <motion.path
          d={path}
          fill={color}
          aria-hidden
          animate={
            stillFlicker
              ? { d: path }
              : {
                  d: path,
                  opacity: [FLICKER_OPACITY.min, FLICKER_OPACITY.max],
                }
          }
          transition={{
            d: {
              duration: STAGE_TRANSITION_MS / 1000,
              ease: STAGE_TRANSITION_EASE,
            },
            opacity: stillFlicker
              ? { duration: 0 }
              : {
                  duration: FLICKER_DURATION_S,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "mirror",
                },
          }}
        />
      </motion.g>
    </g>
  );
}

/**
 * Stage-aware extras: side licks (stage 4+) and the crown wisp (stage 5).
 * They live inside Fire so they get the same breath/flicker treatment.
 */
function FlameExtras({
  stage,
  paused,
  reducedMotion,
}: {
  stage: FireStage;
  paused: boolean;
  reducedMotion: boolean;
}) {
  return (
    <AnimatePresence>
      {stage.hasSideLicks && (
        <motion.g
          key="licks"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: STAGE_TRANSITION_MS / 1000,
            ease: STAGE_TRANSITION_EASE,
          }}
        >
          <SidePath
            path={FLAME_PATH_LICK_LEFT}
            paused={paused}
            reducedMotion={reducedMotion}
          />
          <SidePath
            path={FLAME_PATH_LICK_RIGHT}
            paused={paused}
            reducedMotion={reducedMotion}
          />
        </motion.g>
      )}
      {stage.hasCrownWisp && (
        <motion.g
          key="crown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: STAGE_TRANSITION_MS / 1000,
            ease: STAGE_TRANSITION_EASE,
          }}
        >
          <SidePath
            path={FLAME_PATH_CROWN}
            paused={paused}
            reducedMotion={reducedMotion}
          />
        </motion.g>
      )}
    </AnimatePresence>
  );
}

function SidePath({
  path,
  paused,
  reducedMotion,
}: {
  path: string;
  paused: boolean;
  reducedMotion: boolean;
}) {
  const breathDuration = useMemo(
    () => BREATH_BASE_DURATION_S + Math.random() * BREATH_JITTER_S,
    [],
  );
  const still = paused || reducedMotion;
  return (
    <motion.path
      d={path}
      fill={FIRE_COLORS.mid}
      aria-hidden
      animate={still ? { x: 0 } : { x: [-1.5, 1.5] }}
      transition={
        still
          ? { duration: 0 }
          : {
              duration: breathDuration,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }
      }
    />
  );
}

export function Fire({
  intensity,
  paused = false,
  reducedMotion,
  className,
}: FireProps) {
  const safe = clamp01(intensity);
  const stage = stageFor(safe);
  const osReduced = useReducedMotion();
  const reduced = reducedMotion ?? Boolean(osReduced);

  return (
    <div
      className={`relative ${className ?? ""}`}
      // No `width` here — let the consumer's className (or parent) decide.
      // Inline width would beat the Tailwind utility and cause overflow.
      style={{
        aspectRatio: `${FIRE_VIEWBOX.width} / ${FIRE_VIEWBOX.height}`,
      }}
    >
      <svg
        viewBox={`0 0 ${FIRE_VIEWBOX.width} ${FIRE_VIEWBOX.height}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {/* Base shadow + log — never animate. */}
        <ellipse
          cx={FIRE_BASE_X}
          cy={FIRE_BASE_Y + 6}
          rx={FIRE_LOG.shadowWidth / 2}
          ry={FIRE_LOG.shadowHeight / 2}
          fill="rgba(0,0,0,0.2)"
        />
        <rect
          x={FIRE_BASE_X - FIRE_LOG.width / 2}
          y={FIRE_BASE_Y}
          width={FIRE_LOG.width}
          height={FIRE_LOG.height}
          rx={2}
          fill={FIRE_COLORS.log}
        />

        {/* Flame layers. We render all three slots; opacity toggles
            visibility per stage so the layer count animates instead of
            popping in. */}
        {(["outer", "mid", "core"] as const).map((layer) => (
          <FlameLayer
            key={layer}
            layer={layer}
            path={STAGE_PATH[stage.id]}
            visible={stage.layers.includes(layer)}
            paused={paused}
            reducedMotion={reduced}
          />
        ))}

        <FlameExtras stage={stage} paused={paused} reducedMotion={reduced} />
      </svg>

      {!reduced && (
        <Sparks
          rate={paused ? 0 : stage.particlesPerSecond}
          flameHeightPx={stage.flameHeightPx}
          paused={paused}
        />
      )}

      {/* Reduced-motion cross-fade overlay. AnimatePresence keyed on the
          stage id renders both old and new stage SVGs during the 200 ms
          transition. */}
      {reduced && (
        <AnimatePresence mode="sync">
          <motion.div
            key={`fade-${stage.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: REDUCED_MOTION_FADE_MS / 1000 }}
            className="pointer-events-none absolute inset-0"
            aria-hidden
          />
        </AnimatePresence>
      )}
    </div>
  );
}
