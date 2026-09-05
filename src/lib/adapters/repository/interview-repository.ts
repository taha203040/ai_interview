import type { InterviewRecord, InterviewRecordInput } from "@/lib/interview/types";

/**
 * Application-level boundary for interview metadata rows in the
 * `public.interviews` table. Implementations delegate to the official
 * Supabase SDK. No business logic belongs here.
 */
export interface InterviewRepository {
  create(input: InterviewRecordInput): Promise<InterviewRecord>;
  listByUser(userId: string): Promise<InterviewRecord[]>;
  getById(id: string, userId: string): Promise<InterviewRecord | null>;
}
