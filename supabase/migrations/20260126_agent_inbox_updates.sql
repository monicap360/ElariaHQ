create table if not exists public.agent_inbox (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  from_contact text,
  body text not null,
  agent_name text,
  task_type text,
  status text default 'received',
  created_at timestamptz default now()
);

create table if not exists public.agent_updates (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  task_id uuid,
  message text not null,
  created_at timestamptz default now()
);
