-- Sync production indexes/columns with the current cruisesfromgalveston schema.
-- This migration is additive and safe to run repeatedly.
-- It aligns with existing entities: ships, sailings, pricing_snapshots, bookings (optional).

do $$
declare
  has_sailings boolean := false;
  has_ship_id boolean := false;
  has_is_active boolean := false;
  has_depart_date boolean := false;
  has_departure_date boolean := false;
  has_pricing_snapshots boolean := false;
  has_pricing_sailing_id boolean := false;
  has_pricing_as_of boolean := false;
  has_pricing_effective_date boolean := false;
begin
  has_sailings := to_regclass('public.sailings') is not null;

  if has_sailings then
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'sailings'
        and column_name = 'ship_id'
    ) into has_ship_id;

    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'sailings'
        and column_name = 'is_active'
    ) into has_is_active;

    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'sailings'
        and column_name = 'depart_date'
    ) into has_depart_date;

    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'sailings'
        and column_name = 'departure_date'
    ) into has_departure_date;

    if has_depart_date then
      execute 'create index if not exists idx_sailings_depart_date on public.sailings (depart_date)';
    elsif has_departure_date then
      execute 'create index if not exists idx_sailings_departure_date on public.sailings (departure_date)';
    end if;

    if has_ship_id then
      execute 'create index if not exists idx_sailings_ship_id on public.sailings (ship_id)';
    end if;

    if has_is_active then
      execute 'create index if not exists idx_sailings_is_active on public.sailings (is_active)';
    end if;
  end if;

  has_pricing_snapshots := to_regclass('public.pricing_snapshots') is not null;

  if has_pricing_snapshots then
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'pricing_snapshots'
        and column_name = 'sailing_id'
    ) into has_pricing_sailing_id;

    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'pricing_snapshots'
        and column_name = 'as_of'
    ) into has_pricing_as_of;

    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'pricing_snapshots'
        and column_name = 'effective_date'
    ) into has_pricing_effective_date;

    if has_pricing_sailing_id then
      execute 'create index if not exists idx_pricing_snapshots_sailing_id on public.pricing_snapshots (sailing_id)';
    end if;

    if has_pricing_as_of then
      execute 'create index if not exists idx_pricing_snapshots_as_of on public.pricing_snapshots (as_of)';
    elsif has_pricing_effective_date then
      execute 'create index if not exists idx_pricing_snapshots_effective_date on public.pricing_snapshots (effective_date)';
    end if;
  end if;

  if to_regclass('public.bookings') is not null then
    alter table public.bookings add column if not exists booking_source text default 'website';
    alter table public.bookings add column if not exists utm_params jsonb;
    alter table public.bookings add column if not exists metadata jsonb;
  end if;
end $$;
