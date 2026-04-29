"use client";

import Link from "next/link";
import { motion } from "motion/react";
import data from "./data.json";

type CTAVariant = "white" | "outline";
type CTALink = { label: string; href: string; variant: CTAVariant };

const CTA: {
  heading: string[];
  subheading: string;
  ctas: CTALink[];
} = data as never;

const CTA_BASE =
  "inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-wide transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30";

const CTA_VARIANT: Record<CTAVariant, string> = {
  white: "bg-white text-fleent-ink hover:bg-slate-100",
  outline: "border border-white/40 text-white hover:bg-white/10",
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

export function Cta() {
  return (
    <section className="bg-fleent-background pt-12 pb-24 sm:pb-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-fleent-orange px-8 py-20 sm:px-16 sm:py-24">
          <CirclePatterns />

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={container}
            className="relative mx-auto flex max-w-xl flex-col items-start"
          >
            <motion.h2
              variants={item}
              className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl"
            >
              {CTA.heading.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </motion.h2>

            <motion.p
              variants={item}
              className="mt-5 text-fleent-body tracking-wide text-white/85"
            >
              {CTA.subheading}
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {CTA.ctas.map((cta) => (
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
        </div>
      </div>
    </section>
  );
}

function CirclePatterns() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <span className="absolute -top-40 -right-40 size-[28rem] rounded-full border border-white/15" />
      <span className="absolute -top-20 -right-20 size-[18rem] rounded-full border border-white/20" />
      <span className="absolute top-12 right-12 size-32 rounded-full border border-white/15" />

      <span className="absolute -bottom-32 -left-32 size-[22rem] rounded-full border border-white/15" />
      <span className="absolute -bottom-16 -left-16 size-44 rounded-full border border-white/20" />
    </div>
  );
}
