import {
  clampNoteToWordLimit,
  MAX_WORDS_PER_NOTE,
} from "@/lib/note-words";

export type DashboardNote = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
};

export const NOTES_QUERY_ROOT = "dashboard-notes" as const;

export function notesQueryKey(storageKey: string) {
  return [NOTES_QUERY_ROOT, storageKey] as const;
}

/** Client-only: safe to call from TanStack Query `queryFn` in the browser. */
export function loadNotesFromStorage(storageKey: string): DashboardNote[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (n): n is { id: string } =>
          typeof n === "object" &&
          n !== null &&
          "id" in n &&
          typeof (n as { id: unknown }).id === "string",
      )
      .map((n) => {
        const rawTitle =
          typeof (n as DashboardNote).title === "string"
            ? (n as DashboardNote).title
            : "";
        const rawBody =
          typeof (n as DashboardNote).body === "string"
            ? (n as DashboardNote).body
            : "";
        const bounded = clampNoteToWordLimit(
          rawTitle,
          rawBody,
          MAX_WORDS_PER_NOTE,
        );
        return {
          id: (n as DashboardNote).id,
          title: bounded.title,
          body: bounded.body,
          updatedAt:
            typeof (n as DashboardNote).updatedAt === "number"
              ? (n as DashboardNote).updatedAt
              : Date.now(),
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 80);
  } catch {
    return [];
  }
}

export function persistNotesToStorage(
  storageKey: string,
  notes: DashboardNote[],
): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  } catch {
    /* quota / private mode */
  }
}
