import Link from "next/link";
import { Play } from "@phosphor-icons/react/ssr";
import { Cta } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

const HIGHLIGHTS = [
  {
    title: "Brain-dump in 30 seconds.",
    body: "Type or speak — Fleent extracts the actionable bits and ignores the rest.",
  },
  {
    title: "Three tasks, ranked by friction.",
    body: "Watch the AI pick what's easiest to start right now, not what's most \"important.\"",
  },
  {
    title: "One tap, a 10-second action.",
    body: "Hit Flip and see a daunting task collapse into something you can do before the kettle boils.",
  },
];

export default function DemoPage() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="Demo"
          heading="Watch Fleent in 90 seconds."
          subheading="A short walk through the brain-dump, the friction sort, and the very first flip."
        />

        <section className="bg-fleent-background pb-12 sm:pb-16">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-fleent-ink">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-white">
                <button
                  type="button"
                  aria-label="Play demo"
                  className="inline-flex size-20 items-center justify-center rounded-full bg-fleent-orange transition-transform duration-200 ease-out hover:scale-105"
                >
                  <Play size={28} weight="fill" />
                </button>
                <span className="text-sm tracking-wide text-white/70">
                  90 seconds · captioned · no sign-up required
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-fleent-background py-16 sm:py-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="rounded-3xl bg-white p-8">
                <h3 className="text-lg font-bold tracking-tight text-fleent-ink">
                  {h.title}
                </h3>
                <p className="mt-3 text-fleent-body tracking-wide text-fleent-mute">
                  {h.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 px-6">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full bg-fleent-orange px-6 text-sm font-semibold tracking-wide text-white transition-colors duration-200 ease-out hover:bg-fleent-orange/90"
            >
              Try it free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold tracking-wide text-fleent-ink transition-colors duration-200 ease-out hover:bg-slate-100"
            >
              See pricing
            </Link>
          </div>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}
