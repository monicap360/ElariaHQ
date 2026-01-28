import { createClient } from "@supabase/supabase-js";
import { AvailabilitySnapshot, PricingSnapshot, RiskSnapshot, Sailing, Ship } from "./types";
import { CruiseDataProvider } from "./engine";

type SailingRow = {
  id: string;
  depart_date: string;
  return_date: string;
  nights: number;
  cruise_line: string;
  ship_id: string;
  itinerary_tags?: string[] | null;
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

function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function providerFromSupabase(): CruiseDataProvider {
  const sb = supabaseServer();

  return {
    async getSailingById(sailingId: string) {
      const { data, error } = await sb.from("sailings").select("*").eq("id", sailingId).single();
      if (error) throw error;

      return {
        id: data.id,
        departurePort: "Galveston",
        departDate: data.depart_date,
        returnDate: data.return_date,
        nights: data.nights,
        cruiseLine: data.cruise_line,
        shipId: data.ship_id,
        itineraryTags: data.itinerary_tags ?? [],
        seaPayEligible: !!data.seapay_eligible,
      };
    },
    async getSailings({ departurePort, start, end, shipId }) {
      let query = sb
        .from("sailings")
        .select("*")
        .eq("departure_port", departurePort)
        .gte("depart_date", start)
        .lte("depart_date", end);
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
        seaPayEligible: Boolean(row.seapay_eligible),
      })) as Sailing[];
    },

    async getShipsByIds(shipIds) {
      if (!shipIds.length) return {};
      const { data, error } = await sb.from("ships").select("*").in("id", shipIds);
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
      const { data, error } = await sb.from("ships").select("*");
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
      const { data, error } = await sb.from("pricing_latest").select("*").in("sailing_id", sailingIds);
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
      const { data, error } = await sb.from("availability_latest").select("*").in("sailing_id", sailingIds);
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
      const { data, error } = await sb.from("risk_latest").select("*").in("sailing_id", sailingIds);
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
