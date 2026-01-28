import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rankCruiseSailings, DEFAULT_WEIGHTS } from "@/lib/cruiseDecisionEngine/engine";
import {
  AvailabilitySnapshot,
  CruiseDecisionInput,
  CruiseDecisionResult,
  PricingSnapshot,
  RiskSnapshot,
  Sailing,
  Ship,
  stableHash,
} from "@/lib/cruiseDecisionEngine/types";

type DecisionOverride = {
  sailing_id: string;
  disabled: boolean | null;
  force_review: boolean | null;
  note: string | null;
};

type SailingRow = {
  id: string;
  sail_date: string;
  return_date: string;
  ports?: string[] | string | null;
  itinerary?: string | null;
  departure_port?: string | null;
  sea_pay_eligible?: boolean | null;
  price_from?: number | string | null;
  base_price?: number | string | null;
  starting_price?: number | string | null;
  min_price?: number | string | null;
  ship: {
    id: string;
    name: string;
    ship_class?: string | null;
    cruise_line: { name?: string | null } | null;
  } | null;
};

type RawSailingRow = {
  id: string;
  sail_date: string;
  return_date: string;
  ports?: string[] | string | null;
  itinerary?: string | null;
  departure_port?: string | null;
  sea_pay_eligible?: boolean | null;
  price_from?: number | string | null;
  base_price?: number | string | null;
  starting_price?: number | string | null;
  min_price?: number | string | null;
  ship:
    | {
        id: string;
        name: string;
        ship_class?: string | null;
        cruise_line: { name?: string | null } | { name?: string | null }[] | null;
      }
    | {
        id: string;
        name: string;
        ship_class?: string | null;
        cruise_line: { name?: string | null } | { name?: string | null }[] | null;
      }[]
    | null;
};

type PricingSnapshotRow = {
  sailing_id: string;
  as_of: string;
  currency: string | null;
  min_per_person: number | null;
  market_median_per_person?: number | null;
};

type AvailabilitySnapshotRow = {
  sailing_id: string;
  as_of: string;
  demand_pressure?: number | null;
  available_cabin_types?: string[] | null;
};

type RiskSnapshotRow = {
  sailing_id: string;
  as_of: string;
  risk_score?: number | null;
};

type DecisionResultWithSailing = CruiseDecisionResult & {
  sailing: SailingRow & {
    cruise_line: string | null;
  };
};

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ results: [] });
  }

  const input = (await req.json()) as CruiseDecisionInput;
  const supabase = createAdminClient();

  const weights = await loadWeights(supabase);
  const overrides = await loadOverrides(supabase);

  const { data: sailingsData } = await supabase
    .from("sailings")
    .select(
      "id,sail_date,return_date,ports,itinerary,departure_port,sea_pay_eligible,price_from,base_price,starting_price,min_price,ship:ships(id,name,ship_class,cruise_line:cruise_lines(name))"
    )
    .eq("is_active", true)
    .order("sail_date", { ascending: true })
    .limit(500);

  const sailings =
    (sailingsData as RawSailingRow[] | null | undefined)?.map((row) => {
      const shipRow = Array.isArray(row.ship) ? row.ship[0] : row.ship;
      const cruiseLineRow = Array.isArray(shipRow?.cruise_line)
        ? shipRow?.cruise_line[0]
        : shipRow?.cruise_line;
      return {
        ...row,
        ship: shipRow
          ? {
              id: shipRow.id,
              name: shipRow.name,
              ship_class: shipRow.ship_class ?? null,
              cruise_line: cruiseLineRow ? { name: cruiseLineRow.name ?? null } : null,
            }
          : null,
      } satisfies SailingRow;
    }) ?? [];
  const sailingContext = mapSailings(sailings);
  const ships = mapShips(sailings);

  const [pricing, availability, risks] = await Promise.all([
    loadPricing(supabase),
    loadAvailability(supabase),
    loadRisk(supabase),
  ]);

  const results = rankCruiseSailings(
    input,
    {
      sailings: sailingContext,
      ships,
      pricing,
      availability,
      risks,
    },
    weights
  );

  const overrideMap = new Map(overrides.map((row) => [row.sailing_id, row]));
  const filtered = results.filter((result) => {
    const override = overrideMap.get(result.sailingId);
    return !override?.disabled;
  });

  const resultsWithSailings: DecisionResultWithSailing[] = filtered.map((result) => {
    const sailing = sailings.find((row) => row.id === result.sailingId);
    const lineName = sailing?.ship?.cruise_line?.name ?? null;
    return {
      ...result,
      flags: mergeFlags(result.flags, overrideMap.get(result.sailingId)),
      sailing: {
        ...(sailing || {
          id: result.sailingId,
          sail_date: "",
          return_date: "",
          ports: null,
          itinerary: null,
          departure_port: null,
          sea_pay_eligible: null,
          ship: null,
        }),
        cruise_line: lineName,
      },
    };
  });

  await logDecision(supabase, input, resultsWithSailings);

  return NextResponse.json({ results: resultsWithSailings });
}

async function loadWeights(supabase: ReturnType<typeof createAdminClient>) {
  const { data, error } = await supabase.from("decision_weights").select("*").limit(1).maybeSingle();
  if (error || !data) return DEFAULT_WEIGHTS;
  return {
    price: Number(data.price ?? DEFAULT_WEIGHTS.price),
    cabin: Number(data.cabin ?? DEFAULT_WEIGHTS.cabin),
    preference: Number(data.preference ?? DEFAULT_WEIGHTS.preference),
    demand: Number(data.demand ?? DEFAULT_WEIGHTS.demand),
    risk: Number(data.risk ?? DEFAULT_WEIGHTS.risk),
  };
}

async function loadOverrides(supabase: ReturnType<typeof createAdminClient>) {
  const { data, error } = await supabase
    .from("decision_overrides")
    .select("sailing_id,disabled,force_review,note");
  if (error || !data) return [];
  return data as DecisionOverride[];
}

async function loadPricing(supabase: ReturnType<typeof createAdminClient>): Promise<PricingSnapshot[]> {
  const { data, error } = await supabase
    .from("pricing_snapshots")
    .select("sailing_id,as_of,currency,min_per_person,market_median_per_person")
    .order("as_of", { ascending: false });
  if (error || !data) return [];
  const seen = new Set<string>();
  return (data as PricingSnapshotRow[])
    .filter((row) => {
      if (seen.has(row.sailing_id)) return false;
      seen.add(row.sailing_id);
      return true;
    })
    .map((row) => ({
      sailingId: row.sailing_id,
      asOf: row.as_of,
      currency: "USD",
      minPerPerson: Number(row.min_per_person ?? 0),
      marketMedianPerPerson: row.market_median_per_person ? Number(row.market_median_per_person) : undefined,
    }));
}

async function loadAvailability(supabase: ReturnType<typeof createAdminClient>): Promise<AvailabilitySnapshot[]> {
  const { data, error } = await supabase
    .from("availability_cache")
    .select("sailing_id,as_of,demand_pressure,available_cabin_types")
    .order("as_of", { ascending: false });
  if (error || !data) return [];
  const seen = new Set<string>();
  return (data as AvailabilitySnapshotRow[])
    .filter((row) => {
      if (seen.has(row.sailing_id)) return false;
      seen.add(row.sailing_id);
      return true;
    })
    .map((row) => ({
      sailingId: row.sailing_id,
      asOf: row.as_of,
      demandPressure: row.demand_pressure ?? undefined,
      availableCabinTypes: row.available_cabin_types ?? undefined,
    }));
}

async function loadRisk(supabase: ReturnType<typeof createAdminClient>): Promise<RiskSnapshot[]> {
  const { data, error } = await supabase
    .from("risk_snapshots")
    .select("sailing_id,as_of,risk_score")
    .order("as_of", { ascending: false });
  if (error || !data) return [];
  const seen = new Set<string>();
  return (data as RiskSnapshotRow[])
    .filter((row) => {
      if (seen.has(row.sailing_id)) return false;
      seen.add(row.sailing_id);
      return true;
    })
    .map((row) => ({
      sailingId: row.sailing_id,
      asOf: row.as_of,
      riskScore: row.risk_score ?? undefined,
    }));
}

function mapSailings(rows: SailingRow[]): Sailing[] {
  return rows.map((row) => ({
    id: row.id,
    departurePort: row.departure_port || "Galveston",
    departDate: row.sail_date,
    returnDate: row.return_date,
    nights: calcNights(row.sail_date, row.return_date),
    cruiseLine: row.ship?.cruise_line?.name ?? "Unknown",
    shipId: row.ship?.id ?? "unknown",
    itineraryTags: splitTags(row.ports, row.itinerary),
    seaPayEligible: Boolean(row.sea_pay_eligible),
  }));
}

function mapShips(rows: SailingRow[]): Ship[] {
  const map = new Map<string, Ship>();
  rows.forEach((row) => {
    if (!row.ship?.id) return;
    if (map.has(row.ship.id)) return;
    map.set(row.ship.id, {
      id: row.ship.id,
      name: row.ship.name,
      cruiseLine: row.ship.cruise_line?.name ?? "Unknown",
      shipClass: row.ship.ship_class ?? undefined,
    });
  });
  return Array.from(map.values());
}

function splitTags(ports?: string[] | string | null, itinerary?: string | null) {
  const tags: string[] = [];
  if (Array.isArray(ports)) {
    ports.forEach((port) => {
      if (port) tags.push(String(port));
    });
  } else if (typeof ports === "string") {
    ports.split(",").forEach((port) => {
      if (port.trim()) tags.push(port.trim());
    });
  }
  if (itinerary) {
    itinerary.split(",").forEach((port) => {
      if (port.trim()) tags.push(port.trim());
    });
  }
  return tags.map((tag) => tag.trim()).filter(Boolean);
}

function calcNights(start?: string | null, end?: string | null) {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(diff)) return 0;
  return Math.max(0, Math.round(diff / 86400000));
}

function mergeFlags(flags?: string[], override?: DecisionOverride) {
  const next = [...(flags ?? [])];
  if (override?.force_review) next.push("force_review");
  return next.length ? next : undefined;
}

async function logDecision(
  supabase: ReturnType<typeof createAdminClient>,
  input: CruiseDecisionInput,
  results: DecisionResultWithSailing[]
) {
  if (!results.length) return;
  const scores = results.map((item) => item.score).sort((a, b) => a - b);
  const top = scores[scores.length - 1] ?? 0;
  const median = scores[Math.floor(scores.length / 2)] ?? 0;
  const scoreSpread = Math.max(0, top - median);
  const confidence = results[0]?.confidence ?? 0;

  await supabase.from("decision_logs").insert({
    input_hash: stableHash(input),
    top_sailing_id: results[0]?.sailingId ?? null,
    score_spread: scoreSpread,
    confidence,
  });
}
