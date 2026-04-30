import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { auth } from "@/lib/auth";

export default async function SignupPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/dashboard");

  return (
    <AuthShell
      eyebrow="Start small"
      title="Create your Fleent account"
      subtitle="Create your account to continue."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-fleent-ink underline underline-offset-4 hover:text-fleent-orange"
          >
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
