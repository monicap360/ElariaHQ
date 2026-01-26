-- Add outline hashes for traceability and drift checks.
alter table public.agent_tasks
add column if not exists outline_hash text;

alter table public.content_drafts
add column if not exists outline_hash text,
add column if not exists outline_text text;
