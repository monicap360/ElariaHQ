# Guardrails Explained

## 🛡️ What Are Guardrails?

Guardrails prevent the `sail_date` vs `depart_date` issue from happening again. They provide:
- **Documentation** - Clear source of truth
- **Monitoring** - Health checks to catch issues early
- **Automation** - Canary queries for alerts

## 📋 Guardrail 1: Schema Comment

**What it does:**
Documents that `depart_date` is the source of truth, and views may alias it as `sail_date` for compatibility.

**Why it matters:**
Future developers (or you in 6 months) will see this comment and know not to use `sail_date` in new views.

**Location:**
```sql
comment on column public.sailings.depart_date is
'Source-of-truth sailing departure date. Public views may alias this as sail_date for frontend compatibility.';
```

## 📊 Guardrail 2: Inventory Health Check View

**What it does:**
Provides a single view that shows:
- Count of upcoming sailings
- Next sailing date
- Last loaded sailing date
- Status (✅ OK, ⚠️ WARNING, or ❌ ERROR)

**Why it matters:**
If sailings disappear, you'll see it immediately. No more "why isn't anything showing?"

**Usage:**
```sql
SELECT * FROM public.inventory_health_check;
```

**Status meanings:**
- `✅ OK` - Everything working, sailings in next 30 days
- `⚠️ WARNING` - Sailings exist but none in next 30 days
- `❌ ERROR` - No future sailings found (views broken or data issue)

## 🔔 Guardrail 3: Canary Query

**What it does:**
A simple query that returns `true` if sailings exist, `false` if broken.

**Why it matters:**
Can be automated in:
- Cron jobs
- Health check endpoints
- Monitoring services (UptimeRobot, Pingdom, etc.)
- Supabase Edge Functions

**Usage:**
```sql
-- Non-throwing version (recommended)
SELECT 
  COUNT(*) > 0 as is_healthy
FROM public.ship_destination_duration_seo_pages
WHERE sail_date >= (now() at time zone 'UTC')::date;
```

**API Endpoint:**
Visit `/api/inventory-health` to get health status as JSON.

## 🎯 How to Use These

### Daily Check (Manual)
```sql
SELECT * FROM public.inventory_health_check;
```

### Automated Monitoring
1. **Set up cron job** (Supabase Edge Function or external service)
2. **Query:** `/api/inventory-health`
3. **Alert if:** `healthy: false` or status code is 503

### Dashboard Display
Use `inventory_health_check` view to show:
- "Next sailing: [date]"
- "X upcoming sailings"
- Status badge (green/yellow/red)

## 🚨 What Happens If Guardrails Trigger

### If `inventory_health_check` shows ❌ ERROR:

1. **Check views are working:**
   ```sql
   SELECT COUNT(*) FROM public.ship_destination_duration_seo_pages;
   ```

2. **Check data exists:**
   ```sql
   SELECT COUNT(*) FROM public.sailings 
   WHERE depart_date >= CURRENT_DATE;
   ```

3. **Check home_port:**
   ```sql
   SELECT DISTINCT home_port FROM public.ships;
   ```

4. **Check column mapping:**
   ```sql
   -- Should return rows
   SELECT * FROM public.ship_destination_duration_seo_pages LIMIT 1;
   ```

## 📈 Future Enhancements

You mentioned these options - here's how to implement:

### 1. Homepage Badge ("Next sailing: ...")
```typescript
// In your homepage component
const { data } = await fetch('/api/inventory-health');
const nextSailing = data?.next_sailing;
// Display: "Next sailing: {nextSailing}"
```

### 2. Supabase Edge Function Alert
Create an Edge Function that:
- Runs on schedule (cron)
- Queries `inventory_health_check`
- Sends email/Slack if status != '✅ OK'

### 3. Per-Cruise-Line Health Checks
```sql
CREATE VIEW public.cruise_line_health_check AS
SELECT 
  cruise_line,
  COUNT(*) as sailings,
  MIN(sail_date) as next_sailing,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ ERROR'
    ELSE '✅ OK'
  END as status
FROM public.ship_destination_duration_seo_pages
GROUP BY cruise_line;
```

## ✅ Quick Reference

**Check health:**
```sql
SELECT * FROM public.inventory_health_check;
```

**API endpoint:**
```
GET /api/inventory-health
```

**Canary query:**
```sql
SELECT COUNT(*) > 0 as healthy 
FROM public.ship_destination_duration_seo_pages
WHERE sail_date >= CURRENT_DATE;
```
