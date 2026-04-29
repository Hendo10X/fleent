"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import {
  BellSimple,
  CaretDown,
  type Icon,
  Lightbulb,
  List,
  Target,
  Waveform,
  X,
} from "@phosphor-icons/react";
import data from "./data.json";

type IconName = "Target" | "Lightbulb" | "Waveform" | "BellSimple";
type Color = "orange" | "blue" | "green";

type LinkItem = {
  label: string;
  description: string;
  href: string;
  icon: IconName;
  color: Color;
};
type NavLink =
  | { label: string; href: string; items?: undefined }
  | { label: string; items: LinkItem[]; href?: undefined };

const NAV: {
  logo: { label: string; href: string };
  links: NavLink[];
  actions: {
    login: { label: string; href: string };
    register: { label: string; href: string };
  };
} = data as never;

const FEATURE_ICONS: Record<IconName, Icon> = {
  Target,
  Lightbulb,
  Waveform,
  BellSimple,
};

const COLOR_TEXT: Record<Color, string> = {
  orange: "text-fleent-orange",
  blue: "text-fleent-blue",
  green: "text-fleent-green",
};

const SPRING = { type: "spring" as const, bounce: 0.18, duration: 0.45 };
const FAST = { type: "spring" as const, bounce: 0.1, duration: 0.28 };

const LINK_CLASS =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium tracking-wide text-fleent-ink transition-colors duration-200 ease-out hover:bg-[#F3F3F3]";

export function Navbar() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenId(null), 140);
  };

  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    if (!openId && !mobileOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenId(null);
        setMobileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenId(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [openId, mobileOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const activeMenu = openId
    ? (NAV.links.find((l) => l.label === openId && l.items) ?? null)
    : null;

  const featuresMenu = NAV.links.find((l) => l.items);
  const otherLinks = NAV.links.filter((l) => !l.items);

  return (
    <MotionConfig transition={SPRING}>
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
        <motion.nav
          ref={navRef}
          aria-label="Primary"
          className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white"
          onMouseLeave={() => {
            if (!mobileOpen) scheduleClose();
          }}
          onMouseEnter={cancelClose}
        >
          <div className="flex items-center gap-1 px-2 py-1.5">
            <Link
              href={NAV.logo.href}
              aria-label={NAV.logo.label}
              className="flex items-center px-2"
              onClick={() => setMobileOpen(false)}
            >
              <Image
                src="/images/fleent.svg"
                alt={NAV.logo.label}
                width={56}
                height={18}
                priority
              />
            </Link>

            <ul
              className="hidden flex-1 items-center justify-center gap-0.5 md:flex"
              onMouseEnter={() => {
                if (openId) setOpenId(null);
              }}
            >
              {NAV.links.map((link) => {
                const id = link.label;
                const hasMenu = Array.isArray(link.items);
                const isOpen = openId === id;

                return (
                  <li
                    key={id}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      cancelClose();
                      if (hasMenu) setOpenId(id);
                      else setOpenId(null);
                    }}
                  >
                    {hasMenu ? (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-haspopup="menu"
                        onFocus={() => setOpenId(id)}
                        onClick={() => setOpenId(isOpen ? null : id)}
                        className={LINK_CLASS}
                      >
                        <span>{link.label}</span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={FAST}
                          className="ml-0.5 inline-flex"
                        >
                          <CaretDown size={12} weight="bold" />
                        </motion.span>
                      </button>
                    ) : (
                      <Link href={link.href!} className={LINK_CLASS}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="ml-auto flex items-center gap-0.5">
              <Link
                href={NAV.actions.login.href}
                className={`hidden md:inline-flex ${LINK_CLASS} ${
                  mobileOpen ? "!inline-flex" : ""
                }`}
              >
                {NAV.actions.login.label}
              </Link>
              <Link
                href={NAV.actions.register.href}
                className={`ml-0.5 inline-flex items-center justify-center rounded-full bg-black px-3 py-1.5 text-[13px] font-semibold tracking-wide text-white transition-colors duration-200 ease-out hover:bg-slate-700 ${
                  mobileOpen ? "" : "hidden md:inline-flex"
                }`}
              >
                {NAV.actions.register.label}
              </Link>
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="ml-1 inline-flex size-9 items-center justify-center rounded-full text-fleent-ink transition-colors duration-200 ease-out hover:bg-[#F3F3F3] md:hidden"
              >
                <IconSwap
                  open={mobileOpen}
                  iconA={<List size={20} weight="bold" />}
                  iconB={<X size={20} weight="bold" />}
                />
              </button>
            </div>
          </div>

          <ExpandPanel openId={openId} menu={activeMenu} />

          <MobilePanel
            open={mobileOpen}
            features={featuresMenu?.items ?? []}
            otherLinks={otherLinks}
            onNavigate={() => {
              setMobileOpen(false);
              setOpenId(null);
            }}
          />
        </motion.nav>
      </header>
    </MotionConfig>
  );
}

function IconSwap({
  open,
  iconA,
  iconB,
}: {
  open: boolean;
  iconA: ReactNode;
  iconB: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: "easeInOut" as const };

  return (
    <span
      aria-hidden
      className="relative inline-grid place-items-center"
      style={{ width: 20, height: 20 }}
    >
      <motion.span
        className="col-start-1 row-start-1 inline-flex"
        animate={{
          opacity: open ? 0 : 1,
          scale: open ? 0.25 : 1,
          filter: open ? "blur(2px)" : "blur(0px)",
        }}
        transition={transition}
        style={{ willChange: "opacity, transform, filter" }}
      >
        {iconA}
      </motion.span>
      <motion.span
        className="col-start-1 row-start-1 inline-flex"
        animate={{
          opacity: open ? 1 : 0,
          scale: open ? 1 : 0.25,
          filter: open ? "blur(0px)" : "blur(2px)",
        }}
        transition={transition}
        style={{ willChange: "opacity, transform, filter" }}
      >
        {iconB}
      </motion.span>
    </span>
  );
}

function ExpandPanel({
  openId,
  menu,
}: {
  openId: string | null;
  menu: NavLink | null;
}) {
  const isOpen = Boolean(openId && menu?.items);

  return (
    <motion.div
      initial={false}
      animate={{ height: isOpen ? "auto" : 0 }}
      transition={SPRING}
      className="hidden overflow-hidden md:block"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isOpen && menu?.items && (
          <motion.div
            key={menu.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="px-4 pt-2 pb-4"
          >
            <DropdownItems key={menu.label} items={menu.items} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DropdownItems({ items }: { items: LinkItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <LayoutGroup id="nav-dropdown-pill">
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.04, delayChildren: 0.04 },
            },
          }}
          className="grid grid-cols-1 gap-0.5 sm:grid-cols-2"
          onMouseLeave={() => setHovered(null)}
        >
          {items.map((item) => {
            const isHovered = hovered === item.label;
            const FeatureIcon = FEATURE_ICONS[item.icon];
            return (
              <motion.li
                key={item.label}
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", bounce: 0.1, duration: 0.32 },
                  },
                }}
                className="relative"
                onMouseEnter={() => setHovered(item.label)}
              >
                {isHovered && (
                  <motion.span
                    layoutId="nav-dropdown-pill"
                    aria-hidden
                    transition={SPRING}
                    className="absolute inset-0 rounded-2xl bg-slate-100"
                  />
                )}
                <Link
                  href={item.href}
                  role="menuitem"
                  className="relative flex items-start gap-3 rounded-2xl px-4 py-3"
                >
                  <span
                    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white ${COLOR_TEXT[item.color]}`}
                  >
                    <FeatureIcon size={20} weight="regular" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-semibold tracking-tight text-fleent-ink">
                      {item.label}
                    </span>
                    <span className="text-xs tracking-wide text-fleent-mute">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </LayoutGroup>
    </motion.div>
  );
}

function MobilePanel({
  open,
  features,
  otherLinks,
  onNavigate,
}: {
  open: boolean;
  features: LinkItem[];
  otherLinks: NavLink[];
  onNavigate: () => void;
}) {
  return (
    <motion.div
      initial={false}
      animate={{ height: open ? "auto" : 0 }}
      transition={SPRING}
      className="overflow-hidden md:hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {open && (
          <div className="px-3 pt-2 pb-4">
            <motion.div
              key="mobile-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <p className="px-2 pt-1 pb-3 text-[11px] font-semibold tracking-[0.14em] text-fleent-mute uppercase">
                Features
              </p>

              <motion.ul
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.04,
                      delayChildren: 0.04,
                    },
                  },
                }}
                className="grid grid-cols-2 gap-2"
              >
                {features.map((item) => {
                  const FeatureIcon = FEATURE_ICONS[item.icon];
                  return (
                    <motion.li
                      key={item.label}
                      variants={{
                        hidden: { opacity: 0, y: 8 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            type: "spring",
                            bounce: 0.1,
                            duration: 0.32,
                          },
                        },
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className="flex h-full flex-col gap-3 rounded-2xl bg-[#F3F3F3] p-4"
                      >
                        <span
                          className={`inline-flex size-10 items-center justify-center rounded-full bg-white ${COLOR_TEXT[item.color]}`}
                        >
                          <FeatureIcon size={20} weight="regular" />
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="text-sm font-semibold tracking-tight text-fleent-ink">
                            {item.label}
                          </span>
                          <span className="text-xs tracking-wide text-fleent-mute">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <ul className="mt-4 flex flex-col">
                {otherLinks.map((link, i) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      bounce: 0.1,
                      duration: 0.3,
                      delay: 0.16 + i * 0.04,
                    }}
                  >
                    <Link
                      href={link.href!}
                      onClick={onNavigate}
                      className="block rounded-2xl px-2 py-3 text-sm font-medium tracking-wide text-fleent-ink transition-colors duration-200 ease-out hover:bg-[#F3F3F3]"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
