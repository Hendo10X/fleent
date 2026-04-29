import Link from "next/link";
import {
  Compass,
  CreditCard,
  Gear,
  Lightning,
  Lock,
  ShieldCheck,
} from "@phosphor-icons/react/ssr";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

type Category = {
  icon: typeof Compass;
  title: string;
  description: string;
  href: string;
};

const CATEGORIES: Category[] = [
  {
    icon: Compass,
    title: "Getting started",
    description: "Set up Fleent in 60 seconds.",
    href: "/help/getting-started",
  },
  {
    icon: Lightning,
    title: "The 3-task flow",
    description: "How focus, capture, and flips work together.",
    href: "/help/three-task-flow",
  },
  {
    icon: Gear,
    title: "Account & settings",
    description: "Profile, integrations, notifications.",
    href: "/help/account",
  },
  {
    icon: CreditCard,
    title: "Billing",
    description: "Plans, invoices, refunds.",
    href: "/help/billing",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & data",
    description: "What we store, what we don't.",
    href: "/help/privacy",
  },
  {
    icon: Lock,
    title: "Security",
    description: "How we keep your account safe.",
    href: "/help/security",
  },
];

const POPULAR = [
  { title: "How do I connect Google Calendar?", href: "/help/calendar-google" },
  { title: "Can I edit a flip after it's generated?", href: "/help/edit-flips" },
  { title: "How do streaks work, exactly?", href: "/help/streaks" },
  { title: "Cancel or pause my Pro subscription", href: "/help/pause" },
  { title: "Export all my data", href: "/help/export" },
];

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="Help center"
          heading="What can we help you with?"
          subheading="Quick answers, setup guides, and the things people ask us most."
        />

        <section className="bg-fleent-background pb-12 sm:pb-16">
          <div className="mx-auto max-w-2xl px-6">
            <input
              type="search"
              placeholder="Search help articles…"
              aria-label="Search help articles"
              className="h-14 w-full rounded-full bg-white px-6 text-fleent-body tracking-wide text-fleent-ink outline-none placeholder:text-fleent-mute focus-visible:ring-4 focus-visible:ring-fleent-orange/20"
            />
          </div>
        </section>

        <section className="bg-fleent-background py-8">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group flex flex-col gap-3 rounded-3xl bg-white p-6 transition-colors duration-200 ease-out hover:bg-[#F3F3F3]"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-[#F2F2F2] text-fleent-orange">
                    <Icon size={20} weight="regular" />
                  </span>
                  <h3 className="text-base font-bold tracking-tight text-fleent-ink">
                    {cat.title}
                  </h3>
                  <p className="text-sm tracking-wide text-fleent-mute">
                    {cat.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="bg-fleent-background py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-2xl font-bold tracking-tight text-fleent-ink sm:text-3xl">
              Popular articles
            </h2>
            <ul className="mt-6 flex flex-col overflow-hidden rounded-3xl bg-white">
              {POPULAR.map((p, i) => (
                <li
                  key={p.title}
                  className={i > 0 ? "border-t border-black/5" : ""}
                >
                  <Link
                    href={p.href}
                    className="block px-6 py-4 text-fleent-body tracking-wide text-fleent-ink transition-colors duration-200 ease-out hover:bg-[#F3F3F3]"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
