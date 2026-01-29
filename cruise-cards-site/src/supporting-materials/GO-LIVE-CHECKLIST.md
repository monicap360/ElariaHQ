# Go-Live Checklist for Cruises From Galveston

## 🚀 Pre-Launch Requirements

### 1. Database Fixes (Run First)
- [ ] **Run migration:** `supabase/migrations/20250127_fix_home_port_standardization.sql`
  - Fixes home_port standardization
  - Aligns departure_port with home_port
- [ ] **Verify fix worked:** Run `go-live-checklist.sql` and check all ✅ marks

### 2. Core Data Requirements

#### Ships
- [ ] At least 3 ships with `home_port = 'Galveston'` (exact match, case-sensitive)
- [ ] All Galveston ships have valid cruise_line names
- [ ] Ship names match what cruise lines use

#### Sailings
- [ ] **Minimum 10 future sailings** with:
  - `departure_port = 'Galveston'`
  - `depart_date >= CURRENT_DATE`
  - `is_active = true`
  - Valid `ship_id` (not orphaned)
  - Non-empty `ports_summary`

#### Ports & Destinations
- [ ] All sailings have `ports_summary` populated
- [ ] `ports_summary` uses comma (`,`) or semicolon (`;`) separators
- [ ] At least 10 destination aliases in `destination_aliases` table
- [ ] Common ports have aliases (Half Moon Cay, Great Stirrup Cay, Perfect Day, etc.)

### 3. SEO Views Must Work

- [ ] `ship_destination_duration_seo_pages` returns rows
- [ ] `port_destination_seo_pages` returns rows  
- [ ] `destination_duration_seo_pages` returns rows
- [ ] Views are accessible to `anon` role (permissions granted)

### 4. Remove Demo/Test Data

- [ ] **Delete past test sailings** (if any)
  ```sql
  DELETE FROM public.sailings 
  WHERE depart_date < CURRENT_DATE 
    AND depart_date > CURRENT_DATE - INTERVAL '6 months';
  ```
- [ ] **Remove non-Galveston sailings** (if you only serve Galveston)
  ```sql
  DELETE FROM public.sailings 
  WHERE departure_port != 'Galveston';
  ```
- [ ] **Remove Miami ships** (if not serving Miami)
  ```sql
  DELETE FROM public.ships 
  WHERE home_port = 'Miami';
  ```

### 5. Environment Variables

Verify these are set in your production environment:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

**Test:** Visit `/api/env-check` to verify connection

### 6. Permissions

- [ ] `anon` role can SELECT from:
  - `sailings`
  - `ships`
  - `destination_aliases`
  - `ship_destination_duration_seo_pages`
  - `port_destination_seo_pages`
  - `destination_duration_seo_pages`

### 7. Pricing Data (Optional but Recommended)

- [ ] At least some sailings have pricing in `pricing_snapshots`
- [ ] Pricing is recent (within last 30 days)

### 8. Frontend Verification

- [ ] Home page loads without errors
- [ ] `/cruises-from-galveston/board` shows sailings
- [ ] Search functionality works
- [ ] Booking page loads
- [ ] Guest Help Desk pages load
- [ ] Phone number (409) 632-2106 appears in header/footer
- [ ] Email addresses (hello@, help@, bookings@) are correct

### 9. Content Pages

- [ ] Guest Help Desk page has content
- [ ] Embarkation Day page has content
- [ ] Parking & Transportation page has content
- [ ] First-time Cruisers page has content

### 10. Production Deployment

- [ ] Site deployed to production domain
- [ ] SSL certificate valid
- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] No console errors in browser
- [ ] Mobile responsive

## 🔍 Quick Verification Commands

### Run in Supabase SQL Editor:

```sql
-- Quick status check
SELECT 
  (SELECT COUNT(*) FROM public.ships WHERE home_port = 'Galveston') as ships,
  (SELECT COUNT(*) FROM public.sailings 
   WHERE departure_port = 'Galveston' 
     AND depart_date >= CURRENT_DATE 
     AND is_active = true) as future_sailings,
  (SELECT COUNT(*) FROM public.ship_destination_duration_seo_pages) as seo_pages;
```

**Expected minimums:**
- Ships: ≥ 3
- Future sailings: ≥ 10
- SEO pages: > 0

## 🚨 Common Go-Live Issues

1. **No sailings showing**
   - ✅ Run home_port fix migration
   - ✅ Check `departure_port = 'Galveston'` (exact match)
   - ✅ Check `depart_date >= CURRENT_DATE`
   - ✅ Check `is_active = true`

2. **Views return no data**
   - ✅ Verify `home_port = 'Galveston'` (not "GALVESTON" or "Galveston, TX")
   - ✅ Check `ports_summary` is not NULL/empty
   - ✅ Verify destination aliases exist

3. **Frontend errors**
   - ✅ Check environment variables
   - ✅ Verify Supabase connection
   - ✅ Check browser console for errors

## ✅ Final Go-Live Sign-Off

Before launching, ensure:
- [ ] All database fixes applied
- [ ] Minimum data requirements met
- [ ] Views returning data
- [ ] No demo/test data remaining
- [ ] Environment variables configured
- [ ] Frontend tested and working
- [ ] Phone/email contact info correct

**Ready to launch?** Run `go-live-checklist.sql` and verify all checks pass.
