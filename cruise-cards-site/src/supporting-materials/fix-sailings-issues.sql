-- ============================================================================
-- FIX SAILINGS ISSUES - Run after diagnose-sailings.sql
-- ============================================================================

-- 🔧 FIX 1: Standardize home_port to 'Galveston' (case-sensitive)
-- This fixes the SQL views that filter by sh.home_port = 'Galveston'
UPDATE public.ships
SET home_port = 'Galveston'
WHERE home_port ILIKE '%galveston%' 
  AND home_port != 'Galveston';

-- Show what was changed
SELECT 
  'HOME_PORT FIXED' as action,
  COUNT(*) as ships_updated
FROM public.ships
WHERE home_port = 'Galveston';

-- 🔧 FIX 2: Ensure departure_port matches for sailings
-- Frontend queries use .eq("departure_port", "Galveston")
-- Update sailings to have departure_port = 'Galveston' if ship has home_port = 'Galveston'
UPDATE public.sailings s
SET departure_port = 'Galveston'
FROM public.ships sh
WHERE s.ship_id = sh.id
  AND sh.home_port = 'Galveston'
  AND (s.departure_port IS NULL OR s.departure_port != 'Galveston');

-- Show what was changed
SELECT 
  'DEPARTURE_PORT FIXED' as action,
  COUNT(*) as sailings_updated
FROM public.sailings
WHERE departure_port = 'Galveston';

-- 🔧 FIX 3: Update past test sailings (if they're recent test data)
-- Only update sailings from the last 6 months that are in the past
-- BE CAREFUL - Review this before running!
-- Uncomment and adjust the date offset if needed:
/*
UPDATE public.sailings
SET sail_date = sail_date + INTERVAL '1 year'
WHERE sail_date < CURRENT_DATE 
  AND sail_date > CURRENT_DATE - INTERVAL '6 months'
  AND sail_date > '2024-01-01';  -- Only update recent test data
*/

-- 🔧 FIX 4: Ensure ports_summary uses comma or semicolon separators
-- The views use: regexp_split_to_table(coalesce(s.ports_summary, ''), '[,;]')
-- If your ports use | or /, update them:
/*
UPDATE public.sailings
SET ports_summary = REPLACE(REPLACE(ports_summary, '|', ','), '/', ',')
WHERE ports_summary LIKE '%|%' OR ports_summary LIKE '%/%';
*/

-- 🔧 FIX 5: Add missing destination aliases for common ports
-- Check diagnose-sailings.sql output first, then add missing ones:
INSERT INTO public.destination_aliases (alias, canonical_name)
VALUES
  ('half moon cay', 'Half Moon Cay'),
  ('halfmoon cay', 'Half Moon Cay'),
  ('relaxaway half moon cay', 'Half Moon Cay'),
  ('great stirrup cay', 'Great Stirrup Cay'),
  ('gsc', 'Great Stirrup Cay'),
  ('coco cay', 'Perfect Day at CocoCay'),
  ('perfect day', 'Perfect Day at CocoCay'),
  ('coco cay perfect day', 'Perfect Day at CocoCay')
ON CONFLICT (alias) DO NOTHING;

-- 🔧 FIX 6: Ensure is_active flag is set correctly
-- Some queries filter by is_active = true
UPDATE public.sailings
SET is_active = true
WHERE is_active IS NULL
  AND sail_date >= CURRENT_DATE;

-- 🔧 FIX 7: Refresh materialized views (if any)
-- If you have materialized views, refresh them:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY public.ship_destination_duration_seo_pages;

-- 🔧 FIX 8: Grant permissions (if views aren't accessible)
-- Run these if diagnose shows permission issues:
GRANT SELECT ON public.ship_destination_duration_seo_pages TO anon;
GRANT SELECT ON public.sailings TO anon;
GRANT SELECT ON public.ships TO anon;
GRANT SELECT ON public.destination_aliases TO anon;
GRANT SELECT ON public.port_destination_seo_pages TO anon;
GRANT SELECT ON public.destination_duration_seo_pages TO anon;

-- ✅ VERIFICATION QUERIES
-- Run these after fixes to verify:

-- Check home_port standardization
SELECT 
  'VERIFY: HOME_PORT' as check_type,
  home_port,
  COUNT(*) as count
FROM public.ships
WHERE home_port ILIKE '%galveston%'
GROUP BY home_port;

-- Check departure_port alignment
SELECT 
  'VERIFY: DEPARTURE_PORT vs HOME_PORT' as check_type,
  s.departure_port,
  sh.home_port,
  COUNT(*) as count
FROM public.sailings s
JOIN public.ships sh ON sh.id = s.ship_id
WHERE sh.home_port = 'Galveston'
GROUP BY s.departure_port, sh.home_port;

-- Check view output
SELECT 
  'VERIFY: VIEW OUTPUT' as check_type,
  COUNT(*) as view_rows
FROM public.ship_destination_duration_seo_pages;

-- Check future sailings count
SELECT 
  'VERIFY: FUTURE SAILINGS' as check_type,
  COUNT(*) as total,
  COUNT(CASE WHEN sail_date >= CURRENT_DATE THEN 1 END) as future_count
FROM public.sailings s
JOIN public.ships sh ON sh.id = s.ship_id
WHERE sh.home_port = 'Galveston';
