import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/dashboard");

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to Fleent"
      subtitle="Enter your details to continue."
      footer={
        <>
          New here?{" "}
          <Link
            href="/signup"
            className="font-semibold text-fleent-ink underline underline-offset-4 hover:text-fleent-orange"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
