import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import type { InterviewRecord, InterviewRecordInput } from "@/lib/interview/types";
import type { InterviewRepository } from "./interview-repository";

// Metadata only — the full content lives in Storage and is fetched on demand.
const LIST_COLUMNS = "id, user_id, role, topic, skills, created_at, data_path, status";

/**
 * InterviewRepository backed by the official Supabase SDK (PostgREST via
 * `supabase.from("interviews")`). This adapter only delegates to the SDK.
 */
export class SupabaseInterviewRepository implements InterviewRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createAdminClient();
  }

  async create(input: InterviewRecordInput): Promise<InterviewRecord> {
    const { data, error } = await this.supabase
      .from("interviews")
      .insert({
        user_id: input.userId,
        role: input.role,
        topic: input.topic,
        skills: input.skills,
        data_path: input.dataPath,
        status: input.status,
      })
      .select(LIST_COLUMNS)
      .single();

    if (error) throw error;
    return data as InterviewRecord;
  }

  async listByUser(userId: string): Promise<InterviewRecord[]> {
    const { data, error } = await this.supabase
      .from("interviews")
      .select(LIST_COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as InterviewRecord[];
  }

  async getById(id: string, userId: string): Promise<InterviewRecord | null> {
    const { data, error } = await this.supabase
      .from("interviews")
      .select(LIST_COLUMNS)
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return (data as InterviewRecord | null) ?? null;
  }
}
