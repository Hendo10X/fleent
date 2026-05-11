"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, asc, eq, sql } from "drizzle-orm";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/db";
import { streakEvents, streaks, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";

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

  const isComplete = existing.status === "completed";

  await db
    .update(tasks)
    .set({
      status: isComplete ? "active" : "completed",
      completedAt: isComplete ? null : new Date(),
    })
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)));

  if (!isComplete) await bumpStreakOnTaskComplete(session.user.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/stats");
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

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)));

  revalidatePath("/dashboard");
}

export async function autoPrioritizeTasks() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not signed in.");

  await db.execute(
    sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0 NOT NULL`,
  );

  const activeTasks = await db
    .select({ id: tasks.id, title: tasks.title, difficulty: tasks.difficulty, taskType: tasks.taskType })
    .from(tasks)
    .where(
      and(eq(tasks.userId, session.user.id), eq(tasks.status, "active")),
    )
    .orderBy(asc(tasks.createdAt));

  if (activeTasks.length === 0) return [];

  const prompt = `You are a task prioritization assistant. Rank these tasks by importance and urgency.

Return a JSON array of objects with the original id and a priorityScore (1-100, higher = more important).
Only return valid JSON, no explanation, no markdown.

Tasks:
${JSON.stringify(activeTasks, null, 2)}`;

  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    system: "You output only valid JSON arrays. No markdown, no explanation.",
    prompt,
    temperature: 0.3,
  });

  const ranked: Array<{ id: string; priorityScore: number }> = JSON.parse(
    text.replace(/```json|```/g, "").trim(),
  );

  const idIndex = new Map(ranked.map((r, i) => [r.id, i]));

  const updates = activeTasks
    .map((t) => ({
      ...t,
      sortOrder: idIndex.get(t.id) ?? 999,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  for (let i = 0; i < updates.length; i++) {
    await db
      .update(tasks)
      .set({ sortOrder: i + 1 })
      .where(eq(tasks.id, updates[i].id));
  }

  revalidatePath("/dashboard");
  return updates.map((t, i) => ({ id: t.id, sortOrder: i + 1 }));
}
