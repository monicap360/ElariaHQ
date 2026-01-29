-- ============================================================================
-- Fix: sail_date vs depart_date column mismatch in views
-- Uses depart_date internally (the real column) but exposes sail_date as alias
-- for backward compatibility with frontend code
-- ============================================================================

-- Fix: ship_destination_duration_seo_pages (main SEO view)
-- Uses depart_date internally but exposes sail_date as alias for backward compatibility
create or replace view public.ship_destination_duration_seo_pages as
with base as (
  select
    s.id as sailing_id,
    sh.id as ship_id,
    sh.name as ship_name,
    lower(regexp_replace(sh.name, '[^a-zA-Z0-9]+', '-', 'g')) as ship_slug,
    sh.cruise_line,
    -- ✅ SOURCE OF TRUTH: Use depart_date internally, expose as sail_date
    s.depart_date as sail_date,
    s.return_date,
    ((s.return_date - s.depart_date) + 1) as duration_days,
    case when ((s.return_date - s.depart_date) + 1) >= 8 then '8-day' 
         else ((s.return_date - s.depart_date) + 1) || '-day' end as duration_slug,
    coalesce(a.canonical_name, initcap(trim(lower(port)))) as destination_name
  from public.sailings s
  join public.ships sh on sh.id = s.ship_id
  cross join lateral regexp_split_to_table(
    coalesce(s.ports_summary, ''),
    '[,;]'
  ) as port
  left join public.destination_aliases a
    on trim(lower(port)) = a.alias
  where
    sh.home_port = 'Galveston'
    and s.depart_date >= (now() at time zone 'UTC')::date
    and trim(port) <> ''
)
select distinct
  ship_id,
  ship_name,
  ship_slug,
  regexp_replace(lower(destination_name), '[^a-z0-9]+', '-', 'g') as destination_slug,
  destination_name,
  duration_slug,
  ship_name || ' ' ||
  destination_name || ' ' ||
  case when duration_days >= 8 then '8+ Day' else duration_days || ' Day' end ||
  ' Cruises from Galveston' as seo_title,
  ship_name || ' ' ||
  destination_name || ' ' ||
  case when duration_days >= 8 then '8+ Day' else duration_days || ' Day' end ||
  ' cruises departing Galveston' as seo_h1,
  'Browse ' || ship_name || ' cruises from Galveston visiting ' || destination_name ||
  ' on ' ||
  case when duration_days >= 8 then '8+ Day' else duration_days || ' Day' end ||
  ' itineraries.' as seo_description,
  sail_date
from base
order by sail_date asc;

-- Fix: future_sailings_list
create or replace view public.future_sailings_list as
select
  s.id as sailing_id,
  s.depart_date as sail_date,
  s.return_date,
  s.duration,
  s.itinerary_code,
  s.created_at,
  sh.id as ship_id,
  sh.name as ship_name,
  sh.cruise_line,
  sh.home_port
from public.sailings s
join public.ships sh on sh.id = s.ship_id
where
  s.depart_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston'
order by sail_date asc;

-- Fix: ship_future_sailing_counts
create or replace view public.ship_future_sailing_counts as
select
  sh.id as ship_id,
  sh.name as ship_name,
  sh.cruise_line,
  sh.home_port,
  count(s.id) as future_sailing_count,
  min(s.depart_date) as next_sailing_date,
  max(s.depart_date) as last_sailing_date
from public.ships sh
join public.sailings s on s.ship_id = sh.id
where
  s.depart_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston'
group by sh.id, sh.name, sh.cruise_line, sh.home_port
order by future_sailing_count desc, next_sailing_date asc;

-- Fix: ship_future_sailings
create or replace view public.ship_future_sailings as
select
  sh.id as ship_id,
  sh.name as ship_name,
  sh.cruise_line,
  sh.home_port,
  s.id as sailing_id,
  s.depart_date as sail_date,
  s.return_date,
  s.duration,
  s.itinerary_code
from public.ships sh
join public.sailings s on s.ship_id = sh.id
where
  s.depart_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston'
order by sh.name, sail_date;

-- Fix: duration_seo_pages
create or replace view public.duration_seo_pages as
select distinct
  case when s.duration >= 8 then '8-day' else concat(s.duration, '-day') end as duration_slug,
  case when s.duration >= 8 then '8+ Day Cruises from Galveston' else concat(s.duration, ' Day Cruises from Galveston') end as seo_title,
  concat(
    case when s.duration >= 8 then '8+ Day' else concat(s.duration, ' Day') end,
    ' cruises departing from Galveston, Texas.'
  ) as seo_h1
from public.sailings s
join public.ships sh on sh.id = s.ship_id
where
  s.depart_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Fix: ship_seo_pages
create or replace view public.ship_seo_pages as
select distinct
  sh.id as ship_id,
  lower(replace(sh.name, ' ', '-')) as ship_slug,
  concat(sh.name, ' Cruises from Galveston') as seo_title,
  concat(sh.name, ' cruises departing from Galveston, Texas') as seo_h1,
  sh.cruise_line
from public.ships sh
join public.sailings s on s.ship_id = sh.id
where
  s.depart_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Fix: ship_duration_seo_pages
create or replace view public.ship_duration_seo_pages as
select distinct
  sh.id as ship_id,
  lower(replace(sh.name, ' ', '-')) as ship_slug,
  case when s.duration >= 8 then '8-day' else concat(s.duration, '-day') end as duration_slug,
  concat(
    sh.name, ' ',
    case when s.duration >= 8 then '8+ Day' else concat(s.duration, ' Day') end,
    ' Cruises from Galveston'
  ) as seo_title,
  concat(
    sh.name, ' ',
    case when s.duration >= 8 then '8+ Day' else concat(s.duration, ' Day') end,
    ' cruises departing Galveston'
  ) as seo_h1
from public.ships sh
join public.sailings s on s.ship_id = sh.id
where
  s.depart_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Fix: cruise_line_seo_pages
create or replace view public.cruise_line_seo_pages as
select distinct
  lower(regexp_replace(sh.cruise_line, '[^a-zA-Z0-9]+', '-', 'g')) as cruise_line_slug,
  sh.cruise_line as cruise_line_name,
  concat(sh.cruise_line, ' Cruises from Galveston') as seo_title,
  concat(sh.cruise_line, ' cruises departing from Galveston, Texas') as seo_h1,
  concat(
    'Browse all ',
    sh.cruise_line,
    ' cruises departing from Galveston. Compare ships, sailing dates, and durations.'
  ) as seo_description
from public.ships sh
join public.sailings s on s.ship_id = sh.id
where
  s.depart_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Fix: cruise_line_ship_pages
create or replace view public.cruise_line_ship_pages as
select distinct
  lower(regexp_replace(sh.cruise_line, '[^a-zA-Z0-9]+', '-', 'g')) as cruise_line_slug,
  lower(regexp_replace(sh.name, '[^a-zA-Z0-9]+', '-', 'g')) as ship_slug,
  sh.name as ship_name,
  sh.cruise_line
from public.ships sh
join public.sailings s on s.ship_id = sh.id
where
  s.depart_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Fix: cruise_line_duration_seo_pages
create or replace view public.cruise_line_duration_seo_pages as
select distinct
  lower(regexp_replace(sh.cruise_line, '[^a-zA-Z0-9]+', '-', 'g')) as cruise_line_slug,
  sh.cruise_line as cruise_line_name,
  case when s.duration >= 8 then '8-day' else concat(s.duration, '-day') end as duration_slug,
  concat(
    sh.cruise_line,
    ' ',
    case when s.duration >= 8 then '8+ Day' else concat(s.duration, ' Day') end,
    ' Cruises from Galveston'
  ) as seo_title,
  concat(
    sh.cruise_line,
    ' ',
    case when s.duration >= 8 then '8+ Day' else concat(s.duration, ' Day') end,
    ' cruises departing Galveston'
  ) as seo_h1
from public.ships sh
join public.sailings s on s.ship_id = sh.id
where
  s.depart_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Fix: port_destination_seo_pages
create or replace view public.port_destination_seo_pages as
with raw_ports as (
  select
    s.id as sailing_id,
    sh.id as ship_id,
    trim(lower(port)) as raw_port
  from public.sailings s
  join public.ships sh on sh.id = s.ship_id
  cross join lateral regexp_split_to_table(coalesce(s.ports_summary, ''), '[,;]') as port
  where
    s.depart_date >= (now() at time zone 'UTC')::date
    and sh.home_port = 'Galveston'
    and trim(port) <> ''
),
canonical_ports as (
  select
    sailing_id,
    coalesce(a.canonical_name, initcap(raw_port)) as destination_name
  from raw_ports rp
  left join public.destination_aliases a
    on rp.raw_port = a.alias
)
select distinct
  regexp_replace(lower(destination_name), '[^a-z0-9]+', '-', 'g') as destination_slug,
  destination_name,
  destination_name || ' Cruises from Galveston' as seo_title,
  destination_name || ' cruises departing from Galveston, Texas' as seo_h1,
  'Browse cruises from Galveston visiting ' ||
  destination_name ||
  '. Compare ships, sailing dates, and durations.' as seo_description
from canonical_ports;

-- Fix: destination_duration_seo_pages
create or replace view public.destination_duration_seo_pages as
with raw_ports as (
  select
    s.duration,
    trim(lower(port)) as raw_port
  from public.sailings s
  join public.ships sh on sh.id = s.ship_id
  cross join lateral regexp_split_to_table(coalesce(s.ports_summary, ''), '[,;]') as port
  where
    s.depart_date >= (now() at time zone 'UTC')::date
    and sh.home_port = 'Galveston'
    and trim(port) <> ''
),
canonical_ports as (
  select
    duration,
    coalesce(a.canonical_name, initcap(raw_port)) as destination_name
  from raw_ports rp
  left join public.destination_aliases a
    on rp.raw_port = a.alias
)
select distinct
  regexp_replace(lower(destination_name), '[^a-z0-9]+', '-', 'g') as destination_slug,
  case when duration >= 8 then '8-day' else duration || '-day' end as duration_slug,
  destination_name || ' ' ||
  case when duration >= 8 then '8+ Day' else duration || ' Day' end ||
  ' Cruises from Galveston' as seo_title,
  destination_name || ' ' ||
  case when duration >= 8 then '8+ Day' else duration || ' Day' end ||
  ' cruises departing Galveston' as seo_h1
from canonical_ports;

-- Fix: destination_faqs
create or replace view public.destination_faqs as
with destination_stats as (
  select
    trim(lower(port)) as raw_port,
    count(*) as sailing_count,
    min(s.duration) as min_duration,
    max(s.duration) as max_duration
  from public.sailings s
  join public.ships sh on sh.id = s.ship_id
  cross join lateral regexp_split_to_table(coalesce(s.ports_summary, ''), '[,;]') as port
  where
    s.depart_date >= (now() at time zone 'UTC')::date
    and sh.home_port = 'Galveston'
    and trim(port) <> ''
  group by trim(lower(port))
),
canonical_ports as (
  select
    coalesce(a.canonical_name, initcap(raw_port)) as destination_name,
    sailing_count,
    min_duration,
    max_duration
  from destination_stats ds
  left join public.destination_aliases a
    on ds.raw_port = a.alias
)
select
  regexp_replace(lower(destination_name), '[^a-z0-9]+', '-', 'g') as destination_slug,
  destination_name,
  'Are there cruises from Galveston to ' || destination_name || '?' as question_1,
  'Yes. There are ' || sailing_count ||
  ' upcoming cruises from Galveston that visit ' ||
  destination_name || '.' as answer_1,
  'How many days is a cruise from Galveston to ' || destination_name || '?' as question_2,
  'Cruises from Galveston to ' || destination_name ||
  ' typically range from ' || min_duration || ' Day to ' ||
  case when max_duration >= 8 then '8+ Day' else max_duration || ' Day' end || ' sailings.' as answer_2
from canonical_ports;

-- Fix: ship_group_duration_seo_pages
create or replace view public.ship_group_duration_seo_pages as
with raw_ports as (
  select
    s.id as sailing_id,
    sh.id as ship_id,
    sh.name as ship_name,
    lower(regexp_replace(sh.name, '[^a-zA-Z0-9]+', '-', 'g')) as ship_slug,
    ((s.return_date - s.depart_date) + 1) as duration_days,
    trim(lower(port)) as raw_port
  from public.sailings s
  join public.ships sh on sh.id = s.ship_id
  cross join lateral regexp_split_to_table(coalesce(s.ports_summary, ''), '[,;]') as port
  where
    s.depart_date >= (now() at time zone 'UTC')::date
    and sh.home_port = 'Galveston'
    and trim(port) <> ''
),
canonical_ports as (
  select
    ship_id,
    ship_name,
    ship_slug,
    duration_days,
    coalesce(a.canonical_name, initcap(raw_port)) as destination_name
  from raw_ports rp
  left join public.destination_aliases a
    on rp.raw_port = a.alias
),
grouped as (
  select
    ship_id,
    ship_name,
    ship_slug,
    duration_days,
    destination_name
  from canonical_ports cp
  where exists (
    select 1
    from public.destination_group_members dgm
    where dgm.destination_name = cp.destination_name
  )
)
select distinct
  ship_id,
  ship_name,
  ship_slug,
  (select group_slug from public.destination_group_members dgm where dgm.destination_name = g.destination_name limit 1) as group_slug,
  (select group_name from public.destination_group_members dgm where dgm.destination_name = g.destination_name limit 1) as group_name,
  duration_days,
  case when duration_days >= 8 then '8-day' else duration_days || '-day' end as duration_slug,
  ship_name || ' ' ||
  (select group_name from public.destination_group_members dgm where dgm.destination_name = g.destination_name limit 1) || ' ' ||
  case when duration_days >= 8 then '8+ Day' else duration_days || ' Day' end ||
  ' Cruises from Galveston' as seo_title,
  ship_name || ' ' ||
  (select group_name from public.destination_group_members dgm where dgm.destination_name = g.destination_name limit 1) || ' ' ||
  case when duration_days >= 8 then '8+ Day' else duration_days || ' Day' end ||
  ' cruises departing Galveston' as seo_h1,
  'Browse ' || ship_name || ' cruises from Galveston visiting ' ||
  (select group_name from public.destination_group_members dgm where dgm.destination_name = g.destination_name limit 1) ||
  ' on ' ||
  case when duration_days >= 8 then '8+ Day' else duration_days || ' Day' end ||
  ' itineraries.' as seo_description
from grouped g;

-- Fix: jamaica_duration_seo_pages
create or replace view public.jamaica_duration_seo_pages as
with jamaica_sailings as (
  select distinct
    s.id as sailing_id,
    ((s.return_date - s.depart_date) + 1) as duration_days,
    coalesce(a.canonical_name, initcap(trim(lower(port)))) as destination_name
  from public.sailings s
  join public.ships sh on sh.id = s.ship_id
  cross join lateral regexp_split_to_table(
    coalesce(s.ports_summary, ''),
    '[,;]'
  ) as port
  left join public.destination_aliases a
    on trim(lower(port)) = a.alias
  where
    sh.home_port = 'Galveston'
    and s.depart_date >= (now() at time zone 'UTC')::date
),
jamaica_only as (
  select
    sailing_id,
    duration_days
  from jamaica_sailings
  where destination_name in ('Montego Bay', 'Falmouth', 'Ocho Rios')
    and duration_days <> 5
)
select
  duration_days,
  duration_days || '-day' as duration_slug,
  'Jamaica ' || duration_days || ' Day Cruises from Galveston' as seo_title,
  'Jamaica ' || duration_days || ' Day cruises departing from Galveston' as seo_h1,
  'Browse ' || duration_days || ' day cruises from Galveston to Jamaica, ' ||
  'including visits to Montego Bay, Falmouth, and Ocho Rios.' as seo_description,
  count(distinct sailing_id) as sailing_count
from jamaica_only
group by duration_days
order by duration_days;

-- Fix: jamaica_cruise_line_duration_seo_pages
create or replace view public.jamaica_cruise_line_duration_seo_pages as
with jamaica_sailings as (
  select distinct
    s.id as sailing_id,
    sh.cruise_line,
    lower(regexp_replace(sh.cruise_line, '[^a-zA-Z0-9]+', '-', 'g')) as cruise_line_slug,
    ((s.return_date - s.depart_date) + 1) as duration_days,
    coalesce(a.canonical_name, initcap(trim(lower(port)))) as destination_name
  from public.sailings s
  join public.ships sh on sh.id = s.ship_id
  cross join lateral regexp_split_to_table(
    coalesce(s.ports_summary, ''),
    '[,;]'
  ) as port
  left join public.destination_aliases a
    on trim(lower(port)) = a.alias
  where
    sh.home_port = 'Galveston'
    and s.depart_date >= (now() at time zone 'UTC')::date
),
jamaica_only as (
  select
    sailing_id,
    cruise_line,
    cruise_line_slug,
    duration_days,
    destination_name
  from jamaica_sailings
  where destination_name in ('Montego Bay', 'Falmouth', 'Ocho Rios')
),
validated as (
  select distinct
    jo.sailing_id,
    jo.cruise_line,
    jo.cruise_line_slug,
    jo.duration_days
  from jamaica_only jo
  join public.destination_docking_rules ddr
    on ddr.cruise_line = jo.cruise_line
   and ddr.destination_name = jo.destination_name
)
select
  cruise_line,
  cruise_line_slug,
  duration_days,
  duration_days || '-day' as duration_slug,
  'Jamaica ' || duration_days || ' Day ' || cruise_line || ' Cruises from Galveston' as seo_title,
  'Jamaica ' || duration_days || ' Day ' || cruise_line || ' cruises departing from Galveston' as seo_h1,
  'Browse ' || duration_days || ' day Jamaica cruises from Galveston with ' ||
  cruise_line ||
  ', including port calls in Montego Bay, Falmouth, and Ocho Rios.' as seo_description,
  count(distinct sailing_id) as sailing_count
from validated
group by cruise_line, cruise_line_slug, duration_days
order by cruise_line, duration_days;

-- ============================================================================
-- GUARDRAILS: Prevent future drift and provide health monitoring
-- ============================================================================

-- Guardrail 1: Schema Comment (Source-of-Truth Lock)
-- Documents intent so future edits don't drift back to sail_date
comment on column public.sailings.depart_date is
'Source-of-truth sailing departure date. Public views may alias this as sail_date for frontend compatibility.';

-- Guardrail 2: Inventory Health Check View
-- If this returns 0 rows, something is wrong upstream
create or replace view public.inventory_health_check as
select
  count(*) as upcoming_sailings,
  min(sail_date) as next_sailing,
  max(sail_date) as last_loaded_sailing,
  case
    when count(*) = 0 then '❌ ERROR: No future sailings'
    when min(sail_date) > (now() at time zone 'UTC')::date + 30
      then '⚠️ WARNING: No sailings in next 30 days'
    else '✅ OK'
  end as status
from public.ship_destination_duration_seo_pages;

-- Grant permissions
grant select on public.ship_destination_duration_seo_pages to anon;
grant select on public.inventory_health_check to anon;
grant select on public.future_sailings_list to anon;
grant select on public.ship_future_sailing_counts to anon;
grant select on public.ship_future_sailings to anon;
grant select on public.duration_seo_pages to anon;
grant select on public.ship_seo_pages to anon;
grant select on public.ship_duration_seo_pages to anon;
grant select on public.cruise_line_seo_pages to anon;
grant select on public.cruise_line_ship_pages to anon;
grant select on public.cruise_line_duration_seo_pages to anon;
grant select on public.port_destination_seo_pages to anon;
grant select on public.destination_duration_seo_pages to anon;
grant select on public.destination_faqs to anon;
grant select on public.ship_group_duration_seo_pages to anon;
grant select on public.jamaica_duration_seo_pages to anon;
grant select on public.jamaica_cruise_line_duration_seo_pages to anon;
