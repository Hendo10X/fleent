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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
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

export function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Image
            src="/images/fleent.svg"
            alt="Fleent"
            width={64}
            height={20}
            priority
            className="group-data-[collapsible=icon]:hidden"
          />
          <span className="hidden size-7 items-center justify-center rounded-lg bg-fleent-orange text-sm font-bold text-white group-data-[collapsible=icon]:flex">
            F
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                const ItemIcon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <ItemIcon
                        size={18}
                        weight={active ? "fill" : "regular"}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith("/dashboard/settings")}
              tooltip="Settings"
              render={<Link href="/dashboard/settings" />}
            >
              <Gear size={18} weight="regular" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={user.name}
              render={<Link href="/dashboard/settings" />}
            >
              <UserAvatar
                user={user}
                className="size-7 shrink-0 overflow-hidden rounded-full bg-[#F3F3F3]"
              />
              <span className="truncate font-medium">{user.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
