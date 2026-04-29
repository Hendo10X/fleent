import Link from "next/link";
import {
  CalendarDots,
  CheckCircle,
  HandTap,
  Lightning,
  ShieldCheck,
  Sparkle,
  Target,
} from "@phosphor-icons/react/ssr";
import { Cta } from "@/components/sections/cta";
import { Faq } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { Footer } from "@/components/sections/footer";
import { How } from "@/components/sections/how";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

const SNAPSHOTS = [
  {
    icon: Target,
    label: "Focus Mode",
    title: "Three tasks, one honest screen.",
    body: "Fleent keeps the day small enough to enter. No backlog theater, no color-coded pile of guilt.",
  },
  {
    icon: HandTap,
    label: "Task Flips",
    title: "Turn dread into a body-level next move.",
    body: "Every flip becomes something you can physically do in about ten seconds, before your brain can negotiate its way out.",
  },
  {
    icon: CalendarDots,
    label: "Calendar Gaps",
    title: "Find work that fits the time you actually have.",
    body: "Fleent reads the shape of your day, then suggests starts that fit the white space between meetings and errands.",
  },
];

const DETAILS = [
  "Friction ranking based on effort, ambiguity, time, and emotional drag.",
  "Voice and text capture for messy thoughts before they disappear.",
  "Starting streaks that celebrate beginning instead of punishing unfinished work.",
  "Gentle reminders that nudge without turning your phone into an alarm panel.",
  "Privacy-first calendar sync that sees time blocks, not event contents.",
  "A dashboard designed for repeat daily use, not productivity cosplay.",
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="Features"
          heading="Everything in Fleent is built to make starting smaller."
          subheading="A focused dashboard, AI-assisted task flips, and calendar-aware suggestions work together so your day feels possible again."
        />

        <section className="bg-fleent-background pb-12 sm:pb-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 md:grid-cols-3">
            {SNAPSHOTS.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.label}
                  className="group relative overflow-hidden rounded-3xl bg-white p-8"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-fleent-orange/10 text-fleent-orange transition-colors duration-200 ease-out group-hover:bg-fleent-orange group-hover:text-white">
                    <Icon size={23} weight="regular" />
                  </span>
                  <p className="mt-6 text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
                    {item.label}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-fleent-ink">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-fleent-body tracking-wide text-fleent-mute">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <Features />

        <section className="bg-fleent-background py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium tracking-wide text-fleent-mute">
                <Sparkle size={14} weight="fill" className="text-fleent-orange" />
                Built for real days
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-balance text-fleent-ink sm:text-4xl">
                The small systems that make the big system work.
              </h2>
              <p className="mt-4 text-fleent-body-lg tracking-wide text-fleent-mute">
                Fleent is intentionally narrow. It does a few things extremely
                well, then gets out of the way when you finally have momentum.
              </p>
              <Link
                href="/demo"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-fleent-orange px-6 text-sm font-semibold tracking-wide text-white transition-colors duration-200 ease-out hover:bg-fleent-orange/90"
              >
                Watch the flow
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DETAILS.map((detail) => (
                <div
                  key={detail}
                  className="flex items-start gap-3 rounded-3xl bg-white p-5"
                >
                  <CheckCircle
                    size={20}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-fleent-green"
                  />
                  <p className="text-sm tracking-wide text-fleent-ink">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <How />

        <section className="bg-fleent-background py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 md:grid-cols-3">
            {[
              {
                icon: Lightning,
                title: "Fast to enter",
                body: "The first useful action is never hidden behind setup.",
              },
              {
                icon: ShieldCheck,
                title: "Calm by default",
                body: "No public leaderboards, shame loops, or fake urgency.",
              },
              {
                icon: Sparkle,
                title: "AI with a job",
                body: "It shrinks tasks and ranks friction. It does not perform productivity theater.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-3xl bg-white p-8">
                  <Icon size={24} weight="regular" className="text-fleent-orange" />
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-fleent-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-fleent-body tracking-wide text-fleent-mute">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
