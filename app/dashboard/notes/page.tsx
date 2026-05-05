import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NotesApp } from "@/components/dashboard/notes-app";

export default async function NotesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <NotesApp storageKey={`fleent:dashboard:notes:${session.user.id}`} />
  );
}
