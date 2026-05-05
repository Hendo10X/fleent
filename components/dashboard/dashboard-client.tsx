"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretDown, Plus, Trash } from "@phosphor-icons/react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  deleteTask,
  toggleTaskComplete,
} from "@/app/dashboard/actions";
import { StreakChip } from "@/components/dashboard/streak-widgets";

type Task = {
  id: string;
  title: string;
  taskType: string | null;
  difficulty: number | null;
  firstAction: string | null;
  status: "active" | "completed";
};

type Props = {
  user: { name: string; image: string | null };
  tasks: Task[];
  completedInLast4Weeks: number;
  currentStreak: number;
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring" as const, bounce: 0.18, duration: 0.45 };

export function DashboardClient({
  user,
  tasks,
  completedInLast4Weeks,
  currentStreak,
}: Props) {
  const activeTasks = tasks.filter((t) => t.status === "active");
  const activeCount = activeTasks.length;

  const topThree = tasks.slice(0, 3);
  const queued = tasks.slice(3);

  const dateLabel = formatDateLabel(new Date());
  const isEmpty = tasks.length === 0;

  return (
    <main className="px-6 pt-12">
      <section className="mx-auto flex w-full max-w-md flex-col text-center">
        <div className="flex w-full flex-col gap-3 text-left">
          <div className="flex w-full min-w-0 items-center justify-between gap-3">
            <h1 className="min-w-0 flex-1 text-2xl font-bold tracking-tight text-fleent-ink">
              Welcome back, {user.name}
            </h1>
            <StreakChip count={currentStreak} />
          </div>
          <div className="flex flex-col items-start">
            <p className="text-base font-semibold tracking-tight text-fleent-ink">
              {dateLabel}
            </p>
            <p className="mt-1 text-sm tracking-wide text-fleent-ink">
              {completedInLast4Weeks} task
              {completedInLast4Weeks === 1 ? "" : "s"} completed in 4 weeks
            </p>
            <p className="text-sm tracking-wide text-fleent-mute">
              {activeCount} pending task{activeCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {isEmpty ? (
          <EmptyState />
        ) : (
          <TaskList
            topThree={topThree}
            queued={queued}
            queuedActiveCount={
              queued.filter((t) => t.status === "active").length
            }
          />
        )}
      </section>
    </main>
  );
}

function TaskList({
  topThree,
  queued,
  queuedActiveCount,
}: {
  topThree: Task[];
  queued: Task[];
  queuedActiveCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasQueue = queued.length > 0;

  return (
    <div className="mt-10 flex w-full flex-col">
      <ul className="flex w-full flex-col gap-1.5">
        {topThree.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
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
              {queued.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
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

function EmptyState() {
  return (
    <Empty className="gap-3! px-0 py-12">
      <EmptyHeader>
        <EmptyMedia className="text-fleent-mute">
          <Plus size={32} weight="bold" />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-bold tracking-tight text-fleent-ink">
          Nothing on the list yet.
        </EmptyTitle>
        <EmptyDescription className="text-fleent-body tracking-wide text-fleent-mute">
          Tap the + in the dock to add your first task.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent />
    </Empty>
  );
}

function TaskRow({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const completed = task.status === "completed";

  return (
    <motion.li
      layout
      transition={SPRING}
      className="group flex items-center gap-2 rounded-xl px-2 py-2 transition-colors duration-200 ease-out hover:bg-white"
    >
      <button
        type="button"
        disabled={isPending || isDeleting}
        onClick={() =>
          startTransition(async () => {
            await toggleTaskComplete(task.id);
          })
        }
        aria-label={completed ? "Mark task active" : "Mark task complete"}
        className="flex flex-1 items-center gap-3 text-left"
      >
        <span
          className={`inline-flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-200 ease-out ${
            completed
              ? "border-fleent-orange bg-fleent-orange"
              : "border-fleent-ink/40 group-hover:border-fleent-ink"
          }`}
        >
          {completed && (
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
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
        </span>
        <StrikeText text={task.title} completed={completed} />
      </button>

      <button
        type="button"
        disabled={isDeleting}
        onClick={() =>
          startDeleting(async () => {
            await deleteTask(task.id);
          })
        }
        aria-label="Delete task"
        className="ml-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-fleent-mute opacity-0 transition-all duration-200 ease-out hover:bg-[#F3F3F3] hover:text-fleent-ink group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-50"
      >
        <Trash size={14} weight="regular" />
      </button>
    </motion.li>
  );
}

function StrikeText({ text, completed }: { text: string; completed: boolean }) {
  return (
    <span className="relative inline-block">
      <motion.span
        animate={{ color: completed ? "#828181" : "#000000" }}
        transition={{ duration: 0.3, ease: EASE_OUT, delay: completed ? 0.15 : 0 }}
        className="text-sm font-medium tracking-wide"
      >
        {text}
      </motion.span>
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleX: completed ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        style={{ transformOrigin: completed ? "left center" : "right center" }}
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-fleent-mute/60"
      />
    </span>
  );
}

/** Dashboard hero date line — uses full weekday name (not the mistaken "weekday" locale key). */
function formatDateLabel(date: Date) {
  const month = date.toLocaleString("en-US", { month: "long" });
  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  return `${month}, ${weekday} ${date.getDate()}`;
}
