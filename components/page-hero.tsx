"use client";

import { motion } from "motion/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

export function PageHero({
  eyebrow,
  heading,
  subheading,
}: {
  eyebrow?: string;
  heading: string;
  subheading?: string;
}) {
  return (
    <section className="bg-fleent-background pt-32 pb-12 sm:pt-40 sm:pb-16">
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
      >
        {eyebrow && (
          <motion.span
            variants={item}
            className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium tracking-wide text-fleent-mute"
          >
            {eyebrow}
          </motion.span>
        )}
        <motion.h1
          variants={item}
          className="mt-5 text-4xl font-bold tracking-tight text-balance text-fleent-ink sm:text-5xl"
        >
          {heading}
        </motion.h1>
        {subheading && (
          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-fleent-body-lg tracking-wide text-balance text-fleent-mute"
          >
            {subheading}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}
