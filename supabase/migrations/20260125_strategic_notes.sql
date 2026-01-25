create table if not exists public.strategic_notes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.authority_topics(id),
  note text,
  visibility text check (visibility in ('internal','public_summary')),
  created_at timestamptz default now()
);
