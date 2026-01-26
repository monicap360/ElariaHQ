create table if not exists public.transfer_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  area text check (area in ('seawall','61st','harborside','airport')),
  city text default 'Galveston',
  state text default 'TX',
  latitude numeric,
  longitude numeric,
  max_vehicle_type text default 'sedan_4pax',
  notes text,
  active boolean default true
);

create table if not exists public.transfer_rules (
  id uuid primary key default gen_random_uuid(),
  vehicle_type text check (vehicle_type in ('sedan_4pax')),
  max_passengers int not null default 4,
  max_luggage int not null default 4,
  notes text
);

create table if not exists public.transfer_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  pickup_location_id uuid references public.transfer_locations(id),
  dropoff_location_id uuid references public.transfer_locations(id),
  pickup_time timestamptz not null,
  passengers int check (passengers between 1 and 4),
  luggage_count int check (luggage_count between 0 and 4),
  vehicle_type text default 'sedan_4pax',
  status text check (status in ('requested','confirmed','completed','cancelled')) default 'requested',
  created_by text default 'transport_agent',
  created_at timestamptz default now(),
  notes text
);
