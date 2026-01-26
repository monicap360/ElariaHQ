insert into public.transfer_rules (vehicle_type, max_passengers, max_luggage, notes)
values ('sedan_4pax', 4, 4, 'Standard sedan with trunk luggage only')
on conflict do nothing;
