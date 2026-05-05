import { Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"
import { LenisProvider } from "@/components/lenis-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { cn } from "@/lib/utils";
import { CookiePop } from "@/components/cookie-pop";
import { Toaster } from "@/components/ui/sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", plusJakartaSans.variable, "font-sans")}
    >
      <body>
        <QueryProvider>
          <LenisProvider>
            {children}
            <CookiePop />
            <Toaster />
          </LenisProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
