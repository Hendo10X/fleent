"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
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
