export type DashboardTask = {
  id: string;
  title: string;
  taskType: string | null;
  difficulty: number | null;
  firstAction: string | null;
  status: "active" | "completed";
  sortOrder: number;
};

export const dashboardTasksQueryKey = ["dashboard", "tasks"] as const;
