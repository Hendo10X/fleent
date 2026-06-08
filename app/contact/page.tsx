"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChatCircle,
  EnvelopeSimple,
  Lifebuoy,
} from "@phosphor-icons/react";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

const CHANNELS = [
  {
    icon: EnvelopeSimple,
    title: "Email",
    description: "Best for thoughtful questions or partnership pitches.",
    href: "mailto:hello@fleent.app",
    label: "hello@fleent.app",
  },
  {
    icon: Lifebuoy,
    title: "Support",
    description: "Bug reports, billing questions, account help.",
    href: "mailto:support@fleent.app",
    label: "support@fleent.app",
  },
  {
    icon: ChatCircle,
    title: "Press",
    description: "Stories, interviews, and review copies.",
    href: "mailto:press@fleent.app",
    label: "press@fleent.app",
  },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="Contact"
          heading="Get in touch."
          subheading="Pick the right inbox below, or drop us a note here. We answer within one working day."
        />

        <section className="bg-fleent-background pb-12 sm:pb-16">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.title}
                  href={c.href}
                  className="group flex flex-col gap-3 rounded-3xl bg-white p-8 transition-colors duration-200 ease-out hover:bg-[#F3F3F3]"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-[#F2F2F2] text-fleent-orange">
                    <Icon size={22} weight="regular" />
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-fleent-ink">
                    {c.title}
                  </h3>
                  <p className="text-fleent-body tracking-wide text-fleent-mute">
                    {c.description}
                  </p>
                  <span className="text-sm font-semibold tracking-tight text-fleent-orange">
                    {c.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="bg-fleent-background pb-24 sm:pb-32">
          <div className="mx-auto max-w-3xl px-6">
            <div className="rounded-3xl bg-white p-8 sm:p-12">
              <h2 className="text-2xl font-bold tracking-tight text-fleent-ink sm:text-3xl">
                Or send a quick note
              </h2>
              <p className="mt-3 text-fleent-body tracking-wide text-fleent-mute">
                Anything goes - feature ideas, bug reports, or just hi.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="mt-8 flex flex-col gap-4"
              >
                <Field label="Name" name="name" required />
                <Field label="Email" name="email" type="email" required />
                <Field
                  label="Message"
                  name="message"
                  as="textarea"
                  rows={5}
                  required
                />
                <button
                  type="submit"
                  disabled={sent}
                  className="inline-flex h-12 items-center justify-center self-start rounded-full bg-fleent-orange px-6 text-sm font-semibold tracking-wide text-white transition-colors duration-200 ease-out hover:bg-fleent-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sent ? "Thanks - we'll be in touch." : "Send"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  as?: "input" | "textarea";
  rows?: number;
};

function Field({
  label,
  name,
  type = "text",
  required,
  as = "input",
  rows = 4,
}: FieldProps) {
  const baseClass =
    "w-full rounded-2xl bg-[#F3F3F3] px-4 py-3 text-fleent-body tracking-wide text-fleent-ink outline-none placeholder:text-fleent-mute focus-visible:ring-4 focus-visible:ring-fleent-orange/20";

  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-wide text-fleent-ink uppercase">
        {label}
      </span>
      {as === "textarea" ? (
        <textarea
          name={name}
          required={required}
          rows={rows}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input type={type} name={name} required={required} className={baseClass} />
      )}
    </label>
  );
}
