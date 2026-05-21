"use client";

/**
 * `<Bean />` — the companion pet, driven by `intensity ∈ [0, 1]`.
 *
 * Visuals interpolate continuously by piping the intensity through a single
 * `useMotionValue` and deriving each animated field (body colour, cheek
 * blush, eye colour, etc.) with `useTransform`. None of these recompute via
 * React state — only via Framer Motion's render loop.
 *
 * `mood` is an optional explicit override — passing one of "cold" | "ideal"
 * | "warm" | "sleepy" maps to a fixed synthetic intensity (see
 * `BEAN_MOOD_INTENSITY`) and renders that frozen state. `sleepy` is the
 * special variant: closed eyes + drowsy smile, used for breaks / paused.
 *
 * The "warm sigh" is a one-shot — gated by a `useRef` so it only fires the
 * first time intensity crosses 0.85 upward over the component's life.
 */

import { useEffect, useMemo, useRef } from "react";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  BEAN_BODY,
  BEAN_BODY_STOPS,
  BEAN_BOB_AMPLITUDE_PX,
  BEAN_BOB_DURATION_COLD_S,
  BEAN_BOB_DURATION_WARM_S,
  BEAN_CHEEK_COLOR,
  BEAN_EYE_COLOR_COLD,
  BEAN_EYE_COLOR_WARM,
  BEAN_MOOD_INTENSITY,
  BEAN_SHIVER_AMPLITUDE_PX,
  BEAN_SHIVER_HALF_PERIOD_S,
  BEAN_THRESHOLDS,
  BEAN_VIEWBOX,
  SIGH_DURATION_MS,
  SIGH_EASE,
} from "@/lib/flint/constants";
import type { BeanProps } from "@/lib/flint/types";

// Body is a circle centred at (60, 60) with r=45. Face elements are
// positioned relative to that centre so the layout stays balanced no
// matter how the body is scaled.
const CX = BEAN_BODY.cx; // 60
const CY = BEAN_BODY.cy; // 60
const EYE_Y = CY - 8; // 52 — slightly above centre
const CHEEK_Y = CY + 6; // 66
const MOUTH_Y_BASE = CY + 22; // 82
const EYE_DX = 16; // ±16 px from centre → x = 44, 76

// All eye / mouth paths share the same `M ... Q ... ...` structure so SVG
// path interpolation produces a clean morph rather than a snap.
const EYE_PATH_LEFT_SAD = `M ${CX - EYE_DX - 5} ${EYE_Y - 3} Q ${CX - EYE_DX} ${EYE_Y + 3} ${CX - EYE_DX + 5} ${EYE_Y - 3}`;
const EYE_PATH_LEFT_HAPPY = `M ${CX - EYE_DX - 5} ${EYE_Y + 2} Q ${CX - EYE_DX} ${EYE_Y - 4} ${CX - EYE_DX + 5} ${EYE_Y + 2}`;
const EYE_PATH_LEFT_CLOSED = `M ${CX - EYE_DX - 5} ${EYE_Y} Q ${CX - EYE_DX} ${EYE_Y} ${CX - EYE_DX + 5} ${EYE_Y}`;

const EYE_PATH_RIGHT_SAD = `M ${CX + EYE_DX - 5} ${EYE_Y - 3} Q ${CX + EYE_DX} ${EYE_Y + 3} ${CX + EYE_DX + 5} ${EYE_Y - 3}`;
const EYE_PATH_RIGHT_HAPPY = `M ${CX + EYE_DX - 5} ${EYE_Y + 2} Q ${CX + EYE_DX} ${EYE_Y - 4} ${CX + EYE_DX + 5} ${EYE_Y + 2}`;
const EYE_PATH_RIGHT_CLOSED = `M ${CX + EYE_DX - 5} ${EYE_Y} Q ${CX + EYE_DX} ${EYE_Y} ${CX + EYE_DX + 5} ${EYE_Y}`;

const MOUTH_PATH_FROWN = `M ${CX - 10} ${MOUTH_Y_BASE + 4} Q ${CX} ${MOUTH_Y_BASE - 4} ${CX + 10} ${MOUTH_Y_BASE + 4}`;
const MOUTH_PATH_LINE = `M ${CX - 10} ${MOUTH_Y_BASE} Q ${CX} ${MOUTH_Y_BASE} ${CX + 10} ${MOUTH_Y_BASE}`;
const MOUTH_PATH_SMILE = `M ${CX - 10} ${MOUTH_Y_BASE - 4} Q ${CX} ${MOUTH_Y_BASE + 4} ${CX + 10} ${MOUTH_Y_BASE - 4}`;

const SNOWFLAKE_PATH =
  "M 0 -5 L 0 5 M -5 0 L 5 0 M -3.5 -3.5 L 3.5 3.5 M -3.5 3.5 L 3.5 -3.5";

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function mouthPathFor(intensity: number, sleepy: boolean): string {
  if (sleepy) return MOUTH_PATH_SMILE;
  if (intensity < BEAN_THRESHOLDS.frownMax) return MOUTH_PATH_FROWN;
  if (intensity > BEAN_THRESHOLDS.smileMin) return MOUTH_PATH_SMILE;
  return MOUTH_PATH_LINE;
}

function eyePathsFor(
  intensity: number,
  sleepy: boolean,
): { left: string; right: string } {
  if (sleepy) {
    return { left: EYE_PATH_LEFT_CLOSED, right: EYE_PATH_RIGHT_CLOSED };
  }
  const sad = intensity < BEAN_THRESHOLDS.shiverMax;
  return sad
    ? { left: EYE_PATH_LEFT_SAD, right: EYE_PATH_RIGHT_SAD }
    : { left: EYE_PATH_LEFT_HAPPY, right: EYE_PATH_RIGHT_HAPPY };
}

function ariaLabelFor(intensity: number, sleepy: boolean): string {
  if (sleepy) return "Bean is resting";
  if (intensity < 0.2) return "Bean is frozen";
  if (intensity < 0.5) return "Bean is thawing";
  if (intensity < 0.85) return "Bean is warming up";
  return "Bean is cosy";
}

function BeanFace({
  intensity,
  reduced,
  bodyMV,
  sleepy,
}: {
  intensity: number;
  reduced: boolean;
  bodyMV: ReturnType<typeof useMotionValue<number>>;
  sleepy: boolean;
}) {
  const eyeColor = useTransform(
    bodyMV,
    [0, BEAN_THRESHOLDS.eyeWarmAt, 1],
    [BEAN_EYE_COLOR_COLD, BEAN_EYE_COLOR_COLD, BEAN_EYE_COLOR_WARM],
  );
  const blushOpacity = useTransform(
    bodyMV,
    [BEAN_THRESHOLDS.blushStart, BEAN_THRESHOLDS.blushFull],
    [0, 0.7],
    { clamp: true },
  );
  const eyes = eyePathsFor(intensity, sleepy);
  const mouth = mouthPathFor(intensity, sleepy);
  const pathDuration = reduced ? 0 : 0.35;

  return (
    <g aria-hidden>
      <motion.ellipse
        cx={CX - 18}
        cy={CHEEK_Y}
        rx={8}
        ry={4.5}
        fill={BEAN_CHEEK_COLOR}
        style={{ opacity: blushOpacity }}
      />
      <motion.ellipse
        cx={CX + 18}
        cy={CHEEK_Y}
        rx={8}
        ry={4.5}
        fill={BEAN_CHEEK_COLOR}
        style={{ opacity: blushOpacity }}
      />
      <motion.path
        d={eyes.left}
        stroke={eyeColor}
        strokeWidth={3}
        strokeLinecap="round"
        fill="transparent"
        animate={{ d: eyes.left }}
        transition={{ duration: pathDuration, ease: "easeInOut" }}
      />
      <motion.path
        d={eyes.right}
        stroke={eyeColor}
        strokeWidth={3}
        strokeLinecap="round"
        fill="transparent"
        animate={{ d: eyes.right }}
        transition={{ duration: pathDuration, ease: "easeInOut" }}
      />
      <motion.path
        d={mouth}
        stroke={eyeColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="transparent"
        animate={{ d: mouth }}
        transition={{ duration: pathDuration, ease: "easeInOut" }}
      />
    </g>
  );
}

function FrozenDecor({
  intensity,
  bodyMV,
  sleepy,
}: {
  intensity: number;
  bodyMV: ReturnType<typeof useMotionValue<number>>;
  sleepy: boolean;
}) {
  const iceOpacity = useTransform(
    bodyMV,
    [BEAN_THRESHOLDS.iceVisibleMax, BEAN_THRESHOLDS.iceGoneAt],
    [1, 0],
    { clamp: true },
  );
  const shiverOpacity = useTransform(
    bodyMV,
    [BEAN_THRESHOLDS.shiverLineVisibleMax, BEAN_THRESHOLDS.shiverLineGoneAt],
    [1, 0],
    { clamp: true },
  );

  // Sleepy is mutually exclusive with frozen decor — instead it gets a
  // pair of drifting "z"s for that "doing nothing on purpose" energy.
  if (sleepy) {
    return (
      <g aria-hidden>
        <text
          x={CX + 28}
          y={CY - 30}
          fontSize={10}
          fontWeight={700}
          fill="#8FAEC5"
        >
          z
        </text>
        <text
          x={CX + 33}
          y={CY - 38}
          fontSize={7}
          fontWeight={700}
          fill="#A8C0D2"
        >
          z
        </text>
      </g>
    );
  }

  // Past the thaw point — nothing to draw.
  if (
    intensity >= BEAN_THRESHOLDS.iceGoneAt &&
    intensity >= BEAN_THRESHOLDS.shiverLineGoneAt
  ) {
    return null;
  }

  return (
    <g aria-hidden>
      <motion.g style={{ opacity: iceOpacity }} stroke="#B8DCEC" strokeWidth={1.2}>
        <g transform={`translate(${CX - 15} ${CY - 50})`}>
          <path d={SNOWFLAKE_PATH} />
        </g>
        <g transform={`translate(${CX + 15} ${CY - 50})`}>
          <path d={SNOWFLAKE_PATH} />
        </g>
      </motion.g>
      <motion.g
        style={{ opacity: shiverOpacity }}
        stroke="#9FC5E8"
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <line x1={CX - 50} y1={CY - 8} x2={CX - 54} y2={CY - 8} />
        <line x1={CX - 50} y1={CY + 8} x2={CX - 54} y2={CY + 8} />
        <line x1={CX + 50} y1={CY - 8} x2={CX + 54} y2={CY - 8} />
        <line x1={CX + 50} y1={CY + 8} x2={CX + 54} y2={CY + 8} />
      </motion.g>
    </g>
  );
}

export function Bean({
  intensity,
  mood,
  reducedMotion,
  className,
}: BeanProps) {
  // When mood is set, all visuals are driven by a synthetic intensity so the
  // existing transform pipeline still does the work — no parallel renderer.
  const effective =
    mood !== undefined ? BEAN_MOOD_INTENSITY[mood] : clamp01(intensity);
  const sleepy = mood === "sleepy";

  const osReduced = useReducedMotion();
  const reduced = reducedMotion ?? Boolean(osReduced);

  const intensityMV = useMotionValue(effective);
  if (intensityMV.get() !== effective) intensityMV.set(effective);

  const bodyFill = useTransform(
    intensityMV,
    [...BEAN_BODY_STOPS.inputs],
    [...BEAN_BODY_STOPS.outputs],
  );

  const bobDuration = useMemo(() => {
    const t = clamp01((effective - 0.5) / 0.4);
    return (
      BEAN_BOB_DURATION_COLD_S +
      (BEAN_BOB_DURATION_WARM_S - BEAN_BOB_DURATION_COLD_S) * t
    );
  }, [effective]);

  const shivering = effective < BEAN_THRESHOLDS.shiverMax && !sleepy;

  const sighControls = useAnimationControls();
  const sighFiredRef = useRef(false);
  const prevEffRef = useRef(effective);
  useEffect(() => {
    const prev = prevEffRef.current;
    if (
      !sighFiredRef.current &&
      prev < BEAN_THRESHOLDS.sighAt &&
      effective >= BEAN_THRESHOLDS.sighAt
    ) {
      sighFiredRef.current = true;
      if (!reduced) {
        sighControls.start({
          scale: [1, 1.04, 1],
          transition: { duration: SIGH_DURATION_MS / 1000, ease: SIGH_EASE },
        });
      }
    }
    prevEffRef.current = effective;
  }, [effective, reduced, sighControls]);

  const bobAnim = reduced
    ? { y: 0 }
    : { y: [-BEAN_BOB_AMPLITUDE_PX, BEAN_BOB_AMPLITUDE_PX] };
  const bobTransition = reduced
    ? { duration: 0 }
    : {
        duration: bobDuration,
        ease: "easeInOut" as const,
        repeat: Infinity,
        repeatType: "mirror" as const,
      };

  const shiverAnim =
    !reduced && shivering
      ? { x: [-BEAN_SHIVER_AMPLITUDE_PX, BEAN_SHIVER_AMPLITUDE_PX] }
      : { x: 0 };
  const shiverTransition =
    !reduced && shivering
      ? {
          duration: BEAN_SHIVER_HALF_PERIOD_S * 2,
          ease: "easeInOut" as const,
          repeat: Infinity,
          repeatType: "mirror" as const,
        }
      : { duration: 0 };

  return (
    <div
      role="img"
      aria-label={ariaLabelFor(effective, sleepy)}
      className={`relative ${className ?? ""}`}
      style={{
        aspectRatio: `${BEAN_VIEWBOX.width} / ${BEAN_VIEWBOX.height}`,
      }}
    >
      <svg
        viewBox={`0 0 ${BEAN_VIEWBOX.width} ${BEAN_VIEWBOX.height}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <motion.g animate={shiverAnim} transition={shiverTransition}>
          <motion.g animate={bobAnim} transition={bobTransition}>
            <motion.g
              animate={sighControls}
              style={{ originX: `${CX}px`, originY: `${CY}px` }}
            >
              <motion.circle
                cx={CX}
                cy={CY}
                r={BEAN_BODY.r}
                style={{ fill: bodyFill }}
              />
              <BeanFace
                intensity={effective}
                reduced={reduced}
                bodyMV={intensityMV}
                sleepy={sleepy}
              />
            </motion.g>
          </motion.g>
          <FrozenDecor
            intensity={effective}
            bodyMV={intensityMV}
            sleepy={sleepy}
          />
        </motion.g>
      </svg>
    </div>
  );
}
