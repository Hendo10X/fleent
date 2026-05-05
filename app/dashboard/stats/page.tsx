import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gte } from "drizzle-orm";
import { ChartBar, CheckCircle, Fire, ListChecks } from "@phosphor-icons/react/ssr";
import { db } from "@/db";
import { streaks, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { computeCurrentStreakFromDates } from "@/lib/streak";

export default async function StatsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userId = session.user.id;

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const [allTasks, completedRecentRows, completedAllRows, streakRow] =
    await Promise.all([
    db.select().from(tasks).where(eq(tasks.userId, userId)),
    db
      .select({ completedAt: tasks.completedAt })
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

  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.status === "completed").length;
  const active = allTasks.filter((t) => t.status === "active").length;
  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const derivedStreak = computeCurrentStreakFromDates(
    completedAllRows.map((row) => row.completedAt),
  );
  const streak = Math.max(streakRow[0]?.currentStreak ?? 0, derivedStreak);
  const longest = streakRow[0]?.longestStreak ?? 0;

  // Build a 4-week sparkline of completions per week (oldest → newest)
  const weeks = buildWeekBuckets(completedRecentRows.map((r) => r.completedAt));
  const maxWeek = Math.max(1, ...weeks.map((w) => w.count));

  return (
    <main className="px-6 pt-12">
      <section className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-2xl font-bold tracking-tight text-fleent-ink">
            Stats
          </h1>
          <p className="mt-1 text-sm tracking-wide text-fleent-mute">
            What you've done, and what's still humming.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <StatCard
            icon={<ListChecks size={18} weight="regular" />}
            label="Total tasks"
            value={total}
          />
          <StatCard
            icon={<CheckCircle size={18} weight="regular" />}
            label="Completed"
            value={completed}
            tint="green"
          />
          <StatCard
            icon={<ChartBar size={18} weight="regular" />}
            label="Active"
            value={active}
            tint="blue"
          />
          <StatCard
            icon={<Fire size={18} weight="fill" />}
            label="Day streak"
            value={streak}
            tint="orange"
          />
        </div>

        <div className="mt-3 rounded-2xl bg-white px-4 py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
              Completion rate
            </span>
            <span className="text-base font-bold tracking-tight text-fleent-ink tabular-nums">
              {completionRate}%
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#F3F3F3]">
            <div
              className="h-full rounded-full bg-fleent-orange"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="mt-2 text-xs tracking-wide text-fleent-mute">
            Longest streak: {longest} day{longest === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-3 rounded-2xl bg-white px-4 py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
              Last 4 weeks
            </span>
            <span className="text-xs tracking-wide text-fleent-mute">
              {weeks.reduce((s, w) => s + w.count, 0)} completed
            </span>
          </div>
          <div className="mt-4 flex h-24 items-end justify-between gap-2">
            {weeks.map((w) => {
              const heightPct = (w.count / maxWeek) * 100;
              return (
                <div
                  key={w.label}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <div
                    className="w-full rounded-t-md bg-fleent-orange/80"
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    aria-label={`${w.count} completed week of ${w.label}`}
                  />
                  <span className="text-[10px] tracking-wide text-fleent-mute">
                    {w.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint?: "orange" | "green" | "blue";
}) {
  const tintClass =
    tint === "orange"
      ? "text-fleent-orange"
      : tint === "green"
        ? "text-fleent-green"
        : tint === "blue"
          ? "text-fleent-blue"
          : "text-fleent-ink";

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-4">
      <span className={`inline-flex ${tintClass}`}>{icon}</span>
      <span className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
        {label}
      </span>
      <span className="text-2xl font-bold tracking-tight text-fleent-ink tabular-nums">
        {value}
      </span>
    </div>
  );
}

function buildWeekBuckets(dates: (Date | null)[]) {
  const now = new Date();
  const buckets = Array.from({ length: 4 }, (_, i) => {
    const start = new Date(now);
    start.setDate(start.getDate() - (4 - i) * 7);
    return {
      start,
      label: shortDate(start),
      count: 0,
    };
  });

  for (const d of dates) {
    if (!d) continue;
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (d >= buckets[i].start) {
        buckets[i].count += 1;
        break;
      }
    }
  }

  return buckets;
}

function shortDate(date: Date) {
  return date.toLocaleString("en-US", { month: "short", day: "numeric" });
}
