import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SupabaseInterviewRepository } from "@/lib/adapters/repository/supabase-interview-repository";
import { SupabaseStorage } from "@/lib/adapters/storage/supabase-storage";
import type { InterviewData } from "@/lib/adapters/ai/interview-analyzer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
type Assessment = {
  score: number;
  keyStrengths: string[];
  keyWeaknesses: string[];
  summary: string;
};
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
  let assessment: Assessment | null = null;
  let data: InterviewData | null = null;

  if (interview.data_path) {
    const storage = new SupabaseStorage();

    const assessmentJson = await storage.loadAssessment(interview.data_path);

    assessment =
      typeof assessmentJson === "string"
        ? JSON.parse(assessmentJson)
        : assessmentJson;

    data = await storage.loadData(interview.data_path);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <Link
          href="/interviews"
          className="text-sm text-zinc-500 hover:underline"
        >
          ← Back to interviews
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{interview.role}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {interview.topic}
          {interview.skills && interview.skills.length > 0 && (
            <span className="text-zinc-400">
              {" "}
              · {interview.skills.join(", ")}
            </span>
          )}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          {new Date(interview.created_at).toLocaleString()} · {interview.status}
        </p>
      </div>

      {assessment && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Assessment</CardTitle>
            <CardDescription>Technical interview evaluation</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score */}
            <div className="flex items-center gap-6">
              <div className="relative flex size-28 items-center justify-center">
                <svg
                  className="absolute size-28 -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />

                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${assessment.score * 26.4} 264`}
                    className="text-primary"
                  />
                </svg>

                <div className="text-center">
                  <div className="text-2xl font-bold">{assessment.score}</div>
                  <div className="text-xs text-muted-foreground">/ 10</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Overall Score</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your technical interview performance.
                </p>
              </div>
            </div>

            {/* Strengths / Weaknesses */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Strengths */}
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="text-base text-green-600 dark:text-green-400">
                    Key Strengths
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2">
                    {assessment.keyStrengths.map(
                      (strength: string, index: number) => (
                        <li
                          key={index}
                          className="rounded-md bg-green-500/10 p-3 text-sm"
                        >
                          {strength}
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card className="border-red-500/20 bg-red-500/5">
                <CardHeader>
                  <CardTitle className="text-base text-red-600 dark:text-red-400">
                    Key Weaknesses
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2">
                    {assessment.keyWeaknesses.map(
                      (weakness: string, index: number) => (
                        <li
                          key={index}
                          className="rounded-md bg-red-500/10 p-3 text-sm"
                        >
                          {weakness}
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {assessment.summary}
                </p>
              </CardContent>
            </Card>

          </CardContent>
        </Card>
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
