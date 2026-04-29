import { CheckCircle } from "@phosphor-icons/react/ssr";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

const SYSTEMS = [
  { name: "Web app", status: "operational" as const },
  { name: "iOS app", status: "operational" as const },
  { name: "Android app", status: "operational" as const },
  { name: "API", status: "operational" as const },
  { name: "Calendar sync", status: "operational" as const },
  { name: "AI flips", status: "operational" as const },
  { name: "Authentication", status: "operational" as const },
];

const HISTORY = [
  {
    date: "March 2026",
    incidents: [],
  },
  {
    date: "February 2026",
    incidents: [
      {
        title: "Slow flip generation",
        date: "Feb 14, 14:22 – 14:48 UTC",
        body: "AI worker queue was backed up after a model deploy. Fully resolved by rolling forward to the new worker pool.",
      },
    ],
  },
];

export default function StatusPage() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="Status"
          heading="All systems operational."
          subheading="Live status of every Fleent service. Updated every 60 seconds."
        />

        <section className="bg-fleent-background pb-12 sm:pb-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className="flex items-center justify-between gap-4 rounded-3xl bg-fleent-green/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fleent-green opacity-50" />
                  <span className="relative inline-flex size-3 rounded-full bg-fleent-green" />
                </span>
                <span className="text-base font-semibold tracking-tight text-fleent-ink">
                  All systems operational
                </span>
              </div>
              <span className="text-xs tracking-wide text-fleent-mute">
                Updated just now
              </span>
            </div>

            <ul className="mt-6 flex flex-col overflow-hidden rounded-3xl bg-white">
              {SYSTEMS.map((s, i) => (
                <li
                  key={s.name}
                  className={`flex items-center justify-between gap-4 px-6 py-4 ${
                    i > 0 ? "border-t border-black/5" : ""
                  }`}
                >
                  <span className="text-fleent-body tracking-wide text-fleent-ink">
                    {s.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium tracking-wide text-fleent-green">
                    <CheckCircle size={16} weight="fill" />
                    Operational
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-fleent-background pb-24 sm:pb-32">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-2xl font-bold tracking-tight text-fleent-ink sm:text-3xl">
              Incident history
            </h2>

            <div className="mt-6 flex flex-col gap-6">
              {HISTORY.map((month) => (
                <div key={month.date} className="rounded-3xl bg-white p-6 sm:p-8">
                  <h3 className="text-sm font-semibold tracking-[0.12em] text-fleent-mute uppercase">
                    {month.date}
                  </h3>
                  {month.incidents.length === 0 ? (
                    <p className="mt-3 text-fleent-body tracking-wide text-fleent-mute">
                      No incidents reported.
                    </p>
                  ) : (
                    <ul className="mt-4 flex flex-col gap-4">
                      {month.incidents.map((inc) => (
                        <li
                          key={inc.title}
                          className="rounded-2xl bg-[#F3F3F3] p-5"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="text-base font-semibold tracking-tight text-fleent-ink">
                              {inc.title}
                            </span>
                            <span className="text-xs tracking-wide text-fleent-mute">
                              {inc.date}
                            </span>
                          </div>
                          <p className="mt-2 text-sm tracking-wide text-fleent-mute">
                            {inc.body}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
