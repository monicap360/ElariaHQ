-- ============================================================================
-- GO-LIVE CHECKLIST - Run this to verify your site is ready for production
-- ============================================================================

-- ✅ STEP 1: Run the home_port fix first
-- (This is in: supabase/migrations/20250127_fix_home_port_standardization.sql)

-- ✅ STEP 2: Verify Core Data Exists

-- 2.1 Check ships exist with correct home_port
SELECT 
  'SHIPS CHECK' as check_type,
  COUNT(*) as total_ships,
  COUNT(CASE WHEN home_port = 'Galveston' THEN 1 END) as galveston_ships,
  COUNT(CASE WHEN home_port IS NULL THEN 1 END) as null_home_port
FROM public.ships;

-- 2.2 Check sailings exist and are future-dated
SELECT 
  'SAILINGS CHECK' as check_type,
  COUNT(*) as total_sailings,
  COUNT(CASE WHEN depart_date >= CURRENT_DATE THEN 1 END) as future_sailings,
  COUNT(CASE WHEN depart_date < CURRENT_DATE THEN 1 END) as past_sailings,
  COUNT(CASE WHEN departure_port = 'Galveston' THEN 1 END) as galveston_departures,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_sailings
FROM public.sailings;

-- 2.3 Check sailings have ship relationships
SELECT 
  'SAILING-SHIP RELATIONSHIPS' as check_type,
  COUNT(*) as total_sailings,
  COUNT(sh.id) as sailings_with_ships,
  COUNT(*) - COUNT(sh.id) as orphaned_sailings
FROM public.sailings s
LEFT JOIN public.ships sh ON sh.id = s.ship_id;

-- 2.4 Check ports_summary is populated
SELECT 
  'PORTS_SUMMARY CHECK' as check_type,
  COUNT(*) as total_sailings,
  COUNT(CASE WHEN ports_summary IS NOT NULL AND ports_summary != '' THEN 1 END) as has_ports,
  COUNT(CASE WHEN ports_summary IS NULL OR ports_summary = '' THEN 1 END) as missing_ports
FROM public.sailings s
JOIN public.ships sh ON sh.id = s.ship_id
WHERE sh.home_port = 'Galveston'
  AND s.depart_date >= CURRENT_DATE;

-- ✅ STEP 3: Verify Views Are Working

-- 3.1 Check SEO views return data
SELECT 
  'SEO VIEWS CHECK' as check_type,
  (SELECT COUNT(*) FROM public.ship_destination_duration_seo_pages) as ship_dest_duration_pages,
  (SELECT COUNT(*) FROM public.port_destination_seo_pages) as port_destination_pages,
  (SELECT COUNT(*) FROM public.destination_duration_seo_pages) as dest_duration_pages;

-- 3.2 Sample from main view
SELECT 
  'VIEW SAMPLE' as check_type,
  ship_name,
  destination_name,
  duration_slug
FROM public.ship_destination_duration_seo_pages
LIMIT 5;

-- ✅ STEP 4: Verify Destination Aliases

SELECT 
  'DESTINATION ALIASES' as check_type,
  COUNT(*) as total_aliases,
  COUNT(DISTINCT canonical_name) as unique_destinations
FROM public.destination_aliases;

-- ✅ STEP 5: Verify Pricing Data

SELECT 
  'PRICING CHECK' as check_type,
  COUNT(DISTINCT sailing_id) as sailings_with_pricing,
  COUNT(*) as total_pricing_snapshots,
  MIN(as_of) as earliest_price,
  MAX(as_of) as latest_price
FROM public.pricing_snapshots;

-- ✅ STEP 6: Critical Go-Live Requirements

-- 6.1 Minimum viable data check
WITH checks AS (
  SELECT 
    (SELECT COUNT(*) FROM public.ships WHERE home_port = 'Galveston') >= 3 as has_ships,
    (SELECT COUNT(*) FROM public.sailings 
     WHERE departure_port = 'Galveston' 
       AND depart_date >= CURRENT_DATE 
       AND is_active = true) >= 10 as has_future_sailings,
    (SELECT COUNT(*) FROM public.ship_destination_duration_seo_pages) > 0 as views_working,
    (SELECT COUNT(*) FROM public.destination_aliases) >= 10 as has_aliases
)
SELECT 
  'GO-LIVE READINESS' as check_type,
  CASE WHEN has_ships THEN '✅' ELSE '❌' END as ships_ready,
  CASE WHEN has_future_sailings THEN '✅' ELSE '❌' END as sailings_ready,
  CASE WHEN views_working THEN '✅' ELSE '❌' END as views_ready,
  CASE WHEN has_aliases THEN '✅' ELSE '❌' END as aliases_ready,
  CASE WHEN has_ships AND has_future_sailings AND views_working AND has_aliases 
    THEN '✅ READY FOR GO-LIVE' 
    ELSE '❌ NOT READY - Fix issues above' 
  END as overall_status
FROM checks;

-- ✅ STEP 7: Check for Demo/Test Data

-- 7.1 Look for test sailings (dates in past 6 months that are now past)
SELECT 
  'POTENTIAL TEST DATA' as check_type,
  COUNT(*) as past_test_sailings
FROM public.sailings
WHERE depart_date < CURRENT_DATE
  AND depart_date > CURRENT_DATE - INTERVAL '6 months';

-- 7.2 Check for Miami sailings (if you only do Galveston)
SELECT 
  'NON-GALVESTON SAILINGS' as check_type,
  departure_port,
  COUNT(*) as count
FROM public.sailings
WHERE departure_port != 'Galveston'
GROUP BY departure_port;

-- ✅ STEP 8: Environment Check (run this in your app, not SQL)

-- Check these environment variables are set:
-- NEXT_PUBLIC_SUPABASE_URL
-- NEXT_PUBLIC_SUPABASE_ANON_KEY  
-- SUPABASE_SERVICE_ROLE_KEY (for server-side)

-- ✅ STEP 9: Permissions Check

SELECT 
  'PERMISSIONS CHECK' as check_type,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
  AND table_schema = 'public'
  AND table_name IN ('sailings', 'ships', 'destination_aliases', 'ship_destination_duration_seo_pages')
ORDER BY table_name, privilege_type;

-- ✅ STEP 10: Final Summary

SELECT 
  'FINAL SUMMARY' as check_type,
  (SELECT COUNT(*) FROM public.ships WHERE home_port = 'Galveston') as galveston_ships,
  (SELECT COUNT(*) FROM public.sailings 
   WHERE departure_port = 'Galveston' 
     AND depart_date >= CURRENT_DATE 
     AND is_active = true) as future_galveston_sailings,
  (SELECT COUNT(*) FROM public.ship_destination_duration_seo_pages) as seo_pages_available,
  (SELECT COUNT(DISTINCT destination_name) FROM public.ship_destination_duration_seo_pages) as unique_destinations;
