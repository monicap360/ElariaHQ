# 🚨 CRITICAL ISSUES FOUND - Must Fix Before Go-Live

## Issue #1: Column Name Mismatch (CRITICAL)

**Problem:** SQL views use `s.sail_date` but the actual table column is `depart_date`

**Impact:** All SEO views will return ZERO rows because they're querying a non-existent column.

**Files affected:**
- `cruise-cards-site/src/supporting-materials/seo-views.sql` - All views use `s.sail_date`
- Actual table uses `depart_date` (confirmed in board-sailings route)

**Fix Required:**
You need to either:
1. **Option A:** Add a column alias in the views (recommended)
2. **Option B:** Rename the column in the table (risky if other code depends on it)
3. **Option C:** Update all views to use `depart_date`

**Quick check:**
```sql
-- Check what column actually exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'sailings' 
  AND column_name IN ('sail_date', 'depart_date');
```

## Issue #2: Home Port Standardization

**Status:** ✅ Migration created: `supabase/migrations/20250127_fix_home_port_standardization.sql`

**Action Required:** Run this migration in Supabase SQL Editor

## Issue #3: Demo Data Cleanup

**Found:** `sailings-seed.sql` contains:
- Miami sailings (Symphony Of The Seas) - Remove if you only serve Galveston
- Past test sailings - May need cleanup

**Action Required:**
```sql
-- Remove Miami sailings (if not serving Miami)
DELETE FROM public.sailings WHERE departure_port = 'Miami';

-- Remove past test sailings (review dates first!)
DELETE FROM public.sailings 
WHERE depart_date < CURRENT_DATE 
  AND depart_date > CURRENT_DATE - INTERVAL '6 months';
```

## What You Need to Do NOW:

### Step 1: Fix Column Name Issue
Run this in Supabase SQL Editor to check:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'sailings' 
  AND column_name LIKE '%date%';
```

**If the column is `depart_date`:**
- You need to update `seo-views.sql` to use `depart_date` instead of `sail_date`
- OR recreate the views with the correct column name

### Step 2: Run Home Port Fix
Run: `supabase/migrations/20250127_fix_home_port_standardization.sql`

### Step 3: Clean Demo Data
Remove Miami sailings and past test data (see Issue #3 above)

### Step 4: Verify
Run: `go-live-checklist.sql` and ensure all checks pass

## Quick Test Query

Run this to see if views work:
```sql
SELECT COUNT(*) 
FROM public.ship_destination_duration_seo_pages;
```

**If this returns 0:** The column name mismatch is the problem.

**If this returns rows:** Views are working, check other issues.
