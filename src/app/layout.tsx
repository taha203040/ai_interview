import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/ui/theme-provider";

import { ModeToggle } from "@/components/ui/toggle";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Interview",
  description:
    "AI-powered technical interview with voice, diagrams, and assessment.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`
      ${geistSans.variable} 
      ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          // disableTransitionOnChange
        >
          {" "}
          <ClerkProvider>
            <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-3 dark:border-white/[.08]">
              <Link href="/">
                {" "}
                <h1 className="text-2xl font-semibold">AI Interview</h1>
              </Link>{" "}
              
              <div className="flex items-center gap-2">
                <ModeToggle />

                <Show when="signed-out">
                  <SignInButton>
                    <button className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
                      Sign in
                    </button>
                  </SignInButton>

                  <SignUpButton>
                    <button className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md">
                      Get started
                    </button>
                  </SignUpButton>
                </Show>

                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
              
              {/* <div className="flex items-center gap-3">
                <ModeToggle />
                <Show when="signed-out" >
                  <SignInButton  />
                  <SignUpButton />
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div> */}
            </header>
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
