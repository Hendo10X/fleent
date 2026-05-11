import { convertToModelMessages, streamText } from "ai";
import { aiModel } from "@/lib/ai/client";
import { CHAT_BREAKDOWN_SYSTEM } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: aiModel,
    system: CHAT_BREAKDOWN_SYSTEM,
    messages: await convertToModelMessages(messages),
    temperature: 0.4,
  });

  return result.toUIMessageStreamResponse();
}
