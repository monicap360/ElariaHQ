-- ============================================================================
-- VERIFICATION: Check if views are fixed and working
-- Run this after applying the migration
-- ============================================================================

-- Quick check: Do views return data?
SELECT 
  'VIEW STATUS' as check_type,
  (SELECT COUNT(*) FROM public.ship_destination_duration_seo_pages) as ship_dest_duration,
  (SELECT COUNT(*) FROM public.future_sailings_list) as future_sailings,
  (SELECT COUNT(*) FROM public.port_destination_seo_pages) as port_destinations,
  (SELECT COUNT(*) FROM public.destination_duration_seo_pages) as dest_durations;

-- Sample data from main view
SELECT 
  'SAMPLE DATA' as check_type,
  ship_name,
  destination_name,
  duration_slug,
  sail_date
FROM public.ship_destination_duration_seo_pages
ORDER BY sail_date ASC
LIMIT 10;

-- Verify sail_date column exists and has data
SELECT 
  'SAIL_DATE VERIFICATION' as check_type,
  COUNT(*) as total_rows,
  COUNT(sail_date) as rows_with_sail_date,
  MIN(sail_date) as earliest_sail_date,
  MAX(sail_date) as latest_sail_date
FROM public.ship_destination_duration_seo_pages;

-- Check for any NULL sail_date (should be 0)
SELECT 
  'NULL CHECK' as check_type,
  COUNT(*) as null_sail_dates
FROM public.ship_destination_duration_seo_pages
WHERE sail_date IS NULL;
