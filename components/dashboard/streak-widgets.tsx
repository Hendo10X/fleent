"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Fire } from "@phosphor-icons/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const STREAK_ICON_SIZE = 18;
const streakGlyphBoxClass =
  "inline-flex size-7 shrink-0 items-center justify-center p-0 leading-none [&_svg]:block [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:shrink-0";

export function StreakChip({ count }: { count: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const level = getStreakLevel(count);
  const toggleStreak = () => setIsOpen((v) => !v);

  return (
    <div className="relative shrink-0">
      <div
        role="group"
        className="inline-flex h-7 min-h-7 flex-nowrap items-center gap-1 rounded-full px-1.5 py-0 outline-none"
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={toggleStreak}
          aria-expanded={isOpen}
          aria-label={`${count} day streak, ${level.label} level`}
          className={`inline-flex h-full shrink-0 items-center justify-center tabular-nums text-base font-bold leading-none outline-none ${level.textClass}`}
        >
          {count}
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={toggleStreak}
          aria-expanded={isOpen}
          aria-label={`Streak level: ${level.label}`}
          className={`${streakGlyphBoxClass} shrink-0 outline-none ${level.textClass}`}
        >
          <motion.span
            animate={{
              opacity: count > 0 ? [1, 0.72, 1] : 1,
            }}
            transition={
              count > 0
                ? { duration: 1.8, ease: "easeInOut", repeat: Infinity }
                : { duration: 0.2 }
            }
            className="flex h-full w-full items-center justify-center"
          >
            <Fire
              size={STREAK_ICON_SIZE}
              weight={level.iconWeight}
              className="text-current"
            />
          </motion.span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            style={{ boxShadow: "none", filter: "none" }}
            className="absolute right-0 top-[calc(100%+8px)] z-30 w-52 rounded-2xl border border-black/5 bg-white p-3 shadow-none ring-0 drop-shadow-none"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
              Streak level
            </p>
            <p className={`mt-1 text-sm font-semibold ${level.textClass}`}>
              {level.label}
            </p>
            <p className="mt-1 text-xs tracking-wide text-fleent-mute">
              {level.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStreakLevel(count: number) {
  if (count <= 0) {
    return {
      label: "No flame",
      description: "Start a streak today to light your first flame.",
      textClass: "text-fleent-mute",
      iconWeight: "regular" as const,
    };
  }

  if (count <= 3) {
    return {
      label: "Kindling",
      description: "Good start. Keep momentum for 4+ days.",
      textClass: "text-fleent-orange",
      iconWeight: "duotone" as const,
    };
  }

  if (count <= 7) {
    return {
      label: "Flame",
      description: "Solid consistency. One full week unlocked.",
      textClass: "text-fleent-orange",
      iconWeight: "fill" as const,
    };
  }

  if (count <= 14) {
    return {
      label: "Blaze",
      description: "Strong rhythm. You are in deep flow mode.",
      textClass: "text-fleent-orange",
      iconWeight: "fill" as const,
    };
  }

  return {
    label: "Inferno",
    description: "Elite streak. Keep guarding this momentum.",
    textClass: "text-fleent-orange",
    iconWeight: "fill" as const,
  };
}
