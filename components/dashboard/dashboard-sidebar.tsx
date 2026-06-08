"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBar,
  Gear,
  House,
  type Icon,
  Notepad,
  Sparkle,
  Timer,
} from "@phosphor-icons/react";
import { UserAvatar } from "@/components/dashboard/dock-bar";

type NavItem = { label: string; href: string; icon: Icon };

const NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: House },
  { label: "Timer", href: "/dashboard/timer", icon: Timer },
  { label: "AI", href: "/dashboard/ai", icon: Sparkle },
  { label: "Notes", href: "/dashboard/notes", icon: Notepad },
  { label: "Stats", href: "/dashboard/stats", icon: ChartBar },
];

type Props = {
  user: { name: string; image: string | null };
};

/**
 * Desktop sidebar. Deliberately plain: a real flex column (NOT position:
 * fixed) that's `sticky` to the viewport and shown only at `md+` via CSS
 * (`hidden md:flex`). No context, no media-query JS, no portalled sheet, and
 * no fixed positioning — so it can't be knocked out of view by transformed
 * ancestors / smooth-scroll, and can never desync across navigation. Mobile
 * uses the floating dock instead (see DashboardLayout).
 */
export function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);
  }

  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col self-start border-r border-black/5 bg-white px-3 py-4 md:flex">
      <div className="flex items-center px-2 pb-4">
        <Image
          src="/images/fleent.svg"
          alt="Fleent"
          width={72}
          height={22}
          priority
        />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium tracking-tight transition-colors duration-200 ease-out ${
                active
                  ? "bg-fleent-orange/10 text-fleent-orange"
                  : "text-fleent-ink hover:bg-[#F3F3F3]"
              }`}
            >
              <ItemIcon size={18} weight={active ? "fill" : "regular"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-2 flex flex-col gap-1 border-t border-black/5 pt-3">
        <Link
          href="/dashboard/settings"
          aria-current={
            pathname.startsWith("/dashboard/settings") ? "page" : undefined
          }
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium tracking-tight transition-colors duration-200 ease-out ${
            pathname.startsWith("/dashboard/settings")
              ? "bg-fleent-orange/10 text-fleent-orange"
              : "text-fleent-ink hover:bg-[#F3F3F3]"
          }`}
        >
          <Gear size={18} weight="regular" />
          Settings
        </Link>

        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <UserAvatar
            user={user}
            className="size-8 shrink-0 overflow-hidden rounded-full bg-[#F3F3F3]"
          />
          <span className="min-w-0 truncate text-sm font-medium tracking-tight text-fleent-ink">
            {user.name}
          </span>
        </div>
      </div>
    </aside>
  );
}
