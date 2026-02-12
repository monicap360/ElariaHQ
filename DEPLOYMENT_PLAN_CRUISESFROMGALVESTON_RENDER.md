# Deployment Plan for cruisesfromgalveston.net (Current Repo-Compatible Flow)

This plan is corrected for the **existing stack in this repository**:

- Deployment platform: **Render**
- Core data model: `public.ships`, `public.sailings`, `public.pricing_snapshots`, `public.public_sailing_prices`
- Existing migration runner: `supabase/run-migrations.sh` and `supabase/run-migrations.ps1`
- Existing booking flow: frontend calls RPC `create_booking_with_rooms`

---

## Phase 0 - Preflight and Backup

1. Ensure you are deploying from `main`.
2. Confirm environment variables are present in Render:
   - `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_DB_URL` (for migration runs outside Render build)
3. Backup before schema changes:

```bash
pg_dump -h <supabase-host> -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## Phase 1 - Database Migration (Schema-Safe, Additive)

Use migrations in `supabase/migrations` only (no ad-hoc SQL executor required).

Added migration:

- `supabase/migrations/20260212_existing_schema_sync.sql`

What it does safely:

- Adds missing `sailings` indexes based on existing columns:
  - `depart_date` (or fallback to `departure_date` if that exists in your DB)
  - `ship_id`
  - `is_active`
- Adds missing `pricing_snapshots` indexes:
  - `sailing_id`
  - `as_of` (or fallback to `effective_date`)
- Adds optional booking metadata columns if `public.bookings` exists:
  - `booking_source`
  - `utm_params`
  - `metadata`

No destructive changes are included.

---

## Phase 2 - Run Migrations and Seed Data

### Linux/macOS

```bash
export SUPABASE_DB_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
./supabase/run-migrations.sh
```

### PowerShell

```powershell
$env:SUPABASE_DB_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
.\supabase\run-migrations.ps1
```

The existing runner already:

1. Applies all files in `supabase/migrations`
2. Applies all files in `supabase/seed`
3. Applies `cruise-cards-site/src/supporting-materials/sailings-seed.sql`
4. Prints verification counts for ships/sailings

---

## Phase 3 - Build and Deploy (Render)

### Render settings (recommended)

- Build command:

```bash
npm ci --prefer-offline --no-audit --no-fund && NODE_OPTIONS="--max-old-space-size=384" NEXT_TELEMETRY_DISABLED=1 SKIP_ENV_VALIDATION=true SKIP_TYPECHECK=true npm run build
```

- Start command:

```bash
npm start
```

### Memory guard already in repo

- `next.config.ts` sets:
  - `experimental.cpus = 1`

This keeps build worker memory low for 512 MB plans.

---

## Phase 4 - Post-Deploy Verification

1. Confirm deployed commit in logs is latest `main`.
2. Check app health endpoints:
   - `/api/health`
   - `/api/env-check`
3. Check live data endpoint:
   - `/api/board-sailings`
4. Check user-facing pages:
   - `/cruises-from-galveston/board`
   - `/cruises-from-galveston/planning-tools`
   - `/booking`

Optional quick checks:

```bash
curl -s https://www.cruisesfromgalveston.net/api/health
curl -s https://www.cruisesfromgalveston.net/api/env-check
curl -s https://www.cruisesfromgalveston.net/api/board-sailings
```

---

## Phase 5 - Rollback Plan

If deployment fails:

1. In Render, redeploy the previous successful commit.
2. Revert the problematic git commit on `main`.
3. Redeploy the reverted `main`.

Because migrations here are additive, application rollback is usually enough unless a specific migration side effect is identified.

---

## Notes on Removed/Adjusted Ideas

The following items from generic deployment plans were intentionally not used because they do not match this repo:

- Vercel deployment commands/workflows
- `exec_sql` RPC-driven migration executor
- `_migrations` tracking table runner script
- Column assumptions like `sailings.departure_date` or `pricing_snapshots.effective_date` as the primary schema

This plan aligns with the current codebase and existing Supabase migration workflow.
