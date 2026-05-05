import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, asc, desc, eq, gte, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { streaks, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { computeCurrentStreakFromDates } from "@/lib/streak";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  // Visible tasks: every active task + any task completed in the last 4 weeks.
  // Completed tasks stay (struck through) until the user deletes them.
  const [visibleTasks, completedRecent, completedDates, streakRow] =
    await Promise.all([
    db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          or(
            ne(tasks.status, "completed"),
            gte(tasks.completedAt, fourWeeksAgo),
          ),
        ),
      )
      .orderBy(asc(tasks.status), desc(tasks.createdAt)),
    db
      .select({ id: tasks.id })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.status, "completed"),
          gte(tasks.completedAt, fourWeeksAgo),
        ),
      ),
    db
      .select({ completedAt: tasks.completedAt })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "completed"))),
    db.select().from(streaks).where(eq(streaks.userId, userId)).limit(1),
  ]);

  const derivedStreak = computeCurrentStreakFromDates(
    completedDates.map((row) => row.completedAt),
  );
  const currentStreak = Math.max(streakRow[0]?.currentStreak ?? 0, derivedStreak);

  return (
    <DashboardClient
      user={{
        name: session.user.name,
        image: session.user.image ?? null,
      }}
      tasks={visibleTasks.map((t) => ({
        id: t.id,
        title: t.title,
        taskType: t.taskType,
        difficulty: t.difficulty,
        firstAction: t.firstAction,
        status: t.status as "active" | "completed",
      }))}
      completedInLast4Weeks={completedRecent.length}
      currentStreak={currentStreak}
    />
  );
}
