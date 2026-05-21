"use client";

import Link from "next/link";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Copy,
  MagicWand,
  Notepad,
  Sparkle,
} from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const EXAMPLES = [
  "Write the quarterly report",
  "Prepare for my dentist appointment",
  "Clean up my inbox",
  "Study for my chemistry test",
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function AIAssistant() {
  const [task, setTask] = useState("");
  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const assistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");
  const responseText =
    assistantMessage?.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim() ?? "";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = task.trim();
    if (!value || status === "submitted" || status === "streaming") return;

    setMessages([]);
    await sendMessage({ text: value });
  }

  async function handleExample(example: string) {
    setTask(example);
    setMessages([]);
    await sendMessage({ text: example });
  }

  return (
    <main className="px-6 pt-12">
      <section className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex w-full items-start justify-between gap-3 text-left">
          <div className="flex min-w-0 flex-col items-start">
            <h1 className="text-2xl font-bold tracking-tight text-fleent-ink">
              AI
            </h1>
            <p className="mt-1 max-w-[29ch] text-sm tracking-wide text-fleent-mute">
              Translate one task into bite-size todos you can actually start.
            </p>
          </div>
          <Link
            href="/dashboard/notes"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-medium tracking-tight text-fleent-ink transition-colors duration-200 ease-out hover:bg-[#F3F3F3]"
          >
            <Notepad size={14} weight="fill" className="text-fleent-orange" />
            Add notes
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
          <div className="rounded-3xl bg-white p-3">
            <textarea
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder="write the proposal, book the doctor, finish my essay..."
              rows={4}
              className="min-h-28 w-full resize-none bg-transparent px-2 py-1 text-base tracking-wide text-fleent-ink outline-none placeholder:text-fleent-mute"
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs tracking-wide text-fleent-mute">
                One task in. Small next steps out.
              </p>
              <button
                type="submit"
                disabled={!task.trim() || status === "submitted" || status === "streaming"}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-fleent-orange px-5 text-sm font-semibold tracking-wide text-white transition-colors duration-200 ease-out hover:bg-fleent-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "submitted" || status === "streaming" ? (
                  <Spinner className="size-4 text-white" />
                ) : (
                  <>
                    Break it down
                    <ArrowRight size={16} weight="bold" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExample(example)}
              disabled={status === "submitted" || status === "streaming"}
              className="rounded-full bg-white px-3 py-2 text-sm tracking-wide text-fleent-ink transition-colors duration-200 ease-out hover:bg-[#F3F3F3] disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {responseText ? (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="mt-8 rounded-3xl bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-fleent-orange uppercase">
                    Breakdown
                  </p>
                  <p className="mt-2 text-sm tracking-wide text-fleent-mute">
                    A smaller version of the task, ready to move.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(responseText);
                    toast.success("Copied.");
                  }}
                  className="inline-flex size-10 items-center justify-center rounded-full bg-[#F3F3F3] text-fleent-ink transition-colors duration-200 ease-out hover:bg-[#ECECEC]"
                >
                  <Copy size={16} weight="bold" />
                </button>
              </div>

              <div className="mt-5 whitespace-pre-wrap text-sm leading-7 tracking-wide text-fleent-ink">
                {responseText}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              className="mt-8 rounded-3xl bg-white p-5"
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-fleent-orange/10 text-fleent-orange">
                  {status === "submitted" || status === "streaming" ? (
                    <Spinner className="size-4 text-fleent-orange" />
                  ) : (
                    <MagicWand size={20} weight="fill" />
                  )}
                </span>
                <div>
                  <p className="text-base font-bold tracking-tight text-fleent-ink">
                    {status === "submitted" || status === "streaming"
                      ? "Breaking the task down..."
                      : "Ready when you are."}
                  </p>
                  <p className="mt-2 text-sm tracking-wide text-fleent-mute">
                    {status === "submitted" || status === "streaming"
                      ? "The AI is translating your task into smaller actions."
                      : "Paste one task you have been avoiding, and Fleent will turn it into startable todos."}
                  </p>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {error ? (
          <div className="mt-4 w-full max-w-full overflow-hidden rounded-2xl bg-red-50 px-4 py-3 text-sm tracking-wide text-red-700">
            <p className="break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
              {error.message || "The breakdown failed. Try again."}
            </p>
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-[#F3F3F3] text-fleent-orange">
              <Sparkle size={18} weight="fill" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-fleent-ink">
                AI assistance
              </p>
              <p className="mt-1 text-sm tracking-wide text-fleent-mute">
                More guided rewrites and task coaching can grow here later.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
