import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
// NOTE: do NOT import "@uploadthing/react/styles.css" here. That stylesheet
// ships its own full Tailwind build (preflight reset + utility classes) which,
// once loaded, globally overrides the app's own utilities and breaks the
// dashboard sidebar (`hidden md:flex`) on every page until a full reload. The
// upload button is fully styled via its `appearance` prop in SettingsClient,
// so the default stylesheet isn't needed.
import { db } from "@/db";
import { user } from "@/db/schema";
import { SettingsClient } from "@/components/dashboard/settings-client";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [row] = await db
    .select({ createdAt: user.createdAt })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const createdAt =
    row?.createdAt?.toISOString() ?? new Date().toISOString();

  return (
    <main className="px-6 pb-28 pt-12">
      <section className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-2xl font-bold tracking-tight text-fleent-ink">
            Settings
          </h1>
          <p className="mt-1 text-sm tracking-wide text-fleent-mute">
            Profile and preferences for your account.
          </p>
        </div>

        <SettingsClient
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image ?? null,
            emailVerified: session.user.emailVerified,
            createdAt,
          }}
        />
      </section>
    </main>
  );
}
