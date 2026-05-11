export type DashboardTask = {
  id: string;
  title: string;
  taskType: string | null;
  difficulty: number | null;
  firstAction: string | null;
  status: "active" | "completed";
  sortOrder: number;
  /** Self-reference: id of the parent task when this row is a breakdown child. */
  parentId: string | null;
};

export const dashboardTasksQueryKey = ["dashboard", "tasks"] as const;
