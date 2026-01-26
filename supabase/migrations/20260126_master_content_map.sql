-- Master content cadence map tables and views.
-- Adds columns to agent_tasks to align with site/role routing.
alter table public.agent_tasks
add column if not exists site_key text,
add column if not exists agent_role text,
add column if not exists priority int default 3;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'agent_tasks_site_key_check'
  ) then
    alter table public.agent_tasks
      add constraint agent_tasks_site_key_check
      check (
        site_key is null or site_key in (
          'cruisesfromgalveston',
          'texascruiseport',
          'houstoncruisetips',
          'houstoncruiseshuttle',
          'pier10parking',
          'pier25parking'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'agent_tasks_agent_role_check'
  ) then
    alter table public.agent_tasks
      add constraint agent_tasks_agent_role_check
      check (
        agent_role is null or agent_role in (
          'news_desk',
          'authority_editor',
          'journal',
          'publisher',
          'social_context',
          'transport_ops',
          'revenue_manager',
          'parking_ops',
          'qa_bot'
        )
      );
  end if;
end $$;

-- News signals for News Desk.
create table if not exists public.news_signals (
  id uuid primary key default gen_random_uuid(),
  source text check (source in ('google_alert','weather','trade_media','cruise_line')),
  headline text not null,
  summary text,
  source_url text,
  detected_at timestamptz default now(),
  processed boolean default false
);

-- Authority topics (if not already present).
create table if not exists public.authority_topics (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  topic_type text check (topic_type in ('ship','port','itinerary','planning','education')),
  parent_topic uuid references public.authority_topics(id),
  intent text check (intent in ('informational','planning','comparison')),
  created_at timestamptz default now()
);

-- Transportation routes and bookings (houstoncruiseshuttle.com).
create table if not exists public.transport_routes (
  id uuid primary key default gen_random_uuid(),
  from_label text not null,
  to_label text not null,
  route_type text check (
    route_type in ('airport_to_ship','hotel_to_ship','ship_to_airport','ship_to_hotel')
  )
);

create table if not exists public.transport_bookings (
  id uuid primary key default gen_random_uuid(),
  route_id uuid references public.transport_routes(id),
  passenger_count int check (passenger_count between 1 and 4),
  luggage_notes text,
  pickup_time timestamptz,
  contact_phone text,
  status text check (status in ('scheduled','enroute','arrived','completed')),
  created_at timestamptz default now()
);

-- Parking capacity events (pier10/pier25).
create table if not exists public.parking_capacity_events (
  id uuid primary key default gen_random_uuid(),
  pier text check (pier in ('pier10','pier25')),
  capacity_status text check (capacity_status in ('open','limited','full')),
  note text,
  reported_at timestamptz default now()
);

-- Extend content_drafts to support site_key and expanded authority_role.
alter table public.content_drafts
add column if not exists site_key text;

alter table public.content_drafts
drop constraint if exists content_drafts_authority_role_check;

alter table public.content_drafts
add constraint content_drafts_authority_role_check
check (authority_role in ('explainer','guide','context','comparison','news','pr'));

-- Guardrail: no sales role on authority site.
alter table public.content_drafts
drop constraint if exists content_drafts_no_sales_on_authority;

alter table public.content_drafts
add constraint content_drafts_no_sales_on_authority
check (site_key is null or site_key <> 'cruisesfromgalveston' or authority_role <> 'sales');

-- Dashboard views.
create or replace view public.v_ready_drafts as
select
  cd.id as draft_id,
  cd.draft_title,
  cd.site_target,
  cd.site_key,
  cd.authority_role,
  cd.status,
  cd.created_at as draft_created_at
from public.content_drafts cd
where cd.status = 'drafted'
order by cd.created_at desc;

create or replace view public.v_ops_today as
select *
from public.transport_bookings
where pickup_time::date = current_date;

create or replace view public.v_news_pipeline as
select *
from public.news_signals
where processed = false;
