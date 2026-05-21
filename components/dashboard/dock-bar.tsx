"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutGroup, motion, MotionConfig } from "motion/react";
import {
  ChartBar,
  House,
  type Icon,
  Sparkle,
  Timer,
} from "@phosphor-icons/react";

type DockEntry = {
  id: string;
  label: string;
  icon: Icon;
  href: string;
};

/**
 * Slimmed-down navigation dock.
 *
 * Notes / Add / Settings were intentionally removed:
 *  - "Add task" lives on the home dashboard as a prominent CTA
 *  - Notes is reached from the AI page ("Add notes" button)
 *  - Settings is reached by tapping the user avatar
 *
 * Result: a 4-item dock that fits every viewport without an overflow menu.
 */
const DOCK_ITEMS: DockEntry[] = [
  { id: "home", label: "Home", icon: House, href: "/dashboard" },
  { id: "timer", label: "Timer", icon: Timer, href: "/dashboard/timer" },
  { id: "ai", label: "AI", icon: Sparkle, href: "/dashboard/ai" },
  { id: "stats", label: "Stats", icon: ChartBar, href: "/dashboard/stats" },
];

const SPRING = { type: "spring" as const, bounce: 0.18, duration: 0.45 };
const FAST = { type: "spring" as const, bounce: 0.1, duration: 0.28 };

type Props = {
  user: { name: string; image: string | null };
};

export function DockBar({ user }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  const activeFromRoute =
    DOCK_ITEMS.find((i) => pathname === i.href)?.id ?? null;
  const pillTarget = hovered ?? activeFromRoute;

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 max-sm:bottom-0 max-sm:px-2 max-sm:pt-2 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <MotionConfig transition={SPRING}>
        <div className="flex items-center gap-3 max-sm:w-full max-sm:max-w-full max-sm:items-end max-sm:gap-2">
          <LayoutGroup id="dock-pill">
            <div
              role="toolbar"
              aria-label="Dashboard dock"
              onMouseLeave={() => setHovered(null)}
              className="relative z-10 flex items-center gap-2 rounded-3xl bg-white px-4 py-3 max-sm:w-full max-sm:max-w-full max-sm:justify-around max-sm:gap-1.5 max-sm:px-2 max-sm:py-2"
            >
              {DOCK_ITEMS.map((item, itemIndex) => {
                const Icon = item.icon;
                const showPill = pillTarget === item.id;

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    aria-label={item.label}
                    onMouseEnter={() => setHovered(item.id)}
                    onFocus={() => setHovered(item.id)}
                    onClick={() => router.push(item.href)}
                    whileTap={{ scale: 0.97 }}
                    transition={FAST}
                    className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-[1.05rem] outline-none focus-visible:ring-2 focus-visible:ring-fleent-orange/40 sm:size-11 sm:rounded-[1.15rem]"
                  >
                    {showPill && (
                      <motion.span
                        layoutId="dock-pill"
                        aria-hidden
                        initial={{ opacity: 0.6, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0.6, scale: 0.92 }}
                        transition={{ ...SPRING, delay: itemIndex * 0.012 }}
                        className="absolute inset-0 rounded-[1.05rem] bg-[#F3F3F3] sm:rounded-[1.15rem]"
                      />
                    )}
                    <motion.span
                      animate={{ opacity: hovered === item.id ? 1 : 0.92 }}
                      transition={FAST}
                      className="relative inline-flex items-center justify-center"
                    >
                      <Icon size={18} weight="regular" className="text-fleent-ink" />
                    </motion.span>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>

          {/* Avatar → Settings. Hidden on small screens — the avatar is
              available in other surfaces (e.g. profile menu) when needed. */}
          <Link
            href="/dashboard/settings"
            aria-label="Open settings"
            className="max-sm:hidden"
          >
            <UserAvatar user={user} />
          </Link>
        </div>
      </MotionConfig>
    </div>
  );
}

export function UserAvatar({
  user,
  className,
}: Props & { className?: string }) {
  return (
    <div
      className={
        className ??
        "size-10 shrink-0 overflow-hidden rounded-full bg-[#F3F3F3] transition-transform duration-200 ease-out hover:scale-105 sm:size-12"
      }
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name}
          width={48}
          height={48}
          sizes="48px"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-fleent-ink">
          {initialsOf(user.name)}
        </div>
      )}
    </div>
  );
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
}
