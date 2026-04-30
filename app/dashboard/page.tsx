import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-fleent-background px-6 py-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" aria-label="Fleent">
          <Image src="/images/fleent.svg" alt="Fleent" width={72} height={23} />
        </Link>
        <SignOutButton />
      </div>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 pt-20 md:grid-cols-[0.9fr_1.1fr] md:items-stretch">
        <div className="rounded-3xl bg-fleent-orange p-8 text-white sm:p-10">
          <p className="text-xs font-semibold tracking-[0.12em] text-white/70 uppercase">
            Dashboard
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Welcome back, {session.user.name}.
          </h1>
          <p className="mt-5 text-fleent-body-lg tracking-wide text-white/85">
            Your full Fleent surface can grow here. For now, this confirms the
            authenticated session and user profile from the database.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 sm:p-10">
          <p className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
            Signed-in user
          </p>
          <dl className="mt-8 flex flex-col gap-5">
            <div className="rounded-2xl bg-[#F3F3F3] p-5">
              <dt className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
                Name
              </dt>
              <dd className="mt-1 text-xl font-bold text-fleent-ink">
                {session.user.name}
              </dd>
            </div>
            <div className="rounded-2xl bg-[#F3F3F3] p-5">
              <dt className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
                Email
              </dt>
              <dd className="mt-1 break-all text-xl font-bold text-fleent-ink">
                {session.user.email}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
