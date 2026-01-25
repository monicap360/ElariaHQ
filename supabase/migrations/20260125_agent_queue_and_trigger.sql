-- Queue new agent tasks for downstream workers.
create table if not exists public.agent_queue (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.agent_tasks(id),
  agent_name text,
  created_at timestamptz default now(),
  processed boolean default false
);

create index if not exists idx_agent_queue_processed on public.agent_queue (processed);

alter table public.agent_queue enable row level security;

drop policy if exists "service_role_all_access" on public.agent_queue;
create policy "service_role_all_access"
on public.agent_queue
for all
using (true)
with check (true);

create or replace function public.enqueue_agent_task()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.agent_name is not null and new.status = 'pending' then
    insert into public.agent_queue (task_id, agent_name)
    values (new.id, new.agent_name);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enqueue_agent_task on public.agent_tasks;
create trigger trg_enqueue_agent_task
after insert on public.agent_tasks
for each row execute function public.enqueue_agent_task();
