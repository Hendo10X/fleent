import Link from "next/link";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

const SECTIONS = [
  {
    title: "Using Fleent",
    body: "You can use Fleent if you are at least 16 and able to agree to these terms. You are responsible for keeping your account information accurate and for protecting access to your account.",
  },
  {
    title: "Your content",
    body: "The tasks, notes, dumps, and calendar connections you add to Fleent remain yours. You give us permission to process that content only so we can provide, secure, and improve the service for your account.",
  },
  {
    title: "Subscriptions",
    body: "Paid plans renew monthly or annually, depending on the option you choose. You can cancel from account settings at any time, and access to paid features continues until the end of the current billing period.",
  },
  {
    title: "Acceptable use",
    body: "Do not misuse Fleent, interfere with the service, attempt to access someone else's account, upload malicious content, or use the product in a way that violates applicable law.",
  },
  {
    title: "AI features",
    body: "Fleent uses AI to rank task friction and suggest smaller starting actions. The suggestions are assistive and may be imperfect, so use your own judgment before acting on anything important, sensitive, legal, medical, or financial.",
  },
  {
    title: "Availability",
    body: "We work hard to keep Fleent reliable, but we cannot promise uninterrupted availability. Planned maintenance and incidents are posted on the status page when they affect normal use.",
  },
  {
    title: "Changes",
    body: "We may update these terms as Fleent changes. If a change materially affects your rights or obligations, we will notify you by email or in-product notice before it takes effect.",
  },
  {
    title: "Contact",
    body: "Questions about these terms can be sent to legal@fleent.app. We try to answer plain-language questions plainly.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="Terms"
          heading="The agreement, in human language."
          subheading="These terms explain how Fleent works, what you can expect from us, and what we ask from you while using the product."
        />

        <section className="bg-fleent-background pb-24 sm:pb-32">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 lg:grid-cols-[18rem_1fr]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl bg-white p-6">
                <p className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
                  Last updated
                </p>
                <p className="mt-2 text-lg font-bold tracking-tight text-fleent-ink">
                  April 2026
                </p>
                <p className="mt-4 text-sm tracking-wide text-fleent-mute">
                  Privacy questions live on the{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-fleent-ink underline underline-offset-4 hover:text-fleent-orange"
                  >
                    privacy page
                  </Link>
                  . Service health lives on{" "}
                  <Link
                    href="/status"
                    className="font-semibold text-fleent-ink underline underline-offset-4 hover:text-fleent-orange"
                  >
                    status
                  </Link>
                  .
                </p>
              </div>
            </aside>

            <div className="rounded-3xl bg-white p-8 sm:p-12">
              <div className="flex flex-col gap-10">
                {SECTIONS.map((section, index) => (
                  <section key={section.title}>
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-semibold tracking-[0.12em] text-fleent-orange uppercase">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 className="text-xl font-bold tracking-tight text-fleent-ink">
                        {section.title}
                      </h2>
                    </div>
                    <p className="mt-3 text-fleent-body-lg tracking-wide text-fleent-mute">
                      {section.body}
                    </p>
                  </section>
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
