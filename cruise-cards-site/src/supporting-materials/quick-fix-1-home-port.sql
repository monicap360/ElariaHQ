-- ============================================================================
-- QUICK FIX #1: Home Port Mismatch
-- This is the #1 cause of sailings not showing
-- ============================================================================

-- Step 1: Check current home_port values
SELECT 
  'CURRENT HOME_PORT VALUES' as check_type,
  home_port,
  COUNT(*) as ship_count
FROM public.ships
WHERE home_port ILIKE '%galveston%'
GROUP BY home_port
ORDER BY ship_count DESC;

-- Step 2: Fix all variations to exact 'Galveston'
UPDATE public.ships
SET home_port = 'Galveston'
WHERE home_port ILIKE '%galveston%' 
  AND home_port != 'Galveston';

-- Step 3: Verify the fix
SELECT 
  'AFTER FIX - HOME_PORT VALUES' as check_type,
  home_port,
  COUNT(*) as ship_count
FROM public.ships
WHERE home_port ILIKE '%galveston%'
GROUP BY home_port;

-- Step 4: Check how many sailings are now qualified
SELECT 
  'SAILINGS QUALIFIED BY HOME_PORT FIX' as check_type,
  COUNT(*) as total_sailings,
  COUNT(CASE WHEN s.sail_date >= CURRENT_DATE THEN 1 END) as future_sailings
FROM public.sailings s
JOIN public.ships sh ON sh.id = s.ship_id
WHERE sh.home_port = 'Galveston';

-- Expected result: You should see sailings count increase if this was the issue
