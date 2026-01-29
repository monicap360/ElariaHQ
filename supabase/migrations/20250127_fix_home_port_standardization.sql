-- ============================================================================
-- Fix #1: Standardize home_port to 'Galveston' (case-sensitive exact match)
-- This fixes the SQL views that filter by sh.home_port = 'Galveston'
-- ============================================================================

-- Check current state before fix
DO $$
DECLARE
  before_count INTEGER;
  after_count INTEGER;
BEGIN
  -- Count ships with Galveston variations
  SELECT COUNT(*) INTO before_count
  FROM public.ships
  WHERE home_port ILIKE '%galveston%' AND home_port != 'Galveston';
  
  RAISE NOTICE 'Ships with non-standard Galveston home_port: %', before_count;
  
  -- Fix all variations to exact 'Galveston'
  UPDATE public.ships
  SET home_port = 'Galveston'
  WHERE home_port ILIKE '%galveston%' 
    AND home_port != 'Galveston';
  
  -- Count after fix
  SELECT COUNT(*) INTO after_count
  FROM public.ships
  WHERE home_port = 'Galveston';
  
  RAISE NOTICE 'Total ships with home_port = ''Galveston'' after fix: %', after_count;
END $$;

-- Verify the fix
-- This query should show only 'Galveston' (no variations)
SELECT 
  'VERIFICATION: Home Port Values' as check_type,
  home_port,
  COUNT(*) as ship_count
FROM public.ships
WHERE home_port ILIKE '%galveston%'
GROUP BY home_port
ORDER BY ship_count DESC;

-- Also align departure_port with home_port (frontend uses departure_port)
UPDATE public.sailings s
SET departure_port = 'Galveston'
FROM public.ships sh
WHERE s.ship_id = sh.id
  AND sh.home_port = 'Galveston'
  AND (s.departure_port IS NULL OR s.departure_port != 'Galveston');

-- Show how many sailings are now qualified
SELECT 
  'VERIFICATION: Qualified Sailings' as check_type,
  COUNT(*) as total_sailings,
  COUNT(CASE WHEN s.depart_date >= CURRENT_DATE THEN 1 END) as future_sailings,
  COUNT(CASE WHEN s.depart_date < CURRENT_DATE THEN 1 END) as past_sailings
FROM public.sailings s
JOIN public.ships sh ON sh.id = s.ship_id
WHERE sh.home_port = 'Galveston';

-- Verify departure_port alignment
SELECT 
  'VERIFICATION: Departure Port Alignment' as check_type,
  s.departure_port,
  sh.home_port,
  COUNT(*) as count
FROM public.sailings s
JOIN public.ships sh ON sh.id = s.ship_id
WHERE sh.home_port = 'Galveston'
GROUP BY s.departure_port, sh.home_port;
