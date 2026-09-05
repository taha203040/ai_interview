import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { DeepSeekAnalyzer } from "@/lib/adapters/ai/deepseek-analyzer";
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

  const transcript =
    typeof body === "object" && body !== null && "transcript" in body
      ? String((body as { transcript: unknown }).transcript)
      : "";

  if (!transcript.trim()) {
    return NextResponse.json({ error: "Missing transcript" }, { status: 400 });
  }

  try {
    const analyzer = new DeepSeekAnalyzer();
    const assessment = await analyzer.analyze({ transcript });
    return NextResponse.json({ assessment });
  } catch (error) {
    if (error instanceof ConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to analyze interview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
