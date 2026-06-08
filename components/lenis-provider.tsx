"use client";

import { ReactLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Routes that should use NATIVE scrolling (no smooth-scroll hijacking).
// Lenis is great for the marketing site, but on the app shell it interferes
// with `position: sticky` / `fixed` (the sidebar) and inner scroll areas.
const NATIVE_SCROLL_PREFIXES = ["/dashboard", "/onboarding", "/login", "/signup", "/register"];

export function LenisProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const useNativeScroll = NATIVE_SCROLL_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (useNativeScroll) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
      }}
    >
      {children}
    </ReactLenis>
  );
}
