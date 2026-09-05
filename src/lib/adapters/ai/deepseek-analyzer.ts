import OpenAI from "openai";
import { getEnv, getRequiredEnv } from "@/lib/env";
import type { InterviewAnalyzer, InterviewData } from "./interview-analyzer";

const SYSTEM_PROMPT = [
  "You are an expert technical interviewer.",
  "Assess the candidate's interview transcript and return a concise, structured evaluation:",
  "key strengths, key weaknesses, and an overall score out of 10 with a one-sentence justification.",
].join(" ");

/**
 * InterviewAnalyzer backed by the official OpenAI SDK, configured for
 * DeepSeek's OpenAI-compatible API.
 *
 * See: https://api-docs.deepseek.com
 */
export class DeepSeekAnalyzer implements InterviewAnalyzer {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: getEnv("DEEPSEEK_BASE_URL") ?? "https://api.deepseek.com",
      apiKey: getRequiredEnv("DEEPSEEK_API_KEY"),
    });
  }

  async analyze(data: InterviewData): Promise<string> {
    const model = getEnv("DEEPSEEK_MODEL") ?? "deepseek-v4-flash";

    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: data.transcript },
      ],
    });

    return completion.choices[0]?.message?.content ?? "";
  }
}
