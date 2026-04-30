"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-3xl !border-transparent !bg-white !text-fleent-ink !shadow-none",
          title: "!text-sm !font-medium !tracking-wide",
          description: "!text-fleent-mute",
          success: "!text-fleent-ink",
          error: "!text-fleent-ink",
        },
      }}
      {...props}
    />
  );
}
