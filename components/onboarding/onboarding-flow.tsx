"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Sparkle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    eyebrow: "Page 1 of 4",
    title: "Keep the day small.",
    body: "Fleent starts with three visible tasks so your brain does not have to negotiate with the whole backlog.",
    label: "Three tasks",
  },
  {
    eyebrow: "Page 2 of 4",
    title: "Capture messy thoughts.",
    body: "Drop the rough version first. You can sort, rank, and clean it up when your attention returns.",
    label: "Brain dump",
  },
  {
    eyebrow: "Page 3 of 4",
    title: "Flip dread into motion.",
    body: "When a task feels too large, Fleent turns it into a tiny physical action you can start now.",
    label: "10-second start",
  },
  {
    eyebrow: "Page 4 of 4",
    title: "Let rhythm beat pressure.",
    body: "Calendar-aware nudges help you return without shame, alarms, or fake urgency.",
    label: "Daily rhythm",
  },
];

export function OnboardingFlow({ name }: { name: string }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-fleent-background px-6 py-10">
      <section className="w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-wide text-fleent-mute">
            Welcome, {name}
          </p>
          <div className="flex gap-2">
            {STEPS.map((item, itemIndex) => (
              <span
                key={item.label}
                className={`h-2 rounded-full transition-all duration-300 ${
                  itemIndex <= index
                    ? "w-8 bg-fleent-orange"
                    : "w-2 bg-black/12"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative min-h-[31rem] overflow-hidden rounded-3xl bg-white p-7 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: 44, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
                mass: 0.9,
              }}
              className="grid min-h-[25rem] grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center"
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

              <motion.div
                initial={{ y: 14, rotate: -1 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 14,
                  delay: 0.08,
                }}
                className="rounded-3xl bg-[#F3F3F3] p-5"
              >
                <div className="rounded-3xl bg-fleent-ink p-6 text-white">
                  <Sparkle size={24} weight="fill" className="text-fleent-orange" />
                  <p className="mt-5 text-xs font-semibold tracking-[0.12em] text-white/50 uppercase">
                    {step.label}
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    {["visible", "small", "startable"].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3"
                      >
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-fleent-orange text-white">
                          <Check size={13} weight="bold" />
                        </span>
                        <span className="text-sm font-medium tracking-wide">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              className="rounded-full"
              disabled={index === 0}
              onClick={() => setIndex((value) => Math.max(value - 1, 0))}
            >
              Back
            </Button>
            <Button
              className="h-11 rounded-full border-transparent bg-fleent-orange px-6 text-white shadow-none hover:bg-fleent-orange/90"
              onClick={() => {
                if (isLast) {
                  router.push("/dashboard");
                  return;
                }
                setIndex((value) => value + 1);
              }}
            >
              {isLast ? "Go to dashboard" : "Continue"}
              <ArrowRight size={16} weight="bold" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
