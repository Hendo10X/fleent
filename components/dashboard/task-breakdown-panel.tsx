"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowsClockwise,
  Check,
  MagicWand,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { suggestTaskBreakdown } from "@/app/dashboard/actions";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type SuggestionItem = {
  id: string;
  text: string;
  enabled: boolean;
};

type Props = {
  /** Title to break down. Required and non-empty for the request to fire. */
  title: string;
  /** Auto-fire the breakdown the moment the panel mounts. */
  autoFetch?: boolean;
  /** Label for the primary commit button. */
  applyLabel?: string;
  /** Called with the final, ordered list of selected step titles. */
  onApply: (steps: string[]) => void | Promise<void>;
  /** Optional close affordance for parents that render this in a popover. */
  onClose?: () => void;
  /** Disable the apply button externally (e.g. while parent is pending). */
  applyDisabled?: boolean;
};

/**
 * Self-contained breakdown UX:
 *  - Fetches a 2–5 step breakdown of `title`
 *  - Renders editable, toggleable steps
 *  - Calls `onApply` with the cleaned, selected steps
 *
 * Stateless from the parent's perspective beyond the supplied callbacks.
 */
export function TaskBreakdownPanel({
  title,
  autoFetch = false,
  applyLabel = "Add tasks",
  onApply,
  onClose,
  applyDisabled = false,
}: Props) {
  const [items, setItems] = useState<SuggestionItem[]>([]);

  const fetchMutation = useMutation({
    mutationKey: ["ai", "breakdown", title],
    mutationFn: () => suggestTaskBreakdown(title),
    onSuccess: (steps) => {
      setItems(
        steps.map((text) => ({
          id: crypto.randomUUID(),
          text,
          enabled: true,
        })),
      );
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : "Couldn't break this down.";
      toast.error(message);
    },
  });

  // Auto-fire once when mounted with a usable title.
  useEffect(() => {
    if (autoFetch && title.trim().length > 1 && items.length === 0 && !fetchMutation.isPending) {
      fetchMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  const selected = useMemo(
    () => items.filter((i) => i.enabled && i.text.trim().length > 0),
    [items],
  );

  function updateItem(id: string, next: Partial<SuggestionItem>) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...next } : it)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const hasResults = items.length > 0;
  const isLoading = fetchMutation.isPending;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#F6F6FE] p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-fleent-orange">
            <Sparkle size={12} weight="fill" />
          </span>
          <p className="truncate text-xs font-semibold tracking-[0.08em] text-fleent-mute uppercase">
            AI breakdown
          </p>
        </div>
        <div className="flex items-center gap-1">
          {hasResults && (
            <button
              type="button"
              onClick={() => fetchMutation.mutate()}
              disabled={isLoading}
              aria-label="Regenerate breakdown"
              className="inline-flex size-7 items-center justify-center rounded-full text-fleent-mute transition-colors hover:bg-white hover:text-fleent-ink disabled:opacity-50"
            >
              <ArrowsClockwise
                size={12}
                weight="bold"
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close breakdown"
              className="inline-flex size-7 items-center justify-center rounded-full text-fleent-mute transition-colors hover:bg-white hover:text-fleent-ink"
            >
              <X size={12} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {!hasResults && !isLoading && (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm tracking-wide text-fleent-mute">
            Split this task into 2–5 doable steps.
          </p>
          <button
            type="button"
            onClick={() => fetchMutation.mutate()}
            disabled={title.trim().length < 2 || isLoading}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium tracking-tight text-fleent-ink transition-colors duration-200 ease-out hover:bg-[#ECECF8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MagicWand size={14} weight="fill" className="text-fleent-orange" />
            Break it down
          </button>
        </div>
      )}

      {isLoading && (
        <ul className="flex flex-col gap-1.5">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-9 w-full animate-pulse rounded-xl bg-white/70"
            />
          ))}
        </ul>
      )}

      <AnimatePresence initial={false}>
        {hasResults && !isLoading && (
          <motion.ul
            key="results"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="flex flex-col gap-1.5"
          >
            {items.map((item, index) => (
              <li
                key={item.id}
                className="group flex items-center gap-2 rounded-xl bg-white px-2 py-1.5"
              >
                <button
                  type="button"
                  onClick={() =>
                    updateItem(item.id, { enabled: !item.enabled })
                  }
                  aria-label={item.enabled ? "Exclude step" : "Include step"}
                  className={`inline-flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                    item.enabled
                      ? "border-fleent-orange bg-fleent-orange text-white"
                      : "border-fleent-mute/40 text-transparent"
                  }`}
                >
                  <Check size={12} weight="bold" />
                </button>
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-[#F3F3F3] text-[10px] font-bold tabular-nums text-fleent-mute">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) =>
                    updateItem(item.id, { text: e.target.value })
                  }
                  className={`min-w-0 flex-1 bg-transparent text-sm tracking-wide outline-none ${
                    item.enabled
                      ? "text-fleent-ink"
                      : "text-fleent-mute line-through"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove step"
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-fleent-mute opacity-0 transition-all duration-150 hover:bg-[#F3F3F3] hover:text-fleent-ink group-hover:opacity-100"
                >
                  <X size={10} weight="bold" />
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {hasResults && !isLoading && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs tracking-wide text-fleent-mute">
            {selected.length} step{selected.length === 1 ? "" : "s"} selected
          </p>
          <button
            type="button"
            onClick={() => onApply(selected.map((s) => s.text.trim()))}
            disabled={selected.length === 0 || applyDisabled}
            className="inline-flex h-8 items-center justify-center rounded-full bg-fleent-orange px-3 text-sm font-semibold tracking-tight text-white transition-colors hover:bg-fleent-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {applyLabel}
          </button>
        </div>
      )}
    </div>
  );
}
