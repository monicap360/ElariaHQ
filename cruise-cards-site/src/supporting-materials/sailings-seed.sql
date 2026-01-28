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
