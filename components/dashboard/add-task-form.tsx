"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MagicWand } from "@phosphor-icons/react";
import { toast } from "sonner";
import { createTask, createTaskWithBreakdown } from "@/app/dashboard/actions";
import {
  type DashboardTask,
  dashboardTasksQueryKey,
} from "@/lib/dashboard-tasks";
import { TaskBreakdownPanel } from "@/components/dashboard/task-breakdown-panel";

/**
 * Compose-a-task form. Used both as an inline panel on the dashboard and
 * (legacy) inside other surfaces — the `onDone` callback fires after the
 * task lands optimistically, so the host can collapse the panel.
 */
export function AddTaskForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [firstAction, setFirstAction] = useState("");
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function resetForm() {
    setTitle("");
    setTag("");
    setDifficulty(null);
    setFirstAction("");
    setBreakdownOpen(false);
  }

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
        parentId: null,
      };
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

  type BreakdownCreateInput = {
    parent: { id: string; title: string };
    children: Array<{ id: string; title: string }>;
    shared: { taskType?: string; difficulty?: number };
  };

  const breakdownCreateMutation = useMutation({
    mutationKey: ["dashboard", "tasks", "create-with-breakdown"],
    mutationFn: (input: BreakdownCreateInput) =>
      createTaskWithBreakdown({
        parent: input.parent,
        steps: input.children,
        shared: input.shared,
      }),
    onMutate: ({ parent, children, shared }) => {
      const prev =
        queryClient.getQueryData<DashboardTask[]>(dashboardTasksQueryKey) ??
        [];
      const parentRow: DashboardTask = {
        id: parent.id,
        title: parent.title,
        taskType: shared.taskType?.trim() || null,
        difficulty: shared.difficulty ?? null,
        firstAction: null,
        status: "active",
        sortOrder: 0,
        parentId: null,
      };
      const childRows: DashboardTask[] = children.map((c) => ({
        id: c.id,
        title: c.title,
        taskType: shared.taskType?.trim() || null,
        difficulty: shared.difficulty ?? null,
        firstAction: null,
        status: "active",
        sortOrder: 0,
        parentId: parent.id,
      }));
      queryClient.setQueryData<DashboardTask[]>(
        dashboardTasksQueryKey,
        [parentRow, ...childRows, ...prev],
      );
      return { prev };
    },
    onError: (err, _input, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(dashboardTasksQueryKey, ctx.prev);
      const message =
        err instanceof Error ? err.message : "Couldn't add those tasks.";
      toast.error(message);
    },
    onSettled: () => router.refresh(),
  });

  function handleSubmit(e: React.FormEvent) {
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
    resetForm();
    onDone();
    createMutation.mutate(payload);
  }

  function handleApplyBreakdown(steps: string[]) {
    const cleaned = steps.map((s) => s.trim()).filter(Boolean);
    const parentTitle = title.trim();
    if (cleaned.length === 0 || !parentTitle) return;

    const parentId = crypto.randomUUID();
    const children = cleaned.map((t) => ({
      id: crypto.randomUUID(),
      title: t,
    }));
    const shared = {
      taskType: tag.trim() || undefined,
      difficulty: difficulty ?? undefined,
    };

    resetForm();
    onDone();
    breakdownCreateMutation.mutate({
      parent: { id: parentId, title: parentTitle },
      children,
      shared,
    });
  }

  const canBreakdown = title.trim().length >= 2;

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

      {breakdownOpen && (
        <TaskBreakdownPanel
          title={title}
          autoFetch
          applyLabel="Add as tasks"
          onApply={handleApplyBreakdown}
          onClose={() => setBreakdownOpen(false)}
          applyDisabled={breakdownCreateMutation.isPending}
        />
      )}

      <div className="mt-1 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setBreakdownOpen((v) => !v)}
          disabled={!canBreakdown}
          aria-pressed={breakdownOpen}
          className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium tracking-tight transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 ${
            breakdownOpen
              ? "bg-[#F3F3F3] text-fleent-ink"
              : "text-fleent-mute hover:bg-[#F3F3F3] hover:text-fleent-ink"
          }`}
        >
          <MagicWand size={14} weight="fill" className="text-fleent-orange" />
          {breakdownOpen ? "Hide breakdown" : "Break it down"}
        </button>

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
