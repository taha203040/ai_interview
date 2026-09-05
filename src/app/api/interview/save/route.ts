import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { SupabaseStorage } from "@/lib/adapters/storage/supabase-storage";
import { SupabaseInterviewRepository } from "@/lib/adapters/repository/supabase-interview-repository";
import type { InterviewData } from "@/lib/adapters/ai/interview-analyzer";
import { ConfigError } from "@/lib/env";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

  const interviewId = typeof record.interviewId === "string" ? record.interviewId : "";
  const transcript = typeof record.transcript === "string" ? record.transcript : "";
  const assessment = typeof record.assessment === "string" ? record.assessment : undefined;
  const diagram = record.diagram;
  const role =
    typeof record.role === "string" && record.role.trim() !== ""
      ? record.role
      : "Software Engineer";
  const topic =
    typeof record.topic === "string" && record.topic.trim() !== ""
      ? record.topic
      : "General technical interview";
  const skills = Array.isArray(record.skills)
    ? record.skills.filter((s): s is string => typeof s === "string")
    : [];

  if (!interviewId.trim() || !transcript.trim()) {
    return NextResponse.json(
      { error: "Missing interviewId or transcript" },
      { status: 400 }
    );
  }

  try {
    const storage = new SupabaseStorage();
    const data: InterviewData = { transcript };
    if (diagram !== undefined) {
      data.diagram = diagram;
    }
    const dataPath = await storage.saveData(interviewId, data);
    const assessmentPath = assessment
      ? await storage.saveAssessment(interviewId, assessment)
      : undefined;

    const repository = new SupabaseInterviewRepository();
    const savedRecord = await repository.create({
      userId,
      role,
      topic,
      skills,
      dataPath: interviewId,
      status: "completed",
    });

    return NextResponse.json({ dataPath, assessmentPath, recordId: savedRecord.id });
  } catch (error) {
    if (error instanceof ConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to save interview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
