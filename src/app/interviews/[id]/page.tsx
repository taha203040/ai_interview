import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SupabaseInterviewRepository } from "@/lib/adapters/repository/supabase-interview-repository";
import { SupabaseStorage } from "@/lib/adapters/storage/supabase-storage";
import type { InterviewData } from "@/lib/adapters/ai/interview-analyzer";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const { id } = await params;

  const repository = new SupabaseInterviewRepository();
  const interview = await repository.getById(id, userId);
  if (!interview) notFound();

  let assessment: string | null = null;
  let data: InterviewData | null = null;
  if (interview.data_path) {
    const storage = new SupabaseStorage();
    assessment = await storage.loadAssessment(interview.data_path);
    data = await storage.loadData(interview.data_path);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <Link href="/interviews" className="text-sm text-zinc-500 hover:underline">
          ← Back to interviews
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{interview.role}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {interview.topic}
          {interview.skills && interview.skills.length > 0 && (
            <span className="text-zinc-400"> · {interview.skills.join(", ")}</span>
          )}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          {new Date(interview.created_at).toLocaleString()} · {interview.status}
        </p>
      </div>

      {assessment && (
        <section className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.08]">
          <h2 className="font-medium">Assessment</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{assessment}</p>
        </section>
      )}

      {data && (
        <section className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.08]">
          <h2 className="font-medium">Transcript</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{data.transcript}</p>

          {data.diagram != null && (
            <>
              <h2 className="mt-4 font-medium">Whiteboard diagram</h2>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-black/[.04] p-3 text-xs dark:bg-white/[.06]">
                {JSON.stringify(data.diagram, null, 2)}
              </pre>
            </>
          )}
        </section>
      )}

      {!assessment && !data && (
        <p className="text-sm text-zinc-400">
          No saved content found for this interview.
        </p>
      )}
    </main>
  );
}
