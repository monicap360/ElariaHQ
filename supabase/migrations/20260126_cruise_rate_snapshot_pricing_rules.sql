-- Enforce public pricing rules for cruise rate snapshots.
alter table public.cruise_rate_snapshots
add column if not exists excludes_gratuities boolean default true,
add column if not exists excludes_vacation_protection boolean default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rate_snapshots_public_price_rule'
  ) then
    alter table public.cruise_rate_snapshots
      add constraint rate_snapshots_public_price_rule
      check (
        start_price is null
        or taxes_fees_included = true
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'rate_snapshots_exclusions_locked'
  ) then
    alter table public.cruise_rate_snapshots
      add constraint rate_snapshots_exclusions_locked
      check (
        excludes_gratuities = true
        and excludes_vacation_protection = true
      );
  end if;
end $$;
