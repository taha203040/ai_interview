import type { InterviewData } from "@/lib/adapters/ai/interview-analyzer";

/**
 * Application-level boundary for persisting interview artifacts (files in
 * Supabase Storage). Implementations delegate to the official Supabase SDK.
 * No business logic belongs here.
 */
export interface InterviewStorage {
  saveData(interviewId: string, data: InterviewData): Promise<string>;
  saveAssessment(interviewId: string, assessment: string): Promise<string>;
  loadData(dataPath: string): Promise<InterviewData | null>;
  loadAssessment(dataPath: string): Promise<string | null>;
}
