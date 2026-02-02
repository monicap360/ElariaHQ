# Populating Cabin-Level Pricing

## Overview

The `public_sailing_prices` table stores per-cabin-type pricing for each sailing. This allows the frontend to display detailed pricing breakdowns (Interior, Ocean View, Balcony, Suite, etc.).

## Table Structure

```sql
public_sailing_prices
├── id (uuid, primary key)
├── sailing_id (uuid, foreign key to sailings)
├── cabin_type (text, e.g., "Interior", "Ocean View", "Balcony", "Suite")
├── price (numeric, per-person price >= 0)
├── currency (text, default 'USD')
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

**Unique constraint:** One price per cabin type per sailing (`sailing_id`, `cabin_type`)

## Common Cabin Types

Based on the codebase, these are the standard cabin types:
- `Interior` - Inside cabins (no window)
- `Ocean View` - Outside cabins with window/porthole
- `Balcony` - Outside cabins with private balcony
- `Suite` - Premium suites with extra space/amenities

## Sample Insert Queries

### Single Sailing, Multiple Cabin Types

```sql
-- Example: Add pricing for a specific sailing
INSERT INTO public.public_sailing_prices (sailing_id, cabin_type, price, currency)
VALUES
  ('<sailing-uuid>', 'Interior', 599.00, 'USD'),
  ('<sailing-uuid>', 'Ocean View', 799.00, 'USD'),
  ('<sailing-uuid>', 'Balcony', 999.00, 'USD'),
  ('<sailing-uuid>', 'Suite', 1499.00, 'USD')
ON CONFLICT (sailing_id, cabin_type) 
DO UPDATE SET 
  price = EXCLUDED.price,
  updated_at = now();
```

### Bulk Insert from pricing_snapshots (with estimated cabin pricing)

```sql
-- Generate estimated cabin pricing based on min_per_person
-- This is a starting point - adjust multipliers based on your pricing strategy
INSERT INTO public.public_sailing_prices (sailing_id, cabin_type, price, currency)
SELECT 
  ps.sailing_id,
  cabin_type,
  CASE cabin_type
    WHEN 'Interior' THEN ps.min_per_person * 1.0
    WHEN 'Ocean View' THEN ps.min_per_person * 1.25
    WHEN 'Balcony' THEN ps.min_per_person * 1.5
    WHEN 'Suite' THEN ps.min_per_person * 2.0
  END as price,
  ps.currency
FROM public.pricing_snapshots ps
CROSS JOIN (
  SELECT 'Interior' as cabin_type
  UNION ALL SELECT 'Ocean View'
  UNION ALL SELECT 'Balcony'
  UNION ALL SELECT 'Suite'
) cabin_types
WHERE ps.as_of = (
  SELECT MAX(as_of) 
  FROM public.pricing_snapshots ps2 
  WHERE ps2.sailing_id = ps.sailing_id
)
ON CONFLICT (sailing_id, cabin_type) 
DO UPDATE SET 
  price = EXCLUDED.price,
  updated_at = now();
```

### Update Pricing for All Future Sailings

```sql
-- Update pricing for all active future sailings from Galveston
-- Adjust the multipliers (1.0, 1.25, 1.5, 2.0) based on your actual pricing strategy
WITH latest_pricing AS (
  SELECT DISTINCT ON (sailing_id)
    sailing_id,
    min_per_person,
    currency
  FROM public.pricing_snapshots
  WHERE sailing_id IN (
    SELECT id FROM public.sailings
    WHERE departure_port = 'Galveston'
      AND is_active = true
      AND depart_date >= (now() at time zone 'UTC')::date
  )
  ORDER BY sailing_id, as_of DESC
)
INSERT INTO public.public_sailing_prices (sailing_id, cabin_type, price, currency)
SELECT 
  lp.sailing_id,
  ct.cabin_type,
  CASE ct.cabin_type
    WHEN 'Interior' THEN lp.min_per_person * 1.0
    WHEN 'Ocean View' THEN lp.min_per_person * 1.25
    WHEN 'Balcony' THEN lp.min_per_person * 1.5
    WHEN 'Suite' THEN lp.min_per_person * 2.0
  END as price,
  lp.currency
FROM latest_pricing lp
CROSS JOIN (
  VALUES 
    ('Interior'),
    ('Ocean View'),
    ('Balcony'),
    ('Suite')
) AS ct(cabin_type)
ON CONFLICT (sailing_id, cabin_type) 
DO UPDATE SET 
  price = EXCLUDED.price,
  updated_at = now();
```

## Verification Queries

### Check Coverage

```sql
-- How many sailings have cabin-level pricing?
SELECT 
  COUNT(DISTINCT sailing_id) as sailings_with_pricing,
  COUNT(*) as total_cabin_prices,
  COUNT(*) / COUNT(DISTINCT sailing_id) as avg_cabins_per_sailing
FROM public.public_sailing_prices;
```

### Find Sailings Missing Pricing

```sql
-- Sailings without any cabin-level pricing
SELECT 
  s.id,
  sh.name as ship_name,
  s.depart_date,
  ps.min_per_person as has_min_price
FROM public.sailings s
INNER JOIN public.ships sh ON sh.id = s.ship_id
LEFT JOIN public.public_sailing_prices psp ON psp.sailing_id = s.id
LEFT JOIN (
  SELECT DISTINCT ON (sailing_id) sailing_id, min_per_person
  FROM public.pricing_snapshots
  ORDER BY sailing_id, as_of DESC
) ps ON ps.sailing_id = s.id
WHERE s.departure_port = 'Galveston'
  AND s.is_active = true
  AND s.depart_date >= (now() at time zone 'UTC')::date
  AND psp.sailing_id IS NULL
ORDER BY s.depart_date ASC;
```

### Sample Pricing Display

```sql
-- View pricing for a specific sailing
SELECT 
  sh.name as ship_name,
  s.depart_date,
  psp.cabin_type,
  psp.price,
  psp.currency
FROM public.public_sailing_prices psp
INNER JOIN public.sailings s ON s.id = psp.sailing_id
INNER JOIN public.ships sh ON sh.id = s.ship_id
WHERE psp.sailing_id = '<sailing-uuid>'
ORDER BY 
  CASE psp.cabin_type
    WHEN 'Interior' THEN 1
    WHEN 'Ocean View' THEN 2
    WHEN 'Balcony' THEN 3
    WHEN 'Suite' THEN 4
    ELSE 5
  END;
```

## Notes

1. **Pricing Strategy**: The multipliers in the bulk insert queries (1.0, 1.25, 1.5, 2.0) are examples. Adjust based on your actual pricing structure.

2. **Data Source**: If you have actual cabin-level pricing from your cruise line API or booking system, use that instead of estimated multipliers.

3. **Currency**: Currently defaults to 'USD'. If you support multiple currencies, ensure consistency across all cabin types for a given sailing.

4. **Updates**: Use `ON CONFLICT ... DO UPDATE` to refresh pricing without creating duplicates.

5. **Frontend Display**: The `SailingDetailsClient` component will automatically display this data once populated.
