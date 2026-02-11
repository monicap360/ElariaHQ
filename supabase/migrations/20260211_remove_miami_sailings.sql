-- Keep Galveston-only inventory by removing Miami sailings and related snapshots.
do $$
declare
  removed_count integer := 0;
begin
  if to_regclass('public.sailings') is null then
    raise notice 'Skipping Miami cleanup: public.sailings does not exist.';
    return;
  end if;

  create temporary table _miami_sailing_ids (
    id uuid primary key
  ) on commit drop;

  insert into _miami_sailing_ids (id)
  select s.id
  from public.sailings s
  where s.departure_port = 'Miami';

  if not exists (select 1 from _miami_sailing_ids) then
    raise notice 'No Miami sailings found. Nothing to remove.';
    return;
  end if;

  if to_regclass('public.public_sailing_prices') is not null then
    delete from public.public_sailing_prices p
    using _miami_sailing_ids m
    where p.sailing_id = m.id;
  end if;

  if to_regclass('public.pricing_snapshots') is not null then
    delete from public.pricing_snapshots p
    using _miami_sailing_ids m
    where p.sailing_id = m.id;
  end if;

  if to_regclass('public.availability_cache') is not null then
    delete from public.availability_cache a
    using _miami_sailing_ids m
    where a.sailing_id = m.id;
  end if;

  if to_regclass('public.risk_snapshots') is not null then
    delete from public.risk_snapshots r
    using _miami_sailing_ids m
    where r.sailing_id = m.id;
  end if;

  if to_regclass('public.decision_overrides') is not null then
    delete from public.decision_overrides d
    using _miami_sailing_ids m
    where d.sailing_id = m.id;
  end if;

  delete from public.sailings s
  using _miami_sailing_ids m
  where s.id = m.id;

  get diagnostics removed_count = row_count;
  raise notice 'Removed % Miami sailings; Galveston inventory retained.', removed_count;
end $$;
