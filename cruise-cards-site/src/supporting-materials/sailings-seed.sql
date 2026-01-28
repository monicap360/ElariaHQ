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
