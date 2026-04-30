"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "fleent-cookie-consent";

export function CookiePop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== "accepted");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.aside
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
          className="fixed bottom-5 left-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm rounded-3xl bg-white p-5"
        >
          <p className="text-sm font-semibold tracking-tight text-fleent-ink">
            Cookies, kept boring.
          </p>
          <p className="mt-2 text-sm tracking-wide text-fleent-mute">
            Fleent uses essential cookies for login sessions and a tiny bit of
            product analytics. No ad trackers.
          </p>
          <Button
            size="sm"
            className="mt-4 rounded-full border-transparent bg-fleent-orange text-white shadow-none hover:bg-fleent-orange/90"
            onClick={() => {
              window.localStorage.setItem(STORAGE_KEY, "accepted");
              setVisible(false);
            }}
          >
            Accept
          </Button>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
