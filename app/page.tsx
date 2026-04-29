import { Cta } from "@/components/sections/cta";
import { Faq } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { How } from "@/components/sections/how";
import { Navbar } from "@/components/sections/navbar";
import { Pillars } from "@/components/sections/pillars";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="bg-fleent-background">
        <Hero />
        <Pillars />
        <Features />
        <How />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
