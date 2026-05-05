"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Plus, Trash } from "@phosphor-icons/react";
import type { DashboardNote } from "@/lib/notes-storage";
import {
  loadNotesFromStorage,
  notesQueryKey,
  persistNotesToStorage,
} from "@/lib/notes-storage";
import {
  clampNoteToWordLimit,
  countWords,
  MAX_WORDS_PER_NOTE,
} from "@/lib/note-words";

const SPRING_SOFT = { type: "spring" as const, bounce: 0.18, duration: 0.45 };

interface Props {
  storageKey: string;
}

export function NotesApp({ storageKey }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => notesQueryKey(storageKey), [storageKey]);

  const { data: notes = [], isPending } = useQuery({
    queryKey,
    queryFn: () => loadNotesFromStorage(storageKey),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const setNotes = useCallback(
    (updater: (prev: DashboardNote[]) => DashboardNote[]) => {
      queryClient.setQueryData<DashboardNote[]>(queryKey, (old) =>
        updater(old ?? []),
      );
    },
    [queryClient, queryKey],
  );

  useEffect(() => {
    if (isPending) return;
    const handle = window.setTimeout(() => {
      persistNotesToStorage(storageKey, notes);
    }, 380);
    return () => window.clearTimeout(handle);
  }, [notes, storageKey, isPending]);

  const addNote = useCallback(() => {
    const note: DashboardNote = {
      id: crypto.randomUUID(),
      title: "",
      body: "",
      updatedAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
    requestAnimationFrame(() => {
      listRef.current?.querySelector<HTMLElement>(`[data-note-id="${note.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [setNotes]);

  const updateNote = useCallback(
    (id: string, patch: Partial<DashboardNote>) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n;
          const title = patch.title !== undefined ? patch.title : n.title;
          const body = patch.body !== undefined ? patch.body : n.body;
          const bounded = clampNoteToWordLimit(
            title,
            body,
            MAX_WORDS_PER_NOTE,
          );
          return {
            ...n,
            title: bounded.title,
            body: bounded.body,
            updatedAt: Date.now(),
          };
        }),
      );
    },
    [setNotes],
  );

  const removeNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotes],
  );

  return (
    <main className="px-6 pb-28 pt-12">
      <section className="mx-auto flex w-full max-w-md flex-col">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-fleent-ink">
              Notes
            </h1>
            <p className="mt-1 text-sm tracking-wide text-fleent-mute">
              Write here — saved on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={addNote}
            aria-label="Add note"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-fleent-ink outline-none ring-1 ring-black/8 transition-colors hover:bg-[#F3F3F3] focus-visible:ring-2 focus-visible:ring-fleent-orange/40"
          >
            <Plus size={22} weight="bold" />
          </button>
        </header>

        {isPending ? (
          <div className="mt-10 space-y-4" aria-hidden>
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-white/60 ring-1 ring-black/5"
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-fleent-mute/30 bg-white/50 px-5 py-12 text-center">
            <p className="text-sm font-medium tracking-tight text-fleent-ink">
              No notes yet.
            </p>
            <p className="mt-2 text-sm tracking-wide text-fleent-mute">
              Up to {MAX_WORDS_PER_NOTE} words per note. Tap + to add one.
            </p>
            <button
              type="button"
              onClick={addNote}
              className="mt-5 rounded-full bg-fleent-orange px-4 py-2 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-fleent-orange/90"
            >
              Add note
            </button>
          </div>
        ) : (
          <LayoutGroup>
            <div ref={listRef} className="mt-10 flex flex-col gap-4">
              <AnimatePresence initial={false} mode="popLayout">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    maxWords={MAX_WORDS_PER_NOTE}
                    onChange={(patch) => updateNote(note.id, patch)}
                    onRemove={() => removeNote(note.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        )}
      </section>
    </main>
  );
}

interface NoteCardProps {
  note: DashboardNote;
  maxWords: number;
  onChange: (patch: Partial<DashboardNote>) => void;
  onRemove: () => void;
}

function NoteCard({ note, maxWords, onChange, onRemove }: NoteCardProps) {
  const wordsUsed = countWords(note.title) + countWords(note.body);

  return (
    <motion.article
      layout
      layoutId={note.id}
      data-note-id={note.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={SPRING_SOFT}
      className="rounded-2xl bg-white p-4 shadow-none ring-1 ring-black/6"
    >
      <div className="flex items-start gap-2">
        <input
          type="text"
          value={note.title}
          onChange={(e) => {
            const nextTitle = e.target.value;
            const bounded = clampNoteToWordLimit(
              nextTitle,
              note.body,
              maxWords,
            );
            onChange({ title: bounded.title, body: bounded.body });
          }}
          placeholder="Title (optional)"
          className="min-w-0 flex-1 bg-transparent text-base font-semibold tracking-tight text-fleent-ink outline-none placeholder:text-fleent-mute"
        />
        <button
          type="button"
          aria-label="Delete note"
          onClick={onRemove}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-fleent-mute ring-1 ring-black/5 transition-colors hover:bg-black/4 hover:text-fleent-ink"
        >
          <Trash size={18} weight="bold" />
        </button>
      </div>

      <textarea
        value={note.body}
        onChange={(e) => {
          const nextBody = e.target.value;
          const bounded = clampNoteToWordLimit(
            note.title,
            nextBody,
            maxWords,
          );
          onChange({ title: bounded.title, body: bounded.body });
        }}
        placeholder="Write something…"
        rows={5}
        className="mt-3 w-full resize-none bg-transparent text-sm leading-relaxed tracking-wide text-fleent-ink outline-none placeholder:text-fleent-mute"
      />

      <p className="mt-2 text-right text-xs tabular-nums tracking-wide text-fleent-mute">
        {wordsUsed} / {maxWords} words
      </p>
    </motion.article>
  );
}
