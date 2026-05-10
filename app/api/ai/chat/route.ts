import { headers } from "next/headers";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { auth } from "@/lib/auth";
import { flashModel } from "@/lib/ai/client";
import { AI_CHAT_SYSTEM } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const result = streamText({
    model: flashModel,
    system: AI_CHAT_SYSTEM,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
