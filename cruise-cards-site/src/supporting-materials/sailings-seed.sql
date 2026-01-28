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
