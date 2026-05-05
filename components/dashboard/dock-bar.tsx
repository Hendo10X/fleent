"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
} from "motion/react";
import useMeasure from "react-use-measure";
import {
  ChartBar,
  Gear,
  House,
  type Icon,
  Notepad,
  Plus,
  Sparkle,
  Timer,
} from "@phosphor-icons/react";
import useClickOutside from "@/hooks/useClickOutside";
import { createTask } from "@/app/dashboard/actions";

type DockEntry = {
  id: string;
  label: string;
  icon: Icon;
  href: string | null; // null = panel trigger
};

// + sits at index 3 (the middle of 7)
const DOCK_ITEMS: DockEntry[] = [
  { id: "home", label: "Home", icon: House, href: "/dashboard" },
  { id: "timer", label: "Timer", icon: Timer, href: "/dashboard/timer" },
  { id: "ai", label: "AI", icon: Sparkle, href: "/dashboard/ai" },
  { id: "add", label: "Add task", icon: Plus, href: null },
  { id: "notes", label: "Notes", icon: Notepad, href: "/dashboard/notes" },
  { id: "stats", label: "Stats", icon: ChartBar, href: "/dashboard/stats" },
  { id: "settings", label: "Settings", icon: Gear, href: "/dashboard/settings" },
];

const SPRING = { type: "spring" as const, bounce: 0.18, duration: 0.45 };
const FAST = { type: "spring" as const, bounce: 0.1, duration: 0.28 };

type Props = {
  user: { name: string; image: string | null };
};

export function DockBar({ user }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [panelOpen, setPanelOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [contentRef, { height: heightContent }] = useMeasure();
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setPanelOpen(false));

  // Close panel on route change
  useEffect(() => {
    setPanelOpen(false);
  }, [pathname]);

  const activeFromRoute =
    DOCK_ITEMS.find((i) => i.href !== null && pathname === i.href)?.id ?? null;
  const pillTarget = hovered ?? activeFromRoute;

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <MotionConfig transition={SPRING}>
        <div ref={containerRef} className="flex items-center gap-3">
          <div className="relative shrink-0">
            <AnimatePresence initial={false} mode="sync">
              {panelOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: heightContent || 0, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={SPRING}
                  className="absolute bottom-[calc(100%+10px)] left-0 right-0 z-20 overflow-hidden rounded-3xl border border-black/5 bg-white"
                >
                  <div ref={contentRef} className="p-3">
                    <AddTaskForm onDone={() => setPanelOpen(false)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <LayoutGroup id="dock-pill">
              <div
                role="toolbar"
                aria-label="Dashboard dock"
                onMouseLeave={() => setHovered(null)}
                className="relative z-10 flex items-center gap-2 rounded-3xl bg-white px-4 py-3"
              >
                {DOCK_ITEMS.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isPlus = item.id === "add";
                  const showPill = pillTarget === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      aria-label={item.label}
                      onMouseEnter={() => setHovered(item.id)}
                      onFocus={() => setHovered(item.id)}
                      onClick={() => {
                        if (item.href === null) {
                          setPanelOpen((v) => !v);
                        } else {
                          setPanelOpen(false);
                          router.push(item.href);
                        }
                      }}
                      whileTap={{ scale: 0.97 }}
                      transition={FAST}
                      className="relative inline-flex size-11 items-center justify-center rounded-[1.15rem] outline-none focus-visible:ring-2 focus-visible:ring-fleent-orange/40"
                    >
                      {showPill && (
                        <motion.span
                          layoutId="dock-pill"
                          aria-hidden
                          initial={{ opacity: 0.6, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0.6, scale: 0.92 }}
                          transition={{ ...SPRING, delay: itemIndex * 0.012 }}
                          className="absolute inset-0 rounded-[1.15rem] bg-[#F3F3F3]"
                        />
                      )}
                      <motion.span
                        animate={{ opacity: hovered === item.id ? 1 : 0.92 }}
                        transition={FAST}
                        className="relative inline-flex items-center justify-center"
                      >
                        <Icon
                          size={isPlus ? 24 : 20}
                          weight={isPlus ? "bold" : "regular"}
                          className="text-fleent-ink"
                        />
                      </motion.span>
                    </motion.button>
                  );
                })}
              </div>
            </LayoutGroup>
          </div>

          <UserAvatar user={user} />
        </div>
      </MotionConfig>
    </div>
  );
}

function UserAvatar({ user }: Props) {
  return (
    <div className="size-12 shrink-0 overflow-hidden rounded-full bg-[#F3F3F3]">
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name}
          width={48}
          height={48}
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

function AddTaskForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [firstAction, setFirstAction] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createTask({
        title,
        taskType: tag || undefined,
        difficulty: difficulty ?? undefined,
        firstAction: firstAction || undefined,
      });
      setTitle("");
      setTag("");
      setDifficulty(null);
      setFirstAction("");
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2.5">
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="what is the task today"
        className="w-full rounded-2xl px-4 py-3 text-lg font-medium tracking-tight text-fleent-ink outline-none placeholder:text-fleent-mute"
      />
      <input
        type="text"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Add tag e.g home or school"
        className="w-full rounded-xl bg-[#F6F6FE] px-4 py-2.5 text-sm tracking-wide text-fleent-ink outline-none placeholder:text-fleent-mute focus-visible:ring-2 focus-visible:ring-fleent-orange/30"
      />

      <DifficultyRow value={difficulty} onChange={setDifficulty} />

      <input
        type="text"
        value={firstAction}
        onChange={(e) => setFirstAction(e.target.value)}
        placeholder="Micro summary"
        className="w-full rounded-xl bg-[#F6F6FE] px-4 py-2.5 text-sm tracking-wide text-fleent-ink outline-none placeholder:text-fleent-mute focus-visible:ring-2 focus-visible:ring-fleent-orange/30"
      />

      <div className="mt-1 flex justify-end">
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="inline-flex h-9 items-center justify-center rounded-full bg-fleent-orange px-4 text-sm font-semibold tracking-wide text-white transition-colors duration-200 ease-out hover:bg-fleent-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add task"}
        </button>
      </div>
    </form>
  );
}

function DifficultyRow({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  const LEVELS: { id: number; label: string; color: string }[] = [
    { id: 1, label: "Easy", color: "text-fleent-green" },
    { id: 2, label: "Medium", color: "text-fleent-blue" },
    { id: 3, label: "Hard", color: "text-fleent-orange" },
  ];

  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-sm tracking-wide text-fleent-mute">
        Difficulty level
      </span>
      <div className="ml-auto flex gap-1">
        {LEVELS.map((lvl) => {
          const isActive = value === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => onChange(lvl.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors duration-200 ease-out ${
                isActive
                  ? `bg-[#F3F3F3] ${lvl.color}`
                  : "text-fleent-mute hover:bg-[#F3F3F3]"
              }`}
            >
              {lvl.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
}
