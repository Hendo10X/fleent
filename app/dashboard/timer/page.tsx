"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  ArrowClockwise,
  Pause,
  Play,
  SkipForward,
} from "@phosphor-icons/react";

type Mode = "focus" | "short" | "long";

const MODES: { id: Mode; label: string; minutes: number; hint: string }[] = [
  { id: "focus", label: "Focus", minutes: 25, hint: "Deep work" },
  { id: "short", label: "Short", minutes: 5, hint: "Step back" },
  { id: "long", label: "Long", minutes: 15, hint: "Recharge" },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring" as const, bounce: 0.18, duration: 0.45 };
const FAST = { type: "spring" as const, bounce: 0.1, duration: 0.28 };

const FOCUS_BEFORE_LONG = 4;

export default function TimerPage() {
  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => secondsForMode("focus"));
  const [pomodorosDone, setPomodorosDone] = useState(0);
  const [focusUntilLong, setFocusUntilLong] = useState(FOCUS_BEFORE_LONG);

  const endAtRef = useRef<number | null>(null);
  const pausedTotalRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const modeRef = useRef(mode);
  const focusUntilLongRef = useRef(focusUntilLong);

  modeRef.current = mode;
  focusUntilLongRef.current = focusUntilLong;

  const total = secondsForMode(mode);

  const syncFromEndTime = useCallback(() => {
    const end = endAtRef.current;
    if (!end) return;
    const remainingMs = Math.max(0, end - Date.now());
    const secs = Math.ceil(remainingMs / 1000);
    setSecondsLeft((prev) => (secs !== prev ? secs : prev));
  }, []);

  // Reset duration when mode changes (not while merely pausing).
  useEffect(() => {
    setRunning(false);
    endAtRef.current = null;
    pausedTotalRef.current = secondsForMode(mode);
    setSecondsLeft(secondsForMode(mode));
  }, [mode]);

  // rAF loop while running — avoids visible drift vs wall clock.
  useEffect(() => {
    if (!running) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    function tick() {
      const end = endAtRef.current;
      if (!end) return;

      const remainingMs = end - Date.now();
      const secs = Math.max(0, Math.ceil(remainingMs / 1000));
      setSecondsLeft(secs);

      if (remainingMs <= 0) {
        endAtRef.current = null;
        setRunning(false);
        handleNaturalComplete();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    if (!endAtRef.current) endAtRef.current = Date.now() + secondsLeft * 1000;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // Deadline is set in handleStartPause; fallback above covers edge paths only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function handleNaturalComplete() {
    const m = modeRef.current;
    const until = focusUntilLongRef.current;

    if (m === "focus") {
      setPomodorosDone((p) => p + 1);
      if (until <= 1) {
        setMode("long");
        setFocusUntilLong(FOCUS_BEFORE_LONG);
      } else {
        setMode("short");
        setFocusUntilLong((u) => u - 1);
      }
      return;
    }

    setMode("focus");
  }

  function handleStartPause() {
    setRunning((wasRunning) => {
      if (!wasRunning) {
        pausedTotalRef.current = secondsLeft;
        endAtRef.current = Date.now() + pausedTotalRef.current * 1000;
      } else {
        syncFromEndTime();
        endAtRef.current = null;
      }
      return !wasRunning;
    });
  }

  function handleReset() {
    setRunning(false);
    endAtRef.current = null;
    setSecondsLeft(total);
    pausedTotalRef.current = total;
  }

  /** Advance without counting a finished pomodoro (abandon rest of segment). */
  function handleSkipSegment() {
    setRunning(false);
    endAtRef.current = null;
    const m = modeRef.current;
    if (m === "focus") setMode("short");
    else setMode("focus");
  }

  const progress = total <= 0 ? 0 : 1 - secondsLeft / total;
  const display = formatTime(secondsLeft);
  const accent = accentForMode(mode);
  const modeMeta = MODES.find((x) => x.id === mode);

  useEffect(() => {
    if (!running) {
      document.title = "Pomodoro · Fleent";
      return;
    }
    document.title = `${display} · ${modeMeta?.hint ?? "Pomodoro"} · Fleent`;
    return () => {
      document.title = "Pomodoro · Fleent";
    };
  }, [display, modeMeta?.hint, running]);

  return (
    <main className="px-6 pb-28 pt-12">
      <section className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-2xl font-bold tracking-tight text-fleent-ink">
            Pomodoro
          </h1>
          <p className="mt-1 max-w-[28ch] text-sm tracking-wide text-fleent-mute">
            Twenty-five on, five off. Every fourth focus earns a longer break.
          </p>
        </div>

        <ModeTabs mode={mode} onChange={setMode} disabled={running} />

        <p
          className="mt-3 text-center text-xs tracking-wide text-fleent-mute"
          aria-live="polite"
        >
          {mode === "focus"
            ? `${focusUntilLong} focus${focusUntilLong === 1 ? "" : "es"} until long break`
            : modeMeta?.hint}
        </p>

        <div className="mt-8 flex justify-center">
          <ProgressDial
            progress={progress}
            display={display}
            accent={accent}
            running={running}
            modeLabel={modeMeta?.hint ?? ""}
            mode={mode}
          />
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <RoundButton ariaLabel="Reset timer" onClick={handleReset}>
            <ArrowClockwise size={18} weight="bold" />
          </RoundButton>

          <PrimaryButton
            ariaLabel={running ? "Pause" : "Start"}
            onClick={handleStartPause}
            accent={accent}
          >
            <AnimatePresence mode="wait" initial={false}>
              {running ? (
                <motion.span
                  key="pause"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={FAST}
                  className="inline-flex"
                >
                  <Pause size={22} weight="fill" />
                </motion.span>
              ) : (
                <motion.span
                  key="play"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={FAST}
                  className="inline-flex"
                >
                  <Play size={22} weight="fill" />
                </motion.span>
              )}
            </AnimatePresence>
          </PrimaryButton>

          <RoundButton
            ariaLabel="Skip to next phase"
            onClick={handleSkipSegment}
          >
            <SkipForward size={18} weight="bold" />
          </RoundButton>
        </div>

        <div className="mt-8 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-none">
          <p className="text-center text-sm tracking-wide text-fleent-mute">
            {pomodorosDone === 0
              ? "Start your first focus when you're ready."
              : `${pomodorosDone} pomodoro${pomodorosDone === 1 ? "" : "s"} completed this visit.`}
          </p>
        </div>
      </section>
    </main>
  );
}

function ModeTabs({
  mode,
  onChange,
  disabled,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  disabled?: boolean;
}) {
  return (
    <LayoutGroup id="timer-mode-pill">
      <div className="mt-8 flex w-full items-center gap-1 self-center rounded-full bg-white p-1">
        {MODES.map((m) => {
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(m.id)}
              className="relative flex-1 rounded-full px-2 py-2 text-xs font-semibold tracking-wide outline-none transition-opacity duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-sm"
            >
              {active && (
                <motion.span
                  layoutId="timer-mode-pill"
                  aria-hidden
                  transition={SPRING}
                  className="absolute inset-0 rounded-full bg-[#F3F3F3]"
                />
              )}
              <motion.span
                animate={{ color: active ? "#000000" : "#828181" }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className="relative"
              >
                {m.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

function ProgressDial({
  progress,
  display,
  accent,
  running,
  modeLabel,
  mode,
}: {
  progress: number;
  display: string;
  accent: string;
  running: boolean;
  modeLabel: string;
  mode: Mode;
}) {
  const size = 248;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        aria-hidden
        animate={{
          opacity: running ? 0.2 : 0.1,
          scale: running ? 1.05 : 1,
        }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="absolute inset-7 rounded-full blur-2xl"
        style={{ background: accent }}
      />
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#F3F3F3"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - progress) }}
          transition={{ duration: running ? 0.28 : 0.45, ease: EASE_OUT }}
        />
      </svg>

      <motion.div
        animate={{ scale: running ? [1, 1.008, 1] : 1 }}
        transition={
          running
            ? { duration: 2.2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }
            : FAST
        }
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${mode}-${display}`}
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -4, opacity: 0 }}
            transition={{ duration: 0.16, ease: EASE_OUT }}
            className="text-5xl font-bold tracking-tight text-fleent-ink tabular-nums"
            role="timer"
            aria-live="off"
            aria-label={`${minutesLabel(mode)}, ${display} remaining`}
          >
            {display}
          </motion.span>
        </AnimatePresence>
        <span className="mt-2 max-w-[18ch] text-center text-xs font-semibold tracking-[0.14em] text-fleent-mute uppercase">
          {running ? modeLabel : mode === "focus" ? "ready" : "paused"}
        </span>
      </motion.div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  ariaLabel,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  accent: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.03 }}
      transition={FAST}
      style={{ backgroundColor: accent }}
      className="inline-flex size-16 items-center justify-center rounded-full text-white outline-none focus-visible:ring-4 focus-visible:ring-black/10"
    >
      {children}
    </motion.button>
  );
}

function RoundButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.03 }}
      transition={FAST}
      className="inline-flex size-12 items-center justify-center rounded-full bg-white text-fleent-ink outline-none transition-colors duration-200 ease-out hover:bg-[#F3F3F3] focus-visible:ring-2 focus-visible:ring-fleent-orange/40"
    >
      {children}
    </motion.button>
  );
}

function minutesLabel(mode: Mode) {
  if (mode === "focus") return "Focus";
  if (mode === "short") return "Short break";
  return "Long break";
}

function secondsForMode(mode: Mode): number {
  return (MODES.find((x) => x.id === mode)?.minutes ?? 25) * 60;
}

function accentForMode(mode: Mode) {
  if (mode === "focus") return "#FF8629";
  if (mode === "short") return "#00A6FA";
  return "#00D74C";
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
