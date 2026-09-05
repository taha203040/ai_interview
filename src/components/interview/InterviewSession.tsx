"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InterviewVoice } from "@/lib/adapters/voice/vapi-client";
import type { TranscriptMessage } from "@/lib/adapters/voice/vapi-client";
import type { DiagramEngine } from "@/lib/adapters/diagram/diagram-engine";
import type { InterviewConfig } from "@/lib/interview/types";
import { Whiteboard } from "./Whiteboard";

interface InterviewSessionProps extends InterviewConfig {
  interviewId: string;
}

type CallStatus = "idle" | "starting" | "active" | "ended";

export function InterviewSession({
  interviewId,
  role,
  topic,
  skills,
}: InterviewSessionProps) {
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

  const [status, setStatus] = useState<CallStatus>("idle");
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const engineRef = useRef<DiagramEngine | null>(null);

  const voice = useMemo(() => {
    if (!publicKey) return null;
    return new InterviewVoice(publicKey);
  }, [publicKey]);

  useEffect(() => {
    if (!voice) return;
    voice.subscribe({
      onTranscript: (msg) => setTranscripts((prev) => [...prev, msg]),
      onCallStart: () => setStatus("active"),
      onCallEnd: () => setStatus("ended"),
      onError: (e) => setError(String(e)),
    });
  }, [voice]);

  const transcriptText = useMemo(
    () => transcripts.map((t) => `${t.role}: ${t.transcript}`).join("\n"),
    [transcripts]
  );

  const start = useCallback(async () => {
    if (!voice) {
      setError("Vapi is not configured: NEXT_PUBLIC_VAPI_PUBLIC_KEY is missing.");
      return;
    }
    if (!assistantId) {
      setError("Vapi is not configured: NEXT_PUBLIC_VAPI_ASSISTANT_ID is missing.");
      return;
    }
    setError(null);
    setStatus("starting");
    try {
      await voice.start(assistantId, {
        variableValues: { role, topic, skills: skills.join(", ") },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("idle");
    }
  }, [voice, assistantId, role, topic, skills]);

  const endInterview = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      if (voice && status === "active") await voice.stop();
      setStatus("ended");

      const diagram = engineRef.current?.toJSON();

      const analyzeRes = await fetch("/api/interview/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptText }),
      });
      const analyzeJson = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(analyzeJson.error ?? "Analysis failed");
      }
      setAssessment(analyzeJson.assessment ?? "");

      const saveRes = await fetch("/api/interview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          transcript: transcriptText,
          assessment: analyzeJson.assessment,
          diagram,
          role,
          topic,
          skills,
        }),
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveJson.error ?? "Save failed");
      }
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [voice, status, transcriptText, interviewId]);

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{role}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {topic}
            {skills.length > 0 && (
              <span className="text-zinc-400"> · {skills.join(", ")}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {status === "idle" || status === "ended" ? (
            <button
              type="button"
              onClick={start}
              className="h-10 rounded-full bg-foreground px-5 text-sm font-medium text-background"
            >
              {status === "ended" ? "Restart call" : "Start call"}
            </button>
          ) : (
            <button
              type="button"
              onClick={endInterview}
              disabled={busy}
              className="h-10 rounded-full bg-red-600 px-5 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? "Ending…" : "End interview"}
            </button>
          )}
          <span className="text-sm text-zinc-500">
            {status === "idle" && "Not started"}
            {status === "starting" && "Connecting…"}
            {status === "active" && "In progress"}
            {status === "ended" && "Ended"}
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.08]">
          <h2 className="font-medium">Live transcript</h2>
          <div className="mt-2 h-80 space-y-2 overflow-y-auto text-sm">
            {transcripts.length === 0 ? (
              <p className="text-zinc-400">
                Transcript will appear here once the call starts.
              </p>
            ) : (
              transcripts.map((t, i) => (
                <p key={i}>
                  <span className="font-medium capitalize">{t.role}:</span>{" "}
                  {t.transcript}
                </p>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.08]">
          <h2 className="font-medium">Whiteboard</h2>
          <Whiteboard engineRef={engineRef} />
        </section>
      </div>

      {assessment && (
        <section className="mt-6 rounded-xl border border-black/[.08] p-4 dark:border-white/[.08]">
          <h2 className="font-medium">Assessment</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{assessment}</p>
          {saved && (
            <p className="mt-2 text-sm text-green-600">Saved to Supabase ✓</p>
          )}
        </section>
      )}
    </div>
  );
}
