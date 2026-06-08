"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  CaretDown,
  MagicWand,
  Play,
  Plus,
  X,
  Trash,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { TaskBreakdownPanel } from "@/components/dashboard/task-breakdown-panel";
import { CompletionBurst } from "@/components/dashboard/completion-burst";
import { AddTaskForm } from "@/components/dashboard/add-task-form";
import { accentFor, DIFFICULTY_META } from "@/lib/ui/colors";
import { fireTaskConfetti } from "@/lib/ui/confetti";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  breakdownTask,
  deleteTask,
  toggleTaskComplete,
} from "@/app/dashboard/actions";
import { StreakChip } from "@/components/dashboard/streak-widgets";
import {
  type DashboardTask,
  dashboardTasksQueryKey,
} from "@/lib/dashboard-tasks";

type Props = {
  user: { name: string; image: string | null };
  tasks: DashboardTask[];
  completedInLast4Weeks: number;
  currentStreak: number;
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring" as const, bounce: 0.2, duration: 0.35 };

export function DashboardClient({
  user,
  tasks,
  completedInLast4Weeks,
  currentStreak,
}: Props) {
  const queryClient = useQueryClient();

  const { data: liveTasks = tasks } = useQuery<DashboardTask[]>({
    queryKey: dashboardTasksQueryKey,
    queryFn: () =>
      (queryClient.getQueryData<DashboardTask[]>(dashboardTasksQueryKey) ??
        tasks),
    initialData: tasks,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Reconcile the cache only when a *new* `tasks` reference arrives from the
  // server. Previously we also depended on `pendingMutations`, which caused
  // the effect to fire when the mutation count flipped 1→0 - overwriting the
  // optimistic cache with the *stale* `tasks` prop and producing the visible
  // "row flashes twice" glitch.
  //
  // We still skip reconciliation while a mutation is in-flight to avoid
  // clobbering optimistic state; if `tasks` changes mid-mutation, the
  // `lastReconciledRef` check ensures we'll process it on the next render
  // when the mutation settles.
  const pendingMutations = useIsMutating({ mutationKey: ["dashboard", "tasks"] });
  const pendingRef = useRef(pendingMutations);
  pendingRef.current = pendingMutations;
  const lastReconciledRef = useRef<DashboardTask[] | null>(null);

  useEffect(() => {
    if (pendingRef.current !== 0) return;
    if (lastReconciledRef.current === tasks) return;
    queryClient.setQueryData<DashboardTask[]>(dashboardTasksQueryKey, tasks);
    lastReconciledRef.current = tasks;
  }, [tasks, queryClient, pendingMutations]);

  // O(n) - done once per `liveTasks` change instead of on every render.
  // Stable references downstream let `React.memo` actually skip work.
  const tree = useMemo(() => buildTaskTree(liveTasks), [liveTasks]);
  const topThree = useMemo(() => tree.slice(0, 3), [tree]);
  const queued = useMemo(() => tree.slice(3), [tree]);

  const activeCount = useMemo(
    () =>
      liveTasks.reduce(
        (n, t) => (t.status === "active" ? n + 1 : n),
        0,
      ),
    [liveTasks],
  );

  const queuedActiveCount = useMemo(
    () =>
      queued.filter(
        (t) =>
          t.status === "active" ||
          t.children.some((c) => c.status === "active"),
      ).length,
    [queued],
  );

  // The label is only visually relevant once per session; recomputing on
  // every keystroke / row update is wasteful.
  const dateLabel = useMemo(() => formatDateLabel(new Date()), []);
  const greeting = useMemo(() => getGreeting(new Date()), []);
  const isEmpty = liveTasks.length === 0;

  const [addOpen, setAddOpen] = useState(false);

  return (
    <main className="px-6 pt-8 md:px-10 md:pt-2 lg:px-16">
      <section className="mx-auto flex w-full max-w-md flex-col text-center md:max-w-2xl">
        <div className="flex w-full flex-col gap-3 text-left">
          <div className="flex w-full min-w-0 items-center justify-between gap-3">
            <h1 className="min-w-0 flex-1 text-2xl font-bold tracking-tight text-fleent-ink md:text-3xl">
              {greeting.label}, {user.name}
            </h1>
            <StreakChip count={currentStreak} />
          </div>
          <div className="flex w-full flex-col items-start text-left">
            <p className="self-start text-left text-base font-semibold tracking-tight text-fleent-ink">
              {dateLabel}
            </p>
            <p className="mt-1 self-start text-left text-sm tracking-wide text-fleent-ink">
              {completedInLast4Weeks} task
              {completedInLast4Weeks === 1 ? "" : "s"} completed in 4 weeks
            </p>
            <p className="self-start text-left text-sm tracking-wide text-fleent-mute">
              {activeCount} pending task{activeCount === 1 ? "" : "s"}
            </p>

            <motion.button
              type="button"
              onClick={() => setAddOpen((v) => !v)}
              aria-expanded={addOpen}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className={`mt-4 inline-flex h-10 items-center gap-2 self-start rounded-full px-4 text-sm font-semibold tracking-tight transition-colors duration-200 ease-out ${
                addOpen
                  ? "bg-white text-fleent-ink hover:bg-[#F3F3F3]"
                  : "bg-fleent-orange text-white hover:bg-fleent-orange/90"
              }`}
            >
              <span className="relative inline-flex size-4 items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {addOpen ? (
                    <motion.span
                      key="x"
                      initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
                      transition={{ duration: 0.18, ease: EASE_OUT }}
                      className="inline-flex"
                    >
                      <X size={16} weight="bold" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="plus"
                      initial={{ opacity: 0, rotate: 45, scale: 0.6 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: -45, scale: 0.6 }}
                      transition={{ duration: 0.18, ease: EASE_OUT }}
                      className="inline-flex"
                    >
                      <Plus size={16} weight="bold" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              {addOpen ? "Close" : "Add task"}
            </motion.button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {addOpen && (
            <motion.div
              key="add-panel"
              initial={{ height: 0, opacity: 0, y: -4 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -4 }}
              transition={{
                height: { duration: 0.3, ease: EASE_OUT },
                opacity: { duration: 0.2, ease: EASE_OUT },
              }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-3xl border border-black/5 bg-white p-3">
                <AddTaskForm onDone={() => setAddOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isEmpty ? (
          <EmptyState onAdd={() => setAddOpen(true)} />
        ) : (
          <>
            <TaskList
              topThree={topThree}
              queued={queued}
              queuedActiveCount={queuedActiveCount}
            />
          </>
        )}
      </section>
    </main>
  );
}

/** Node in the dashboard's one-level task tree. */
type TaskNode = DashboardTask & { children: DashboardTask[] };

/**
 * Group children under their parents in a single pass while preserving the
 * server's sort order for roots. Orphaned children (parent missing for any
 * reason) are surfaced as roots so they never silently disappear.
 */
function buildTaskTree(tasks: DashboardTask[]): TaskNode[] {
  const roots: TaskNode[] = [];
  const rootById = new Map<string, TaskNode>();

  for (const t of tasks) {
    if (!t.parentId) {
      const node: TaskNode = { ...t, children: [] };
      rootById.set(t.id, node);
      roots.push(node);
    }
  }

  for (const t of tasks) {
    if (!t.parentId) continue;
    const parent = rootById.get(t.parentId);
    if (parent) {
      parent.children.push(t);
    } else {
      // Parent isn't in this slice - promote child to root rather than drop it.
      roots.push({ ...t, children: [] });
    }
  }

  return roots;
}

/**
 * Render a single root node - either a plain `TaskRow` (no decoration, no
 * extra space) or a `ParentTaskCard` when the task has breakdown children.
 */
function renderRoot(node: TaskNode) {
  return node.children.length > 0 ? (
    <ParentTaskCard key={node.id} parent={node} children={node.children} />
  ) : (
    <TaskRow key={node.id} task={node} />
  );
}

function TaskList({
  topThree,
  queued,
  queuedActiveCount,
}: {
  topThree: TaskNode[];
  queued: TaskNode[];
  queuedActiveCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasQueue = queued.length > 0;

  return (
    <div className="mt-10 flex w-full flex-col">
      <ul className="flex w-full flex-col gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {topThree.map((node) => renderRoot(node))}
        </AnimatePresence>
      </ul>

      <AnimatePresence initial={false}>
        {hasQueue && expanded && (
          <motion.ul
            key="queue"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.32, ease: EASE_OUT },
              opacity: { duration: 0.18, ease: EASE_OUT },
            }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1.5 pt-1.5">
              <AnimatePresence initial={false} mode="popLayout">
                {queued.map((node) => renderRoot(node))}
              </AnimatePresence>
            </div>
          </motion.ul>
        )}
      </AnimatePresence>

      {hasQueue && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-6 inline-flex items-center justify-center gap-1.5 self-center rounded-full px-3 py-1.5 text-sm font-medium tracking-wide text-fleent-mute transition-colors duration-200 ease-out hover:bg-[#F3F3F3] hover:text-fleent-ink"
        >
          <span>
            {expanded
              ? "Show only top 3"
              : `${queuedActiveCount} more task${queuedActiveCount === 1 ? "" : "s"} queued`}
          </span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="inline-flex"
          >
            <CaretDown size={12} weight="bold" />
          </motion.span>
        </button>
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Empty className="gap-3! px-0 py-12">
      <EmptyHeader>
        <EmptyMedia className="text-fleent-orange">
          <motion.span
            animate={{ rotate: [-6, 6, -6] }}
            transition={{
              duration: 3.4,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fleent-orange/15 to-fleent-orange/5 text-2xl"
          >
            ✨
          </motion.span>
        </EmptyMedia>
        <EmptyTitle className="text-lg font-bold tracking-tight text-fleent-ink">
          A clean slate. Nice.
        </EmptyTitle>
        <EmptyDescription className="text-fleent-body tracking-wide text-fleent-mute">
          Tap{" "}
          <button
            type="button"
            onClick={onAdd}
            className="font-semibold text-fleent-orange underline-offset-2 hover:underline"
          >
            Add task
          </button>{" "}
          to drop in your first one.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent />
    </Empty>
  );
}

/**
 * Container card for a task that has AI-generated breakdown children.
 *
 * - Dotted orange border distinguishes it from standalone rows
 * - Caret toggles the children dropdown (starts expanded after a new breakdown)
 * - The parent itself is NOT directly completable - it stands in as a folder
 *   for its steps. Deleting it cascades to the children.
 *
 * Tasks with zero children render as a plain `TaskRow` instead so the UI
 * stays tight for everything that hasn't been broken down.
 *
 * Wrapped in `React.memo` below - the `tree` upstream is memoized on
 * `liveTasks` so node references are stable until the data actually changes,
 * letting this component skip rerenders triggered by unrelated parent state.
 */
function ParentTaskCardImpl({
  parent,
  children,
}: {
  parent: DashboardTask;
  children: DashboardTask[];
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const completedCount = children.filter(
    (c) => c.status === "completed",
  ).length;
  const total = children.length;
  const allDone = total > 0 && completedCount === total;
  const progress = total > 0 ? completedCount / total : 0;

  // Whole parent just finished (last step checked) → celebrate. Ref-gated so
  // it fires once on the false→true transition, not on every re-render.
  const prevAllDoneRef = useRef(allDone);
  useEffect(() => {
    if (allDone && !prevAllDoneRef.current) fireTaskConfetti();
    prevAllDoneRef.current = allDone;
  }, [allDone]);

  const deleteMutation = useMutation({
    mutationKey: ["dashboard", "tasks", "delete", parent.id],
    mutationFn: () => deleteTask(parent.id),
    onMutate: () => {
      const prev =
        queryClient.getQueryData<DashboardTask[]>(dashboardTasksQueryKey) ??
        [];
      queryClient.setQueryData<DashboardTask[]>(
        dashboardTasksQueryKey,
        prev.filter((t) => t.id !== parent.id && t.parentId !== parent.id),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(dashboardTasksQueryKey, ctx.prev);
    },
    onSettled: () => router.refresh(),
  });

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: 24,
        scale: 0.96,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
      }}
      transition={{ ...SPRING, opacity: { duration: 0.18, ease: EASE_OUT } }}
      className="group flex flex-col overflow-hidden rounded-2xl border-2 border-dashed border-fleent-orange/45 bg-white/40 transition-colors duration-200 ease-out hover:bg-white/70"
    >
      {/*
        Header is a plain row - NOT a button - so it can host sibling action
        buttons without producing invalid `<button>` nested in `<button>`
        markup (which fails hydration in React 19 / Next 16).
        The expand toggle is a flex-1 button covering the title area; the
        trash sits next to it as its own button.

        A subtle progress bar animates underneath as children get completed -
        gives instant, glanceable feedback for ADHD users without a wall of
        text.
      */}
      <div className="relative flex w-full items-center gap-2 px-3 py-2.5">
        <motion.span
          aria-hidden
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="pointer-events-none absolute inset-y-0 left-0 -z-0 bg-gradient-to-r from-fleent-orange/15 via-fleent-orange/10 to-transparent"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="relative z-10 flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <motion.span
            aria-hidden
            animate={{
              rotate: allDone ? [0, -10, 10, 0] : 0,
              scale: allDone ? [1, 1.15, 1] : 1,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-fleent-orange/15 text-fleent-orange"
          >
            {allDone ? (
              <span className="text-sm leading-none">🎉</span>
            ) : (
              <MagicWand size={12} weight="fill" />
            )}
          </motion.span>
          <span
            className={`min-w-0 flex-1 truncate text-sm font-semibold tracking-tight ${
              allDone ? "text-fleent-mute line-through" : "text-fleent-ink"
            }`}
          >
            {parent.title}
          </span>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums tracking-wider transition-colors"
            style={{
              backgroundColor: allDone ? "#FFE9DA" : "#F3F3F3",
              color: allDone ? "#FF8629" : "#828181",
            }}
          >
            {completedCount}/{total}
          </span>
          <motion.span
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="inline-flex size-6 shrink-0 items-center justify-center text-fleent-mute"
          >
            <CaretDown size={12} weight="bold" />
          </motion.span>
        </button>
        <button
          type="button"
          disabled={deleteMutation.isPending}
          onClick={() => deleteMutation.mutate()}
          aria-label="Delete this breakdown"
          className="relative z-10 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-fleent-mute opacity-100 transition-all duration-200 ease-out hover:bg-[#F3F3F3] hover:text-fleent-ink focus-visible:opacity-100 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Trash size={14} weight="regular" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.28, ease: EASE_OUT },
              opacity: { duration: 0.18, ease: EASE_OUT },
            }}
            className="overflow-hidden"
          >
            <ul className="flex flex-col gap-0.5 border-t border-dashed border-fleent-orange/30 px-2 py-1.5">
              <AnimatePresence initial={false} mode="popLayout">
                {children.map((child) => (
                  <TaskRow key={child.id} task={child} compact />
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

/**
 * Memoized exports: shallow-prop equality is enough because `tree` upstream
 * is memoized on `liveTasks`, so node + children references are stable until
 * the underlying data actually changes.
 */
const ParentTaskCard = memo(ParentTaskCardImpl);

function TaskRowImpl({
  task,
  compact = false,
}: {
  task: DashboardTask;
  /** Used when rendered as a child inside `ParentTaskCard` - tighter padding. */
  compact?: boolean;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const completed = task.status === "completed";
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const prevCompletedRef = useRef(completed);

  // Fire a one-shot celebration burst on 0→1 transition only - never on
  // initial mount, undo, or when the cache reconciles the same status.
  useEffect(() => {
    if (!prevCompletedRef.current && completed) {
      setShowBurst(true);
      const id = window.setTimeout(() => setShowBurst(false), 600);
      return () => window.clearTimeout(id);
    }
    prevCompletedRef.current = completed;
  }, [completed]);

  const accent = useMemo(() => accentFor(task.id), [task.id]);
  const difficulty =
    task.difficulty && DIFFICULTY_META[task.difficulty]
      ? DIFFICULTY_META[task.difficulty]
      : null;
  const tag = task.taskType?.trim() || null;

  const toggleMutation = useMutation({
    mutationKey: ["dashboard", "tasks", "toggle", task.id],
    mutationFn: () => toggleTaskComplete(task.id),
    onMutate: () => {
      // A standalone task (root row, no parent) checking off = a whole task
      // done → confetti. Steps inside a breakdown don't celebrate here; the
      // parent card fires confetti when its *last* step lands.
      const completing = task.status !== "completed";
      if (completing && !compact && !task.parentId) {
        fireTaskConfetti();
      }
      const prev =
        queryClient.getQueryData<DashboardTask[]>(dashboardTasksQueryKey) ??
        [];
      queryClient.setQueryData<DashboardTask[]>(
        dashboardTasksQueryKey,
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status:
                  t.status === "completed"
                    ? ("active" as const)
                    : ("completed" as const),
              }
            : t,
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(dashboardTasksQueryKey, ctx.prev);
    },
    onSettled: () => router.refresh(),
  });

  const deleteMutation = useMutation({
    mutationKey: ["dashboard", "tasks", "delete", task.id],
    mutationFn: () => deleteTask(task.id),
    onMutate: () => {
      const prev =
        queryClient.getQueryData<DashboardTask[]>(dashboardTasksQueryKey) ??
        [];
      queryClient.setQueryData<DashboardTask[]>(
        dashboardTasksQueryKey,
        prev.filter((t) => t.id !== task.id),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(dashboardTasksQueryKey, ctx.prev);
    },
    onSettled: () => router.refresh(),
  });

  // Client-mints child ids so the optimistic insert and the server INSERT
  // share identity - AnimatePresence sees the same keys before/after the
  // server round-trip, avoiding the "task flashes twice" glitch.
  const breakdownMutation = useMutation({
    mutationKey: ["dashboard", "tasks", "breakdown", task.id],
    mutationFn: (params: { ids: string[]; titles: string[] }) =>
      breakdownTask(
        task.id,
        params.titles.map((title, i) => ({ id: params.ids[i], title })),
      ),
    onMutate: ({ ids, titles }) => {
      const prev =
        queryClient.getQueryData<DashboardTask[]>(dashboardTasksQueryKey) ??
        [];
      const children: DashboardTask[] = titles.map((title, i) => ({
        id: ids[i],
        title,
        taskType: task.taskType,
        difficulty: task.difficulty,
        firstAction: null,
        status: "active",
        sortOrder: task.sortOrder,
        parentId: task.id,
      }));
      queryClient.setQueryData<DashboardTask[]>(
        dashboardTasksQueryKey,
        [...prev, ...children],
      );
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(dashboardTasksQueryKey, ctx.prev);
      const message =
        err instanceof Error ? err.message : "Couldn't break this down.";
      toast.error(message);
    },
    onSuccess: () => {
      setBreakdownOpen(false);
      toast.success("Broken into steps");
    },
    onSettled: () => router.refresh(),
  });

  const applyBreakdown = (steps: string[]) => {
    const ids = steps.map(() => crypto.randomUUID());
    breakdownMutation.mutate({ ids, titles: steps });
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: 24,
        scale: 0.96,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      transition={{ ...SPRING, opacity: { duration: 0.18, ease: EASE_OUT } }}
      whileHover={compact ? undefined : { y: -1 }}
      style={
        compact
          ? undefined
          : ({
              "--row-accent": accent.soft,
            } as React.CSSProperties)
      }
      className={`group relative flex flex-col gap-2 overflow-hidden rounded-xl transition-colors duration-200 ease-out hover:bg-[var(--row-accent,white)] ${
        compact ? "px-2 py-1.5" : "px-2 py-2"
      }`}
    >
      <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => toggleMutation.mutate()}
        aria-label={completed ? "Mark task active" : "Mark task complete"}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="relative inline-flex size-5 shrink-0 items-center justify-center">
          <motion.span
            aria-hidden
            animate={{
              backgroundColor: completed ? accent.dot : "rgba(0,0,0,0)",
              borderColor: completed ? accent.dot : accent.dot,
            }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            whileTap={{ scale: 0.82 }}
            className="inline-flex size-5 items-center justify-center rounded-md border-2"
          >
            <AnimatePresence initial={false}>
              {completed && (
                <motion.svg
                  key="check"
                  initial={{ pathLength: 0, opacity: 0, scale: 0.7 }}
                  animate={{ pathLength: 1, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                  viewBox="0 0 12 12"
                  className="size-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path d="M2.5 6.5L5 9L9.5 3.5" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.span>
          <AnimatePresence>{showBurst && <CompletionBurst />}</AnimatePresence>
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <StrikeText text={task.title} completed={completed} />
          {difficulty && !compact && (
            <span
              className="hidden shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase sm:inline-flex"
              style={{
                backgroundColor: difficulty.soft,
                color: difficulty.dot,
              }}
            >
              <span
                className="inline-block size-1.5 rounded-full"
                style={{ backgroundColor: difficulty.dot }}
              />
              {difficulty.label}
            </span>
          )}
          {tag && !compact && (
            <span
              className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide sm:inline-flex"
              style={{
                backgroundColor: accent.soft,
                color: accent.dot,
              }}
            >
              {tag}
            </span>
          )}
        </span>
      </button>

      {!completed && (
        <button
          type="button"
          onClick={() => startFocusForTask(router, task)}
          aria-label="Start a Pomodoro for this task"
          className="ml-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-fleent-mute opacity-100 transition-all duration-200 ease-out hover:bg-fleent-orange/10 hover:text-fleent-orange focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Play size={14} weight="fill" />
        </button>
      )}
      {!completed && !compact && (
        <button
          type="button"
          onClick={() => setBreakdownOpen((v) => !v)}
          aria-label="Break this task down"
          aria-pressed={breakdownOpen}
          className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 ease-out focus-visible:opacity-100 ${
            breakdownOpen
              ? "bg-[#F3F3F3] text-fleent-ink opacity-100"
              : "text-fleent-mute opacity-100 hover:bg-[#F3F3F3] hover:text-fleent-ink sm:opacity-0 sm:group-hover:opacity-100"
          }`}
        >
          <MagicWand size={14} weight="fill" className="text-fleent-orange" />
        </button>
      )}
      <button
        type="button"
        disabled={deleteMutation.isPending}
        onClick={() => deleteMutation.mutate()}
        aria-label="Delete task"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-fleent-mute opacity-100 transition-all duration-200 ease-out hover:bg-[#F3F3F3] hover:text-fleent-ink focus-visible:opacity-100 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash size={14} weight="regular" />
      </button>
      </div>
      <AnimatePresence initial={false}>
        {breakdownOpen && !completed && (
          <motion.div
            key="breakdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.28, ease: EASE_OUT },
              opacity: { duration: 0.18, ease: EASE_OUT },
            }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              <TaskBreakdownPanel
                title={task.title}
                autoFetch
                applyLabel="Add as steps"
                applyDisabled={breakdownMutation.isPending}
                onApply={applyBreakdown}
                onClose={() => setBreakdownOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

const TaskRow = memo(TaskRowImpl);

function StrikeText({ text, completed }: { text: string; completed: boolean }) {
  return (
    <span className="relative inline-block leading-tight">
      <motion.span
        animate={{ color: completed ? "#828181" : "#000000" }}
        transition={{ duration: 0.18, ease: EASE_OUT }}
        className="text-sm font-medium tracking-wide"
      >
        {text}
      </motion.span>
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleX: completed ? 1 : 0 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
        style={{ transformOrigin: completed ? "left center" : "right center" }}
        className="pointer-events-none absolute inset-x-0 top-[55%] h-[1.5px] -translate-y-1/2 rounded-full bg-fleent-ink/55"
      />
    </span>
  );
}

/**
 * Hand a task off to the Pomodoro timer. The task id + title travel via URL
 * search params so the timer page can render the title above the dial and
 * mark the task complete when the focus session finishes.
 */
function startFocusForTask(
  router: ReturnType<typeof useRouter>,
  task: DashboardTask,
) {
  const params = new URLSearchParams({
    taskId: task.id,
    taskTitle: task.title,
  });
  router.push(`/dashboard/timer?${params.toString()}`);
}

/** Dashboard hero date line - uses full weekday name (not the mistaken "weekday" locale key). */
function formatDateLabel(date: Date) {
  const month = date.toLocaleString("en-US", { month: "long" });
  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  return `${month}, ${weekday} ${date.getDate()}`;
}

/** Time-of-day greeting - adds a small daily rhythm. */
function getGreeting(date: Date): { label: string } {
  const h = date.getHours();
  if (h < 5) return { label: "Still up" };
  if (h < 12) return { label: "Good morning" };
  if (h < 17) return { label: "Good afternoon" };
  if (h < 21) return { label: "Good evening" };
  return { label: "Winding down" };
}
