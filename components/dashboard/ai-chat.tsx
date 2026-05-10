"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Sparkle } from "@phosphor-icons/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const SUGGESTIONS = [
  "What should I start with today?",
  "Break my biggest task into smaller steps",
  "Help me plan a focused 90-minute block",
];

export function AIChat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
  });

  const isBusy = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  function handleSuggestion(text: string) {
    if (isBusy) return;
    sendMessage({ text });
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {isEmpty ? (
        <EmptyHero onPick={handleSuggestion} />
      ) : (
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.li
                key={message.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className={
                  message.role === "user"
                    ? "self-end max-w-[85%] rounded-2xl bg-fleent-ink px-3.5 py-2 text-sm tracking-wide text-white"
                    : "self-start max-w-[90%] rounded-2xl bg-white px-3.5 py-2 text-sm tracking-wide text-fleent-ink"
                }
              >
                <MessageText message={message} />
              </motion.li>
            ))}
          </AnimatePresence>
          {isBusy && (
            <li className="self-start inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 text-sm text-fleent-mute">
              <Sparkle size={14} weight="fill" className="animate-pulse text-fleent-orange" />
              Thinking…
            </li>
          )}
        </ul>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {error.message ?? "Something went wrong. Try again."}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-24 mt-auto flex items-center gap-2 rounded-2xl bg-white px-3 py-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the copilot…"
          disabled={isBusy}
          className="min-w-0 flex-1 bg-transparent text-sm tracking-wide text-fleent-ink outline-none placeholder:text-fleent-mute disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isBusy}
          aria-label="Send"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-fleent-orange text-white transition-colors duration-200 ease-out hover:bg-fleent-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowUp size={14} weight="bold" />
        </button>
      </form>
    </div>
  );
}

function MessageText({
  message,
}: {
  message: { parts: Array<{ type: string; text?: string }> };
}) {
  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {message.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("")}
    </span>
  );
}

function EmptyHero({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-col items-start gap-4 py-6 text-left">
      <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white text-fleent-orange">
        <Sparkle size={20} weight="fill" />
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-fleent-ink">
          Plan smarter, not harder.
        </h2>
        <p className="mt-1 text-sm tracking-wide text-fleent-mute">
          Ask anything about your day, or pick a starter below.
        </p>
      </div>
      <div className="flex w-full flex-col gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="w-full rounded-xl bg-white px-3 py-2 text-left text-sm tracking-wide text-fleent-ink transition-colors duration-200 ease-out hover:bg-[#F3F3F3]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
