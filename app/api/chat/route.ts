import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";

const SYSTEM_PROMPT = `
You are Fleent's task breakdown assistant.

Your only job is to translate one task into bite-size todo steps that are easy to start.

Rules:
- Return a short title line first.
- Then return 4 to 7 numbered steps.
- Keep each step concrete, physical, and beginner-friendly.
- Prefer actions that can be started in under 2 minutes.
- Break vague work into setup, first pass, and next move.
- Do not write motivational fluff.
- Do not explain your reasoning.
- Do not ask follow-up questions unless the task is impossible to interpret.
- If the task is already tiny, still make the output cleaner and more actionable.
`.trim();

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    temperature: 0.4,
  });

  return result.toUIMessageStreamResponse();
}
