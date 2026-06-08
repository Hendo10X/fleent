import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DockBar, UserAvatar } from "@/components/dashboard/dock-bar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = {
    name: session.user.name,
    image: session.user.image ?? null,
  };

  return (
    <SidebarProvider>
      {/* Desktop navigation - the shadcn sidebar (hidden < md). */}
      <DashboardSidebar user={user} />

      {/* Content column. A plain div (not SidebarInset) so each page keeps
          its own semantic <main> without nesting two <main> elements. */}
      <div className="relative flex min-h-svh w-full flex-1 flex-col bg-fleent-background">
        {/* Small-screen avatar - taps through to Settings. Shown only below
            sm; from sm–md the dock renders its own avatar, and ≥ md the
            sidebar footer takes over. Prevents a duplicate avatar on tablet. */}
        <Link
          href="/dashboard/settings"
          aria-label="Open settings"
          className="fixed right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-30 sm:hidden"
        >
          <UserAvatar
            user={user}
            className="size-9 shrink-0 overflow-hidden rounded-full bg-[#F3F3F3] ring-1 ring-black/5"
          />
        </Link>

        {/* Desktop top bar - sidebar collapse toggle. Hidden on mobile. */}
        <header className="sticky top-0 z-20 hidden h-12 items-center gap-2 px-4 md:flex">
          <SidebarTrigger className="text-fleent-mute hover:text-fleent-ink" />
        </header>

        {/* Extra bottom padding on mobile clears the floating dock. */}
        <div className="flex-1 pb-32 md:pb-10">{children}</div>
      </div>

      {/* Mobile navigation - the floating dock (hidden ≥ md). */}
      <div className="md:hidden">
        <DockBar user={user} />
      </div>
    </SidebarProvider>
  );
}
