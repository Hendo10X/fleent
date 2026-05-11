"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SignOutButton({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <Button
      disabled={isSigningOut}
      className={cn(
        "h-12 rounded-full border-transparent bg-white px-6 py-3 text-fleent-ink shadow-none hover:bg-[#F3F3F3]",
        className,
      )}
      onClick={async () => {
        setIsSigningOut(true);
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      {isSigningOut ? (
        <Spinner className="size-4 text-current" />
      ) : (
        "Sign out"
      )}
    </Button>
  );
}
