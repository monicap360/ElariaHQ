-- CruiseDecisionEngine tables
create table if not exists decision_weights (
  id integer primary key,
  price numeric not null default 0.25,
  cabin numeric not null default 0.20,
  preference numeric not null default 0.20,
  demand numeric not null default 0.15,
  risk numeric not null default 0.20,
  updated_at timestamptz not null default now()
);

create table if not exists decision_overrides (
  sailing_id uuid primary key,
  disabled boolean not null default false,
  force_review boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists decision_logs (
  id uuid primary key default gen_random_uuid(),
  input_hash text not null,
  top_sailing_id uuid,
  score_spread numeric,
  confidence numeric,
  created_at timestamptz not null default now()
);

-- Optional data tables if not present
create table if not exists pricing_snapshots (
  id uuid primary key default gen_random_uuid(),
  sailing_id uuid not null,
  as_of date not null,
  currency text not null default 'USD',
  min_per_person numeric not null,
  market_median_per_person numeric,
  created_at timestamptz not null default now()
);

create table if not exists availability_cache (
  id uuid primary key default gen_random_uuid(),
  sailing_id uuid not null,
  as_of date not null,
  demand_pressure numeric,
  available_cabin_types text[],
  created_at timestamptz not null default now()
);

create table if not exists risk_snapshots (
  id uuid primary key default gen_random_uuid(),
  sailing_id uuid not null,
  as_of date not null,
  risk_score numeric,
  created_at timestamptz not null default now()
);
