import { generateText } from "ai";
import { z } from "zod";
import { aiModel } from "./client";
import { BREAKDOWN_SYSTEM } from "./prompts";

const BreakdownSchema = z.object({
  steps: z.array(z.string().min(2).max(160)).min(2).max(5),
});

const JSON_FENCE = /```(?:json)?\s*|\s*```/g;

/**
 * Pull the first JSON object out of a model response, even if it's wrapped in
 * markdown fences or trailing prose. Returns null when no parseable object
 * is found.
 */
function extractJsonObject(raw: string): unknown | null {
  const stripped = raw.replace(JSON_FENCE, "").trim();
  // Fast path — full string is valid JSON.
  try {
    return JSON.parse(stripped);
  } catch {
    // fall through
  }
  // Fallback — scan for the first balanced {...} block.
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(stripped.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Ask the model for a 2–5 step breakdown of a single task title.
 *
 * Uses `generateText` + manual JSON extraction so any Groq model works
 * (their `json_schema` response format is restricted to a small subset of
 * models — see https://console.groq.com/docs/structured-outputs).
 */
export async function suggestBreakdown(title: string): Promise<string[]> {
  const cleaned = title.trim();
  if (!cleaned) return [];

  const { text } = await generateText({
    model: aiModel,
    system: `${BREAKDOWN_SYSTEM}

Output strictly as JSON with this shape — no prose, no markdown:
{ "steps": ["step one", "step two", "step three"] }`,
    prompt: `Task: ${cleaned}\n\nReturn 2–5 ordered steps as JSON.`,
    temperature: 0.4,
  });

  const parsed = extractJsonObject(text);
  if (!parsed) {
    throw new Error("AI returned an unreadable response. Try again.");
  }

  const result = BreakdownSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("AI response didn't match the expected shape. Try again.");
  }

  return result.data.steps
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
}
