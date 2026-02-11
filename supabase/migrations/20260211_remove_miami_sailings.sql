-- Remove Miami-origin sailings unless they are Norwegian and start/end in Galveston.
-- Keep rule: line must be Norwegian AND endpoint must be Galveston.
do $$
declare
  removed_count integer := 0;
  has_ships boolean := false;
  has_ship_id boolean := false;
  has_ship_cruise_line boolean := false;
  has_return_port boolean := false;
  has_arrival_port boolean := false;
  has_end_port boolean := false;
  has_disembark_port boolean := false;
  from_clause text := '';
  endpoint_clause text := 'false';
  norwegian_clause text := 'false';
  keep_clause text := '';
begin
  if to_regclass('public.sailings') is null then
    raise notice 'Skipping Miami cleanup: public.sailings does not exist.';
    return;
  end if;

  has_ships := to_regclass('public.ships') is not null;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sailings'
      and column_name = 'ship_id'
  ) into has_ship_id;

  if has_ships then
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'ships'
        and column_name = 'cruise_line'
    ) into has_ship_cruise_line;
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sailings'
      and column_name = 'return_port'
  ) into has_return_port;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sailings'
      and column_name = 'arrival_port'
  ) into has_arrival_port;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sailings'
      and column_name = 'end_port'
  ) into has_end_port;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sailings'
      and column_name = 'disembark_port'
  ) into has_disembark_port;

  create temporary table _miami_sailing_ids (
    id uuid primary key
  ) on commit drop;

  if has_ships and has_ship_id then
    from_clause := 'from public.sailings s left join public.ships sh on sh.id = s.ship_id';
  else
    from_clause := 'from public.sailings s';
  end if;

  endpoint_clause := endpoint_clause || ' or s.departure_port = ''Galveston''';

  if has_return_port then
    endpoint_clause := endpoint_clause || ' or s.return_port = ''Galveston''';
  end if;

  if has_arrival_port then
    endpoint_clause := endpoint_clause || ' or s.arrival_port = ''Galveston''';
  end if;

  if has_end_port then
    endpoint_clause := endpoint_clause || ' or s.end_port = ''Galveston''';
  end if;

  if has_disembark_port then
    endpoint_clause := endpoint_clause || ' or s.disembark_port = ''Galveston''';
  end if;

  if has_ships and has_ship_id and has_ship_cruise_line then
    norwegian_clause := 'sh.cruise_line ilike ''%norwegian%''';
  end if;

  keep_clause := format('(%s) and (%s)', endpoint_clause, norwegian_clause);

  execute format(
    'insert into _miami_sailing_ids (id)
     select s.id
     %s
     where s.departure_port = ''Miami''
       and not (%s)',
    from_clause,
    keep_clause
  );

  if not exists (select 1 from _miami_sailing_ids) then
    raise notice 'No removable Miami sailings found. Nothing to remove.';
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
  raise notice 'Removed % Miami sailings that do not match Norwegian + Galveston-endpoint keep rule.', removed_count;
end $$;
