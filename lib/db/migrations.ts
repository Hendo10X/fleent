import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * In-app, idempotent schema patches.
 *
 * We're not using drizzle-kit migrations yet - these `ALTER TABLE … IF NOT
 * EXISTS` calls let new columns ship without a separate migration step.
 * Each function should be cheap, idempotent, and safe to call on every
 * request that touches the relevant columns.
 */

let ensureTaskColumnsPromise: Promise<void> | null = null;

/**
 * Make sure the `tasks` table has every column the app currently reads/writes.
 * Memoized at module scope so we run the ALTERs once per server process.
 */
export function ensureTaskColumns(): Promise<void> {
  if (!ensureTaskColumnsPromise) {
    ensureTaskColumnsPromise = (async () => {
      await db.execute(
        sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0 NOT NULL`,
      );
      await db.execute(
        sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_id text`,
      );
      // Indexes for the two hot read paths:
      //   1) the dashboard `SELECT` filters by (user_id, status) and orders
      //      by (sort_order, created_at) - composite covers both.
      //   2) deletion cascade + tree build look up by parent_id.
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS tasks_user_status_sort_idx ON tasks (user_id, status, sort_order)`,
      );
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS tasks_user_parent_idx ON tasks (user_id, parent_id)`,
      );
      // Legacy columns from an earlier design - kept harmless to avoid a
      // destructive migration on dev DBs. New code never reads or writes them.
      // Drop manually with: ALTER TABLE tasks DROP COLUMN parent_group_id, DROP COLUMN parent_title;
    })().catch((err) => {
      // Reset the cache on failure so the next request can retry.
      ensureTaskColumnsPromise = null;
      throw err;
    });
  }
  return ensureTaskColumnsPromise;
}
