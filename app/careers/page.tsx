import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Cta } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

type Role = {
  title: string;
  team: string;
  location: string;
  type: string;
  href: string;
};

const ROLES: Role[] = [
  {
    title: "Senior Product Engineer",
    team: "Engineering",
    location: "Remote (EU/US)",
    type: "Full-time",
    href: "mailto:careers@fleent.app?subject=Senior%20Product%20Engineer",
  },
  {
    title: "Design Engineer",
    team: "Design",
    location: "Remote (EU/US)",
    type: "Full-time",
    href: "mailto:careers@fleent.app?subject=Design%20Engineer",
  },
  {
    title: "Founding ML Engineer",
    team: "AI",
    location: "Remote",
    type: "Full-time",
    href: "mailto:careers@fleent.app?subject=Founding%20ML%20Engineer",
  },
  {
    title: "Customer Researcher (ADHD focus)",
    team: "Research",
    location: "Remote",
    type: "Part-time",
    href: "mailto:careers@fleent.app?subject=Customer%20Researcher",
  },
];

const VALUES = [
  {
    title: "Slow is a feature.",
    body: "We don't ship the fastest version. We ship the version that earns trust on the third use.",
  },
  {
    title: "Default to less.",
    body: "Every new option is a tax on someone with twelve open tabs. We add things only when removing them costs more.",
  },
  {
    title: "Build for your ten-tab self.",
    body: "If a feature only works when you're focused, it's broken. We design for the version of you who can't focus right now.",
  },
];

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="Careers"
          heading="Help us build the productivity tool we wished existed."
          subheading="Small team, async-first, distributed across four time zones. We hire people who care about the moment a user finally hits 'Flip'."
        />

        <section className="bg-fleent-background py-12 sm:py-16">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-3xl bg-white p-8">
                <h3 className="text-lg font-bold tracking-tight text-fleent-ink">
                  {v.title}
                </h3>
                <p className="mt-3 text-fleent-body tracking-wide text-fleent-mute">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-fleent-background py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-3xl font-bold tracking-tight text-fleent-ink">
              Open roles
            </h2>
            <p className="mt-3 text-fleent-body-lg tracking-wide text-fleent-mute">
              Don&apos;t see your role? Send a note to{" "}
              <Link
                href="mailto:careers@fleent.app"
                className="text-fleent-ink underline underline-offset-4 hover:text-fleent-orange"
              >
                careers@fleent.app
              </Link>{" "}
              - we read every one.
            </p>

            <ul className="mt-8 flex flex-col overflow-hidden rounded-3xl bg-white">
              {ROLES.map((role, i) => (
                <li
                  key={role.title}
                  className={i > 0 ? "border-t border-black/5" : ""}
                >
                  <Link
                    href={role.href}
                    className="group flex items-center justify-between gap-4 p-6 transition-colors duration-200 ease-out hover:bg-[#F3F3F3]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-semibold tracking-tight text-fleent-ink">
                        {role.title}
                      </span>
                      <span className="text-sm tracking-wide text-fleent-mute">
                        {role.team} · {role.location} · {role.type}
                      </span>
                    </div>
                    <ArrowUpRight
                      size={20}
                      weight="bold"
                      className="shrink-0 text-fleent-mute transition-colors duration-200 ease-out group-hover:text-fleent-orange"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}
