import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { generateObject } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { flashModel } from "@/lib/ai/client";
import { AUTO_STACK_SYSTEM } from "@/lib/ai/prompts";

export const runtime = "nodejs";

const RequestSchema = z.object({
  tasks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        taskType: z.string().nullable().optional(),
        difficulty: z.number().int().min(1).max(3).nullable().optional(),
      }),
    )
    .min(1)
    .max(50),
});

const ResponseSchema = z.object({
  order: z.array(z.string()),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { tasks } = parsed.data;
  const idSet = new Set(tasks.map((t) => t.id));

  try {
    const { object } = await generateObject({
      model: flashModel,
      schema: ResponseSchema,
      system: AUTO_STACK_SYSTEM,
      prompt: `Pending tasks:\n${JSON.stringify(tasks, null, 2)}`,
    });

    // Defensive: keep only known ids, append anything the model dropped.
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const id of object.order) {
      if (idSet.has(id) && !seen.has(id)) {
        ordered.push(id);
        seen.add(id);
      }
    }
    for (const id of idSet) {
      if (!seen.has(id)) ordered.push(id);
    }

    return NextResponse.json({ order: ordered });
  } catch (err) {
    console.error("[ai/autostack] generation failed", err);
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 502 },
    );
  }
}
