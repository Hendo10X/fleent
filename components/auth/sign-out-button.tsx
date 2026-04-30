"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <Button
      loading={isSigningOut}
      className="rounded-full border-transparent bg-white text-fleent-ink shadow-none hover:bg-[#F3F3F3] *:data-[slot=button-loading-indicator]:text-fleent-orange"
      onClick={async () => {
        setIsSigningOut(true);
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
