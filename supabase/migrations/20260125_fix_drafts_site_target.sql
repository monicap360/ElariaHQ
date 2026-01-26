-- Ensure content_drafts has site_target and refresh views.
alter table public.content_drafts
add column if not exists site_target public.site_target;

drop view if exists public.v_draft_viewer;
drop view if exists public.v_ready_drafts;

create or replace view public.v_ready_drafts as
select
  at.id as task_id,
  kt.topic,
  kt.scope,
  coalesce(at.target_site, 'cruisesfromgalveston') as site_target,
  coalesce(at.source_signal, 'manual') as source_signal,
  kt.priority,
  at.created_at as draft_created_at,
  'drafted'::public.draft_status as status
from public.agent_tasks at
left join public.knowledge_topics kt on kt.id = at.reference_id
where at.ready_for_content = true
order by kt.priority asc nulls last, at.created_at asc;

create or replace view public.v_draft_viewer as
select
  cd.id as draft_id,
  cd.draft_title,
  cd.draft_body,
  cd.site_target,
  cd.draft_type,
  cd.format,
  cd.authority_role,
  cd.status,
  cd.routing,
  cd.source_ref,
  cd.created_at as draft_created_at,
  cd.updated_at as draft_updated_at,
  at.notes as outline,
  at.id as task_id,
  at.reference_id as topic_id,
  kt.topic,
  kt.scope,
  kt.priority
from public.content_drafts cd
left join public.agent_tasks at on at.id = cd.task_id
left join public.knowledge_topics kt on kt.id = at.reference_id;
