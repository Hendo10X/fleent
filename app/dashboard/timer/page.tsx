"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  ArrowClockwise,
  CheckCircle,
  FloppyDisk,
  Pause,
  Play,
  SkipForward,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Fire } from "@/components/flint/Fire";
import { Bean } from "@/components/flint/Bean";
import { toggleTaskComplete } from "@/app/dashboard/actions";
import { fireTaskConfetti } from "@/lib/ui/confetti";

type Mode = "focus" | "short" | "long";

type Durations = Record<Mode, number>;

type PersistedTimer = {
  mode: Mode;
  running: boolean;
  secondsLeft: number;
  endAt: number | null;
  durations: Durations;
  pomodorosDone: number;
  focusUntilLong: number;
};

const MODE_META: Record<Mode, { label: string; hint: string }> = {
  focus: { label: "Focus", hint: "Deep work" },
  short: { label: "Short", hint: "Step back" },
  long: { label: "Long", hint: "Recharge" },
};

const DEFAULT_DURATIONS: Durations = {
  focus: 25,
  short: 5,
  long: 15,
};

const STORAGE_KEY = "fleent-pomodoro-state-v1";
// Session-scoped handoff: the dashboard "start" button writes the ordered
// list of microtasks to focus through; the timer reads + advances it.
const FOCUS_QUEUE_KEY = "fleent-focus-queue";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring" as const, bounce: 0.18, duration: 0.45 };
const FAST = { type: "spring" as const, bounce: 0.1, duration: 0.28 };

const FOCUS_BEFORE_LONG = 4;

type ActiveTask = { id: string; title: string };

export default function TimerPage() {
  const searchParams = useSearchParams();
  // Focus queue: the head is the task you're currently working through; the
  // tail is what auto-advances after each Pomodoro. Seeded from the URL for a
  // single task; replaced by the sessionStorage queue (a whole breakdown)
  // in an effect to avoid an SSR hydration mismatch.
  const [queue, setQueue] = useState<ActiveTask[]>(() => {
    const id = searchParams.get("taskId");
    const title = searchParams.get("taskTitle");
    return id && title ? [{ id, title }] : [];
  });
  const activeTask = queue[0] ?? null;
  // Stays true once the *whole* queue is finished - keeps the banner visible
  // with a strike-through instead of yanking it away.
  const [taskDone, setTaskDone] = useState(false);

  const [mode, setModeState] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [durations, setDurations] = useState<Durations>(DEFAULT_DURATIONS);
  const [draftDurations, setDraftDurations] =
    useState<Durations>(DEFAULT_DURATIONS);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    secondsForMode("focus", DEFAULT_DURATIONS),
  );
  const [pomodorosDone, setPomodorosDone] = useState(0);
  const [focusUntilLong, setFocusUntilLong] = useState(FOCUS_BEFORE_LONG);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);

  const endAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const modeRef = useRef(mode);
  const focusUntilLongRef = useRef(focusUntilLong);
  const durationsRef = useRef(durations);
  const runningRef = useRef(running);
  // Ref-tracked so the natural-complete callback (defined inside the RAF
  // loop's effect) always reads the latest queue without re-binding.
  const queueRef = useRef<ActiveTask[]>(queue);

  modeRef.current = mode;
  focusUntilLongRef.current = focusUntilLong;
  durationsRef.current = durations;
  runningRef.current = running;
  queueRef.current = queue;

  const total = secondsForMode(mode, durations);
  const modeMeta = MODE_META[mode];

  const syncFromEndTime = useCallback(() => {
    const end = endAtRef.current;
    if (!end) return;
    const remainingMs = Math.max(0, end - Date.now());
    const secs = Math.ceil(remainingMs / 1000);
    setSecondsLeft((prev) => (secs !== prev ? secs : prev));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const persisted = readPersistedTimer();
      if (persisted) {
        const safeDurations = normalizeDurations(persisted.durations);
        const remaining = persisted.endAt
          ? Math.max(0, Math.ceil((persisted.endAt - Date.now()) / 1000))
          : persisted.secondsLeft;

        setModeState(persisted.mode);
        setDurations(safeDurations);
        setDraftDurations(safeDurations);
        setPomodorosDone(persisted.pomodorosDone);
        setFocusUntilLong(persisted.focusUntilLong);
        endAtRef.current =
          persisted.running && remaining > 0 ? persisted.endAt : null;
        setSecondsLeft(
          remaining > 0
            ? remaining
            : secondsForMode(persisted.mode, safeDurations),
        );
        setRunning(persisted.running && remaining > 0);
      }
      setHydrated(true);
    }, 0);

    // One-shot: pull a multi-task focus queue from sessionStorage (set by the
    // dashboard "start" button). Done here, not in render, to avoid an SSR
    // hydration mismatch from reading sessionStorage during the first paint.
    const stored = readStoredQueue();
    if (stored.length > 0) {
      setQueue(stored);
      setTaskDone(false);
    }

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistTimer({
      mode,
      running,
      secondsLeft,
      endAt: endAtRef.current,
      durations,
      pomodorosDone,
      focusUntilLong,
    });
  }, [
    hydrated,
    mode,
    running,
    secondsLeft,
    durations,
    pomodorosDone,
    focusUntilLong,
  ]);

  useEffect(() => {
    function syncWhenVisible() {
      if (runningRef.current) syncFromEndTime();
    }

    window.addEventListener("focus", syncWhenVisible);
    document.addEventListener("visibilitychange", syncWhenVisible);

    return () => {
      window.removeEventListener("focus", syncWhenVisible);
      document.removeEventListener("visibilitychange", syncWhenVisible);
    };
  }, [syncFromEndTime]);

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
    // Deadline is set in handleStartPause; fallback above covers edge paths.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  /**
   * Mark the current (head) task complete on the server, celebrate, and pop
   * it off the queue so the next microtask becomes active. When the queue
   * empties, flip the banner to its struck-through "all done" state.
   */
  function completeCurrentTask() {
    const t = queueRef.current[0];
    if (!t) return;

    fireTaskConfetti();
    toggleTaskComplete(t.id)
      .then(() => toast.success(`"${t.title}" - done!`))
      .catch(() => toast.error("Couldn't mark the task done."));

    const next = queueRef.current.slice(1);
    writeStoredQueue(next);
    setQueue(next);
    if (next.length === 0) setTaskDone(true);
  }

  function handleNaturalComplete() {
    const m = modeRef.current;
    const until = focusUntilLongRef.current;

    if (m === "focus") {
      setPomodorosDone((p) => p + 1);

      // If this Pomodoro was focused on a task, complete it and advance to the
      // next microtask in the queue. The next task waits as the active task
      // through the break, then the following focus session works on it.
      if (queueRef.current.length > 0) completeCurrentTask();

      if (until <= 1) {
        setMode("long", { reset: true });
        setFocusUntilLong(FOCUS_BEFORE_LONG);
      } else {
        setMode("short", { reset: true });
        setFocusUntilLong((u) => u - 1);
      }
      return;
    }

    setMode("focus", { reset: true });
  }

  function handleMarkActiveTaskDone() {
    if (taskDone || queueRef.current.length === 0) return;
    completeCurrentTask();
  }

  function handleDismissQueue() {
    writeStoredQueue([]);
    setQueue([]);
    setTaskDone(false);
  }

  function setMode(nextMode: Mode, options?: { reset?: boolean }) {
    setRunning(false);
    endAtRef.current = null;
    setModeState(nextMode);
    if (options?.reset !== false) {
      setSecondsLeft(secondsForMode(nextMode, durationsRef.current));
    }
  }

  function handleStartPause() {
    setRunning((wasRunning) => {
      if (!wasRunning) {
        endAtRef.current = Date.now() + secondsLeft * 1000;
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
  }

  function handleSkipSegment() {
    setRunning(false);
    endAtRef.current = null;
    if (modeRef.current === "focus") setMode("short");
    else setMode("focus");
  }

  function handleDurationChange(id: Mode, value: string) {
    const minutes = clampMinutes(Number(value));
    setDraftDurations((prev) => ({ ...prev, [id]: minutes }));
  }

  function handleSaveDurations() {
    const next = normalizeDurations(draftDurations);
    setDurations(next);
    setDraftDurations(next);
    if (!runningRef.current) {
      setSecondsLeft(secondsForMode(modeRef.current, next));
      endAtRef.current = null;
    }
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 900);
  }

  const progress = total <= 0 ? 0 : 1 - secondsLeft / total;
  const display = formatTime(secondsLeft);
  const accent = accentForMode(mode);

  useEffect(() => {
    if (!running) {
      document.title = "Pomodoro · Fleent";
      return;
    }
    document.title = `${display} · ${modeMeta.hint} · Fleent`;
    return () => {
      document.title = "Pomodoro · Fleent";
    };
  }, [display, modeMeta.hint, running]);

  return (
    <main className="flex min-h-[calc(100dvh-6.5rem)] flex-col px-6 pt-6 pb-24">
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Compact header - title + settings on one row */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-fleent-ink">
            Pomodoro
          </h1>
          <motion.button
            type="button"
            aria-label="Timer settings"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((value) => !value)}
            whileTap={{ scale: 0.94 }}
            transition={FAST}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-fleent-ink outline-none transition-colors hover:bg-[#F3F3F3] focus-visible:ring-2 focus-visible:ring-fleent-orange/40"
          >
            <SlidersHorizontal size={16} weight="bold" />
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {settingsOpen && (
            <motion.div
              key="settings"
              initial={{ height: 0, opacity: 0, y: -6 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -6 }}
              transition={SPRING}
              className="overflow-hidden"
            >
              <TimerSettings
                values={draftDurations}
                onChange={handleDurationChange}
                onSave={handleSaveDurations}
                savedPulse={savedPulse}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Focus queue handoff from the dashboard. The head is the current
            task; the tail auto-advances after each Pomodoro. Dismissable. */}
        <AnimatePresence initial={false}>
          {activeTask && (
            <motion.div
              key="focus-queue"
              initial={{ height: 0, opacity: 0, y: -4 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div
                className={`mt-3 flex flex-col gap-1.5 rounded-2xl px-3 py-2.5 transition-colors ${
                  taskDone ? "bg-fleent-green/10" : "bg-fleent-orange/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold tracking-[0.14em] uppercase ${
                      taskDone ? "text-fleent-green" : "text-fleent-orange"
                    }`}
                  >
                    {taskDone ? "Completed" : "Focusing on"}
                  </span>
                  {!taskDone && queue.length > 1 && (
                    <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-bold tabular-nums tracking-wider text-fleent-orange">
                      {queue.length} queued
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1">
                    {!taskDone && (
                      <button
                        type="button"
                        onClick={handleMarkActiveTaskDone}
                        aria-label="Mark task done"
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-fleent-orange transition-colors hover:bg-white"
                      >
                        <CheckCircle size={16} weight="fill" />
                      </button>
                    )}
                    {taskDone && (
                      <span className="inline-flex size-7 shrink-0 items-center justify-center text-fleent-green">
                        <CheckCircle size={18} weight="fill" />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleDismissQueue}
                      aria-label={taskDone ? "Dismiss" : "Stop focusing"}
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-fleent-mute transition-colors hover:bg-white hover:text-fleent-ink"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </span>
                </div>

                <span
                  className={`min-w-0 truncate text-sm font-semibold tracking-tight ${
                    taskDone
                      ? "text-fleent-mute line-through"
                      : "text-fleent-ink"
                  }`}
                >
                  {activeTask.title}
                </span>

                {!taskDone && queue.length > 1 && (
                  <span className="min-w-0 truncate text-xs tracking-wide text-fleent-mute">
                    Up next: {queue[1].title}
                    {queue.length > 2 ? ` +${queue.length - 2} more` : ""}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bean is the hero. Fire sits above as a small companion that
            still drives the focus metaphor. Time is the readout below.
            Fixed compact sizes keep the whole hero ≤ 280 px tall so the
            page never scrolls regardless of viewport height. */}
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-2">
          {mode === "focus" && (
            <Fire
              intensity={progress}
              paused={!running}
              className="w-12"
            />
          )}
          <Bean
            intensity={progress}
            mood={beanMoodFor(mode, running, progress)}
            className="w-32 sm:w-36"
          />
          <div className="mt-1 flex flex-col items-center">
            <p
              aria-live="polite"
              className="font-mono text-5xl font-bold tabular-nums tracking-tight"
              style={{ color: accent }}
            >
              {display}
            </p>
            <p className="mt-1 text-xs tracking-wide text-fleent-mute">
              {mode === "focus"
                ? `${focusUntilLong} focus${focusUntilLong === 1 ? "" : "es"} until long break`
                : modeMeta.hint}
            </p>
          </div>
        </div>

        <ModeTabs mode={mode} onChange={setMode} disabled={running} />

        <div className="mt-5 flex items-center justify-center gap-3">
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
              : `${pomodorosDone} pomodoro${pomodorosDone === 1 ? "" : "s"} completed.`}
          </p>
        </div>
      </section>
    </main>
  );
}

function TimerSettings({
  values,
  onChange,
  onSave,
  savedPulse,
}: {
  values: Durations;
  onChange: (id: Mode, value: string) => void;
  onSave: () => void;
  savedPulse: boolean;
}) {
  return (
    <div className="mt-6 rounded-3xl bg-white p-4">
      <div className="grid grid-cols-3 gap-2">
        {(["focus", "short", "long"] as const).map((id) => (
          <label key={id} className="flex min-w-0 flex-col gap-2">
            <span className="truncate text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
              {MODE_META[id].label}
            </span>
            <input
              type="number"
              min={1}
              max={180}
              value={values[id]}
              onChange={(e) => onChange(id, e.target.value)}
              className="h-11 w-full rounded-2xl bg-[#F3F3F3] px-3 text-center text-base font-bold tabular-nums text-fleent-ink outline-none focus-visible:ring-2 focus-visible:ring-fleent-orange/30"
            />
            <span className="text-center text-[11px] tracking-wide text-fleent-mute">
              min
            </span>
          </label>
        ))}
      </div>

      <motion.button
        type="button"
        onClick={onSave}
        whileTap={{ scale: 0.97 }}
        transition={FAST}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-fleent-ink px-4 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-fleent-ink/90"
      >
        <AnimatePresence mode="wait" initial={false}>
          {savedPulse ? (
            <motion.span
              key="saved"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
            >
              Saved
            </motion.span>
          ) : (
            <motion.span
              key="save"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className="inline-flex items-center gap-2"
            >
              <FloppyDisk size={16} weight="bold" />
              Save times
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
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
        {(["focus", "short", "long"] as const).map((id) => {
          const active = id === mode;
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(id)}
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
                {MODE_META[id].label}
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

function secondsForMode(mode: Mode, durations: Durations): number {
  return durations[mode] * 60;
}

function accentForMode(mode: Mode) {
  if (mode === "focus") return "#FF8629";
  if (mode === "short") return "#00A6FA";
  return "#00D74C";
}

function clampMinutes(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(180, Math.round(value)));
}

function normalizeDurations(value?: Partial<Durations>): Durations {
  return {
    focus: clampMinutes(value?.focus ?? DEFAULT_DURATIONS.focus),
    short: clampMinutes(value?.short ?? DEFAULT_DURATIONS.short),
    long: clampMinutes(value?.long ?? DEFAULT_DURATIONS.long),
  };
}

function readPersistedTimer(): PersistedTimer | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedTimer>;
    const mode = isMode(parsed.mode) ? parsed.mode : "focus";
    const durations = normalizeDurations(parsed.durations);
    return {
      mode,
      running: Boolean(parsed.running),
      secondsLeft:
        typeof parsed.secondsLeft === "number"
          ? Math.max(0, parsed.secondsLeft)
          : secondsForMode(mode, durations),
      endAt: typeof parsed.endAt === "number" ? parsed.endAt : null,
      durations,
      pomodorosDone:
        typeof parsed.pomodorosDone === "number"
          ? Math.max(0, parsed.pomodorosDone)
          : 0,
      focusUntilLong:
        typeof parsed.focusUntilLong === "number"
          ? Math.max(1, Math.min(FOCUS_BEFORE_LONG, parsed.focusUntilLong))
          : FOCUS_BEFORE_LONG,
    };
  } catch {
    return null;
  }
}

function persistTimer(value: PersistedTimer) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

/** Read + validate the focus queue handed off from the dashboard. */
function readStoredQueue(): ActiveTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(FOCUS_QUEUE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is ActiveTask =>
        !!t &&
        typeof (t as ActiveTask).id === "string" &&
        typeof (t as ActiveTask).title === "string",
    );
  } catch {
    return [];
  }
}

/** Persist the remaining queue so a refresh resumes mid-breakdown. */
function writeStoredQueue(queue: ActiveTask[]) {
  if (typeof window === "undefined") return;
  try {
    if (queue.length === 0) {
      window.sessionStorage.removeItem(FOCUS_QUEUE_KEY);
    } else {
      window.sessionStorage.setItem(FOCUS_QUEUE_KEY, JSON.stringify(queue));
    }
  } catch {
    // sessionStorage unavailable (private mode etc.) — queue stays in memory.
  }
}

function isMode(value: unknown): value is Mode {
  return value === "focus" || value === "short" || value === "long";
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Maps the current Pomodoro state onto Bean's mascot mood:
 *  - Break modes → sleepy (Bean naps while you rest)
 *  - Focus, idle (not running) → cold (waiting to start)
 *  - Focus, early run (< 60%) → ideal (settling in)
 *  - Focus, deep run (≥ 60%) → warm (in the groove)
 *
 * Returning `undefined` would defer to intensity-driven appearance instead.
 */
function beanMoodFor(
  mode: Mode,
  running: boolean,
  progress: number,
): "cold" | "ideal" | "warm" | "sleepy" {
  if (mode !== "focus") return "sleepy";
  if (!running) return "cold";
  return progress < 0.6 ? "ideal" : "warm";
}
