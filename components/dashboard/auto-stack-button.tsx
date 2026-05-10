"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Sparkle } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  type DashboardTask,
  dashboardTasksQueryKey,
} from "@/lib/dashboard-tasks";

type AutoStackResponse = { order: string[] };

async function requestAutoStack(tasks: DashboardTask[]): Promise<string[]> {
  const payload = {
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      taskType: t.taskType,
      difficulty: t.difficulty,
    })),
  };

  const res = await fetch("/api/ai/autostack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Auto-stack failed (${res.status})`);
  }

  const data = (await res.json()) as AutoStackResponse;
  return data.order;
}

/**
 * Reorders a task list to match the AI-suggested order.
 * Tasks not present in `order` are appended in their original positions.
 */
function reorderTasks(
  tasks: DashboardTask[],
  order: string[],
): DashboardTask[] {
  const byId = new Map(tasks.map((t) => [t.id, t] as const));
  const active: DashboardTask[] = [];
  const seen = new Set<string>();

  for (const id of order) {
    const task = byId.get(id);
    if (task && task.status === "active" && !seen.has(id)) {
      active.push(task);
      seen.add(id);
    }
  }

  // Untouched: any active task the AI omitted, plus all completed tasks
  // (we never reorder completed items — they keep their slot).
  const remainingActive = tasks.filter(
    (t) => t.status === "active" && !seen.has(t.id),
  );
  const completed = tasks.filter((t) => t.status === "completed");

  return [...active, ...remainingActive, ...completed];
}

export function AutoStackButton({ tasks }: { tasks: DashboardTask[] }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["dashboard", "tasks", "autostack"],
    mutationFn: () => requestAutoStack(tasks.filter((t) => t.status === "active")),
    onSuccess: (order) => {
      const current =
        queryClient.getQueryData<DashboardTask[]>(dashboardTasksQueryKey) ??
        tasks;
      queryClient.setQueryData<DashboardTask[]>(
        dashboardTasksQueryKey,
        reorderTasks(current, order),
      );
      toast.success("Tasks restacked by priority");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Couldn't auto-stack right now");
    },
  });

  const activeCount = tasks.filter((t) => t.status === "active").length;
  const disabled = activeCount < 2 || mutation.isPending;

  return (
    <motion.button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium tracking-tight text-fleent-ink transition-colors duration-200 ease-out hover:bg-[#F3F3F3] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Sparkle
        size={14}
        weight="fill"
        className={
          mutation.isPending
            ? "animate-pulse text-fleent-orange"
            : "text-fleent-orange"
        }
      />
      {mutation.isPending ? "Stacking…" : "Auto-stack"}
    </motion.button>
  );
}
