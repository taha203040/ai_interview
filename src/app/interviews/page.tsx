import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SupabaseInterviewRepository } from "@/lib/adapters/repository/supabase-interview-repository";

export default async function InterviewsPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const repository = new SupabaseInterviewRepository();
  const interviews = await repository.listByUser(userId);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Interviews</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {interviews.length} interview{interviews.length === 1 ? "" : "s"}
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="rounded-xl border border-black/[.08] p-6 text-sm text-zinc-500 dark:border-white/[.08]">
          No interviews yet.{" "}
          <Link href="/interview/new" className="font-medium underline">
            Start one
          </Link>
          .
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {interviews.map((interview) => (
            <li
              key={interview.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-black/[.08] p-4 dark:border-white/[.08]"
            >
              <div className="min-w-0">
                <p className="font-medium">{interview.role}</p>
                <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
                  {interview.topic}
                  {interview.skills && interview.skills.length > 0 && (
                    <span className="text-zinc-400">
                      {" "}
                      · {interview.skills.join(", ")}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {new Date(interview.created_at).toLocaleString()} ·{" "}
                  {interview.status}
                </p>
              </div>
              <Link
                href={`/interviews/${interview.id}`}
                className="shrink-0 rounded-full border border-black/[.12] px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.15] dark:hover:bg-white/[.06]"
              >
                See more
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
