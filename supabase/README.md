# Supabase Edge Functions

## Deploy topical-ownership

1) Login and link to your project:

```
supabase login
supabase link --project-ref <your-project-ref>
```

2) Set the service role secret used by the function:

```
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

3) Deploy the function:

```
supabase functions deploy topical-ownership
```

4) Invoke it (optional):

```
supabase functions invoke topical-ownership
```

## Run migrations and seed data

This repository ships SQL migrations and seed data under `supabase/migrations` and
`supabase/seed`. Use the helper script to apply them to the correct Supabase
database.

```bash
export SUPABASE_DB_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
./supabase/run-migrations.sh
```

## Notes

- `SUPABASE_URL` is provided by Supabase Edge Functions.
- The function uses `SUPABASE_SERVICE_ROLE_KEY` to write tasks.
