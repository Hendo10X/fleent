import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

const SECTIONS = [
  {
    title: "What we collect",
    body: "Account info you give us (email, name), the tasks and dumps you create, and the calendar metadata we need to find your gaps. We never read the contents of your calendar events - only the time blocks they occupy.",
  },
  {
    title: "How we use it",
    body: "Your data powers your Fleent dashboard. The AI that ranks and flips tasks runs on your account's data only. We don't profile you, we don't run ad models, and we don't share data with marketing platforms.",
  },
  {
    title: "What we never do",
    body: "We do not sell your data. We do not use it to train shared AI models. We do not share it with third parties for advertising. Period.",
  },
  {
    title: "Where it lives",
    body: "Your data is stored in encrypted databases in the EU and US. We use industry-standard encryption in transit (TLS 1.3) and at rest (AES-256).",
  },
  {
    title: "Your rights",
    body: "You can export everything from Settings → Data. You can delete your account and all associated data with one click; deletion completes within 30 days. Under GDPR and CCPA you have the right to access, correction, deletion, portability, and to object to processing.",
  },
  {
    title: "Cookies & analytics",
    body: "We use a single first-party analytics cookie to understand product usage. We do not use third-party trackers, pixels, or session recorders. You can opt out from Settings → Privacy.",
  },
  {
    title: "Children",
    body: "Fleent is not intended for use by anyone under 16. We do not knowingly collect data from children.",
  },
  {
    title: "Changes to this policy",
    body: "We'll email you if we change anything material. The current version is dated April 2026.",
  },
  {
    title: "Contact",
    body: "Questions? privacy@fleent.app - answered by a human, usually within one working day.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="Privacy"
          heading="What we know about you, and what we don't."
          subheading="The short version: your tasks, your data, your account. We don't sell it, share it, or use it to train shared models."
        />

        <section className="bg-fleent-background pb-24 sm:pb-32">
          <div className="mx-auto max-w-3xl px-6">
            <div className="rounded-3xl bg-white p-8 sm:p-12">
              <p className="text-xs tracking-wide text-fleent-mute uppercase">
                Last updated: April 2026
              </p>
              <div className="mt-8 flex flex-col gap-10">
                {SECTIONS.map((s) => (
                  <div key={s.title}>
                    <h2 className="text-xl font-bold tracking-tight text-fleent-ink">
                      {s.title}
                    </h2>
                    <p className="mt-3 text-fleent-body-lg tracking-wide text-fleent-mute">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
