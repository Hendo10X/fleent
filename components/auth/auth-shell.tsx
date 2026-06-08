import Image from "next/image";
import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-fleent-background px-6 py-6">
      <section className="w-full max-w-md">
        {/*
          Decorative logo only - intentionally NOT wrapped in a Link. The
          previous build linked to `/`, which dumped users out onto the
          marketing site (its navbar collapses to a hamburger on mobile, so
          it read as "a home page with no nav links"). Keeping the user
          anchored on the auth flow is the expected behaviour for a logo
          inside a login/signup form.
        */}
        <div className="mb-5 flex justify-center">
          <Image
            src="/images/fleent.svg"
            alt="Fleent"
            width={76}
            height={24}
            priority
          />
        </div>

        <div className="rounded-3xl bg-white p-6 sm:p-7">
          <p className="text-xs font-semibold tracking-[0.12em] text-fleent-orange uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-[1.75rem] font-bold tracking-tight text-fleent-ink sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm tracking-wide text-fleent-mute sm:text-base">
            {subtitle}
          </p>

          <div className="mt-6">{children}</div>
        </div>

        <div className="mt-4 text-center text-sm tracking-wide text-fleent-mute">
          {footer}
        </div>
      </section>
    </main>
  );
}
