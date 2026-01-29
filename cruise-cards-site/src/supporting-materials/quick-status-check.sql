-- ============================================================================
-- QUICK STATUS CHECK - Run this after Supabase fixes
-- ============================================================================

-- Overall status
SELECT 
  'OVERALL STATUS' as check_type,
  (SELECT COUNT(*) FROM public.ships WHERE home_port = 'Galveston') as galveston_ships,
  (SELECT COUNT(*) FROM public.sailings 
   WHERE departure_port = 'Galveston' 
     AND depart_date >= CURRENT_DATE 
     AND is_active = true) as future_galveston_sailings,
  (SELECT COUNT(*) FROM public.ship_destination_duration_seo_pages) as seo_pages_available,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.ship_destination_duration_seo_pages) > 0 
    THEN '✅ Views Working' 
    ELSE '❌ Views Broken' 
  END as views_status;

-- Sample sailings that should appear
SELECT 
  'SAMPLE SAILINGS' as check_type,
  s.id,
  s.depart_date,
  sh.name as ship_name,
  s.departure_port,
  s.is_active
FROM public.sailings s
JOIN public.ships sh ON sh.id = s.ship_id
WHERE sh.home_port = 'Galveston'
  AND s.departure_port = 'Galveston'
  AND s.depart_date >= CURRENT_DATE
  AND s.is_active = true
ORDER BY s.depart_date ASC
LIMIT 10;

-- Check for issues
SELECT 
  'POTENTIAL ISSUES' as check_type,
  COUNT(CASE WHEN s.departure_port != 'Galveston' AND sh.home_port = 'Galveston' THEN 1 END) as port_mismatch,
  COUNT(CASE WHEN s.depart_date < CURRENT_DATE AND s.is_active = true THEN 1 END) as past_active_sailings,
  COUNT(CASE WHEN s.ports_summary IS NULL OR s.ports_summary = '' THEN 1 END) as missing_ports
FROM public.sailings s
JOIN public.ships sh ON sh.id = s.ship_id
WHERE sh.home_port = 'Galveston';
