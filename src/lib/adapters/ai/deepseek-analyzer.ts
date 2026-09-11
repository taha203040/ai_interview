import OpenAI from "openai";
import { getEnv, getRequiredEnv } from "@/lib/env";
import type { InterviewAnalyzer, InterviewData } from "./interview-analyzer";

const SYSTEM_PROMPT = [
  "You are an expert technical interviewer.",
  "Assess the candidate's interview transcript for technical depth, system design thinking, communication, and understanding.",
  "Return ONLY valid JSON. Do not include Markdown, code fences, or any text outside the JSON.",
  "The JSON must follow exactly this structure:",
  JSON.stringify({
    score: 0,
    keyStrengths: [],
    keyWeaknesses: [],
    summary: ""
  }),
  "score must be a number from 0 to 10.",
  "keyStrengths must be an array of concise strings.",
  "keyWeaknesses must be an array of concise strings.",
  "summary must be one concise sentence explaining the overall assessment."
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
