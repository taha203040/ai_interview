import { auth } from "@clerk/nextjs/server";
import { InterviewSession } from "@/components/interview/InterviewSession";

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; topic?: string; skills?: string }>;
}) {
  await auth.protect();

  const params = await searchParams;
  const role = params.role?.trim() || "Software Engineer";
  const topic = params.topic?.trim() || "General technical interview";
  const skills = (params.skills ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const interviewId = crypto.randomUUID();

  return (
    <InterviewSession
      interviewId={interviewId}
      role={role}
      topic={topic}
      skills={skills}
    />
  );
}
