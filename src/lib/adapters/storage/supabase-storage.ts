import type { SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";
import type { InterviewData } from "@/lib/adapters/ai/interview-analyzer";
import type { InterviewStorage } from "./interview-storage";

const DEFAULT_BUCKET = "interviews";

/**
 * InterviewStorage backed by the official Supabase SDK (Storage API).
 * This adapter only delegates to `supabase.storage`; it contains no business
 * logic.
 */
export class SupabaseStorage implements InterviewStorage {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor(bucket?: string) {
    this.supabase = createAdminClient();
    this.bucket = bucket ?? getEnv("SUPABASE_STORAGE_BUCKET") ?? DEFAULT_BUCKET;
  }

  async saveData(interviewId: string, data: InterviewData): Promise<string> {
    const { data: result, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(`${interviewId}/data.json`, JSON.stringify(data), {
        contentType: "application/json",
        upsert: true,
      });

    if (error) throw error;
    if (!result) throw new Error("Supabase storage upload returned no path");
    return result.path;
  }

  async saveAssessment(interviewId: string, assessment: string): Promise<string> {
    const { data: result, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(`${interviewId}/assessment.txt`, assessment, {
        contentType: "text/plain",
        upsert: true,
      });

    if (error) throw error;
    if (!result) throw new Error("Supabase storage upload returned no path");
    return result.path;
  }

  async loadData(dataPath: string): Promise<InterviewData | null> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .download(`${dataPath}/data.json`);

    if (error || !data) return null;
    const text = await data.text();
    try {
      return JSON.parse(text) as InterviewData;
    } catch {
      return null;
    }
  }

  async loadAssessment(dataPath: string): Promise<string | null> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .download(`${dataPath}/assessment.txt`);

    if (error || !data) return null;
    return data.text();
  }
}
