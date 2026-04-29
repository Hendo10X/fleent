"use client";

import { motion } from "motion/react";
import {
  ArrowDown,
  CalendarDots,
  HandTap,
  type Icon,
} from "@phosphor-icons/react";
import data from "./data.json";

type Color = "orange" | "green" | "blue";
type IconName = "ArrowDown" | "HandTap" | "CalendarDots";

type Pillar = {
  icon: IconName;
  color: Color;
  heading: string;
  body: string;
};

const PILLARS: { items: Pillar[] } = data as never;

const ICONS: Record<IconName, Icon> = {
  ArrowDown,
  HandTap,
  CalendarDots,
};

const COLOR_CLASS: Record<Color, string> = {
  orange: "text-fleent-orange",
  green: "text-fleent-green",
  blue: "text-fleent-blue",
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

export function Pillars() {
  return (
    <section className="bg-fleent-background py-24 sm:py-32">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={container}
        className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 sm:gap-10 md:grid-cols-3 md:gap-8"
      >
        {PILLARS.items.map((pillar) => {
          const IconComponent = ICONS[pillar.icon];
          return (
            <motion.article
              key={pillar.heading}
              variants={item}
              className="flex flex-col items-center text-center"
            >
              <span
                className={`mb-6 inline-flex size-14 items-center justify-center rounded-full bg-[#F2F2F2] ${COLOR_CLASS[pillar.color]}`}
              >
                <IconComponent size={28} weight="regular" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight text-fleent-ink">
                {pillar.heading}
              </h3>
              <p className="mt-3 max-w-sm text-fleent-body-lg tracking-wide text-fleent-mute">
                {pillar.body}
              </p>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
