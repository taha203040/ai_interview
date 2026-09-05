import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { hasEnv } from "@/lib/env";

const SERVICES = [
  {
    name: "Clerk (auth)",
    configured:
      hasEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") && hasEnv("CLERK_SECRET_KEY"),
  },
  {
    name: "Supabase (storage)",
    configured:
      hasEnv("NEXT_PUBLIC_SUPABASE_URL") &&
      (hasEnv("SUPABASE_SECRET_KEY") || hasEnv("SUPABASE_SERVICE_ROLE_KEY")),
  },
  {
    name: "Vapi (voice)",
    configured:
      hasEnv("NEXT_PUBLIC_VAPI_PUBLIC_KEY") && hasEnv("NEXT_PUBLIC_VAPI_ASSISTANT_ID"),
  },
  {
    name: "DeepSeek (AI)",
    configured: hasEnv("DEEPSEEK_API_KEY"),
  },
];

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="w-full max-w-xl rounded-xl border border-black/[.08] p-6 dark:border-white/[.08]">
        <h1 className="text-2xl font-semibold">AI Interview</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {userId ? "Signed in — ready to run an interview." : "Sign in to run an interview."}
        </p>

        <div className="mt-4 flex gap-3">
          <Link
            href="/interview/new"
            className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-80"
          >
            New interview
          </Link>
          <Link
            href="/interviews"
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/[.12] px-5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.15] dark:hover:bg-white/[.06]"
          >
            View interviews
          </Link>
        </div>

        <h2 className="mt-6 font-medium">Service configuration</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {SERVICES.map((service) => (
            <li key={service.name} className="flex items-center gap-2">
              <span className={service.configured ? "text-green-600" : "text-red-600"}>
                {service.configured ? "✓" : "✗"}
              </span>
              <span>{service.name}</span>
              {!service.configured && (
                <span className="text-zinc-400">— set required env vars (.env.local)</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
