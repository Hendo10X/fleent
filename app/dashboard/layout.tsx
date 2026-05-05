import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DockBar } from "@/components/dashboard/dock-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="relative min-h-screen overflow-hidden bg-fleent-background pb-32">
      {children}
      <DockBar
        user={{
          name: session.user.name,
          image: session.user.image ?? null,
        }}
      />
    </div>
  );
}
