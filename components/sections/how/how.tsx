"use client";

import Image from "next/image";
import { useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
} from "motion/react";
import { CircleNotch } from "@phosphor-icons/react";
import data from "./data.json";

type Color = "orange" | "blue" | "green";

type Step = {
  id: string;
  title: string;
  color: Color;
  body: string;
  image: { src: string; alt: string; width: number; height: number };
};

const HOW: {
  eyebrow: string;
  heading: string;
  subheading: string;
  steps: Step[];
} = data as never;

const TITLE_COLOR: Record<Color, string> = {
  orange: "text-fleent-orange",
  blue: "text-fleent-blue",
  green: "text-fleent-green",
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring" as const, bounce: 0.18, duration: 0.45 };

const headerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const headerItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

export function How() {
  const [activeId, setActiveId] = useState<string>(HOW.steps[0].id);
  const activeStep =
    HOW.steps.find((s) => s.id === activeId) ?? HOW.steps[0];

  return (
    <MotionConfig transition={SPRING}>
      <section className="bg-fleent-background py-24 sm:py-32">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerContainer}
          className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
        >
          <motion.span
            variants={headerItem}
            className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium tracking-wide text-fleent-mute"
          >
            {HOW.eyebrow}
          </motion.span>
          <motion.h2
            variants={headerItem}
            className="mt-5 text-4xl font-bold tracking-tight text-balance text-fleent-ink sm:text-5xl"
          >
            {HOW.heading}
          </motion.h2>
          <motion.p
            variants={headerItem}
            className="mt-5 max-w-xl text-fleent-body tracking-wide text-balance text-fleent-mute"
          >
            {HOW.subheading}
          </motion.p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-2 md:gap-12">
          <LayoutGroup id="how-steps">
            <ul
              className="flex flex-col gap-1"
              onMouseLeave={() => setActiveId(HOW.steps[0].id)}
            >
              {HOW.steps.map((step) => {
                const isActive = step.id === activeStep.id;
                return (
                  <motion.li
                    key={step.id}
                    animate={{ opacity: isActive ? 1 : 0.4 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="relative"
                    onMouseEnter={() => setActiveId(step.id)}
                    onFocus={() => setActiveId(step.id)}
                    tabIndex={-1}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="how-pill"
                        aria-hidden
                        transition={SPRING}
                        className="absolute inset-0 rounded-2xl bg-[#F3F3F3]"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveId(step.id)}
                      className="relative block w-full cursor-pointer rounded-2xl px-5 py-5 text-left"
                    >
                      <h3
                        className={`text-lg font-semibold tracking-tight ${TITLE_COLOR[step.color]}`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`mt-2 text-fleent-body tracking-wide transition-colors duration-300 ${
                          isActive ? "text-fleent-ink" : "text-fleent-mute"
                        }`}
                      >
                        {step.body}
                      </p>
                    </button>
                  </motion.li>
                );
              })}
            </ul>

            <div className="relative h-full min-h-[480px] w-full overflow-hidden rounded-3xl bg-white">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeStep.id}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.32, ease: EASE_OUT }}
                  className="absolute inset-0"
                >
                  <StepScene step={activeStep} />
                </motion.div>
              </AnimatePresence>
            </div>
          </LayoutGroup>
        </div>
      </section>
    </MotionConfig>
  );
}

function StepScene({ step }: { step: Step }) {
  if (step.id === "sync") return <SyncScene image={step.image} />;
  if (step.id === "dump") return <DumpScene image={step.image} />;
  return <FlipScene image={step.image} />;
}

function SyncScene({ image }: { image: Step["image"] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-center gap-3 px-6 pt-14 pb-10">
        <span className="text-4xl font-extrabold tracking-tight text-fleent-orange">
          gmail
        </span>
        <span className="text-4xl font-extrabold tracking-tight text-fleent-blue">
          outlook
        </span>
        <span className="text-4xl font-extrabold tracking-tight text-fleent-green">
          yahoo
        </span>
      </div>
      <div className="mt-auto px-6">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="block h-auto w-full select-none"
          draggable={false}
          priority
        />
      </div>
    </div>
  );
}

function DumpScene({ image }: { image: Step["image"] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="block h-auto w-full select-none"
          draggable={false}
          priority
        />
      </div>
      <div className="mt-10 flex items-center justify-center gap-2 px-6">
        <CircleNotch
          size={20}
          weight="regular"
          className="animate-spin text-fleent-ink"
        />
        <span className="text-fleent-body tracking-wide text-fleent-ink">
          Adding your task.....
        </span>
      </div>
    </div>
  );
}

function FlipScene({ image }: { image: Step["image"] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-center gap-2 px-6 pt-12 pb-8">
        <span className="text-2xl font-extrabold tracking-tight text-fleent-green">
          3 main task added!
        </span>
        <span className="text-2xl font-extrabold tracking-tight text-fleent-orange">
          2 pending task
        </span>
        <span className="text-2xl font-extrabold tracking-tight text-fleent-blue">
          4 day streaks
        </span>
      </div>
      <div className="mt-auto px-6">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="block h-auto w-full select-none"
          draggable={false}
          priority
        />
      </div>
    </div>
  );
}
