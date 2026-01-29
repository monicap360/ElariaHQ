-- SEO views for Cruises From Galveston
-- Run in Supabase SQL editor or migration.

-- Destination alias map (one time).
create table if not exists public.destination_aliases (
  alias text primary key,
  canonical_name text not null
);

insert into public.destination_aliases (alias, canonical_name) values
  ('perfect day', 'Perfect Day at CocoCay'),
  ('cococay', 'Perfect Day at CocoCay'),
  ('perfect day cococay', 'Perfect Day at CocoCay'),
  ('perfect day at cococay', 'Perfect Day at CocoCay'),
  ('costa-maya', 'Costa Maya'),
  ('costamaya', 'Costa Maya'),
  ('roatan', 'Roatán'),
  ('roatán', 'Roatán'),
  ('belize', 'Belize City'),
  ('belize city', 'Belize City'),
  ('grand cayman', 'Grand Cayman'),
  ('bimini', 'Bimini'),
  ('nassau', 'Nassau'),
  ('celebration key', 'Celebration Key')
  ,
  -- Mahogany Bay / Roatan
  ('mahogany bay', 'Roatán'),
  ('mahogany bay roatan', 'Roatán'),
  ('mahogany bay, roatan', 'Roatán'),
  ('roatan', 'Roatán'),
  ('roatán', 'Roatán')
  ,
  -- Curaçao / Aruba
  ('willemstad', 'Willemstad'),
  ('willemstad curacao', 'Willemstad'),
  ('oranjestad', 'Oranjestad'),
  ('oranjestad aruba', 'Oranjestad'),
  -- Bonaire
  ('kralendijk', 'Kralendijk'),
  ('kralendijk bonaire', 'Kralendijk'),
  ('bonaire', 'Kralendijk'),
  -- Sint Eustatius (Statia)
  ('sint eustatius', 'Sint Eustatius'),
  ('st eustatius', 'Sint Eustatius'),
  ('statia', 'Sint Eustatius'),
  -- Jamaica (new port)
  ('ocho rios', 'Ocho Rios'),
  -- Florida / Atlantic crossover
  ('port canaveral', 'Port Canaveral'),
  ('miami', 'Miami'),
  -- Puerto Rico
  ('san juan', 'San Juan'),
  -- British Virgin Islands
  ('tortola', 'Tortola'),
  ('bvi', 'Tortola'),
  -- St. Maarten / St. Martin
  ('philipsburg', 'Philipsburg'),
  ('st maarten', 'Philipsburg'),
  ('st martin', 'Philipsburg'),
  -- St. Barts
  ('gustavia', 'Gustavia'),
  ('st barts', 'Gustavia'),
  ('saint barthelemy', 'Gustavia'),
  -- Antigua
  ('st johns', 'St. John’s'),
  ('st john’s', 'St. John’s'),
  ('antigua', 'St. John’s'),
  -- Guatemala
  ('santo tomas de castilla', 'Santo Tomás de Castilla'),
  ('puerto santo tomas', 'Santo Tomás de Castilla'),
  -- Cayman Islands wording
  ('georgetown', 'Georgetown'),
  ('georgetown grand cayman', 'Georgetown'),
  -- Jamaica ports + general
  ('falmouth', 'Falmouth'),
  ('montego bay', 'Montego Bay'),
  ('ocho rios', 'Ocho Rios'),
  ('jamaica', 'Jamaica')
  ,
  -- RelaxAway / Half Moon Cay
  ('half moon cay', 'RelaxAway, Half Moon Cay'),
  ('half-moon-cay', 'RelaxAway, Half Moon Cay'),
  ('relaxaway half moon cay', 'RelaxAway, Half Moon Cay'),
  ('relaxaway, half moon cay', 'RelaxAway, Half Moon Cay'),
  ('carnival half moon cay', 'RelaxAway, Half Moon Cay')
  ,
  -- Great Stirrup Cay
  ('great stirrup cay', 'Great Stirrup Cay'),
  ('great-stirrup-cay', 'Great Stirrup Cay'),
  ('norwegian great stirrup cay', 'Great Stirrup Cay'),
  ('ncl great stirrup cay', 'Great Stirrup Cay')
on conflict (alias) do nothing;

-- Destination group mapping (optional taxonomy).
create table if not exists public.destination_groups (
  group_slug text primary key,
  group_name text not null,
  seo_title text,
  seo_h1 text,
  seo_description text
);

create table if not exists public.destination_group_members (
  destination_name text not null,
  group_slug text not null,
  primary key (destination_name, group_slug)
);

-- Destination groups (if missing).
insert into public.destination_groups
(group_slug, group_name, seo_title, seo_h1, seo_description)
values
  (
    'eastern-caribbean',
    'Eastern Caribbean',
    'Eastern Caribbean Cruises from Galveston',
    'Eastern Caribbean cruises departing from Galveston',
    'Explore Eastern Caribbean cruises from Galveston visiting Puerto Rico, the Virgin Islands, St. Maarten, Antigua, and more.'
  ),
  (
    'atlantic-crossings',
    'Atlantic Crossings',
    'Atlantic Cruises from Galveston',
    'Atlantic cruises departing from Galveston',
    'Browse repositioning and crossover cruises involving Galveston and Atlantic ports.'
  )
on conflict (group_slug) do nothing;

insert into public.destination_group_members (destination_name, group_slug) values
  ('Roatán', 'western-caribbean'),
  ('Cozumel', 'western-caribbean'),
  ('Belize City', 'western-caribbean'),
  ('Montego Bay', 'western-caribbean'),
  ('Grand Cayman', 'western-caribbean'),
  -- Southern Caribbean
  ('Willemstad', 'southern-caribbean'),
  ('Oranjestad', 'southern-caribbean'),
  ('Kralendijk', 'southern-caribbean'),
  -- Eastern Caribbean
  ('Sint Eustatius', 'eastern-caribbean'),
  ('Philipsburg', 'eastern-caribbean'),
  ('Gustavia', 'eastern-caribbean'),
  ('St. John’s', 'eastern-caribbean'),
  ('Tortola', 'eastern-caribbean'),
  ('San Juan', 'eastern-caribbean'),
  -- Jamaica
  ('Falmouth', 'western-caribbean'),
  ('Ocho Rios', 'western-caribbean'),
  -- Central America
  ('Santo Tomás de Castilla', 'central-america'),
  -- Florida / Atlantic
  ('Miami', 'atlantic-crossings'),
  ('Port Canaveral', 'atlantic-crossings')
on conflict do nothing;

insert into public.destination_group_members (destination_name, group_slug) values
  ('RelaxAway, Half Moon Cay', 'bahamas')
on conflict do nothing;

insert into public.destination_group_members (destination_name, group_slug) values
  ('Great Stirrup Cay', 'bahamas')
on conflict do nothing;

-- Destination docking rules (control data).
create table if not exists public.destination_docking_rules (
  destination_name text not null,
  cruise_line text not null,
  primary key (destination_name, cruise_line)
);

insert into public.destination_docking_rules (destination_name, cruise_line) values
  ('Falmouth', 'Royal Caribbean'),
  ('Montego Bay', 'Carnival'),
  ('Ocho Rios', 'Carnival'),
  ('Ocho Rios', 'Norwegian'),
  ('RelaxAway, Half Moon Cay', 'Carnival'),
  ('Great Stirrup Cay', 'Norwegian')
on conflict do nothing;

create table if not exists public.destination_metadata (
  destination_name text primary key,
  destination_type text,
  is_private_island boolean,
  operator text,
  notes text
);

insert into public.destination_metadata
(destination_name, destination_type, is_private_island, operator, notes)
values
(
  'RelaxAway, Half Moon Cay',
  'private-island',
  true,
  'Carnival',
  'Renamed from Half Moon Cay to RelaxAway, Half Moon Cay starting 2026'
)
on conflict (destination_name) do nothing;

insert into public.destination_metadata
(destination_name, destination_type, is_private_island, operator, notes)
values
(
  'Great Stirrup Cay',
  'private-island',
  true,
  'Norwegian',
  'Norwegian Cruise Line private island in The Bahamas; featured on longer Caribbean itineraries from Galveston'
)
on conflict (destination_name) do nothing;

-- Private island experiences (control data).
create table if not exists public.destination_experiences (
  destination_name text not null,
  experience_slug text not null,
  experience_name text not null,
  description text,
  operator text,
  is_active boolean default true,
  primary key (destination_name, experience_slug)
);

insert into public.destination_experiences
(destination_name, experience_slug, experience_name, description, operator)
values
(
  'RelaxAway, Half Moon Cay',
  'horseback-riding',
  'Horseback Riding',
  'Ride trained quarter horses along scenic island trails and the back bay to Pegasus Ranch.',
  'Carnival'
),
(
  'RelaxAway, Half Moon Cay',
  'jet-skis',
  'Guided Jet Ski Adventure',
  'Explore the inner saltwater lagoon and coastal inlets on a guided jet ski excursion.',
  'Carnival'
),
(
  'RelaxAway, Half Moon Cay',
  'beach-club',
  'Private Beach Club',
  'Relax at the expanded beachfront with cabanas, loungers, island bars, and complimentary lunch.',
  'Carnival'
)
on conflict do nothing;

insert into public.destination_experiences
(destination_name, experience_slug, experience_name, description, operator)
values
(
  'Great Stirrup Cay',
  'water-park',
  'Island Water Park',
  'Race down towering water slides and enjoy one of the largest pools at sea on a private island.',
  'Norwegian'
),
(
  'Great Stirrup Cay',
  'jet-skis',
  'Jet Ski Adventures',
  'Ride jet skis along the coast with guided tours around reefs and island coves.',
  'Norwegian'
),
(
  'Great Stirrup Cay',
  'cabanas',
  'Private Cabanas',
  'Reserve a private cabana for shaded relaxation, ocean views, and premium service.',
  'Norwegian'
)
on conflict do nothing;

create or replace view public.private_island_experience_seo_pages as
select
  de.destination_name,
  lower(regexp_replace(de.destination_name, '[^a-zA-Z0-9]+', '-', 'g')) as destination_slug,
  de.experience_slug,
  de.experience_name,
  de.operator,
  de.experience_name || ' at ' || de.destination_name || ' from Galveston' as seo_title,
  de.experience_name || ' at ' || de.destination_name as seo_h1,
  de.description as seo_description
from public.destination_experiences de
where de.is_active = true;

create or replace view public.destination_docking_summary as
select
  destination_name,
  array_agg(cruise_line order by cruise_line) as cruise_lines
from public.destination_docking_rules
group by destination_name;

-- Jamaica hub SEO page.
create or replace view public.jamaica_hub_seo_page as
with jamaica_ports as (
  select distinct
    dgm.destination_name
  from public.destination_group_members dgm
  where dgm.group_slug = 'western-caribbean'
    and dgm.destination_name in ('Falmouth', 'Montego Bay', 'Ocho Rios')
),
jamaica_docking as (
  select
    dds.destination_name,
    dds.cruise_lines
  from public.destination_docking_summary dds
  where dds.destination_name in ('Falmouth', 'Montego Bay', 'Ocho Rios')
)
select
  'jamaica' as hub_slug,
  'Jamaica Cruises from Galveston' as seo_title,
  'Jamaica cruises departing from Galveston' as seo_h1,
  'Explore cruises from Galveston to Jamaica, with port calls in Montego Bay, Falmouth, and Ocho Rios. Compare cruise lines, itineraries, and departure dates.' as seo_description,
  array_agg(jp.destination_name order by jp.destination_name) as jamaica_ports,
  jsonb_object_agg(
    jd.destination_name,
    jd.cruise_lines
  ) as docking_by_port
from jamaica_ports jp
left join jamaica_docking jd
  on jd.destination_name = jp.destination_name;

-- Jamaica x duration pages (ports_summary text + alias map).
create or replace view public.jamaica_duration_seo_pages as
with jamaica_sailings as (
  select distinct
    s.id as sailing_id,
    ((s.return_date - s.sail_date) + 1) as duration_days,
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
    and s.sail_date >= (now() at time zone 'UTC')::date
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

-- Jamaica x cruise line x duration pages (docking rules enforced).
create or replace view public.jamaica_cruise_line_duration_seo_pages as
with jamaica_sailings as (
  select distinct
    s.id as sailing_id,
    sh.cruise_line,
    lower(regexp_replace(sh.cruise_line, '[^a-zA-Z0-9]+', '-', 'g')) as cruise_line_slug,
    ((s.return_date - s.sail_date) + 1) as duration_days,
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
    and s.sail_date >= (now() at time zone 'UTC')::date
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
-- Future sailings list (Galveston only).
create or replace view public.future_sailings_list as
select
  s.id as sailing_id,
  s.sail_date,
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
  s.sail_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston'
order by s.sail_date asc;

-- Ship counts.
create or replace view public.ship_future_sailing_counts as
select
  sh.id as ship_id,
  sh.name as ship_name,
  sh.cruise_line,
  sh.home_port,
  count(s.id) as future_sailing_count,
  min(s.sail_date) as next_sailing_date,
  max(s.sail_date) as last_sailing_date
from public.ships sh
join public.sailings s on s.ship_id = sh.id
where
  s.sail_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston'
group by sh.id, sh.name, sh.cruise_line, sh.home_port
order by future_sailing_count desc, next_sailing_date asc;

-- Ship future sailings.
create or replace view public.ship_future_sailings as
select
  sh.id as ship_id,
  sh.name as ship_name,
  sh.cruise_line,
  sh.home_port,
  s.id as sailing_id,
  s.sail_date,
  s.return_date,
  s.duration,
  s.itinerary_code
from public.ships sh
join public.sailings s on s.ship_id = sh.id
where
  s.sail_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston'
order by sh.name, s.sail_date;

-- Duration SEO pages.
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
  s.sail_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Ship SEO pages.
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
  s.sail_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Ship x Duration SEO pages.
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
  s.sail_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Cruise line SEO pages.
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
  s.sail_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Cruise line -> ship pages.
create or replace view public.cruise_line_ship_pages as
select distinct
  lower(regexp_replace(sh.cruise_line, '[^a-zA-Z0-9]+', '-', 'g')) as cruise_line_slug,
  lower(regexp_replace(sh.name, '[^a-zA-Z0-9]+', '-', 'g')) as ship_slug,
  sh.name as ship_name,
  sh.cruise_line
from public.ships sh
join public.sailings s on s.ship_id = sh.id
where
  s.sail_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Cruise line x duration pages.
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
  s.sail_date >= (now() at time zone 'UTC')::date
  and sh.home_port = 'Galveston';

-- Port-level destination SEO pages (ports_summary text).
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
    s.sail_date >= (now() at time zone 'UTC')::date
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

-- Destination x duration pages (ports_summary text).
create or replace view public.destination_duration_seo_pages as
with raw_ports as (
  select
    s.duration,
    trim(lower(port)) as raw_port
  from public.sailings s
  join public.ships sh on sh.id = s.ship_id
  cross join lateral regexp_split_to_table(coalesce(s.ports_summary, ''), '[,;]') as port
  where
    s.sail_date >= (now() at time zone 'UTC')::date
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

-- Destination FAQs (ports_summary text).
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
    s.sail_date >= (now() at time zone 'UTC')::date
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

-- Ship x destination x duration pages (ports_summary text + alias map).
create or replace view public.ship_destination_duration_seo_pages as
with raw_ports as (
  select
    s.id as sailing_id,
    s.duration,
    sh.id as ship_id,
    sh.name as ship_name,
    lower(regexp_replace(sh.name, '[^a-zA-Z0-9]+', '-', 'g')) as ship_slug,
    trim(lower(port)) as raw_port
  from public.sailings s
  join public.ships sh on sh.id = s.ship_id
  cross join lateral regexp_split_to_table(coalesce(s.ports_summary, ''), '[,;]') as port
  where
    s.sail_date >= (now() at time zone 'UTC')::date
    and sh.home_port = 'Galveston'
    and trim(port) <> ''
),
canonical_ports as (
  select
    ship_id,
    ship_name,
    ship_slug,
    duration,
    coalesce(a.canonical_name, initcap(raw_port)) as destination_name
  from raw_ports rp
  left join public.destination_aliases a
    on rp.raw_port = a.alias
)
select distinct
  ship_id,
  ship_name,
  ship_slug,
  regexp_replace(lower(destination_name), '[^a-z0-9]+', '-', 'g') as destination_slug,
  destination_name,
  case when duration >= 8 then '8-day' else duration || '-day' end as duration_slug,
  ship_name || ' ' ||
  destination_name || ' ' ||
  case when duration >= 8 then '8+ Day' else duration || ' Day' end ||
  ' Cruises from Galveston' as seo_title,
  ship_name || ' ' ||
  destination_name || ' ' ||
  case when duration >= 8 then '8+ Day' else duration || ' Day' end ||
  ' cruises departing Galveston' as seo_h1,
  'Browse ' || ship_name || ' cruises from Galveston visiting ' || destination_name ||
  ' on ' ||
  case when duration >= 8 then '8+ Day' else duration || ' Day' end ||
  ' itineraries.' as seo_description
from canonical_ports;

-- Ship x group x duration pages (ports_summary text + alias map + groups).
create or replace view public.ship_group_duration_seo_pages as
with raw_ports as (
  select
    s.id as sailing_id,
    sh.id as ship_id,
    sh.name as ship_name,
    lower(regexp_replace(sh.name, '[^a-zA-Z0-9]+', '-', 'g')) as ship_slug,
    ((s.return_date - s.sail_date) + 1) as duration_days,
    trim(lower(port)) as raw_port
  from public.sailings s
  join public.ships sh on sh.id = s.ship_id
  cross join lateral regexp_split_to_table(coalesce(s.ports_summary, ''), '[,;]') as port
  where
    s.sail_date >= (now() at time zone 'UTC')::date
    and sh.home_port = 'Galveston'
    and trim(port) <> ''
),
canonical_ports as (
  select
    rp.ship_id,
    rp.ship_name,
    rp.ship_slug,
    rp.duration_days,
    coalesce(a.canonical_name, initcap(rp.raw_port)) as destination_name
  from raw_ports rp
  left join public.destination_aliases a
    on rp.raw_port = a.alias
),
grouped as (
  select
    cp.ship_id,
    cp.ship_name,
    cp.ship_slug,
    cp.duration_days,
    dg.group_slug,
    dg.group_name
  from canonical_ports cp
  join public.destination_group_members dgm
    on dgm.destination_name = cp.destination_name
  join public.destination_groups dg
    on dg.group_slug = dgm.group_slug
)
select distinct
  ship_id,
  ship_name,
  ship_slug,
  group_slug,
  group_name,
  duration_days,
  duration_days || '-day' as duration_slug,
  ship_name || ' ' ||
  group_name || ' ' ||
  duration_days || ' Day Cruises from Galveston' as seo_title,
  ship_name || ' ' ||
  group_name || ' ' ||
  duration_days || ' Day cruises departing from Galveston' as seo_h1,
  'Browse ' || duration_days || ' day ' ||
  group_name || ' cruises from Galveston aboard ' ||
  ship_name ||
  '. View sailing dates and itinerary details.' as seo_description
from grouped;

-- Private islands hub SEO page.
create or replace view public.private_islands_hub_seo_page as
with private_islands as (
  select
    dm.destination_name,
    lower(regexp_replace(dm.destination_name, '[^a-zA-Z0-9]+', '-', 'g')) as destination_slug,
    dm.operator,
    dm.notes
  from public.destination_metadata dm
  where dm.is_private_island = true
),
inventory_check as (
  select distinct
    pi.destination_name,
    pi.destination_slug,
    pi.operator,
    pi.notes
  from private_islands pi
  join public.ship_destination_duration_seo_pages sdds
    on sdds.destination_name = pi.destination_name
)
select
  'private-islands' as hub_slug,
  'Private Island Cruises from Galveston' as seo_title,
  'Private island cruises departing from Galveston' as seo_h1,
  'Explore private island cruises from Galveston, including exclusive destinations like RelaxAway, Half Moon Cay and Great Stirrup Cay. Compare cruise lines, durations, and departure dates.' as seo_description,
  jsonb_agg(
    jsonb_build_object(
      'destination_name', destination_name,
      'destination_slug', destination_slug,
      'operator', operator,
      'notes', notes
    )
    order by destination_name
  ) as private_islands
from inventory_check;

-- Private island x cruise line pages.
create or replace view public.private_island_cruise_line_seo_pages as
with private_islands as (
  select
    dm.destination_name,
    lower(regexp_replace(dm.destination_name, '[^a-zA-Z0-9]+', '-', 'g')) as destination_slug,
    dm.operator
  from public.destination_metadata dm
  where dm.is_private_island = true
),
inventory_check as (
  select distinct
    pi.destination_name,
    pi.destination_slug,
    pi.operator as cruise_line,
    lower(regexp_replace(pi.operator, '[^a-zA-Z0-9]+', '-', 'g')) as cruise_line_slug
  from private_islands pi
  join public.ship_destination_duration_seo_pages sdds
    on sdds.destination_name = pi.destination_name
   and sdds.cruise_line = pi.operator
)
select
  destination_name,
  destination_slug,
  cruise_line,
  cruise_line_slug,
  destination_name || ' Cruises from Galveston on ' || cruise_line as seo_title,
  cruise_line || ' cruises to ' || destination_name || ' from Galveston' as seo_h1,
  'Explore ' || cruise_line || ' cruises from Galveston to ' || destination_name ||
  ', an exclusive private island experience. View itineraries, durations, and sailing dates.' as seo_description
from inventory_check
order by destination_name, cruise_line;

-- Public read access (views only).
grant select on
  public.future_sailings_list,
  public.ship_future_sailing_counts,
  public.ship_future_sailings,
  public.duration_seo_pages,
  public.ship_seo_pages,
  public.ship_duration_seo_pages,
  public.cruise_line_seo_pages,
  public.cruise_line_ship_pages,
  public.cruise_line_duration_seo_pages,
  public.destination_aliases,
  public.destination_groups,
  public.destination_group_members,
  public.port_destination_seo_pages,
  public.destination_duration_seo_pages,
  public.destination_faqs,
  public.ship_destination_duration_seo_pages,
  public.ship_group_duration_seo_pages,
  public.destination_docking_summary,
  public.jamaica_hub_seo_page,
  public.jamaica_duration_seo_pages,
  public.jamaica_cruise_line_duration_seo_pages,
  public.destination_metadata,
  public.private_islands_hub_seo_page,
  public.private_island_cruise_line_seo_pages,
  public.destination_experiences,
  public.private_island_experience_seo_pages
to anon;
