"use client";

import { motion } from "motion/react";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import data from "./data.json";

type FaqItem = { id: string; question: string; answer: string };

const FAQ: { heading: string; subheading: string; items: FaqItem[] } =
  data as never;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const headerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const headerItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const listItem = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

export function Faq() {
  return (
    <section className="bg-fleent-background py-24 sm:py-32">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={headerContainer}
        className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
      >
        <motion.h2
          variants={headerItem}
          className="text-4xl font-bold tracking-tight text-balance text-fleent-ink sm:text-5xl"
        >
          {FAQ.heading}
        </motion.h2>
        <motion.p
          variants={headerItem}
          className="mt-5 max-w-xl text-fleent-body tracking-wide text-balance text-fleent-mute"
        >
          {FAQ.subheading}
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={listContainer}
        className="mx-auto mt-12 max-w-2xl px-6"
      >
        <Accordion className="flex flex-col">
          {FAQ.items.map((item) => (
            <motion.div key={item.id} variants={listItem}>
              <AccordionItem
                value={item.id}
                className="border-b border-black/8"
              >
                <AccordionTrigger className="py-5 text-fleent-body font-medium tracking-wide text-fleent-ink hover:text-fleent-ink/80">
                  {item.question}
                </AccordionTrigger>
                <AccordionPanel className="text-fleent-body tracking-wide text-fleent-mute">
                  {item.answer}
                </AccordionPanel>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
