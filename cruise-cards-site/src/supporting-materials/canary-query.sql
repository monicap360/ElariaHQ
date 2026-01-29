-- ============================================================================
-- CANARY QUERY - Run this to check if views are working
-- Use in: Supabase SQL Editor, cron jobs, or health endpoints
-- ============================================================================

-- Quick health check (non-throwing version)
select
  count(*) as sailings_count,
  case 
    when count(*) = 0 then false
    else true
  end as is_healthy
from public.ship_destination_duration_seo_pages
where sail_date >= (now() at time zone 'UTC')::date;

-- Alternative: Throwing version (raises exception if broken)
-- Uncomment if you want it to fail loudly:
/*
select
  case when count(*) = 0
    then raise_exception('No future sailings found — check depart_date mapping')
  end
from public.ship_destination_duration_seo_pages
where sail_date >= (now() at time zone 'UTC')::date;
*/

-- Full health check view (recommended)
select * from public.inventory_health_check;
