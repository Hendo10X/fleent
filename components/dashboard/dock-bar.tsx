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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChartBar,
  DotsThreeOutline,
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
import {
  type DashboardTask,
  dashboardTasksQueryKey,
} from "@/lib/dashboard-tasks";

type DockEntry = {
  id: string;
  label: string;
  icon: Icon;
  href: string | null; // null = panel trigger
  /** Visible on small screens. The rest are tucked into the More menu. */
  mobilePrimary: boolean;
};

// On mobile we show 4 primary icons + a More button.
// On sm+ the full 7-item dock renders inline.
const DOCK_ITEMS: DockEntry[] = [
  { id: "home", label: "Home", icon: House, href: "/dashboard", mobilePrimary: true },
  { id: "timer", label: "Timer", icon: Timer, href: "/dashboard/timer", mobilePrimary: true },
  { id: "ai", label: "AI", icon: Sparkle, href: "/dashboard/ai", mobilePrimary: false },
  { id: "add", label: "Add task", icon: Plus, href: null, mobilePrimary: true },
  { id: "notes", label: "Notes", icon: Notepad, href: "/dashboard/notes", mobilePrimary: true },
  { id: "stats", label: "Stats", icon: ChartBar, href: "/dashboard/stats", mobilePrimary: false },
  { id: "settings", label: "Settings", icon: Gear, href: "/dashboard/settings", mobilePrimary: false },
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [contentRef, { height: heightContent }] = useMeasure();
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => {
    setPanelOpen(false);
    setMoreOpen(false);
  });

  // Close panels on route change
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPanelOpen(false);
      setMoreOpen(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const overflowItems = DOCK_ITEMS.filter((item) => !item.mobilePrimary);

  const activeFromRoute =
    DOCK_ITEMS.find((i) => i.href !== null && pathname === i.href)?.id ?? null;
  const pillTarget = hovered ?? activeFromRoute;

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 max-sm:bottom-0 max-sm:px-2 max-sm:pt-2 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <MotionConfig transition={SPRING}>
        <div
          ref={containerRef}
          className="flex items-center gap-3 max-sm:w-full max-sm:max-w-full max-sm:items-end max-sm:gap-2"
        >
          <div className="relative max-sm:w-0 max-sm:min-w-0 max-sm:flex-1">
            <AnimatePresence initial={false} mode="sync">
              {panelOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: heightContent || 0, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={SPRING}
                  className="absolute bottom-[calc(100%+10px)] left-0 right-0 z-20 overflow-hidden rounded-3xl border border-black/5 bg-white max-sm:max-h-[min(70vh,28rem)] max-sm:overflow-y-auto"
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
                className="relative z-10 flex items-center gap-2 rounded-3xl bg-white px-4 py-3 max-sm:w-full max-sm:max-w-full max-sm:justify-between max-sm:gap-1.5 max-sm:px-2 max-sm:py-2"
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
                        setMoreOpen(false);
                        if (item.href === null) {
                          setPanelOpen((v) => !v);
                        } else {
                          setPanelOpen(false);
                          router.push(item.href);
                        }
                      }}
                      whileTap={{ scale: 0.97 }}
                      transition={FAST}
                      className={`relative inline-flex size-10 shrink-0 items-center justify-center rounded-[1.05rem] outline-none focus-visible:ring-2 focus-visible:ring-fleent-orange/40 sm:size-11 sm:rounded-[1.15rem] ${
                        item.mobilePrimary ? "" : "max-sm:hidden"
                      }`}
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
                        <Icon
                          size={isPlus ? 22 : 18}
                          weight={isPlus ? "bold" : "regular"}
                          className="text-fleent-ink"
                        />
                      </motion.span>
                    </motion.button>
                  );
                })}

                <MoreMenu
                  items={overflowItems}
                  open={moreOpen}
                  activeId={activeFromRoute}
                  onToggle={() => {
                    setPanelOpen(false);
                    setMoreOpen((v) => !v);
                  }}
                  onSelect={(href) => {
                    setMoreOpen(false);
                    if (href) router.push(href);
                  }}
                />
              </div>
            </LayoutGroup>
          </div>

          <div className="max-sm:hidden">
            <UserAvatar user={user} />
          </div>
        </div>
      </MotionConfig>
    </div>
  );
}

function MoreMenu({
  items,
  open,
  activeId,
  onToggle,
  onSelect,
}: {
  items: DockEntry[];
  open: boolean;
  activeId: string | null;
  onToggle: () => void;
  onSelect: (href: string | null) => void;
}) {
  const containsActive = !!activeId && items.some((i) => i.id === activeId);

  return (
    <div className="relative shrink-0 sm:hidden">
      <motion.button
        type="button"
        aria-label="More"
        aria-expanded={open}
        onClick={onToggle}
        whileTap={{ scale: 0.97 }}
        transition={FAST}
        className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-[1.05rem] outline-none focus-visible:ring-2 focus-visible:ring-fleent-orange/40"
      >
        {(open || containsActive) && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0.6, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.6, scale: 0.92 }}
            transition={FAST}
            className="absolute inset-0 rounded-[1.05rem] bg-[#F3F3F3]"
          />
        )}
        <span className="relative inline-flex items-center justify-center">
          <DotsThreeOutline size={18} weight="bold" className="text-fleent-ink" />
        </span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="more-content"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={FAST}
            role="menu"
            className="absolute bottom-[calc(100%+10px)] right-0 z-30 w-44 origin-bottom-right rounded-2xl border border-black/5 bg-white p-1.5"
          >
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => onSelect(item.href)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-medium tracking-tight transition-colors ${
                    isActive
                      ? "bg-[#F3F3F3] text-fleent-ink"
                      : "text-fleent-ink hover:bg-[#F6F6F6]"
                  }`}
                >
                  <Icon size={18} weight="regular" className="text-fleent-ink" />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
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
        "size-10 shrink-0 overflow-hidden rounded-full bg-[#F3F3F3] sm:size-12"
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

function AddTaskForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [firstAction, setFirstAction] = useState("");
  const titleRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  type CreateInput = {
    id: string;
    title: string;
    taskType?: string;
    difficulty?: number;
    firstAction?: string;
  };

  const createMutation = useMutation({
    mutationKey: ["dashboard", "tasks", "create"],
    mutationFn: (input: CreateInput) => createTask(input),
    onMutate: (input) => {
      const prev =
        queryClient.getQueryData<DashboardTask[]>(dashboardTasksQueryKey) ??
        [];
      const optimistic: DashboardTask = {
        id: input.id,
        title: input.title.trim(),
        taskType: input.taskType?.trim() || null,
        difficulty: input.difficulty ?? null,
        firstAction: input.firstAction?.trim() || null,
        status: "active",
        sortOrder: 0,
      };
      // Active items first (sorted by status asc), so new task goes at the
      // top of the active group, matching the server ordering.
      queryClient.setQueryData<DashboardTask[]>(
        dashboardTasksQueryKey,
        [optimistic, ...prev],
      );
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(dashboardTasksQueryKey, ctx.prev);
    },
    onSettled: () => router.refresh(),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || createMutation.isPending) return;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const payload = {
      id,
      title,
      taskType: tag || undefined,
      difficulty: difficulty ?? undefined,
      firstAction: firstAction || undefined,
    };
    setTitle("");
    setTag("");
    setDifficulty(null);
    setFirstAction("");
    onDone();
    createMutation.mutate(payload);
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
          disabled={!title.trim()}
          className="inline-flex h-9 items-center justify-center rounded-full bg-fleent-orange px-4 text-sm font-semibold tracking-wide text-white transition-colors duration-200 ease-out hover:bg-fleent-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add task
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
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-1">
      <span className="min-w-0 shrink-0 text-sm tracking-wide text-fleent-mute">
        Difficulty level
      </span>
      <div className="ml-auto flex min-w-0 flex-wrap justify-end gap-1">
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
