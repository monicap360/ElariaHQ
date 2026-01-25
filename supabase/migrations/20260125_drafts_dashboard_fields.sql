alter table public.agent_tasks
add column if not exists target_site text,
add column if not exists source_signal text,
add column if not exists parent_asset_id uuid references public.content_assets(id),
add column if not exists approved_for_publish boolean default false,
add column if not exists revision_notes text,
add column if not exists hold_notes text,
add column if not exists rejection_reason text;

create index if not exists idx_agent_tasks_ready_for_content
on public.agent_tasks (ready_for_content);
