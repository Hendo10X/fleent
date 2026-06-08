import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

type ChangeKind = "new" | "improved" | "fixed";

type Release = {
  version: string;
  date: string;
  title: string;
  changes: { kind: ChangeKind; text: string }[];
};

const KIND_STYLE: Record<ChangeKind, string> = {
  new: "bg-fleent-green/15 text-fleent-green",
  improved: "bg-fleent-blue/15 text-fleent-blue",
  fixed: "bg-fleent-orange/15 text-fleent-orange",
};

const KIND_LABEL: Record<ChangeKind, string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
};

const RELEASES: Release[] = [
  {
    version: "v1.4.0",
    date: "March 18, 2026",
    title: "Voice brain-dump and smarter calendar gaps",
    changes: [
      { kind: "new", text: "Voice brain-dump on iOS and Android - speak your chaos, Fleent ranks it." },
      { kind: "new", text: "Calendar gap detection now ignores all-day events automatically." },
      { kind: "improved", text: "Three new flip styles for creative tasks." },
      { kind: "fixed", text: "Streak counter no longer rolls back when re-syncing across devices." },
    ],
  },
  {
    version: "v1.3.0",
    date: "February 27, 2026",
    title: "Outlook calendar and friction sort v2",
    changes: [
      { kind: "new", text: "Outlook calendar integration." },
      { kind: "improved", text: "Friction sort weights tasks against your time-of-day energy patterns." },
      { kind: "fixed", text: "Dragging a task between cards no longer flickers." },
    ],
  },
  {
    version: "v1.2.0",
    date: "January 30, 2026",
    title: "Gentle reminders, redesigned",
    changes: [
      { kind: "new", text: "Reminders now pick a quiet moment instead of a hard time." },
      { kind: "improved", text: "Faster cold start on the web app." },
      { kind: "fixed", text: "Dark mode contrast on the streaks panel." },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="Changelog"
          heading="What we shipped lately."
          subheading="Small, regular releases. Subscribe via RSS or follow us on X for new-version notes."
        />

        <section className="bg-fleent-background pb-24 sm:pb-32">
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6">
            {RELEASES.map((release) => (
              <article
                key={release.version}
                className="rounded-3xl bg-white p-8 sm:p-10"
              >
                <header className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-fleent-ink">
                    {release.version}
                  </h2>
                  <span className="text-sm tracking-wide text-fleent-mute">
                    {release.date}
                  </span>
                </header>
                <p className="mt-2 text-fleent-body-lg tracking-wide text-fleent-ink">
                  {release.title}
                </p>

                <ul className="mt-6 flex flex-col gap-3">
                  {release.changes.map((c, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${KIND_STYLE[c.kind]}`}
                      >
                        {KIND_LABEL[c.kind]}
                      </span>
                      <span className="text-fleent-body tracking-wide text-fleent-ink">
                        {c.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
