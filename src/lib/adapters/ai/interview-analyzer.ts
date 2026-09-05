/**
 * Application-level boundary for AI interview analysis.
 *
 * Implementations delegate to an external LLM SDK (e.g. the OpenAI SDK
 * pointed at DeepSeek). No business logic belongs in this interface or in
 * the adapters that implement it.
 */

export interface InterviewData {
  /** The full interview transcript (or raw material) to assess. */
  transcript: string;
  /** Optional rubric or free-form context. */
  [key: string]: unknown;
}

export interface InterviewAnalyzer {
  analyze(data: InterviewData): Promise<string>;
}
