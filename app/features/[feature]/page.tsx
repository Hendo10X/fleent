import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BellSimple,
  CalendarDots,
  CheckCircle,
  Clock,
  Lightbulb,
  ShieldCheck,
  Target,
  Waveform,
} from "@phosphor-icons/react/ssr";
import { Cta } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

type Feature = {
  slug: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  icon: typeof Target;
  colorClass: string;
  accentClass: string;
  previewTitle: string;
  previewLines: string[];
  sections: {
    title: string;
    body: string;
  }[];
  outcomes: string[];
};

const FEATURES: Feature[] = [
  {
    slug: "focus",
    eyebrow: "Focus Mode",
    heading: "Three tasks. One screen. Zero noise.",
    subheading:
      "Focus Mode turns the whole day into a small, honest surface: the next three things worth starting, ranked by what your brain can actually enter.",
    icon: Target,
    colorClass: "text-fleent-orange",
    accentClass: "bg-fleent-orange",
    previewTitle: "Today",
    previewLines: ["Open the report", "Reply to Maya", "Book the dentist"],
    sections: [
      {
        title: "A hard cap on overwhelm",
        body: "Your backlog can exist, but it does not get to occupy the dashboard. Fleent limits the active view to three tasks so choosing does not become its own task.",
      },
      {
        title: "Ranked for the moment",
        body: "The order changes with friction, time, and context. The easiest honest start can move above the most impressive-looking item.",
      },
      {
        title: "Designed for re-entry",
        body: "When you fall off, you come back to a clean surface instead of a wall of overdue labels and old guilt.",
      },
    ],
    outcomes: [
      "Reduce choice paralysis before the work starts.",
      "Keep deep work and admin tasks from competing on the same stage.",
      "Make restarting after a messy day feel possible.",
    ],
  },
  {
    slug: "capture",
    eyebrow: "Smart Capture",
    heading: "Drop the thought before it disappears.",
    subheading:
      "Smart Capture gives messy thoughts a place to land, then turns the useful parts into tasks when you are ready to sort them.",
    icon: Lightbulb,
    colorClass: "text-fleent-blue",
    accentClass: "bg-fleent-blue",
    previewTitle: "Brain dump",
    previewLines: ["invoice thing", "ask Sam about launch", "why is tax scary"],
    sections: [
      {
        title: "Messy input is welcome",
        body: "Type fragments, paste a half-formed note, or capture the thought before it evaporates. Fleent expects raw material, not polished task names.",
      },
      {
        title: "Noise gets separated from action",
        body: "Smart Capture looks for concrete work hidden inside the dump, then suggests clean task candidates without making your notes feel over-processed.",
      },
      {
        title: "Sort later without losing the thread",
        body: "Captured thoughts can wait until you have capacity. The important thing is that they are no longer taking up working memory.",
      },
    ],
    outcomes: [
      "Capture quickly without opening a full planning session.",
      "Turn vague worries into named next actions.",
      "Keep half-thoughts available without letting them crowd the dashboard.",
    ],
  },
  {
    slug: "rhythm",
    eyebrow: "Daily Rhythm",
    heading: "Plans that match your actual energy.",
    subheading:
      "Daily Rhythm pairs your calendar shape with your energy patterns, then suggests tasks that fit the moment instead of the fantasy version of the day.",
    icon: Waveform,
    colorClass: "text-fleent-green",
    accentClass: "bg-fleent-green",
    previewTitle: "Next window",
    previewLines: ["18 min gap", "low friction task", "start before 2:10"],
    sections: [
      {
        title: "Calendar-aware by default",
        body: "Fleent sees the open spaces around meetings and appointments, then avoids suggesting work that cannot realistically fit.",
      },
      {
        title: "Energy matters",
        body: "A task that is easy at 10am can feel impossible at 4pm. Rhythm helps the plan respond to that instead of pretending every hour is equal.",
      },
      {
        title: "Less rescheduling theater",
        body: "When the day changes, Fleent keeps the next useful start visible rather than asking you to rebuild a perfect plan.",
      },
    ],
    outcomes: [
      "Match task size to available time.",
      "Stop forcing deep work into tiny gaps.",
      "Recover when meetings or errands rearrange the day.",
    ],
  },
  {
    slug: "reminders",
    eyebrow: "Gentle Reminders",
    heading: "Nudges, never alarms.",
    subheading:
      "Gentle Reminders help you return to the next small start without turning your day into a pile of buzzing demands.",
    icon: BellSimple,
    colorClass: "text-fleent-blue",
    accentClass: "bg-fleent-blue",
    previewTitle: "Quiet nudge",
    previewLines: ["Still want to start?", "Try a 10-second flip", "Snooze until later"],
    sections: [
      {
        title: "Reminders with room to breathe",
        body: "Fleent nudges around your day instead of shouting over it. The goal is re-entry, not urgency.",
      },
      {
        title: "Tied to starts, not shame",
        body: "A reminder points back to the smallest available action. It does not scold you for being late or stack up a row of red badges.",
      },
      {
        title: "Easy to dismiss, easy to resume",
        body: "You can snooze or skip without breaking the whole system. The next helpful start will still be there when you return.",
      },
    ],
    outcomes: [
      "Return to work without panic.",
      "Avoid alarm fatigue from rigid reminder times.",
      "Keep momentum visible when attention drifts.",
    ],
  },
];

export function generateStaticParams() {
  return FEATURES.map((feature) => ({ feature: feature.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ feature: string }>;
}) {
  const { feature: slug } = await params;
  const feature = FEATURES.find((item) => item.slug === slug);

  if (!feature) return {};

  return {
    title: `${feature.eyebrow} | Fleent`,
    description: feature.subheading,
  };
}

export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ feature: string }>;
}) {
  const { feature: slug } = await params;
  const feature = FEATURES.find((item) => item.slug === slug);

  if (!feature) notFound();

  const Icon = feature.icon;

  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow={feature.eyebrow}
          heading={feature.heading}
          subheading={feature.subheading}
        />

        <section className="bg-fleent-background pb-14 sm:pb-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="rounded-3xl bg-white p-8 sm:p-10">
              <span
                className={`inline-flex size-14 items-center justify-center rounded-full bg-[#F3F3F3] ${feature.colorClass}`}
              >
                <Icon size={28} weight="regular" />
              </span>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-fleent-ink">
                Built for the moment before momentum.
              </h2>
              <p className="mt-4 text-fleent-body-lg tracking-wide text-fleent-mute">
                Fleent does not ask you to become a different person before you
                can begin. This feature keeps the next step visible, small, and
                kind enough to start.
              </p>
              <Link
                href="/demo"
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-fleent-orange px-6 text-sm font-semibold tracking-wide text-white transition-colors duration-200 ease-out hover:bg-fleent-orange/90"
              >
                See it in action
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>

            <FeaturePreview feature={feature} />
          </div>
        </section>

        <section className="bg-fleent-background py-12 sm:py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 md:grid-cols-3">
            {feature.sections.map((section) => (
              <article key={section.title} className="rounded-3xl bg-white p-8">
                <h2 className="text-xl font-bold tracking-tight text-fleent-ink">
                  {section.title}
                </h2>
                <p className="mt-3 text-fleent-body tracking-wide text-fleent-mute">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-fleent-background py-12 sm:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium tracking-wide text-fleent-mute">
                <ShieldCheck
                  size={14}
                  weight="fill"
                  className={feature.colorClass}
                />
                Why it helps
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-balance text-fleent-ink sm:text-4xl">
                Small enough to trust. Useful enough to repeat.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {feature.outcomes.map((outcome) => (
                <div
                  key={outcome}
                  className="flex items-start gap-3 rounded-3xl bg-white p-5"
                >
                  <CheckCircle
                    size={20}
                    weight="fill"
                    className={`mt-0.5 shrink-0 ${feature.colorClass}`}
                  />
                  <p className="text-fleent-body tracking-wide text-fleent-ink">
                    {outcome}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-fleent-background py-12 sm:py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 md:grid-cols-3">
            {[
              {
                icon: Clock,
                title: "Fits the gap",
                body: "Suggestions respect the time and energy you actually have.",
              },
              {
                icon: CalendarDots,
                title: "Works with your day",
                body: "Calendar shape and context guide what Fleent surfaces next.",
              },
              {
                icon: Lightbulb,
                title: "Keeps starts concrete",
                body: "The system always points back to a visible, physical first move.",
              },
            ].map((item) => {
              const CardIcon = item.icon;
              return (
                <article key={item.title} className="rounded-3xl bg-white p-8">
                  <CardIcon
                    size={24}
                    weight="regular"
                    className={feature.colorClass}
                  />
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

        <Cta />
      </main>
      <Footer />
    </>
  );
}

function FeaturePreview({ feature }: { feature: Feature }) {
  const PreviewIcon = feature.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-fleent-ink p-6 text-white sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-white/15"
      >
        <span className={`block h-full w-1/3 ${feature.accentClass}`} />
      </div>

      <div className="relative rounded-3xl bg-white p-5 text-fleent-ink">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
            {feature.previewTitle}
          </span>
          <span
            className={`inline-flex size-9 items-center justify-center rounded-full bg-[#F3F3F3] ${feature.colorClass}`}
          >
            <PreviewIcon size={18} weight="regular" />
          </span>
        </div>

        <ul className="mt-5 flex flex-col gap-3">
          {feature.previewLines.map((line, index) => (
            <li
              key={line}
              className="flex items-center justify-between gap-4 rounded-2xl bg-[#F3F3F3] px-4 py-3"
            >
              <span className="text-sm font-medium tracking-wide text-fleent-ink">
                {line}
              </span>
              <span
                className={`size-2 rounded-full ${
                  index === 0 ? feature.accentClass : "bg-black/15"
                }`}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-3">
        {["clear", "small", "now"].map((label) => (
          <div key={label} className="rounded-2xl bg-white/10 px-3 py-4">
            <p className="text-center text-xs font-semibold tracking-[0.12em] text-white/70 uppercase">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
