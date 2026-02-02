-- Check pricing coverage for all sailings
-- This query shows:
-- 1. Total active sailings
-- 2. Sailings with pricing_snapshots (min_per_person)
-- 3. Sailings with public_sailing_prices (cabin-level pricing)
-- 4. Coverage gaps

-- Summary counts
SELECT 
  'Total Active Sailings' as metric,
  COUNT(*)::text as value
FROM public.sailings
WHERE departure_port = 'Galveston'
  AND is_active = true
  AND depart_date >= (now() at time zone 'UTC')::date

UNION ALL

SELECT 
  'Sailings with pricing_snapshots (min_per_person)' as metric,
  COUNT(DISTINCT s.id)::text as value
FROM public.sailings s
INNER JOIN public.pricing_snapshots ps ON ps.sailing_id = s.id
WHERE s.departure_port = 'Galveston'
  AND s.is_active = true
  AND s.depart_date >= (now() at time zone 'UTC')::date

UNION ALL

SELECT 
  'Sailings with public_sailing_prices (cabin-level)' as metric,
  COUNT(DISTINCT s.id)::text as value
FROM public.sailings s
INNER JOIN public.public_sailing_prices psp ON psp.sailing_id = s.id
WHERE s.departure_port = 'Galveston'
  AND s.is_active = true
  AND s.depart_date >= (now() at time zone 'UTC')::date

UNION ALL

SELECT 
  'Average cabin types per sailing (with pricing)' as metric,
  COALESCE(ROUND(AVG(cabin_count), 1)::text, '0') as value
FROM (
  SELECT 
    s.id,
    COUNT(DISTINCT psp.cabin_type) as cabin_count
  FROM public.sailings s
  INNER JOIN public.public_sailing_prices psp ON psp.sailing_id = s.id
  WHERE s.departure_port = 'Galveston'
    AND s.is_active = true
    AND s.depart_date >= (now() at time zone 'UTC')::date
  GROUP BY s.id
) cabin_counts;

-- Detailed breakdown: Sailings missing cabin-level pricing
SELECT 
  s.id as sailing_id,
  sh.name as ship_name,
  s.depart_date,
  s.nights,
  CASE 
    WHEN ps.sailing_id IS NULL THEN '❌ Missing pricing_snapshots'
    ELSE '✅ Has pricing_snapshots'
  END as min_price_status,
  CASE 
    WHEN psp.sailing_id IS NULL THEN '❌ Missing cabin-level pricing'
    ELSE '✅ Has ' || COUNT(DISTINCT psp.cabin_type) || ' cabin types'
  END as cabin_pricing_status
FROM public.sailings s
INNER JOIN public.ships sh ON sh.id = s.ship_id
LEFT JOIN public.pricing_snapshots ps ON ps.sailing_id = s.id
LEFT JOIN public.public_sailing_prices psp ON psp.sailing_id = s.id
WHERE s.departure_port = 'Galveston'
  AND s.is_active = true
  AND s.depart_date >= (now() at time zone 'UTC')::date
GROUP BY s.id, sh.name, s.depart_date, s.nights, ps.sailing_id, psp.sailing_id
ORDER BY s.depart_date ASC;

-- Sample cabin-level pricing for first 5 sailings
SELECT 
  s.id as sailing_id,
  sh.name as ship_name,
  s.depart_date,
  psp.cabin_type,
  psp.price,
  psp.currency
FROM public.sailings s
INNER JOIN public.ships sh ON sh.id = s.ship_id
INNER JOIN public.public_sailing_prices psp ON psp.sailing_id = s.id
WHERE s.departure_port = 'Galveston'
  AND s.is_active = true
  AND s.depart_date >= (now() at time zone 'UTC')::date
ORDER BY s.depart_date ASC, psp.price ASC
LIMIT 20;
