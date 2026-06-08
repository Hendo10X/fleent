import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, asc, desc, eq, gte, ne, or, isNull } from "drizzle-orm";
import { db } from "@/db";
import { streaks, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { computeCurrentStreakFromDates } from "@/lib/streak";
import { ensureTaskColumns } from "@/lib/db/migrations";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Idempotent, memoized - runs the ALTERs once per server process so the
  // schema matches the Drizzle types before we read.
  await ensureTaskColumns();

  const userId = session.user.id;

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  // Visible tasks: every active task + any task completed in the last 4 weeks.
  // Completed tasks stay (struck through) until the user deletes them.
  // We also pull *all* completed timestamps for streak computation in a single
  // parallel query - previously this took 4 DB calls per dashboard load, now 3.
  const [visibleTasks, completedDates, streakRow] = await Promise.all([
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
      // Roots first (parent_id IS NULL), then children - keeps the client's
      // tree-build stable without needing a second pass to find parents.
      .orderBy(
        asc(tasks.status),
        desc(isNull(tasks.parentId)),
        asc(tasks.sortOrder),
        desc(tasks.createdAt),
      ),
    db
      .select({ completedAt: tasks.completedAt })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "completed"))),
    db.select().from(streaks).where(eq(streaks.userId, userId)).limit(1),
  ]);

  // Derive the "X tasks completed in 4 weeks" count directly from the data
  // we already loaded instead of issuing a separate `SELECT count(*)`.
  const completedInLast4Weeks = visibleTasks.reduce(
    (n, t) => (t.status === "completed" ? n + 1 : n),
    0,
  );

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
        sortOrder: t.sortOrder,
        parentId: t.parentId,
      }))}
      completedInLast4Weeks={completedInLast4Weeks}
      currentStreak={currentStreak}
    />
  );
}
