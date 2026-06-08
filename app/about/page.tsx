import { Cta } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { Pillars } from "@/components/sections/pillars";
import { PageHero } from "@/components/page-hero";

const STORY = [
  {
    title: "We were the ones staring at the wall.",
    body: "Fleent didn't start as a productivity app. It started as a workaround - a personal hack to bypass the dread that hit every time we opened a long to-do list. Three tasks. One screen. Just enough room to start.",
  },
  {
    title: "Then we noticed everyone else was, too.",
    body: "We kept showing it to friends with ADHD, executive-function fatigue, or just brains that don't fit standard productivity advice. Every demo ended the same way: \"Wait, can I have this?\" So we built it for them.",
  },
  {
    title: "Built for brains that dance differently.",
    body: "We're not chasing CEOs or hustle culture. We're chasing the moment after a 90-minute scroll spiral when you finally open the document and write one sentence. That's the win we measure.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="About"
          heading="Built for brains that dance differently."
          subheading="Fleent is a small team building the productivity tool we wished existed when starting felt impossible."
        />

        <section className="bg-fleent-background pb-12 sm:pb-16">
          <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6">
            {STORY.map((chunk) => (
              <div key={chunk.title} className="rounded-3xl bg-white p-8 sm:p-10">
                <h2 className="text-2xl font-bold tracking-tight text-fleent-ink">
                  {chunk.title}
                </h2>
                <p className="mt-3 text-fleent-body-lg tracking-wide text-fleent-mute">
                  {chunk.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Pillars />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
