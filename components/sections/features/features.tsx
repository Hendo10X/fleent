"use client";

import Image from "next/image";
import { motion } from "motion/react";
import data from "./data.json";

type ImagePosition = "top" | "bottom";
type BleedSide = "all" | "left" | "right" | "top" | "bottom";

type FeatureItem = {
  title: string;
  body: string;
  image: { src: string; alt: string; width: number; height: number };
  imagePosition: ImagePosition;
  imageBleed?: boolean | BleedSide;
};

const FEATURES: {
  eyebrow: string;
  heading: string;
  subheading: string;
  items: FeatureItem[];
} = data as never;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

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

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const card = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

export function Features() {
  return (
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
          {FEATURES.eyebrow}
        </motion.span>
        <motion.h2
          variants={headerItem}
          className="mt-5 text-4xl font-bold tracking-tight text-balance text-fleent-ink sm:text-5xl"
        >
          {FEATURES.heading}
        </motion.h2>
        <motion.p
          variants={headerItem}
          className="mt-5 max-w-xl text-fleent-body tracking-wide text-balance text-fleent-mute"
        >
          {FEATURES.subheading}
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={gridContainer}
        className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-2"
      >
        {FEATURES.items.map((item) => (
          <motion.article
            key={item.title}
            variants={card}
            className="flex flex-col overflow-hidden rounded-3xl bg-white"
          >
            {item.imagePosition === "top" && (
              <FeatureImage
                image={item.image}
                position="top"
                bleed={item.imageBleed}
              />
            )}

            <div className="flex flex-col gap-3 px-6 py-6 sm:px-8">
              <h3 className="text-2xl font-bold tracking-tight text-fleent-ink">
                {item.title}
              </h3>
              <p className="whitespace-pre-line text-fleent-body tracking-wide text-fleent-mute">
                {item.body}
              </p>
            </div>

            {item.imagePosition === "bottom" && (
              <FeatureImage
                image={item.image}
                position="bottom"
                bleed={item.imageBleed}
                className="mt-auto"
              />
            )}
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

function FeatureImage({
  image,
  position,
  bleed,
  className = "",
}: {
  image: FeatureItem["image"];
  position: ImagePosition;
  bleed?: boolean | BleedSide;
  className?: string;
}) {
  const bleedSide: BleedSide | null =
    bleed === true ? "all" : bleed === undefined || bleed === false ? null : bleed;

  const insetClass = getInsetClass(position, bleedSide);
  const isAnyBleed = bleedSide !== null;

  return (
    <div className={`relative w-full ${insetClass} ${className}`}>
      <div
        className={`relative w-full overflow-hidden ${isAnyBleed ? "" : "rounded-2xl"}`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="block h-auto w-full select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}

function getInsetClass(position: ImagePosition, bleed: BleedSide | null): string {
  if (bleed === "all") return "";

  const t = "pt-6 sm:pt-8";
  const r = "pr-6 sm:pr-8";
  const b = "pb-6 sm:pb-8";
  const l = "pl-6 sm:pl-8";

  if (position === "top") {
    if (bleed === "left") return [t, r].join(" ");
    if (bleed === "right") return [t, l].join(" ");
    if (bleed === "top") return [l, r].join(" ");
    return [t, l, r].join(" ");
  }

  if (bleed === "left") return [b, r].join(" ");
  if (bleed === "right") return [b, l].join(" ");
  if (bleed === "bottom") return [l, r].join(" ");
  return [b, l, r].join(" ");
}
