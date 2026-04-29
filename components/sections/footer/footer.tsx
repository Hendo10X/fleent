"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  GithubLogo,
  type Icon,
  LinkedinLogo,
  XLogo,
} from "@phosphor-icons/react";
import data from "./data.json";

type SocialIcon = "XLogo" | "LinkedinLogo" | "GithubLogo";

type FooterData = {
  tagline: string;
  demo: {
    headline: string;
    subheading: string;
    placeholder: string;
    buttonLabel: string;
    resetLabel: string;
    resultPrefix: string;
    suggestions: string[];
  };
  columns: { title: string; links: { label: string; href: string }[] }[];
  social: { label: string; icon: SocialIcon; href: string }[];
  copyright: string;
};

const FOOTER: FooterData = data as never;

const SOCIAL_ICONS: Record<SocialIcon, Icon> = {
  XLogo,
  LinkedinLogo,
  GithubLogo,
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring" as const, bounce: 0.18, duration: 0.45 };

export function Footer() {
  return (
    <footer className="bg-fleent-background pt-12 pb-10">
      <div className="mx-auto max-w-6xl px-6">
        <FlipDemo />

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] md:gap-12">
          <div className="flex flex-col gap-3">
            <Link href="/" aria-label="Fleent" className="inline-flex">
              <Image
                src="/images/fleent.svg"
                alt="Fleent"
                width={64}
                height={20}
              />
            </Link>
            <p className="text-fleent-body tracking-wide text-fleent-mute">
              {FOOTER.tagline}
            </p>
          </div>

          {FOOTER.columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold tracking-[0.12em] text-fleent-ink uppercase">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-fleent-body tracking-wide text-fleent-mute transition-colors duration-200 ease-out hover:text-fleent-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-6 border-t border-black/8 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs tracking-wide text-fleent-mute">
            {FOOTER.copyright}
          </p>
          <ul className="flex items-center gap-2">
            {FOOTER.social.map((s) => {
              const SocialIcon = SOCIAL_ICONS[s.icon];
              return (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    aria-label={s.label}
                    className="inline-flex size-9 items-center justify-center rounded-full text-fleent-mute transition-colors duration-200 ease-out hover:bg-[#F3F3F3] hover:text-fleent-ink"
                  >
                    <SocialIcon size={18} weight="regular" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FlipDemo() {
  const [value, setValue] = useState("");
  const [flipped, setFlipped] = useState<{ task: string; action: string } | null>(
    null,
  );
  const lastIndex = useRef<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function nextSuggestion(): string {
    const pool = FOOTER.demo.suggestions;
    if (pool.length <= 1) return pool[0] ?? "";
    let i = Math.floor(Math.random() * pool.length);
    if (i === lastIndex.current) i = (i + 1) % pool.length;
    lastIndex.current = i;
    return pool[i];
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const task = value.trim();
    if (!task) return;
    setFlipped({ task, action: nextSuggestion() });
  }

  function handleReset() {
    setFlipped(null);
    setValue("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <section
      aria-label="Try a flip"
      className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-12"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute -top-24 -right-24 size-72 rounded-full border border-fleent-orange/10" />
        <span className="absolute -top-12 -right-12 size-44 rounded-full border border-fleent-orange/15" />
      </div>

      <div className="relative max-w-xl">
        <h3 className="text-2xl font-bold tracking-tight text-fleent-ink sm:text-3xl">
          {FOOTER.demo.headline}
        </h3>
        <p className="mt-3 text-fleent-body tracking-wide text-fleent-mute">
          {FOOTER.demo.subheading}
        </p>
      </div>

      <div className="relative mt-6">
        <AnimatePresence mode="wait" initial={false}>
          {flipped === null ? (
            <motion.form
              key="input"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row"
            >
              <label htmlFor="flip-input" className="sr-only">
                Task
              </label>
              <input
                ref={inputRef}
                id="flip-input"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={FOOTER.demo.placeholder}
                autoComplete="off"
                className="h-14 w-full flex-1 rounded-full bg-[#F3F3F3] px-5 py-4 text-fleent-body tracking-wide text-fleent-ink outline-none placeholder:text-fleent-mute focus-visible:ring-4 focus-visible:ring-fleent-orange/20 sm:h-12 sm:py-0"
              />
              <button
                type="submit"
                disabled={!value.trim()}
                className="inline-flex h-14 items-center justify-center gap-1.5 rounded-full bg-fleent-orange px-6 text-sm font-semibold tracking-wide text-white transition-colors duration-200 ease-out hover:bg-fleent-orange/90 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
              >
                {FOOTER.demo.buttonLabel}
                <ArrowRight size={16} weight="bold" />
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={SPRING}
              className="flex w-full max-w-xl flex-col gap-4"
            >
              <div className="flex flex-col gap-2 rounded-2xl bg-[#F3F3F3] px-5 py-4">
                <span className="text-xs font-medium tracking-wide text-fleent-mute uppercase">
                  You said
                </span>
                <span className="text-fleent-body tracking-wide text-fleent-ink line-through decoration-fleent-mute/40">
                  {flipped.task}
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.08 }}
                className="flex flex-col gap-2 rounded-2xl bg-fleent-orange/8 px-5 py-4"
              >
                <span className="text-xs font-medium tracking-wide text-fleent-orange uppercase">
                  Right now
                </span>
                <span className="text-fleent-body tracking-wide text-fleent-ink">
                  {FOOTER.demo.resultPrefix}{" "}
                  <span className="font-semibold">{flipped.action}</span>
                </span>
              </motion.div>

              <button
                type="button"
                onClick={handleReset}
                className="self-start rounded-full px-3 py-1.5 text-sm font-medium tracking-wide text-fleent-mute transition-colors duration-200 ease-out hover:text-fleent-ink"
              >
                {FOOTER.demo.resetLabel}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
