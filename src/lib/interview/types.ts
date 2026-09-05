export interface InterviewConfig {
  role: string;
  topic: string;
  skills: string[];
}

/** A row in the `public.interviews` metadata table. */
export interface InterviewRecord {
  id: string;
  user_id: string;
  role: string | null;
  topic: string | null;
  skills: string[] | null;
  created_at: string;
  data_path: string | null;
  status: string | null;
}

/** Input for creating a new interview metadata row. */
export interface InterviewRecordInput {
  userId: string;
  role: string;
  topic: string;
  skills: string[];
  dataPath: string;
  status: string;
}
