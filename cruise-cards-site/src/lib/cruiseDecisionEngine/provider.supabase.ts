import { AvailabilitySnapshot, PricingSnapshot, RiskSnapshot, Sailing, Ship } from "./types";
import { CruiseDataProvider } from "./engine";
import { createServerClient } from "@/lib/supabase/server";

const DEFAULT_MAX_DECISION_SAILINGS = 240;
const SAILINGS_SELECT =
  "id,depart_date,return_date,nights,cruise_line,ship_id,itinerary_tags,itinerary_label,ports_summary,seapay_eligible";
const SHIPS_SELECT = "id,name,cruise_line,ship_class";
const PRICING_SELECT = "sailing_id,as_of,min_per_person,market_median_per_person";
const AVAILABILITY_SELECT = "sailing_id,as_of,demand_pressure,available_cabin_types";
const RISK_SELECT = "sailing_id,as_of,risk_score";

function resolveMaxDecisionSailings() {
  const raw = Number(process.env.DECISION_ENGINE_MAX_SAILINGS || "");
  if (Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  return DEFAULT_MAX_DECISION_SAILINGS;
}

type SailingRow = {
  id: string;
  depart_date: string;
  return_date: string;
  nights: number;
  cruise_line: string;
  ship_id: string;
  itinerary_tags?: string[] | null;
  itinerary_label?: string | null;
  ports_summary?: string | null;
  seapay_eligible?: boolean | null;
};

type ShipRow = {
  id: string;
  name: string;
  cruise_line: string;
  ship_class?: string | null;
};

type PricingLatestRow = {
  sailing_id: string;
  as_of: string;
  min_per_person: number;
  market_median_per_person?: number | null;
};

type AvailabilityLatestRow = {
  sailing_id: string;
  as_of: string;
  demand_pressure?: number | null;
  available_cabin_types?: string[] | null;
};

type RiskLatestRow = {
  sailing_id: string;
  as_of: string;
  risk_score?: number | null;
};

export function providerFromSupabase(): CruiseDataProvider {
  const server = createServerClient();
  if (!server) {
    throw new Error("Missing Supabase environment variables.");
  }
  const sb = server.client;
  const maxDecisionSailings = resolveMaxDecisionSailings();

  return {
    async getSailingById(sailingId: string) {
      const { data, error } = await sb.from("sailings").select(SAILINGS_SELECT).eq("id", sailingId).single();
      if (error) throw error;

      const row = data as SailingRow;
      return {
        id: row.id,
        departurePort: "Galveston",
        departDate: row.depart_date,
        returnDate: row.return_date,
        nights: row.nights,
        cruiseLine: row.cruise_line,
        shipId: row.ship_id,
        itineraryTags: row.itinerary_tags ?? [],
        itineraryLabel: row.itinerary_label ?? null,
        portsSummary: row.ports_summary ?? null,
        seaPayEligible: !!row.seapay_eligible,
      };
    },
    async getSailings({ departurePort, start, end, shipId }) {
      let query = sb
        .from("sailings")
        .select(SAILINGS_SELECT)
        .eq("departure_port", departurePort)
        .gte("depart_date", start)
        .lte("depart_date", end)
        .order("depart_date", { ascending: true })
        .limit(maxDecisionSailings);
      if (shipId) {
        query = query.eq("ship_id", shipId);
      }
      const { data, error } = await query;

      if (error) throw error;

      const rows = (data ?? []) as SailingRow[];
      return rows.map((row) => ({
        id: row.id,
        departurePort: "Galveston",
        departDate: row.depart_date,
        returnDate: row.return_date,
        nights: row.nights,
        cruiseLine: row.cruise_line,
        shipId: row.ship_id,
        itineraryTags: row.itinerary_tags ?? [],
        itineraryLabel: row.itinerary_label ?? null,
        portsSummary: row.ports_summary ?? null,
        seaPayEligible: Boolean(row.seapay_eligible),
      })) as Sailing[];
    },

    async getShipsByIds(shipIds) {
      if (!shipIds.length) return {};
      const { data, error } = await sb.from("ships").select(SHIPS_SELECT).in("id", shipIds);
      if (error) throw error;

      const rows = (data ?? []) as ShipRow[];
      const out: Record<string, Ship> = {};
      rows.forEach((row) => {
        out[row.id] = {
          id: row.id,
          name: row.name,
          cruiseLine: row.cruise_line,
          shipClass: row.ship_class ?? undefined,
        };
      });
      return out;
    },
    async getAllShips() {
      const { data, error } = await sb.from("ships").select(SHIPS_SELECT);
      if (error) throw error;
      const rows = (data ?? []) as ShipRow[];
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        cruiseLine: row.cruise_line,
        shipClass: row.ship_class ?? undefined,
      })) as Ship[];
    },

    async getLatestPricingBySailingIds(sailingIds) {
      if (!sailingIds.length) return {};
      const { data, error } = await sb.from("pricing_latest").select(PRICING_SELECT).in("sailing_id", sailingIds);
      if (error) throw error;

      const rows = (data ?? []) as PricingLatestRow[];
      const out: Record<string, PricingSnapshot | undefined> = {};
      for (const row of rows) {
        out[row.sailing_id] = {
          sailingId: row.sailing_id,
          asOf: row.as_of,
          currency: "USD",
          minPerPerson: Number(row.min_per_person),
          marketMedianPerPerson:
            row.market_median_per_person != null ? Number(row.market_median_per_person) : undefined,
        };
      }
      return out;
    },

    async getLatestAvailabilityBySailingIds(sailingIds) {
      if (!sailingIds.length) return {};
      const { data, error } = await sb
        .from("availability_latest")
        .select(AVAILABILITY_SELECT)
        .in("sailing_id", sailingIds);
      if (error) throw error;

      const rows = (data ?? []) as AvailabilityLatestRow[];
      const out: Record<string, AvailabilitySnapshot | undefined> = {};
      rows.forEach((row) => {
        out[row.sailing_id] = {
          sailingId: row.sailing_id,
          asOf: row.as_of,
          demandPressure: row.demand_pressure != null ? Number(row.demand_pressure) : undefined,
          availableCabinTypes: row.available_cabin_types ?? undefined,
        };
      });
      return out;
    },

    async getLatestRiskBySailingIds(sailingIds) {
      if (!sailingIds.length) return {};
      const { data, error } = await sb.from("risk_latest").select(RISK_SELECT).in("sailing_id", sailingIds);
      if (error) throw error;

      const rows = (data ?? []) as RiskLatestRow[];
      const out: Record<string, RiskSnapshot | undefined> = {};
      rows.forEach((row) => {
        out[row.sailing_id] = {
          sailingId: row.sailing_id,
          asOf: row.as_of,
          riskScore: row.risk_score != null ? Number(row.risk_score) : undefined,
        };
      });
      return out;
    },
  };
}
