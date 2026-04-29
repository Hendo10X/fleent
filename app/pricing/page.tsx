import Link from "next/link";
import { Check } from "@phosphor-icons/react/ssr";
import { Cta } from "@/components/sections/cta";
import { Faq } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

type Tier = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "The 3-task flow. Enough to find your momentum.",
    features: [
      "3-task focus dashboard",
      "Manual brain dump",
      "Basic flips on any task",
      "1 calendar connected",
      "7-day streak history",
    ],
    cta: { label: "Start free", href: "/signup" },
  },
  {
    name: "Pro",
    price: "$6",
    cadence: "per month",
    description: "Everything you need to keep moving without thinking about it.",
    features: [
      "Everything in Free",
      "AI friction-mapping & ranking",
      "Voice brain-dump",
      "Calendar gap detection",
      "Unlimited flips & history",
      "Gentle morning + afternoon nudges",
    ],
    cta: { label: "Try Pro free", href: "/signup?plan=pro" },
    highlighted: true,
  },
  {
    name: "Team",
    price: "$12",
    cadence: "per user / month",
    description: "Shared rhythm for small teams that need to ship together.",
    features: [
      "Everything in Pro",
      "Shared task surfaces",
      "Role-based focus blocks",
      "SSO + admin controls",
      "Priority support",
    ],
    cta: { label: "Start a team trial", href: "/signup?plan=team" },
  },
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

        <section className="bg-fleent-background py-12 sm:py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
            {TIERS.map((tier) => (
              <article
                key={tier.name}
                className={`flex flex-col rounded-3xl p-8 sm:p-10 ${
                  tier.highlighted
                    ? "bg-fleent-orange text-white"
                    : "bg-white text-fleent-ink"
                }`}
              >
                <div
                  className={`text-sm font-semibold tracking-wide uppercase ${
                    tier.highlighted ? "text-white/80" : "text-fleent-mute"
                  }`}
                >
                  {tier.name}
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">
                    {tier.price}
                  </span>
                  <span
                    className={
                      tier.highlighted
                        ? "text-sm tracking-wide text-white/80"
                        : "text-sm tracking-wide text-fleent-mute"
                    }
                  >
                    {tier.cadence}
                  </span>
                </div>

                <p
                  className={`mt-3 text-fleent-body tracking-wide ${
                    tier.highlighted ? "text-white/90" : "text-fleent-mute"
                  }`}
                >
                  {tier.description}
                </p>

                <ul className="mt-8 flex flex-col gap-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full ${
                          tier.highlighted
                            ? "bg-white text-fleent-orange"
                            : "bg-fleent-orange/10 text-fleent-orange"
                        }`}
                      >
                        <Check size={12} weight="bold" />
                      </span>
                      <span
                        className={`text-fleent-body tracking-wide ${
                          tier.highlighted ? "text-white" : "text-fleent-ink"
                        }`}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.cta.href}
                  className={`mt-10 inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-wide transition-colors duration-200 ease-out ${
                    tier.highlighted
                      ? "bg-white text-fleent-orange hover:bg-slate-100"
                      : "bg-black text-white hover:bg-slate-700"
                  }`}
                >
                  {tier.cta.label}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
