-- ============================================================================
-- SAILINGS DIAGNOSTIC SCRIPT
-- Run this in Supabase SQL Editor to identify why sailings aren't showing
-- ============================================================================

-- 1️⃣ CHECK SAILING DATES (Most Common Issue)
-- Look for: dates in past, NULL dates, wrong years
SELECT 
  'SAILING DATES CHECK' as check_type,
  COUNT(*) as total_sailings,
  COUNT(CASE WHEN sail_date IS NULL THEN 1 END) as null_sail_date,
  COUNT(CASE WHEN sail_date < CURRENT_DATE THEN 1 END) as past_dates,
  COUNT(CASE WHEN sail_date >= CURRENT_DATE THEN 1 END) as future_dates,
  MIN(sail_date) as earliest_date,
  MAX(sail_date) as latest_date
FROM public.sailings;

-- Show first 20 sailings by date
SELECT 
  'FIRST 20 SAILINGS' as check_type,
  id, 
  sail_date, 
  return_date,
  departure_port,
  ship_id
FROM public.sailings
ORDER BY sail_date ASC NULLS LAST
LIMIT 20;

-- 2️⃣ CHECK HOME PORT MATCHING
-- Look for: mismatched home_port values (GALVESTON vs Galveston vs Galveston, TX)
SELECT 
  'HOME PORT CHECK' as check_type,
  home_port,
  COUNT(*) as ship_count
FROM public.ships
WHERE home_port ILIKE '%galveston%'
GROUP BY home_port
ORDER BY ship_count DESC;

-- Show all ships with their home ports
SELECT 
  'ALL SHIPS' as check_type,
  id, 
  name, 
  home_port,
  cruise_line
FROM public.ships
ORDER BY home_port, name;

-- 3️⃣ CHECK SHIP-SAILING RELATIONSHIPS
-- Look for: orphaned sailings (sailings without matching ships)
SELECT 
  'ORPHANED SAILINGS' as check_type,
  s.id as sailing_id,
  s.ship_id,
  s.sail_date,
  s.departure_port
FROM public.sailings s
LEFT JOIN public.ships sh ON sh.id = s.ship_id
WHERE sh.id IS NULL;

-- Count sailings with valid ship relationships
SELECT 
  'SHIP-SAILING RELATIONSHIPS' as check_type,
  COUNT(*) as total_sailings,
  COUNT(sh.id) as sailings_with_ships,
  COUNT(*) - COUNT(sh.id) as orphaned_sailings
FROM public.sailings s
LEFT JOIN public.ships sh ON sh.id = s.ship_id;

-- 4️⃣ CHECK PORTS_SUMMARY (Critical for destination pages)
-- Look for: NULL or empty ports_summary
SELECT 
  'PORTS_SUMMARY CHECK' as check_type,
  COUNT(*) as total_sailings,
  COUNT(CASE WHEN ports_summary IS NULL THEN 1 END) as null_ports,
  COUNT(CASE WHEN ports_summary = '' THEN 1 END) as empty_ports,
  COUNT(CASE WHEN ports_summary IS NOT NULL AND ports_summary != '' THEN 1 END) as has_ports
FROM public.sailings;

-- Show sample ports_summary values
SELECT 
  'PORTS_SUMMARY SAMPLES' as check_type,
  id,
  ports_summary,
  LENGTH(ports_summary) as length
FROM public.sailings
WHERE ports_summary IS NOT NULL AND ports_summary != ''
ORDER BY RANDOM()
LIMIT 10;

-- 5️⃣ CHECK DESTINATION ALIASES
-- Look for: missing alias mappings
SELECT 
  'DESTINATION ALIASES COUNT' as check_type,
  COUNT(*) as total_aliases,
  COUNT(DISTINCT canonical_name) as unique_destinations
FROM public.destination_aliases;

-- Show all aliases
SELECT 
  'ALL ALIASES' as check_type,
  alias,
  canonical_name
FROM public.destination_aliases
ORDER BY canonical_name, alias;

-- 6️⃣ CHECK DEPARTURE_PORT vs HOME_PORT MISMATCH
-- This is CRITICAL - frontend uses departure_port, views use home_port
SELECT 
  'DEPARTURE_PORT vs HOME_PORT' as check_type,
  s.departure_port,
  sh.home_port,
  COUNT(*) as count
FROM public.sailings s
JOIN public.ships sh ON sh.id = s.ship_id
WHERE s.departure_port IS NOT NULL OR sh.home_port IS NOT NULL
GROUP BY s.departure_port, sh.home_port
ORDER BY count DESC;

-- 7️⃣ CHECK VIEW OUTPUTS
-- Test if views are returning data
SELECT 
  'SHIP_DESTINATION_DURATION_SEO_PAGES COUNT' as check_type,
  COUNT(*) as view_row_count
FROM public.ship_destination_duration_seo_pages;

-- Sample from the view
SELECT 
  'VIEW SAMPLE' as check_type,
  ship_name,
  destination_name,
  duration_slug,
  ship_slug,
  destination_slug
FROM public.ship_destination_duration_seo_pages
LIMIT 10;

-- 8️⃣ CHECK ACTIVE FLAG
-- Some queries use is_active flag
SELECT 
  'IS_ACTIVE CHECK' as check_type,
  is_active,
  COUNT(*) as count
FROM public.sailings
GROUP BY is_active;

-- 9️⃣ COMPREHENSIVE SAILING QUALIFICATION CHECK
-- This shows why sailings might be filtered out
SELECT 
  'SAILING QUALIFICATION ANALYSIS' as check_type,
  s.id,
  s.sail_date,
  s.departure_port,
  sh.home_port,
  sh.name as ship_name,
  s.ports_summary,
  CASE 
    WHEN s.sail_date IS NULL THEN '❌ NULL sail_date'
    WHEN s.sail_date < CURRENT_DATE THEN '❌ Past date'
    WHEN s.sail_date >= CURRENT_DATE THEN '✅ Future date'
  END as date_status,
  CASE 
    WHEN sh.id IS NULL THEN '❌ No ship relationship'
    WHEN sh.home_port != 'Galveston' THEN '❌ Wrong home_port: ' || COALESCE(sh.home_port, 'NULL')
    WHEN sh.home_port = 'Galveston' THEN '✅ Correct home_port'
  END as home_port_status,
  CASE 
    WHEN s.ports_summary IS NULL OR s.ports_summary = '' THEN '⚠️ No ports_summary'
    ELSE '✅ Has ports_summary'
  END as ports_status
FROM public.sailings s
LEFT JOIN public.ships sh ON sh.id = s.ship_id
ORDER BY s.sail_date ASC NULLS LAST
LIMIT 50;

-- 🔟 QUICK FIX SUGGESTIONS
-- Run these if you find issues:

-- Fix home_port case sensitivity:
-- UPDATE public.ships
-- SET home_port = 'Galveston'
-- WHERE home_port ILIKE '%galveston%' AND home_port != 'Galveston';

-- Fix orphaned sailings (if any):
-- DELETE FROM public.sailings
-- WHERE ship_id NOT IN (SELECT id FROM public.ships);

-- Update past test sailings (if needed):
-- UPDATE public.sailings
-- SET sail_date = sail_date + INTERVAL '1 year'
-- WHERE sail_date < CURRENT_DATE AND sail_date > CURRENT_DATE - INTERVAL '6 months';
