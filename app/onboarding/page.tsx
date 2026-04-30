import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { auth } from "@/lib/auth";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  return <OnboardingFlow name={session.user.name} />;
}
