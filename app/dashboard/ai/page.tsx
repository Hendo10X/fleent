import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AIChat } from "@/components/dashboard/ai-chat";

export default async function AIPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <main className="px-6 pb-32 pt-12">
      <section className="mx-auto flex w-full max-w-md flex-col">
        <header className="flex w-full flex-col items-start text-left">
          <h1 className="text-2xl font-bold tracking-tight text-fleent-ink">
            AI
          </h1>
          <p className="mt-1 text-sm tracking-wide text-fleent-mute">
            Your productivity copilot — powered by Gemini.
          </p>
        </header>

        <div className="mt-8">
          <AIChat />
        </div>
      </section>
    </main>
  );
}
