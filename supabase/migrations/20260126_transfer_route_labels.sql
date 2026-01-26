-- Route labeling and constraints for transfers.
alter table public.transfer_requests
add column if not exists route_type text check (
  route_type in ('airport_to_ship','hotel_to_ship','ship_to_airport','ship_to_hotel')
),
add column if not exists ship_name text;

create or replace view public.v_transfer_routes as
select
  tr.id,
  tr.route_type,
  tr.ship_name,
  pl.name as pickup_name,
  pl.area as pickup_area,
  dl.name as dropoff_name,
  dl.area as dropoff_area,
  case
    when tr.route_type = 'airport_to_ship' then pl.name || ' -> ' || tr.ship_name
    when tr.route_type = 'hotel_to_ship' then pl.name || ' -> ' || tr.ship_name
    when tr.route_type = 'ship_to_airport' then tr.ship_name || ' -> ' || dl.name
    when tr.route_type = 'ship_to_hotel' then tr.ship_name || ' -> ' || dl.name
    else coalesce(pl.name, 'Unknown') || ' -> ' || coalesce(dl.name, 'Unknown')
  end as route_label
from public.transfer_requests tr
left join public.transfer_locations pl on pl.id = tr.pickup_location_id
left join public.transfer_locations dl on dl.id = tr.dropoff_location_id;
