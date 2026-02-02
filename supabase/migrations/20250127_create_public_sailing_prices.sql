-- Create public_sailing_prices table for cabin-level pricing display
-- This table stores per-cabin-type pricing for each sailing, allowing
-- the frontend to display detailed pricing breakdowns (Interior, Ocean View, Balcony, Suite, etc.)

create table if not exists public.public_sailing_prices (
  id uuid primary key default gen_random_uuid(),
  sailing_id uuid not null references public.sailings(id) on delete cascade,
  cabin_type text not null,
  price numeric not null check (price >= 0),
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Ensure one price per cabin type per sailing
  unique(sailing_id, cabin_type)
);

-- Index for fast lookups by sailing_id (most common query pattern)
create index if not exists idx_public_sailing_prices_sailing_id 
  on public.public_sailing_prices(sailing_id);

-- Index for cabin_type lookups (useful for filtering/aggregation)
create index if not exists idx_public_sailing_prices_cabin_type 
  on public.public_sailing_prices(cabin_type);

-- Composite index for common query: sailing_id + cabin_type
create index if not exists idx_public_sailing_prices_sailing_cabin 
  on public.public_sailing_prices(sailing_id, cabin_type);

-- Function to update updated_at timestamp
create or replace function public.update_public_sailing_prices_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
drop trigger if exists trigger_update_public_sailing_prices_updated_at on public.public_sailing_prices;
create trigger trigger_update_public_sailing_prices_updated_at
  before update on public.public_sailing_prices
  for each row
  execute function public.update_public_sailing_prices_updated_at();

-- Grant SELECT to anon role (public read access)
grant select on public.public_sailing_prices to anon;

-- Grant SELECT to authenticated role (for logged-in users)
grant select on public.public_sailing_prices to authenticated;

-- Add table comment
comment on table public.public_sailing_prices is 
  'Public-facing cabin-level pricing for sailings. Stores per-person pricing for each cabin type (Interior, Ocean View, Balcony, Suite, etc.) per sailing. Prices are in the specified currency and represent per-person rates.';

-- Add column comments
comment on column public.public_sailing_prices.sailing_id is 
  'Foreign key to public.sailings. The sailing this pricing applies to.';

comment on column public.public_sailing_prices.cabin_type is 
  'Cabin category name (e.g., "Interior", "Ocean View", "Balcony", "Suite"). Case-sensitive as stored.';

comment on column public.public_sailing_prices.price is 
  'Per-person price in the specified currency. Must be >= 0.';

comment on column public.public_sailing_prices.currency is 
  'ISO currency code (default: USD).';
