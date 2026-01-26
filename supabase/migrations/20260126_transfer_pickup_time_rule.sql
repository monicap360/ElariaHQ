-- Enforce earliest transfer pickup time (Galveston local time).
alter table public.transfer_requests
add constraint transfer_pickup_time_min
check ((pickup_time at time zone 'America/Chicago')::time >= time '07:30');
