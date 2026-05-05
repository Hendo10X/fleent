import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DockBar, UserAvatar } from "@/components/dashboard/dock-bar";

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
    <div className="relative min-h-screen overflow-hidden bg-fleent-background pb-32">
      <div className="fixed right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-30 sm:hidden">
        <UserAvatar
          user={user}
          className="size-9 shrink-0 overflow-hidden rounded-full bg-[#F3F3F3] ring-1 ring-black/5"
        />
      </div>
      {children}
      <DockBar user={user} />
    </div>
  );
}
