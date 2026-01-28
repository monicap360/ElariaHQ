-- Seed: Carnival Legend (Caribbean & Panama) sailing from Galveston
-- Requires: ships table has a row named "Carnival Legend"

insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  '2026-03-16'::date,
  '2026-03-26'::date,
  10,
  true,
  'Caribbean & Panama',
  'Cozumel, Limón, Colón (Panama Canal) & Mahogany Bay'
from public.ships sh
where sh.name = 'Carnival Legend';

-- Seed: April 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Breeze', '2026-04-06'::date, 4, 'Mexico', 'Cozumel & Progreso', 469),
      ('Carnival Legend', '2026-04-09'::date, 3, 'Mexico', 'Cozumel & Progreso', 469),
      ('Carnival Breeze', '2026-04-11'::date, 4, 'Mexico', 'Cozumel & Progreso', 479),
      ('Carnival Jubilee', '2026-04-11'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 694),
      ('Carnival Dream', '2026-04-12'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 544),
      ('Carnival Legend', '2026-04-13'::date, 9, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 1079),
      ('Carnival Breeze', '2026-04-16'::date, 3, 'Mexico', 'Cozumel & Progreso', 434),
      ('Carnival Jubilee', '2026-04-18'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 694),
      ('Carnival Dream', '2026-04-18'::date, 7, 'The Bahamas', 'Nassau & Freeport', 934),
      ('Carnival Breeze', '2026-04-20'::date, 4, 'Mexico', 'Cozumel & Progreso', 479)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Late May / early June 2027 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Horizon', '2027-05-19'::date, 7, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 904),
      ('Carnival Breeze', '2027-05-22'::date, 6, 'The Bahamas', 'Nassau & Freeport', 844),
      ('Carnival Jubilee', '2027-05-23'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 859),
      ('Carnival Horizon', '2027-05-27'::date, 3, 'Mexico', 'Cozumel & Progreso', 674),
      ('Carnival Breeze', '2027-05-29'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 1024),
      ('Carnival Jubilee', '2027-05-29'::date, 7, 'The Bahamas', 'Nassau & Freeport', 1234),
      ('Carnival Horizon', '2027-05-31'::date, 4, 'Mexico', 'Cozumel & Progreso', 774),
      ('Carnival Breeze', '2027-06-05'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 1104),
      ('Carnival Horizon', '2027-06-05'::date, 4, 'Mexico', 'Cozumel & Progreso', 784),
      ('Carnival Jubilee', '2027-06-06'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 919)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: May 2027 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Dream', '2027-05-01'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 739),
      ('Carnival Jubilee', '2027-05-01'::date, 7, 'The Bahamas', 'Nassau & Freeport', 934),
      ('Carnival Breeze', '2027-05-03'::date, 4, 'Mexico', 'Cozumel & Progreso', 539),
      ('Carnival Miracle', '2027-05-06'::date, 14, 'Transatlantic', 'Bermuda, Ponta Delgada, Funchal & Lisbon', 944),
      ('Carnival Breeze', '2027-05-08'::date, 4, 'Mexico', 'Cozumel & Progreso', 559),
      ('Carnival Dream', '2027-05-08'::date, 6, 'The Bahamas', 'Nassau & Freeport', 844),
      ('Carnival Jubilee', '2027-05-09'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 689),
      ('Carnival Breeze', '2027-05-13'::date, 3, 'Mexico', 'Cozumel & Progreso', 539),
      ('Carnival Jubilee', '2027-05-15'::date, 7, 'The Bahamas', 'Nassau & Freeport', 1024),
      ('Carnival Breeze', '2027-05-17'::date, 4, 'Mexico', 'Cozumel & Progreso', 639)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Correction: Carnival Miracle Transatlantic (May 6, 2027)
update public.sailings s
set
  nights = 14,
  return_date = (s.depart_date + interval '14 days')::date,
  itinerary_label = 'Transatlantic',
  ports_summary = 'Bermuda, Ponta Delgada, Funchal & Lisbon'
from public.ships sh
where sh.id = s.ship_id
  and sh.name = 'Carnival Miracle'
  and s.depart_date = '2027-05-06'::date;

-- Seed: April 2027 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Breeze', '2027-04-15'::date, 3, 'Mexico', 'Cozumel & Progreso', 509),
      ('Carnival Dream', '2027-04-17'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 699),
      ('Carnival Jubilee', '2027-04-17'::date, 7, 'The Bahamas', 'Nassau & Freeport', 924),
      ('Carnival Breeze', '2027-04-19'::date, 4, 'Mexico', 'Cozumel & Progreso', 489),
      ('Carnival Miracle', '2027-04-22'::date, 3, 'Mexico', 'Cozumel & Progreso', 539),
      ('Carnival Breeze', '2027-04-24'::date, 4, 'Mexico', 'Cozumel & Progreso', 489),
      ('Carnival Dream', '2027-04-24'::date, 6, 'The Bahamas', 'Nassau & Freeport', 799),
      ('Carnival Jubilee', '2027-04-25'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 649),
      ('Carnival Miracle', '2027-04-26'::date, 9, 'Caribbean & Panama', 'Cozumel, Limón, Colón (Panama Canal) & Mahogany Bay', 1079),
      ('Carnival Breeze', '2027-04-29'::date, 3, 'Mexico', 'Cozumel & Progreso', 529)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Carnival Miracle Eastern Caribbean sailing (Mar 29, 2027)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Miracle', '2027-03-29'::date, 10, 'Eastern Caribbean', 'Celebration Key, Half Moon Cay, Grand Turk & Amber Cove', 994)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Mid/late March 2027 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Jubilee', '2027-03-14'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 859),
      ('Carnival Miracle', '2027-03-15'::date, 9, 'Eastern Caribbean', 'Eastern Caribbean ports', 994),
      ('Carnival Breeze', '2027-03-19'::date, 3, 'Mexico', 'Cozumel & Progreso', 549),
      ('Carnival Dream', '2027-03-20'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 794),
      ('Carnival Jubilee', '2027-03-20'::date, 8, 'The Bahamas', 'Nassau, Half Moon Cay & Celebration Key', 964),
      ('Carnival Breeze', '2027-03-23'::date, 3, 'Mexico', 'Cozumel & Progreso', 569),
      ('Carnival Miracle', '2027-03-25'::date, 3, 'Mexico', 'Cozumel & Progreso', 589),
      ('Carnival Breeze', '2027-03-27'::date, 4, 'Mexico', 'Cozumel & Progreso', 539),
      ('Carnival Dream', '2027-03-27'::date, 6, 'The Bahamas', 'Nassau & Freeport', 809),
      ('Carnival Jubilee', '2027-03-28'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 659)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Correction: Carnival Jubilee Bahamas sailing (Mar 20, 2027)
update public.sailings s
set
  nights = 8,
  return_date = (s.depart_date + interval '8 days')::date,
  itinerary_label = 'The Bahamas',
  ports_summary = 'Nassau, Half Moon Cay & Celebration Key'
from public.ships sh
where sh.id = s.ship_id
  and sh.name = 'Carnival Jubilee'
  and s.depart_date = '2027-03-20'::date;

-- Seed: Late Feb / early Mar 2027 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Jubilee', '2027-02-20'::date, 7, 'The Bahamas', 'Nassau & Freeport', 809),
      ('Carnival Breeze', '2027-02-22'::date, 3, 'Mexico', 'Cozumel & Progreso', 364),
      ('Carnival Miracle', '2027-02-25'::date, 3, 'Mexico', 'Cozumel & Progreso', 429),
      ('Carnival Dream', '2027-02-27'::date, 6, 'The Bahamas', 'Nassau & Freeport', 679),
      ('Carnival Jubilee', '2027-02-28'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 549),
      ('Carnival Miracle', '2027-03-01'::date, 3, 'Mexico', 'Cozumel & Progreso', 489),
      ('Carnival Miracle', '2027-03-05'::date, 9, 'Caribbean & Panama', 'Cozumel, Limón, Colón (Panama Canal) & Mahogany Bay', 1079),
      ('Carnival Dream', '2027-03-06'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 749),
      ('Carnival Jubilee', '2027-03-06'::date, 7, 'The Bahamas', 'Nassau & Freeport', 1124),
      ('Carnival Dream', '2027-03-13'::date, 6, 'The Bahamas', 'Nassau & Freeport', 989)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: February 2027 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Dream', '2027-02-06'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 619),
      ('Carnival Jubilee', '2027-02-06'::date, 7, 'The Bahamas', 'Nassau & Freeport', 809),
      ('Carnival Breeze', '2027-02-08'::date, 4, 'Mexico', 'Cozumel & Progreso', 409),
      ('Carnival Miracle', '2027-02-11'::date, 3, 'Mexico', 'Cozumel & Progreso', 439),
      ('Carnival Breeze', '2027-02-13'::date, 4, 'Mexico', 'Cozumel & Progreso', 429),
      ('Carnival Dream', '2027-02-13'::date, 6, 'The Bahamas', 'Nassau & Freeport', 689),
      ('Carnival Jubilee', '2027-02-14'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 569),
      ('Carnival Miracle', '2027-02-15'::date, 9, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 779),
      ('Carnival Breeze', '2027-02-18'::date, 3, 'Mexico', 'Cozumel & Progreso', 369),
      ('Carnival Dream', '2027-02-20'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 619)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Late Jan / early Feb 2027 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Miracle', '2027-01-18'::date, 9, 'Caribbean & Panama', 'Cozumel, Limón, Colón (Panama Canal) & Mahogany Bay', 909),
      ('Carnival Breeze', '2027-01-21'::date, 3, 'Mexico', 'Cozumel & Progreso', 359),
      ('Carnival Jubilee', '2027-01-23'::date, 7, 'The Bahamas', 'Nassau & Freeport', 799),
      ('Carnival Breeze', '2027-01-25'::date, 4, 'Mexico', 'Cozumel & Progreso', 369),
      ('Carnival Miracle', '2027-01-28'::date, 3, 'Mexico', 'Cozumel & Progreso', 409),
      ('Carnival Breeze', '2027-01-30'::date, 4, 'Mexico', 'Cozumel & Progreso', 369),
      ('Carnival Dream', '2027-01-30'::date, 6, 'The Bahamas', 'Nassau & Freeport', 679),
      ('Carnival Jubilee', '2027-01-31'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 529),
      ('Carnival Miracle', '2027-02-01'::date, 9, 'Eastern Caribbean', 'Eastern Caribbean ports', 814),
      ('Carnival Breeze', '2027-02-04'::date, 3, 'Mexico', 'Cozumel & Progreso', 369)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Late Dec 2026 / Jan 2027 Carnival sailings (Journeys + additions)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Dream', '2027-01-02'::date, 13, 'Southern Caribbean', 'Southern Caribbean ports', 1079),
      ('Carnival Jubilee', '2027-01-03'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 534),
      ('Carnival Miracle', '2027-01-04'::date, 9, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 779),
      ('Carnival Breeze', '2027-01-07'::date, 3, 'Mexico', 'Cozumel & Progreso', 349),
      ('Carnival Jubilee', '2027-01-09'::date, 7, 'The Bahamas', 'Nassau & Freeport', 799),
      ('Carnival Breeze', '2027-01-11'::date, 4, 'Mexico', 'Cozumel & Progreso', 369),
      ('Carnival Miracle', '2027-01-14'::date, 3, 'Mexico', 'Cozumel & Progreso', 409),
      ('Carnival Breeze', '2027-01-16'::date, 4, 'Mexico', 'Cozumel & Progreso', 379),
      ('Carnival Dream', '2027-01-16'::date, 13, 'Eastern Caribbean', 'Eastern Caribbean ports', 1119),
      ('Carnival Jubilee', '2027-01-17'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 524)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Late Dec 2026 / early Jan 2027 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Breeze', '2026-12-19'::date, 3, 'Mexico', 'Cozumel & Progreso', 539),
      ('Carnival Dream', '2026-12-19'::date, 7, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 1124),
      ('Carnival Miracle', '2026-12-21'::date, 4, 'Mexico', 'Cozumel & Progreso', 869),
      ('Carnival Breeze', '2026-12-23'::date, 4, 'Mexico', 'Cozumel & Progreso', 894),
      ('Carnival Jubilee', '2026-12-26'::date, 7, 'The Bahamas', 'Nassau & Freeport', 1629),
      ('Carnival Miracle', '2026-12-26'::date, 3, 'Mexico', 'Cozumel & Progreso', 769),
      ('Carnival Dream', '2026-12-27'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 939),
      ('Carnival Breeze', '2026-12-28'::date, 4, 'Mexico', 'Cozumel & Progreso', 914),
      ('Carnival Miracle', '2026-12-30'::date, 4, 'Mexico', 'Cozumel & Progreso', 889),
      ('Carnival Breeze', '2027-01-02'::date, 4, 'Mexico', 'Cozumel & Progreso', 409)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: December 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Breeze', '2026-12-05'::date, 4, 'Mexico', 'Cozumel & Progreso', 334),
      ('Carnival Dream', '2026-12-05'::date, 6, 'The Bahamas', 'Nassau & Freeport', 679),
      ('Carnival Jubilee', '2026-12-06'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 534),
      ('Carnival Miracle', '2026-12-07'::date, 9, 'Caribbean & Panama', 'Cozumel, Limón, Colón (Panama Canal) & Mahogany Bay', 909),
      ('Carnival Breeze', '2026-12-10'::date, 3, 'Mexico', 'Cozumel & Progreso', 359),
      ('Carnival Jubilee', '2026-12-12'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 534),
      ('Carnival Dream', '2026-12-12'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 564),
      ('Carnival Breeze', '2026-12-14'::date, 4, 'Mexico', 'Cozumel & Progreso', 354),
      ('Carnival Miracle', '2026-12-17'::date, 3, 'Mexico', 'Cozumel & Progreso', 539),
      ('Carnival Jubilee', '2026-12-18'::date, 7, 'The Bahamas', 'Nassau & Freeport', 1294)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Late Nov / early Dec 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Breeze', '2026-11-21'::date, 4, 'Mexico', 'Cozumel & Progreso', 589),
      ('Carnival Dream', '2026-11-21'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 894),
      ('Carnival Jubilee', '2026-11-22'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 824),
      ('Carnival Miracle', '2026-11-23'::date, 9, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 839),
      ('Carnival Breeze', '2026-11-26'::date, 3, 'Mexico', 'Cozumel & Progreso', 514),
      ('Carnival Dream', '2026-11-28'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 544),
      ('Carnival Jubilee', '2026-11-28'::date, 7, 'The Bahamas', 'Nassau & Freeport', 814),
      ('Carnival Breeze', '2026-11-30'::date, 4, 'Mexico', 'Cozumel & Progreso', 334),
      ('Carnival Miracle', '2026-12-03'::date, 3, 'Mexico', 'Cozumel & Progreso', 429)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Sep-Nov 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Breeze', '2026-09-03'::date, 3, 'Mexico', 'Cozumel & Progreso', 434),
      ('Carnival Dream', '2026-09-05'::date, 7, 'The Bahamas', 'Nassau & Freeport', 799),
      ('Carnival Jubilee', '2026-09-05'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 629),
      ('Carnival Breeze', '2026-09-07'::date, 4, 'Mexico', 'Cozumel & Progreso', 359),
      ('Carnival Breeze', '2026-09-12'::date, 4, 'Mexico', 'Cozumel & Progreso', 334),
      ('Carnival Jubilee', '2026-09-12'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 629),
      ('Carnival Dream', '2026-09-13'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 464),
      ('Carnival Breeze', '2026-09-17'::date, 3, 'Mexico', 'Cozumel & Progreso', 359),
      ('Carnival Jubilee', '2026-09-19'::date, 7, 'The Bahamas', 'Nassau & Freeport', 834),
      ('Carnival Dream', '2026-09-19'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 554),
      ('Carnival Breeze', '2026-09-21'::date, 4, 'Mexico', 'Cozumel & Progreso', 334),
      ('Carnival Breeze', '2026-09-26'::date, 4, 'Mexico', 'Cozumel & Progreso', 344),
      ('Carnival Dream', '2026-09-26'::date, 6, 'The Bahamas', 'Nassau & Freeport', 664),
      ('Carnival Jubilee', '2026-09-27'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 589),
      ('Carnival Breeze', '2026-10-01'::date, 3, 'Mexico', 'Cozumel & Progreso', 369),
      ('Carnival Jubilee', '2026-10-03'::date, 7, 'The Bahamas', 'Nassau & Freeport', 814),
      ('Carnival Dream', '2026-10-03'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 714),
      ('Carnival Breeze', '2026-10-05'::date, 4, 'Mexico', 'Cozumel & Progreso', 374),
      ('Carnival Breeze', '2026-10-10'::date, 4, 'Mexico', 'Cozumel & Progreso', 454),
      ('Carnival Dream', '2026-10-10'::date, 6, 'The Bahamas', 'Nassau & Freeport', 734),
      ('Carnival Jubilee', '2026-10-11'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 629),
      ('Carnival Miracle', '2026-10-12'::date, 9, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 789),
      ('Carnival Breeze', '2026-10-15'::date, 3, 'Mexico', 'Cozumel & Progreso', 379),
      ('Carnival Jubilee', '2026-10-17'::date, 7, 'The Bahamas', 'Nassau & Freeport', 814),
      ('Carnival Dream', '2026-10-17'::date, 13, 'Eastern Caribbean', 'Eastern Caribbean ports', 1399),
      ('Carnival Breeze', '2026-10-19'::date, 4, 'Mexico', 'Cozumel & Progreso', 344),
      ('Carnival Miracle', '2026-10-22'::date, 3, 'Mexico', 'Cozumel & Progreso', 449),
      ('Carnival Breeze', '2026-10-24'::date, 4, 'Mexico', 'Cozumel & Progreso', 344),
      ('Carnival Jubilee', '2026-10-25'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 564),
      ('Carnival Miracle', '2026-10-26'::date, 9, 'Caribbean & Panama', 'Cozumel, Limón, Colón (Panama Canal) & Mahogany Bay', 929),
      ('Carnival Breeze', '2026-10-29'::date, 3, 'Mexico', 'Cozumel & Progreso', 399),
      ('Carnival Dream', '2026-10-31'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 564),
      ('Carnival Jubilee', '2026-10-31'::date, 7, 'The Bahamas', 'Nassau & Freeport', 814),
      ('Carnival Breeze', '2026-11-02'::date, 4, 'Mexico', 'Cozumel & Progreso', 334),
      ('Carnival Miracle', '2026-11-05'::date, 3, 'Mexico', 'Cozumel & Progreso', 429),
      ('Carnival Breeze', '2026-11-07'::date, 4, 'Mexico', 'Cozumel & Progreso', 344),
      ('Carnival Dream', '2026-11-07'::date, 6, 'The Bahamas', 'Nassau & Freeport', 654),
      ('Carnival Jubilee', '2026-11-08'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 554),
      ('Carnival Miracle', '2026-11-09'::date, 9, 'Eastern Caribbean', 'Eastern Caribbean ports', 844),
      ('Carnival Breeze', '2026-11-12'::date, 3, 'Mexico', 'Cozumel & Progreso', 369),
      ('Carnival Jubilee', '2026-11-14'::date, 7, 'The Bahamas', 'Nassau & Freeport', 844),
      ('Carnival Dream', '2026-11-14'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 544),
      ('Carnival Breeze', '2026-11-16'::date, 4, 'Mexico', 'Cozumel & Progreso', 334)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Late Sep / Oct 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Jubilee', '2026-09-27'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 589),
      ('Carnival Breeze', '2026-10-01'::date, 3, 'Mexico', 'Cozumel & Progreso', 369),
      ('Carnival Jubilee', '2026-10-03'::date, 7, 'The Bahamas', 'Nassau & Freeport', 814),
      ('Carnival Dream', '2026-10-03'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 714),
      ('Carnival Breeze', '2026-10-05'::date, 4, 'Mexico', 'Cozumel & Progreso', 374),
      ('Carnival Breeze', '2026-10-10'::date, 4, 'Mexico', 'Cozumel & Progreso', 454),
      ('Carnival Dream', '2026-10-10'::date, 6, 'The Bahamas', 'Nassau & Freeport', 734),
      ('Carnival Jubilee', '2026-10-11'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 629),
      ('Carnival Miracle', '2026-10-12'::date, 9, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 789),
      ('Carnival Breeze', '2026-10-15'::date, 3, 'Mexico', 'Cozumel & Progreso', 379)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: September 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Breeze', '2026-09-07'::date, 4, 'Mexico', 'Cozumel & Progreso', 359),
      ('Carnival Breeze', '2026-09-12'::date, 4, 'Mexico', 'Cozumel & Progreso', 334),
      ('Carnival Jubilee', '2026-09-12'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 629),
      ('Carnival Dream', '2026-09-13'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 464),
      ('Carnival Breeze', '2026-09-17'::date, 3, 'Mexico', 'Cozumel & Progreso', 359),
      ('Carnival Jubilee', '2026-09-19'::date, 7, 'The Bahamas', 'Nassau & Freeport', 834),
      ('Carnival Dream', '2026-09-19'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 554),
      ('Carnival Breeze', '2026-09-21'::date, 4, 'Mexico', 'Cozumel & Progreso', 334),
      ('Carnival Breeze', '2026-09-26'::date, 4, 'Mexico', 'Cozumel & Progreso', 344),
      ('Carnival Dream', '2026-09-26'::date, 6, 'The Bahamas', 'Nassau & Freeport', 664)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Late Aug / early Sep 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Breeze', '2026-08-20'::date, 3, 'Mexico', 'Cozumel & Progreso', 439),
      ('Carnival Dream', '2026-08-22'::date, 7, 'The Bahamas', 'Nassau & Freeport', 779),
      ('Carnival Jubilee', '2026-08-22'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 649),
      ('Carnival Breeze', '2026-08-24'::date, 4, 'Mexico', 'Cozumel & Progreso', 374),
      ('Carnival Breeze', '2026-08-29'::date, 4, 'Mexico', 'Cozumel & Progreso', 374),
      ('Carnival Jubilee', '2026-08-29'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 629),
      ('Carnival Dream', '2026-08-30'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 464),
      ('Carnival Breeze', '2026-09-03'::date, 3, 'Mexico', 'Cozumel & Progreso', 434),
      ('Carnival Dream', '2026-09-05'::date, 7, 'The Bahamas', 'Nassau & Freeport', 799),
      ('Carnival Jubilee', '2026-09-05'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 629)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: August 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Jubilee', '2026-08-01'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 919),
      ('Carnival Breeze', '2026-08-01'::date, 4, 'Mexico', 'Cozumel & Progreso', 564),
      ('Carnival Dream', '2026-08-02'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 674),
      ('Carnival Breeze', '2026-08-06'::date, 3, 'Mexico', 'Cozumel & Progreso', 479),
      ('Carnival Dream', '2026-08-08'::date, 7, 'The Bahamas', 'Nassau & Freeport', 819),
      ('Carnival Jubilee', '2026-08-08'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 749),
      ('Carnival Breeze', '2026-08-10'::date, 4, 'Mexico', 'Cozumel & Progreso', 454),
      ('Carnival Jubilee', '2026-08-15'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 659),
      ('Carnival Breeze', '2026-08-15'::date, 4, 'Mexico', 'Cozumel & Progreso', 414),
      ('Carnival Dream', '2026-08-16'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 504)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: July 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Dream', '2026-07-11'::date, 7, 'The Bahamas', 'Nassau & Freeport', 1199),
      ('Carnival Jubilee', '2026-07-11'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 1014),
      ('Carnival Breeze', '2026-07-13'::date, 4, 'Mexico', 'Cozumel & Progreso', 629),
      ('Carnival Breeze', '2026-07-18'::date, 4, 'Mexico', 'Cozumel & Progreso', 629),
      ('Carnival Jubilee', '2026-07-18'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 1004),
      ('Carnival Dream', '2026-07-19'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 799),
      ('Carnival Breeze', '2026-07-23'::date, 3, 'Mexico', 'Cozumel & Progreso', 604),
      ('Carnival Jubilee', '2026-07-25'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 994),
      ('Carnival Dream', '2026-07-25'::date, 7, 'The Bahamas', 'Nassau & Freeport', 1119),
      ('Carnival Breeze', '2026-07-27'::date, 4, 'Mexico', 'Cozumel & Progreso', 599)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Late June / early July 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Breeze', '2026-06-20'::date, 4, 'Mexico', 'Cozumel & Progreso', 644),
      ('Carnival Dream', '2026-06-21'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 819),
      ('Carnival Breeze', '2026-06-25'::date, 3, 'Mexico', 'Cozumel & Progreso', 614),
      ('Carnival Dream', '2026-06-27'::date, 7, 'The Bahamas', 'Nassau & Freeport', 1199),
      ('Carnival Jubilee', '2026-06-27'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 1004),
      ('Carnival Breeze', '2026-06-29'::date, 4, 'Mexico', 'Cozumel & Progreso', 644),
      ('Carnival Jubilee', '2026-07-04'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 1014),
      ('Carnival Breeze', '2026-07-04'::date, 4, 'Mexico', 'Cozumel & Progreso', 639),
      ('Carnival Dream', '2026-07-05'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 799),
      ('Carnival Breeze', '2026-07-09'::date, 3, 'Mexico', 'Cozumel & Progreso', 604)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Late May / June 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Dream', '2026-05-30'::date, 7, 'The Bahamas', 'Nassau & Freeport', 1089),
      ('Carnival Breeze', '2026-06-01'::date, 4, 'Mexico', 'Cozumel & Progreso', 644),
      ('Carnival Breeze', '2026-06-06'::date, 4, 'Mexico', 'Cozumel & Progreso', 664),
      ('Carnival Jubilee', '2026-06-06'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 1014),
      ('Carnival Dream', '2026-06-07'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 809),
      ('Carnival Breeze', '2026-06-11'::date, 3, 'Mexico', 'Cozumel & Progreso', 644),
      ('Carnival Dream', '2026-06-13'::date, 7, 'The Bahamas', 'Nassau & Freeport', 1239),
      ('Carnival Jubilee', '2026-06-13'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 1009),
      ('Carnival Breeze', '2026-06-15'::date, 4, 'Mexico', 'Cozumel & Progreso', 644),
      ('Carnival Jubilee', '2026-06-20'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 1014)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Mid/late May 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Dream', '2026-05-10'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 549),
      ('Carnival Breeze', '2026-05-14'::date, 3, 'Mexico', 'Cozumel & Progreso', 434),
      ('Carnival Dream', '2026-05-16'::date, 7, 'The Bahamas', 'Nassau & Freeport', 949),
      ('Carnival Jubilee', '2026-05-16'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 794),
      ('Carnival Breeze', '2026-05-18'::date, 4, 'Mexico', 'Cozumel & Progreso', 479),
      ('Carnival Breeze', '2026-05-23'::date, 4, 'Mexico', 'Cozumel & Progreso', 594),
      ('Carnival Jubilee', '2026-05-23'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 954),
      ('Carnival Dream', '2026-05-24'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 739),
      ('Carnival Breeze', '2026-05-28'::date, 3, 'Mexico', 'Cozumel & Progreso', 584),
      ('Carnival Jubilee', '2026-05-30'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 994)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: Late April / early May 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Legend', '2026-04-23'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 619),
      ('Carnival Breeze', '2026-04-25'::date, 4, 'Mexico', 'Cozumel & Progreso', 429),
      ('Carnival Jubilee', '2026-04-25'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 684),
      ('Carnival Dream', '2026-04-26'::date, 5, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 529),
      ('Carnival Breeze', '2026-04-30'::date, 3, 'Mexico', 'Cozumel & Progreso', 389),
      ('Carnival Jubilee', '2026-05-02'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 704),
      ('Carnival Dream', '2026-05-02'::date, 7, 'The Bahamas', 'Nassau & Freeport', 909),
      ('Carnival Breeze', '2026-05-04'::date, 4, 'Mexico', 'Cozumel & Progreso', 432),
      ('Carnival Breeze', '2026-05-09'::date, 4, 'Mexico', 'Cozumel & Progreso', 474),
      ('Carnival Jubilee', '2026-05-09'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 714)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);

-- Seed: March/early April 2026 Carnival sailings from Galveston (additive)
with sailings_data as (
  select *
  from (
    values
      ('Carnival Breeze', '2026-03-19'::date, 3, 'Mexico', 'Cozumel & Progreso', 554),
      ('Carnival Jubilee', '2026-03-21'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 804),
      ('Carnival Breeze', '2026-03-23'::date, 4, 'Mexico', 'Cozumel & Progreso', 489),
      ('Carnival Legend', '2026-03-26'::date, 3, 'Mexico', 'Cozumel & Progreso', 494),
      ('Carnival Breeze', '2026-03-28'::date, 4, 'Mexico', 'Cozumel & Progreso', 459),
      ('Carnival Jubilee', '2026-03-28'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 764),
      ('Carnival Legend', '2026-03-30'::date, 9, 'Eastern Caribbean', 'Eastern Caribbean ports', 1019),
      ('Carnival Breeze', '2026-04-02'::date, 3, 'Mexico', 'Cozumel & Progreso', 494),
      ('Carnival Jubilee', '2026-04-04'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 754),
      ('Carnival Dream', '2026-04-05'::date, 6, 'Western Caribbean', 'Cozumel, Roatán & Costa Maya', 714)
  ) as v(ship_name, depart_date, nights, itinerary_label, ports_summary, min_price)
)
insert into public.sailings (
  id,
  ship_id,
  departure_port,
  depart_date,
  return_date,
  nights,
  is_active,
  itinerary_label,
  ports_summary
)
select
  gen_random_uuid(),
  sh.id,
  'Galveston',
  v.depart_date,
  (v.depart_date + (v.nights || ' days')::interval)::date,
  v.nights,
  true,
  v.itinerary_label,
  v.ports_summary
from sailings_data v
join public.ships sh on sh.name = v.ship_name
where not exists (
  select 1
  from public.sailings s
  where s.ship_id = sh.id
    and s.depart_date = v.depart_date
);

insert into public.pricing_snapshots (
  sailing_id,
  as_of,
  currency,
  min_per_person
)
select
  s.id,
  v.depart_date,
  'USD',
  v.min_price
from sailings_data v
join public.ships sh on sh.name = v.ship_name
join public.sailings s on s.ship_id = sh.id and s.depart_date = v.depart_date
where not exists (
  select 1
  from public.pricing_snapshots p
  where p.sailing_id = s.id
    and p.as_of = v.depart_date
);
