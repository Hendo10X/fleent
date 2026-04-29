"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import data from "./data.json";

type CTA = { label: string; href: string; variant: "orange" | "white" };

type HeroImage = { src: string; alt: string; width: number; height: number };

const HERO: {
  heading: string[];
  subheading: string;
  ctas: CTA[];
  image: HeroImage;
  imageMobile: HeroImage;
} = data as never;

const CTA_BASE =
  "inline-flex h-14 items-center justify-center rounded-full px-8 text-base font-semibold tracking-wide transition-colors duration-200 ease-out focus-visible:ring-4 focus-visible:ring-black/10 focus-visible:outline-none";

const CTA_VARIANT: Record<CTA["variant"], string> = {
  orange: "bg-fleent-orange text-white hover:bg-fleent-orange/90",
  white: "bg-white text-fleent-ink hover:bg-slate-100",
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

const cards = {
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

export function Hero() {
  return (
    <section className="relative bg-fleent-background pt-32 pb-12 sm:pt-40">
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
      >
        <motion.h1
          variants={item}
          className="text-fleent-display font-semibold tracking-tight text-balance text-fleent-ink"
        >
          {HERO.heading.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-fleent-body-lg tracking-wide text-balance text-fleent-mute"
        >
          {HERO.subheading}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {HERO.ctas.map((cta) => (
            <Link
              key={cta.label}
              href={cta.href}
              className={`${CTA_BASE} ${CTA_VARIANT[cta.variant]}`}
            >
              {cta.label}
            </Link>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={cards}
        className="mx-auto mt-10 w-full max-w-5xl px-2 sm:mt-16 sm:px-6"
      >
        <Image
          src={HERO.imageMobile.src}
          alt={HERO.imageMobile.alt}
          width={HERO.imageMobile.width}
          height={HERO.imageMobile.height}
          priority
          className="block h-auto w-full select-none sm:hidden"
          draggable={false}
        />
        <Image
          src={HERO.image.src}
          alt={HERO.image.alt}
          width={HERO.image.width}
          height={HERO.image.height}
          priority
          className="hidden h-auto w-full select-none sm:block"
          draggable={false}
        />
      </motion.div>
    </section>
  );
}
