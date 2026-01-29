# Sailings Not Showing - Troubleshooting Guide

## 🔍 Critical Issue Found

**The frontend and SQL views use DIFFERENT fields for filtering:**

- **Frontend queries** use: `sailings.departure_port = 'Galveston'`
- **SQL views** use: `ships.home_port = 'Galveston'`

This mismatch means sailings might exist but won't show up in views or frontend queries if these fields don't align.

## 📋 Quick Diagnostic Steps

### Step 1: Run Diagnostic Script

Run `diagnose-sailings.sql` in Supabase SQL Editor. This will show you:

1. ✅ Date issues (past dates, NULL dates)
2. ✅ Home port mismatches (GALVESTON vs Galveston vs Galveston, TX)
3. ✅ Orphaned sailings (sailings without ships)
4. ✅ Missing ports_summary
5. ✅ Missing destination aliases
6. ✅ departure_port vs home_port alignment

### Step 2: Check These Three Queries First

```sql
-- 1. Total sailings count
SELECT COUNT(*) FROM public.sailings;

-- 2. View output count (should match if views work)
SELECT COUNT(*) FROM public.ship_destination_duration_seo_pages;

-- 3. Home port values (look for mismatches)
SELECT DISTINCT home_port FROM public.ships WHERE home_port ILIKE '%galveston%';
```

**Expected Results:**
- Query 1: Should return your total sailings
- Query 2: Should return rows if views are working
- Query 3: Should show ONLY `'Galveston'` (case-sensitive, exact match)

## 🔧 Most Common Fixes

### Fix 1: Standardize home_port (CRITICAL)

```sql
UPDATE public.ships
SET home_port = 'Galveston'
WHERE home_port ILIKE '%galveston%' AND home_port != 'Galveston';
```

**Why:** SQL views filter by `sh.home_port = 'Galveston'` (exact match, case-sensitive). If you have "GALVESTON" or "Galveston, TX", they won't match.

### Fix 2: Align departure_port with home_port

```sql
UPDATE public.sailings s
SET departure_port = 'Galveston'
FROM public.ships sh
WHERE s.ship_id = sh.id
  AND sh.home_port = 'Galveston'
  AND (s.departure_port IS NULL OR s.departure_port != 'Galveston');
```

**Why:** Frontend queries use `.eq("departure_port", "Galveston")`. If this doesn't match, frontend won't show sailings.

### Fix 3: Check Date Filters

The views use: `s.sail_date >= (now() at time zone 'UTC')::date`

**Common issues:**
- Sailings stored in CST but compared to UTC
- "Today" sailings filtered out at midnight UTC
- Test sailings accidentally in the past

**Check:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN sail_date < CURRENT_DATE THEN 1 END) as past,
  COUNT(CASE WHEN sail_date >= CURRENT_DATE THEN 1 END) as future
FROM public.sailings;
```

### Fix 4: Verify ports_summary Format

Views use: `regexp_split_to_table(coalesce(s.ports_summary, ''), '[,;]')`

**Requirements:**
- Must use comma (`,`) or semicolon (`;`) as separators
- Cannot be NULL or empty string
- Examples: `"Cozumel, Roatán, Belize City"` or `"Cozumel;Roatán;Belize City"`

**Check:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN ports_summary IS NULL OR ports_summary = '' THEN 1 END) as missing
FROM public.sailings;
```

### Fix 5: Add Missing Destination Aliases

Views match ports using `destination_aliases` table. If a port isn't aliased, it won't match.

**Common missing aliases:**
- `half moon cay` → `Half Moon Cay`
- `great stirrup cay` / `gsc` → `Great Stirrup Cay`
- `coco cay` / `perfect day` → `Perfect Day at CocoCay`

**Add:**
```sql
INSERT INTO public.destination_aliases (alias, canonical_name)
VALUES
  ('half moon cay', 'Half Moon Cay'),
  ('halfmoon cay', 'Half Moon Cay'),
  ('great stirrup cay', 'Great Stirrup Cay'),
  ('gsc', 'Great Stirrup Cay')
ON CONFLICT (alias) DO NOTHING;
```

## 🎯 Frontend Query Patterns

### Pattern 1: Direct sailings query (board-sailings)
```typescript
.from("sailings")
.eq("departure_port", "Galveston")
.eq("is_active", true)
```

**Requires:**
- `departure_port = 'Galveston'` (exact match)
- `is_active = true`

### Pattern 2: SEO page queries (via views)
```typescript
.from("ship_destination_duration_seo_pages")
```

**Requires:**
- View exists and has data
- `home_port = 'Galveston'` (in view definition)
- `sail_date >= today` (in view definition)
- `ports_summary` is parseable

### Pattern 3: Direct sailings with port filtering
```typescript
.from("sailings")
.eq("departure_port", "Galveston")
.gte("sail_date", new Date().toISOString().slice(0, 10))
.or("ports_summary.ilike.%cozumel%")
```

**Requires:**
- `departure_port = 'Galveston'`
- `sail_date >= today`
- `ports_summary` contains search term

## 🚨 Red Flags to Check

1. **Home port has extra text:** `"Galveston, TX"` or `"Port of Galveston"` → Won't match `'Galveston'`
2. **departure_port is NULL:** Frontend queries will exclude these
3. **sail_date is in the past:** Views filter these out
4. **ports_summary is empty:** Destination pages won't show these sailings
5. **Missing ship relationship:** Orphaned sailings won't appear in any view

## ✅ Verification Checklist

After running fixes, verify:

- [ ] All ships with Galveston have `home_port = 'Galveston'` (exact)
- [ ] All sailings from Galveston ships have `departure_port = 'Galveston'`
- [ ] All future sailings have `sail_date >= CURRENT_DATE`
- [ ] All sailings have non-empty `ports_summary`
- [ ] View `ship_destination_duration_seo_pages` returns rows
- [ ] No orphaned sailings (all have valid ship_id)
- [ ] Destination aliases exist for all ports in ports_summary

## 📞 Next Steps

1. **Run `diagnose-sailings.sql`** → Get full picture
2. **Run `fix-sailings-issues.sql`** → Apply fixes
3. **Re-run diagnostic** → Verify fixes worked
4. **Test frontend** → Check if sailings appear

If issues persist after fixes, check:
- Environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- RLS policies (if enabled)
- View permissions (GRANT SELECT)
