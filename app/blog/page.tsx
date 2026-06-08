import Link from "next/link";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { PageHero } from "@/components/page-hero";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
};

const POSTS: Post[] = [
  {
    slug: "the-wall-of-awful",
    title: "The Wall of Awful: why \"just start\" is the worst advice for ADHD brains",
    excerpt:
      "If \"just start\" worked, you'd already be done. Here's what's actually happening in your brain when a tiny task feels impossible - and the one thing that gets you over the wall.",
    date: "Mar 12, 2026",
    readTime: "6 min",
    category: "Focus",
  },
  {
    slug: "10-second-actions",
    title: "Why every Fleent task ends in a physical 10-second action",
    excerpt:
      "Mental tasks blur into worry. Physical ones don't. We dig into the friction-mapping research that shaped Fleent's core mechanic.",
    date: "Mar 04, 2026",
    readTime: "5 min",
    category: "Product",
  },
  {
    slug: "calendar-gap-detection",
    title: "How calendar gap detection actually works (and what it doesn't read)",
    excerpt:
      "Privacy-first scheduling means we look at the shape of your day, never the contents. A peek at how Fleent finds the white space.",
    date: "Feb 24, 2026",
    readTime: "4 min",
    category: "Engineering",
  },
  {
    slug: "no-streak-shame",
    title: "We track \"days you started\" - not days you finished. Here's why.",
    excerpt:
      "Most apps shame you back into the loop. We celebrate the smallest brave thing: showing up. The streak philosophy behind Fleent.",
    date: "Feb 11, 2026",
    readTime: "3 min",
    category: "Philosophy",
  },
  {
    slug: "ai-without-the-hype",
    title: "The AI in Fleent doesn't write your tasks - it shrinks them",
    excerpt:
      "We had a chance to bolt on a chatbot. We didn't. Here's our quiet stance on AI inside the product, and what it actually does.",
    date: "Jan 30, 2026",
    readTime: "4 min",
    category: "Product",
  },
  {
    slug: "fleent-changelog-january",
    title: "What we shipped in January: voice dump, three new flips, calendar v2",
    excerpt:
      "A short walk through the past month of releases - and the small thing we got right that took twelve attempts.",
    date: "Jan 15, 2026",
    readTime: "3 min",
    category: "Changelog",
  },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <PageHero
          eyebrow="Blog"
          heading="Notes from a slower kind of productivity."
          subheading="Essays, research, and occasional changelog posts from the team building Fleent."
        />

        <section className="bg-fleent-background pb-24 sm:pb-32">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-3xl bg-white p-8 transition-colors duration-200 ease-out hover:bg-white/80"
              >
                <span className="text-xs font-semibold tracking-[0.12em] text-fleent-orange uppercase">
                  {post.category}
                </span>
                <h2 className="mt-3 text-xl font-bold tracking-tight text-fleent-ink group-hover:text-fleent-ink/80">
                  {post.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-fleent-body tracking-wide text-fleent-mute">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-3 pt-6 text-xs tracking-wide text-fleent-mute">
                  <span>{post.date}</span>
                  <span aria-hidden>·</span>
                  <span>{post.readTime} read</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
