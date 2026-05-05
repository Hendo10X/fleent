export const MAX_WORDS_PER_NOTE = 100;

function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return splitWords(text).length;
}

function takeFirstWords(text: string, n: number): string {
  if (n <= 0) return "";
  const w = splitWords(text);
  return w.slice(0, n).join(" ");
}

/** Title + body share one word budget (maxWords total). */
export function clampNoteToWordLimit(
  title: string,
  body: string,
  maxWords: number,
): {
  title: string;
  body: string;
} {
  const tw = countWords(title);
  const bw = countWords(body);
  if (tw + bw <= maxWords) return { title, body };

  if (tw >= maxWords) {
    return {
      title: takeFirstWords(title, maxWords),
      body: "",
    };
  }

  const maxBody = maxWords - tw;
  return {
    title,
    body: takeFirstWords(body, maxBody),
  };
}
