import Image from "next/image";
import Link from "next/link";
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
    <main className="grid min-h-screen place-items-center bg-fleent-background px-6 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Fleent">
            <Image
              src="/images/fleent.svg"
              alt="Fleent"
              width={76}
              height={24}
              priority
            />
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-7 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.12em] text-fleent-orange uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-fleent-ink">
            {title}
          </h1>
          <p className="mt-3 text-fleent-body tracking-wide text-fleent-mute">
            {subtitle}
          </p>

          <div className="mt-8">{children}</div>
        </div>

        <div className="mt-5 text-center text-sm tracking-wide text-fleent-mute">
          {footer}
        </div>
      </section>
    </main>
  );
}
