import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DockBar, UserAvatar } from "@/components/dashboard/dock-bar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

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
    // Real flex row: the sidebar is a layout column, not a floating overlay.
    <div className="flex min-h-svh bg-fleent-background">
      {/* Desktop navigation - sticky column, shown only at md+ via CSS. */}
      <DashboardSidebar user={user} />

      {/* Content column. */}
      <div className="relative flex min-h-svh w-full min-w-0 flex-col">
        {/* Small-screen avatar - taps through to Settings. Shown only below
            sm; the dock renders its own avatar from sm up, and the sidebar
            footer takes over at md. Prevents a duplicate avatar on tablet. */}
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

        {/* Extra bottom padding on mobile clears the floating dock. */}
        <div className="flex-1 pt-6 pb-32 md:pt-4 md:pb-10">{children}</div>
      </div>

      {/* Mobile navigation - the floating dock (hidden at md+). */}
      <div className="md:hidden">
        <DockBar user={user} />
      </div>
    </div>
  );
}
