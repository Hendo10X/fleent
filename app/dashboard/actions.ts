"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { streakEvents, streaks, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { suggestBreakdown } from "@/lib/ai/breakdown";
import { ensureTaskColumns } from "@/lib/db/migrations";

type CreateTaskInput = {
  id?: string;
  title: string;
  taskType?: string;
  difficulty?: number;
  firstAction?: string;
};

export async function createTask(input: CreateTaskInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not signed in.");

  const title = input.title.trim();
  if (!title) throw new Error("Task title is required.");

  const id = input.id ?? crypto.randomUUID();

  await db.insert(tasks).values({
    id,
    userId: session.user.id,
    title,
    taskType: input.taskType?.trim() || null,
    difficulty:
      typeof input.difficulty === "number" && input.difficulty > 0
        ? input.difficulty
        : null,
    firstAction: input.firstAction?.trim() || null,
    status: "active",
  });

  revalidatePath("/dashboard");
  return { id };
}

export async function toggleTaskComplete(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not signed in.");

  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
    .limit(1);

  if (!existing) throw new Error("Task not found.");

  const wasComplete = existing.status === "completed";
  const nowComplete = !wasComplete;

  await db
    .update(tasks)
    .set({
      status: nowComplete ? "completed" : "active",
      completedAt: nowComplete ? new Date() : null,
    })
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)));

  if (nowComplete) await bumpStreakOnTaskComplete(session.user.id);

  // If this task is a breakdown child, keep its parent's status in sync:
  //   - all siblings (incl. this one's new status) complete → mark parent done
  //   - any sibling now active while parent is "completed" → reactivate parent
  //
  // Done on the server so the cascade is atomic from the client's POV — the
  // dashboard refetch sees a coherent snapshot, no extra round-trip needed.
  if (existing.parentId) {
    await syncParentStatus(existing.parentId, session.user.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/stats");
}

async function syncParentStatus(parentId: string, userId: string) {
  const [parentRow] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, parentId), eq(tasks.userId, userId)))
    .limit(1);
  if (!parentRow) return;

  const siblings = await db
    .select({ status: tasks.status })
    .from(tasks)
    .where(and(eq(tasks.parentId, parentId), eq(tasks.userId, userId)));
  if (siblings.length === 0) return;

  const allComplete = siblings.every((s) => s.status === "completed");
  const parentComplete = parentRow.status === "completed";

  if (allComplete && !parentComplete) {
    await db
      .update(tasks)
      .set({ status: "completed", completedAt: new Date() })
      .where(and(eq(tasks.id, parentId), eq(tasks.userId, userId)));
    await bumpStreakOnTaskComplete(userId);
  } else if (!allComplete && parentComplete) {
    await db
      .update(tasks)
      .set({ status: "active", completedAt: null })
      .where(and(eq(tasks.id, parentId), eq(tasks.userId, userId)));
  }
}

function utcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function utcDateKeyMinusDays(dateKey: string, days: number) {
  const d = new Date(`${dateKey}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function bumpStreakOnTaskComplete(userId: string) {
  const todayKey = utcDateKey(new Date());
  const yesterdayKey = utcDateKeyMinusDays(todayKey, 1);

  const [alreadyLoggedToday] = await db
    .select({ id: streakEvents.id })
    .from(streakEvents)
    .where(
      and(
        eq(streakEvents.userId, userId),
        eq(streakEvents.eventDate, todayKey),
      ),
    )
    .limit(1);

  if (!alreadyLoggedToday) {
    await db.insert(streakEvents).values({
      id: crypto.randomUUID(),
      userId,
      eventDate: todayKey,
    });
  }

  const [row] = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, userId))
    .limit(1);

  if (row?.lastActivityDate === todayKey) return;

  const nextCurrent = row
    ? row.lastActivityDate === yesterdayKey
      ? row.currentStreak + 1
      : 1
    : 1;

  const nextLongest = row
    ? Math.max(row.longestStreak, nextCurrent)
    : Math.max(1, nextCurrent);

  if (!row) {
    await db.insert(streaks).values({
      userId,
      currentStreak: nextCurrent,
      longestStreak: nextLongest,
      lastActivityDate: todayKey,
    });
    return;
  }

  await db
    .update(streaks)
    .set({
      currentStreak: nextCurrent,
      longestStreak: nextLongest,
      lastActivityDate: todayKey,
    })
    .where(eq(streaks.userId, userId));
}

export async function deleteTask(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not signed in.");

  await ensureTaskColumns();

  // Single round-trip: delete the task and any breakdown children at once.
  // We OR the predicates so Postgres handles cascade in one statement.
  await db
    .delete(tasks)
    .where(
      and(
        eq(tasks.userId, session.user.id),
        sql`(${tasks.id} = ${id} OR ${tasks.parentId} = ${id})`,
      ),
    );

  revalidatePath("/dashboard");
}

/**
 * AI-powered breakdown of a single task title into 2–5 micro steps.
 * Used by the Add-task form and by per-task breakdown on the dashboard.
 *
 * Returns only suggestions — the caller decides what to persist.
 */
export async function suggestTaskBreakdown(title: string): Promise<string[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not signed in.");

  const cleaned = title.trim();
  if (cleaned.length < 2) throw new Error("Give the task a bit more context.");

  return suggestBreakdown(cleaned);
}

type BreakdownStep = { id: string; title: string };

/**
 * Attach AI-generated child steps to an existing task.
 *
 * The parent task is preserved — it becomes a collapsible container in the
 * UI with the children as its breakdown. Children inherit the parent's
 * taskType and difficulty.
 *
 * Accepts client-supplied child ids so the optimistic UI and the server
 * agree on identity (prevents the "task flashes twice" reconcile glitch).
 */
export async function breakdownTask(
  taskId: string,
  steps: BreakdownStep[],
): Promise<{ ids: string[] }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not signed in.");

  const cleaned = steps
    .map((s) => ({ id: s.id, title: s.title.trim() }))
    .filter((s) => s.id && s.title)
    .slice(0, 5);
  if (cleaned.length === 0) throw new Error("No steps to add.");

  await ensureTaskColumns();

  const [original] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))
    .limit(1);

  if (!original) throw new Error("Task not found.");

  const rows = cleaned.map((s) => ({
    id: s.id,
    userId: session.user.id,
    title: s.title,
    taskType: original.taskType,
    difficulty: original.difficulty,
    firstAction: null,
    status: "active" as const,
    parentId: original.id,
  }));

  await db.insert(tasks).values(rows);

  revalidatePath("/dashboard");
  return { ids: rows.map((r) => r.id) };
}

type CreateWithBreakdownInput = {
  parent: { id: string; title: string };
  steps: BreakdownStep[];
  shared?: { taskType?: string; difficulty?: number };
};

/**
 * Create a brand-new parent task plus its breakdown children in a single
 * round-trip. Used by the Add-task form when the user accepts an AI
 * breakdown before adding the task.
 *
 * All ids are client-supplied — keeps optimistic UI stable across the
 * server round-trip.
 */
export async function createTaskWithBreakdown(
  input: CreateWithBreakdownInput,
): Promise<{ parentId: string; childIds: string[] }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not signed in.");

  const parentTitle = input.parent.title.trim();
  if (!parentTitle) throw new Error("Parent title required.");

  const cleaned = input.steps
    .map((s) => ({ id: s.id, title: s.title.trim() }))
    .filter((s) => s.id && s.title)
    .slice(0, 5);
  if (cleaned.length === 0) throw new Error("No steps to add.");

  await ensureTaskColumns();

  const taskType = input.shared?.taskType?.trim() || null;
  const difficulty =
    typeof input.shared?.difficulty === "number" && input.shared.difficulty > 0
      ? input.shared.difficulty
      : null;

  const parentRow = {
    id: input.parent.id,
    userId: session.user.id,
    title: parentTitle,
    taskType,
    difficulty,
    firstAction: null,
    status: "active" as const,
    parentId: null,
  };

  const childRows = cleaned.map((s) => ({
    id: s.id,
    userId: session.user.id,
    title: s.title,
    taskType,
    difficulty,
    firstAction: null,
    status: "active" as const,
    parentId: input.parent.id,
  }));

  await db.insert(tasks).values([parentRow, ...childRows]);

  revalidatePath("/dashboard");
  return {
    parentId: parentRow.id,
    childIds: childRows.map((r) => r.id),
  };
}

