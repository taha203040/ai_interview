-- Interviews metadata table.
-- The full content (transcript, assessment, whiteboard diagram) is stored as
-- files in Supabase Storage under the {data_path}/ folder; this table holds
-- only the lightweight metadata used for list reads.
create table if not exists public.interviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,              -- Clerk user id
  role        text,
  topic       text,
  skills      text[],                     -- note: `ARRAY` alone is invalid; use text[]
  data_path   text,                       -- storage folder holding data.json + assessment.txt
  status      text,
  created_at  timestamptz not null default now()
);

-- Fast, ordered reads for the interviews list page.
create index if not exists interviews_user_created_idx
  on public.interviews (user_id, created_at desc);
