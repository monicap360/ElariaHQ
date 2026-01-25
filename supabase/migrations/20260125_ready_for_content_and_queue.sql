-- Gate content creation behind readiness.
alter table public.agent_tasks
add column if not exists ready_for_content boolean default false;

-- Content queue for tasks that are approved to write.
create or replace view public.content_queue as
select
  at.id as task_id,
  kt.topic,
  at.notes,
  at.created_at
from public.agent_tasks at
join public.knowledge_topics kt on kt.id = at.reference_id
where at.ready_for_content = true
order by kt.priority asc, at.created_at asc;
