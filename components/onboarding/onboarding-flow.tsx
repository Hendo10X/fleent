"use client"

import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, Check } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

type StepId = "three" | "dump" | "flip" | "rhythm"

type Step = {
  id: StepId
  eyebrow: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    id: "three",
    eyebrow: "Three tasks",
    title: "Keep the day small.",
    body: "Fleent starts with three visible tasks so your brain does not have to negotiate with the whole backlog.",
  },
  {
    id: "dump",
    eyebrow: "Brain dump",
    title: "Capture messy thoughts.",
    body: "Drop the rough version first. You can sort, rank, and clean it up when your attention returns.",
  },
  {
    id: "flip",
    eyebrow: "10-second start",
    title: "Flip dread into motion.",
    body: "When a task feels too large, Fleent turns it into a tiny physical action you can start now.",
  },
  {
    id: "rhythm",
    eyebrow: "Daily rhythm",
    title: "Let rhythm beat pressure.",
    body: "Calendar-aware nudges help you return without shame, alarms, or fake urgency.",
  },
]

const ENTRY_SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 26,
  mass: 0.9,
}
const EASE_OUT = [0.22, 1, 0.36, 1] as const

export function OnboardingFlow({ name }: { name: string }) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const step = STEPS[index]
  const isLast = index === STEPS.length - 1
  const progress = ((index + 1) / STEPS.length) * 100

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-fleent-background px-6 py-10">
      <section className="w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-wide text-fleent-mute">
            Welcome, {name}
          </p>
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="h-1 w-24 overflow-hidden rounded-full bg-black/10 sm:w-32"
            >
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                className="h-full rounded-full bg-fleent-orange"
              />
            </div>
            <span
              aria-label={`Step ${index + 1} of ${STEPS.length}`}
              className="text-sm font-semibold tracking-tight text-fleent-ink tabular-nums"
            >
              {index + 1}/{STEPS.length}
            </span>
          </div>
        </div>

        <div className="relative min-h-124">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 44, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.98 }}
              transition={ENTRY_SPRING}
              className="grid min-h-100 grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center"
            >
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-fleent-orange uppercase">
                  {step.eyebrow}
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance text-fleent-ink sm:text-5xl">
                  {step.title}
                </h1>
                <p className="mt-5 text-fleent-body-lg tracking-wide text-fleent-mute">
                  {step.body}
                </p>
              </div>

              <StepVisual id={step.id} />
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              className="rounded-full bg-white text-black hover:bg-slate-100"
              disabled={index === 0}
              onClick={() => setIndex((value) => Math.max(value - 1, 0))}
            >
              Back
            </Button>
            <Button
              className="h-11 rounded-full border-transparent bg-fleent-orange px-6 text-white shadow-none hover:bg-fleent-orange/90"
              onClick={() => {
                if (isLast) {
                  router.push("/dashboard")
                  return
                }
                setIndex((value) => value + 1)
              }}
            >
              {isLast ? "Go to dashboard" : "Continue"}
              <ArrowRight size={16} weight="bold" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function StepVisual({ id }: { id: StepId }) {
  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 14,
        delay: 0.08,
      }}
      className="relative flex h-full min-h-80 w-full flex-col overflow-hidden rounded-3xl bg-white p-7"
    >
      {id === "three" && <ThreeTasksDemo />}
      {id === "dump" && <BrainDumpDemo />}
      {id === "flip" && <FlipDemo />}
      {id === "rhythm" && <RhythmDemo />}
    </motion.div>
  )
}

// ── Step 1 ──────────────────────────────────────────────
// A list of six tasks crowds in, then four dim and three
// settle as "today's three" with checkmarks. Loops.

const ALL_TASKS = [
  "Email mom back",
  "Renew car insurance",
  "Pick up laundry",
  "Reply to Sam's PR",
  "Call the dentist",
  "Finish the doc draft",
]
const KEPT_INDICES = new Set([0, 2, 5])

function ThreeTasksDemo() {
  const [phase, setPhase] = useState<"crowded" | "focused">("crowded")

  useEffect(() => {
    const id = setInterval(() => {
      setPhase((p) => (p === "crowded" ? "focused" : "crowded"))
    }, 3600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold tracking-[0.14em] text-fleent-mute uppercase">
          Today
        </p>
        <motion.span
          animate={{ opacity: phase === "focused" ? 1 : 0.4 }}
          transition={{ duration: 0.4 }}
          className="text-xs font-semibold tracking-wide text-fleent-orange"
        >
          {phase === "focused" ? "Capped at 3" : "6 floating"}
        </motion.span>
      </div>

      <ul className="mt-4 flex flex-col gap-1.5">
        {ALL_TASKS.map((task, i) => {
          const kept = KEPT_INDICES.has(i)
          const dimmed = phase === "focused" && !kept
          return (
            <motion.li
              key={task}
              animate={{
                opacity: dimmed ? 0.25 : 1,
                x: dimmed ? -4 : 0,
              }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="flex items-center gap-3 rounded-xl px-3 py-2"
            >
              <motion.span
                animate={{
                  backgroundColor:
                    phase === "focused" && kept ? "#FF8629" : "#E5E5E5",
                  scale: phase === "focused" && kept ? 1 : 0.85,
                }}
                transition={{ duration: 0.4 }}
                className="inline-flex size-5 items-center justify-center rounded-full text-white"
              >
                <AnimatePresence>
                  {phase === "focused" && kept && (
                    <motion.span
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check size={11} weight="bold" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
              <motion.span
                animate={{
                  color: phase === "focused" && !kept ? "#828181" : "#000000",
                }}
                transition={{ duration: 0.4 }}
                className="text-sm font-medium tracking-wide"
              >
                {task}
              </motion.span>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

// ── Step 2 ──────────────────────────────────────────────
// A messy brain dump types itself out, then morphs into a
// clean ranked list.

const RAW_DUMP =
  "ugh — email mom, dentist call sometime, that PR from sam, laundry, doc draft, insurance ??"
const SORTED = ["Email mom back", "Reply to Sam's PR", "Pick up laundry"]

function BrainDumpDemo() {
  const [phase, setPhase] = useState<"typing" | "sorting" | "sorted">("typing")
  const [typed, setTyped] = useState("")

  useEffect(() => {
    if (phase !== "typing") return
    if (typed.length >= RAW_DUMP.length) {
      const t = setTimeout(() => setPhase("sorting"), 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setTyped(RAW_DUMP.slice(0, typed.length + 1))
    }, 28)
    return () => clearTimeout(t)
  }, [typed, phase])

  useEffect(() => {
    if (phase === "sorting") {
      const t = setTimeout(() => setPhase("sorted"), 280)
      return () => clearTimeout(t)
    }
    if (phase === "sorted") {
      const t = setTimeout(() => {
        setTyped("")
        setPhase("typing")
      }, 2800)
      return () => clearTimeout(t)
    }
  }, [phase])

  return (
    <div className="flex h-full flex-col">
      <p className="text-xs font-semibold tracking-[0.14em] text-fleent-mute uppercase">
        {phase === "typing" ? "Brain dump" : "Sorted"}
      </p>

      <div className="mt-4 flex-1">
        <AnimatePresence mode="wait">
          {phase !== "sorted" ? (
            <motion.p
              key="raw"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="text-sm leading-relaxed tracking-wide text-fleent-ink"
            >
              {typed}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="ml-0.5 inline-block w-0.5 -translate-y-0.5 align-middle"
              >
                <span className="block h-4 w-0.5 bg-fleent-orange" />
              </motion.span>
            </motion.p>
          ) : (
            <motion.ul
              key="sorted"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                },
              }}
              className="flex flex-col gap-2"
            >
              {SORTED.map((line, i) => (
                <motion.li
                  key={line}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: "spring",
                        bounce: 0.1,
                        duration: 0.4,
                      },
                    },
                  }}
                  className="flex items-center gap-3 rounded-xl bg-[#F3F3F3] px-3 py-2.5"
                >
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-fleent-orange text-[10px] font-bold text-white tabular-nums">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium tracking-wide text-fleent-ink">
                    {line}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Step 3 ──────────────────────────────────────────────
// A daunting task title appears, gets struck through, and
// the AI's tiny first-step action emerges. Cycles through
// pairs.

const FLIP_PAIRS = [
  {
    big: "Write the quarterly report",
    small: "Open the doc and type the title.",
  },
  {
    big: "Call the dentist",
    small: "Find their number in Contacts.",
  },
  {
    big: "Clean the garage",
    small: "Walk over and pick up one box.",
  },
  {
    big: "Reply to all emails",
    small: "Open the inbox. Read the first one.",
  },
]

function FlipDemo() {
  const [pair, setPair] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setPair((p) => (p + 1) % FLIP_PAIRS.length)
    }, 3400)
    return () => clearInterval(id)
  }, [])

  const current = FLIP_PAIRS[pair]

  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-xs font-semibold tracking-[0.14em] text-fleent-mute uppercase">
        Flip
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={pair}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.32, ease: EASE_OUT }}
          className="mt-4 flex flex-col gap-5"
        >
          <motion.span
            initial={{ textDecorationColor: "rgba(130,129,129,0)" }}
            animate={{ textDecorationColor: "rgba(130,129,129,0.6)" }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-2xl leading-tight font-bold tracking-tight text-fleent-mute line-through decoration-2"
          >
            {current.big}
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.45, ease: EASE_OUT }}
            className="flex items-start gap-3"
          >
            <span className="mt-1 text-xl font-bold text-fleent-orange">→</span>
            <span className="text-2xl leading-tight font-bold tracking-tight text-fleent-ink">
              {current.small}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Step 4 ──────────────────────────────────────────────
// A vertical day strip with a moving "now" marker that
// glides between time slots, suggesting calendar-aware
// rhythm without alarms.

const RHYTHM_SLOTS = [
  { time: "9:12 a.m.", label: "Quiet start", color: "fleent-blue" as const },
  { time: "10:45 a.m.", label: "Deep work", color: "fleent-orange" as const },
  { time: "1:30 p.m.", label: "Reset walk", color: "fleent-green" as const },
  { time: "3:15 p.m.", label: "Quick wins", color: "fleent-orange" as const },
  { time: "5:00 p.m.", label: "Wind down", color: "fleent-blue" as const },
]

const COLOR_MAP: Record<
  "fleent-blue" | "fleent-orange" | "fleent-green",
  string
> = {
  "fleent-blue": "#00A6FA",
  "fleent-orange": "#FF8629",
  "fleent-green": "#00D74C",
}

function RhythmDemo() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % RHYTHM_SLOTS.length)
    }, 1600)
    return () => clearInterval(id)
  }, [])

  const activeColor = useMemo(
    () => COLOR_MAP[RHYTHM_SLOTS[active].color],
    [active]
  )

  return (
    <div className="flex h-full flex-col">
      <p className="text-xs font-semibold tracking-[0.14em] text-fleent-mute uppercase">
        Today&apos;s rhythm
      </p>

      <ul className="relative mt-4 flex flex-col gap-1">
        {RHYTHM_SLOTS.map((slot, i) => {
          const isActive = i === active
          return (
            <motion.li
              key={slot.time}
              animate={{ opacity: isActive ? 1 : 0.4 }}
              transition={{ duration: 0.35 }}
              className="relative flex items-center gap-4 py-1.5 pl-4"
            >
              {isActive && (
                <motion.span
                  layoutId="rhythm-marker"
                  aria-hidden
                  transition={{
                    type: "spring",
                    bounce: 0.18,
                    duration: 0.5,
                  }}
                  className="absolute top-1 left-0 h-[calc(100%-0.5rem)] w-0.5 rounded-full"
                  style={{ backgroundColor: activeColor }}
                />
              )}
              <span className="w-20 text-xs tracking-wide text-fleent-mute tabular-nums">
                {slot.time}
              </span>
              <motion.span
                animate={{
                  color: isActive ? activeColor : "#000000",
                }}
                transition={{ duration: 0.35 }}
                className="text-sm font-semibold tracking-tight"
              >
                {slot.label}
              </motion.span>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
