# Next Steps After Supabase Fixes

## ✅ Step 1: Verify Fixes Worked

Run this in Supabase SQL Editor to confirm:

```sql
-- Quick verification
SELECT 
  'VERIFICATION' as check_type,
  (SELECT COUNT(*) FROM public.ships WHERE home_port = 'Galveston') as galveston_ships,
  (SELECT COUNT(*) FROM public.sailings 
   WHERE departure_port = 'Galveston' 
     AND depart_date >= CURRENT_DATE 
     AND is_active = true) as future_sailings,
  (SELECT COUNT(*) FROM public.ship_destination_duration_seo_pages) as seo_pages;
```

**Expected:**
- galveston_ships: ≥ 3
- future_sailings: ≥ 10
- seo_pages: > 0 (this is the key one - if 0, views still broken)

## ✅ Step 2: Test Frontend

### 2.1 Test the Board Page
Visit: `/cruises-from-galveston/board`

**Should see:**
- List of sailings with ships, dates, prices
- No "No upcoming sailings" message

**If empty:**
- Check browser console for errors
- Verify environment variables are set
- Check `/api/board-sailings` endpoint

### 2.2 Test Home Page
Visit: `/`

**Should see:**
- Sailings matrix/calendar
- No errors in console
- Phone number (409) 632-2106 visible

### 2.3 Test SEO Pages
Visit these URLs (they should work now):
- `/cruises-from-galveston/cozumel`
- `/cruises-from-galveston/roatan`
- `/cruises-from-galveston/carnival-breeze/cozumel/4-day`

**Should see:**
- Page loads with sailings listed
- No 404 errors

## ✅ Step 3: Clean Up Demo Data

### 3.1 Remove Miami Sailings (if you only serve Galveston)

```sql
-- Check what you have first
SELECT departure_port, COUNT(*) 
FROM public.sailings 
GROUP BY departure_port;

-- If you see Miami and don't want it:
DELETE FROM public.sailings WHERE departure_port = 'Miami';
DELETE FROM public.ships WHERE home_port = 'Miami';
```

### 3.2 Remove Past Test Sailings

```sql
-- Review first (see what will be deleted)
SELECT id, depart_date, ship_id
FROM public.sailings
WHERE depart_date < CURRENT_DATE
  AND depart_date > CURRENT_DATE - INTERVAL '6 months';

-- If those look like test data, delete:
DELETE FROM public.sailings 
WHERE depart_date < CURRENT_DATE 
  AND depart_date > CURRENT_DATE - INTERVAL '6 months';
```

## ✅ Step 4: Verify Environment Variables

Check these are set in your production environment:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

**Test:** Visit `/api/env-check` - should return connection status

## ✅ Step 5: Final Go-Live Checks

### 5.1 Run Full Checklist
Execute: `go-live-checklist.sql` in Supabase SQL Editor

**All checks should show ✅**

### 5.2 Content Verification
- [ ] Guest Help Desk page has content
- [ ] Embarkation Day page has content  
- [ ] Parking & Transportation page has content
- [ ] First-time Cruisers page has content
- [ ] Phone number (409) 632-2106 appears everywhere
- [ ] Email addresses correct (hello@, help@, bookings@)

### 5.3 Functionality Tests
- [ ] Search works
- [ ] Booking page loads
- [ ] Calendar view works
- [ ] Sailings display correctly
- [ ] Mobile responsive
- [ ] No console errors

## ✅ Step 6: Production Deployment

### 6.1 Pre-Deploy
- [ ] All migrations applied to production database
- [ ] Environment variables set in hosting platform
- [ ] Build succeeds without errors
- [ ] No TypeScript/linter errors

### 6.2 Deploy
- [ ] Deploy to production
- [ ] Verify domain/SSL working
- [ ] Test all pages load

### 6.3 Post-Deploy
- [ ] Test from different devices
- [ ] Check Google Analytics (if using)
- [ ] Monitor error logs
- [ ] Test booking flow end-to-end

## 🚨 If Sailings Still Don't Show

### Quick Debug Steps:

1. **Check API endpoint:**
   ```
   Visit: /api/board-sailings
   Should return JSON with sailings array
   ```

2. **Check browser console:**
   - Open DevTools → Console
   - Look for Supabase errors
   - Check network tab for failed requests

3. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Look for query errors

4. **Verify permissions:**
   ```sql
   SELECT table_name, privilege_type
   FROM information_schema.role_table_grants
   WHERE grantee = 'anon'
     AND table_name IN ('sailings', 'ships');
   ```

5. **Test direct query:**
   ```sql
   SELECT COUNT(*) 
   FROM public.sailings 
   WHERE departure_port = 'Galveston' 
     AND depart_date >= CURRENT_DATE 
     AND is_active = true;
   ```

## 📋 Quick Status Check

Run this to see current state:

```sql
SELECT 
  'STATUS' as check,
  (SELECT COUNT(*) FROM public.ships WHERE home_port = 'Galveston') as ships,
  (SELECT COUNT(*) FROM public.sailings 
   WHERE departure_port = 'Galveston' 
     AND depart_date >= CURRENT_DATE) as future_sailings,
  (SELECT COUNT(*) FROM public.ship_destination_duration_seo_pages) as views_working;
```

**If views_working = 0:** Views still need fixing (column name issue)
**If views_working > 0:** Views are working! ✅

## 🎯 Priority Order

1. **FIRST:** Verify views return data (seo_pages > 0)
2. **SECOND:** Test frontend shows sailings
3. **THIRD:** Clean demo data
4. **FOURTH:** Final go-live checklist
5. **FIFTH:** Deploy to production
