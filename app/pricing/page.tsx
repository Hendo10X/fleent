import Link from "next/link";
import {
  ArrowRight,
  Check,
  Circle,
  Minus,
  Sparkle,
} from "@phosphor-icons/react/ssr";
import { Cta } from "@/components/sections/cta";
import { Faq } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

type Tier = {
  id: "free" | "pro" | "team";
  name: string;
  price: string;
  cadence: string;
  note: string;
  description: string;
  cta: { label: string; href: string };
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    note: "Start here",
    description: "The 3-task flow. Enough to find your momentum.",
    cta: { label: "Start free", href: "/signup" },
  },
  {
    id: "pro",
    name: "Pro",
    price: "$6",
    cadence: "per month",
    note: "Most momentum",
    description: "Everything you need to keep moving without thinking about it.",
    cta: { label: "Try Pro free", href: "/signup?plan=pro" },
    highlighted: true,
  },
  {
    id: "team",
    name: "Team",
    price: "$12",
    cadence: "per user / month",
    note: "Shared rhythm",
    description: "Shared rhythm for small teams that need to ship together.",
    cta: { label: "Start a team trial", href: "/signup?plan=team" },
  },
];

type ModuleRow = {
  module: string;
  detail: string;
  free: string;
  pro: string;
  team: string;
};

const MODULES: ModuleRow[] = [
  {
    module: "Focus Mode",
    detail: "The active dashboard that keeps the day small.",
    free: "3 visible tasks",
    pro: "3 tasks with AI friction ranking",
    team: "Shared focus lanes by role",
  },
  {
    module: "Smart Capture",
    detail: "A landing zone for messy thoughts and unfinished ideas.",
    free: "Manual brain dump",
    pro: "Voice and text capture",
    team: "Team inboxes and assignments",
  },
  {
    module: "Task Flips",
    detail: "Turn a daunting task into a physical first move.",
    free: "Basic flips",
    pro: "Unlimited flips and history",
    team: "Shared flip templates",
  },
  {
    module: "Daily Rhythm",
    detail: "Calendar-aware suggestions that fit the day you actually have.",
    free: "1 connected calendar",
    pro: "Calendar gap detection",
    team: "Capacity view across the team",
  },
  {
    module: "Gentle Reminders",
    detail: "Nudges that bring you back without alarm fatigue.",
    free: "Starting streak history",
    pro: "Morning and afternoon nudges",
    team: "Team-safe reminder windows",
  },
  {
    module: "Admin & Support",
    detail: "Controls for billing, access, and reliability.",
    free: "Community support",
    pro: "Priority email support",
    team: "SSO, admin controls, priority support",
  },
];

const SIGNALS = [
  { label: "No forced trial countdown", value: "Free stays free" },
  { label: "Best fit for solo users", value: "Pro" },
  { label: "Best fit for squads", value: "Team" },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="Pricing"
          heading="Start free. Upgrade when momentum needs more room."
          subheading="No seats hidden behind sales calls. No 14-day countdown. Pick a plan when Fleent earns its keep."
        />

        <section className="bg-fleent-background pb-12 sm:pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {TIERS.map((tier) => (
                <PlanHeader key={tier.id} tier={tier} />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SIGNALS.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-3xl bg-white px-5 py-4"
                >
                  <p className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
                    {signal.label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-fleent-ink">
                    {signal.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-fleent-background py-10 sm:py-14">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium tracking-wide text-fleent-mute">
                  <Sparkle
                    size={14}
                    weight="fill"
                    className="text-fleent-orange"
                  />
                  Module map
                </span>
                <h2 className="mt-4 max-w-2xl text-3xl font-bold text-balance text-fleent-ink sm:text-4xl">
                  Compare by the parts of Fleent you will actually use.
                </h2>
              </div>
              <p className="max-w-sm text-fleent-body tracking-wide text-fleent-mute">
                Every row is a module. Every column shows how much power that
                module gets at each plan.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-205 border-collapse">
                  <caption className="sr-only">
                    Feature module comparison across Free, Pro, and Team plans
                  </caption>
                  <thead>
                    <tr className="border-b border-black/8">
                      <th
                        scope="col"
                        className="w-[32%] px-6 py-5 text-left text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase"
                      >
                        Module
                      </th>
                      {TIERS.map((tier) => (
                        <th
                          key={tier.id}
                          scope="col"
                          className={`px-5 py-5 text-left text-xs font-semibold tracking-[0.12em] uppercase ${
                            tier.highlighted
                              ? "text-fleent-orange"
                              : "text-fleent-mute"
                          }`}
                        >
                          {tier.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((row) => (
                      <tr
                        key={row.module}
                        className="border-b border-black/6 last:border-b-0"
                      >
                        <th scope="row" className="px-6 py-5 text-left">
                          <span className="block text-base font-bold text-fleent-ink">
                            {row.module}
                          </span>
                          <span className="mt-1 block max-w-xs text-sm tracking-wide text-fleent-mute">
                            {row.detail}
                          </span>
                        </th>
                        {TIERS.map((tier) => (
                          <td key={tier.id} className="px-5 py-5 align-top">
                            <FeatureCell
                              value={row[tier.id]}
                              highlighted={tier.highlighted}
                              muted={tier.id === "free" && row.module === "Admin & Support"}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-fleent-background py-12 sm:py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="rounded-3xl bg-fleent-ink p-8 text-white sm:p-10">
              <p className="text-xs font-semibold tracking-[0.12em] text-white/60 uppercase">
                How to choose
              </p>
              <h2 className="mt-4 text-3xl font-bold text-balance sm:text-4xl">
                Pick the plan by the moment you are trying to protect.
              </h2>
              <p className="mt-4 text-fleent-body-lg tracking-wide text-white/70">
                Free protects the first start. Pro protects the daily rhythm.
                Team protects the shared handoff between people.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  title: "Choose Free",
                  body: "You want a calmer dashboard and a simple way to break the first task open.",
                },
                {
                  title: "Choose Pro",
                  body: "You want Fleent to rank, flip, nudge, and fit work into the gaps of your day.",
                },
                {
                  title: "Choose Team",
                  body: "You need shared focus surfaces, admin controls, and a rhythm across multiple people.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl bg-white p-6">
                  <h3 className="text-xl font-bold text-fleent-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-fleent-body tracking-wide text-fleent-mute">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

function PlanHeader({ tier }: { tier: Tier }) {
  return (
    <article
      className={`flex min-h-full flex-col rounded-3xl p-7 ${
        tier.highlighted
          ? "bg-fleent-orange text-white"
          : "bg-white text-fleent-ink"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-semibold tracking-[0.12em] uppercase ${
              tier.highlighted ? "text-white/75" : "text-fleent-mute"
            }`}
          >
            {tier.note}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{tier.name}</h2>
        </div>
        {tier.highlighted ? (
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-fleent-orange">
            Best fit
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-5xl font-bold">{tier.price}</span>
        <span
          className={`text-sm tracking-wide ${
            tier.highlighted ? "text-white/75" : "text-fleent-mute"
          }`}
        >
          {tier.cadence}
        </span>
      </div>

      <p
        className={`mt-4 text-fleent-body tracking-wide ${
          tier.highlighted ? "text-white/85" : "text-fleent-mute"
        }`}
      >
        {tier.description}
      </p>

      <Link
        href={tier.cta.href}
        className={`mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold tracking-wide transition-colors duration-200 ease-out ${
          tier.highlighted
            ? "bg-white text-fleent-orange hover:bg-[#F3F3F3]"
            : "bg-black text-white hover:bg-slate-700"
        }`}
      >
        {tier.cta.label}
        <ArrowRight size={15} weight="bold" />
      </Link>
    </article>
  );
}

function FeatureCell({
  value,
  highlighted,
  muted,
}: {
  value: string;
  highlighted?: boolean;
  muted?: boolean;
}) {
  if (muted) {
    return (
      <span className="inline-flex items-start gap-2 text-sm tracking-wide text-fleent-mute">
        <Minus size={17} weight="bold" className="mt-0.5 shrink-0" />
        {value}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-start gap-2 text-sm tracking-wide ${
        highlighted ? "font-semibold text-fleent-ink" : "text-fleent-ink"
      }`}
    >
      {highlighted ? (
        <Check
          size={17}
          weight="bold"
          className="mt-0.5 shrink-0 text-fleent-orange"
        />
      ) : (
        <Circle
          size={10}
          weight="fill"
          className="mt-1.5 shrink-0 text-black/20"
        />
      )}
      {value}
    </span>
  );
}
