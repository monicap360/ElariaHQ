import { AvailabilitySnapshot, PricingSnapshot, RiskSnapshot, Sailing, Ship } from "./types";
import { CruiseDataProvider } from "./engine";
import { createServerClient } from "@/lib/supabase/server";

type SailingRow = {
  id: string;
  depart_date?: string | null;
  sail_date?: string | null;
  return_date?: string | null;
  nights?: number | null;
  duration?: number | null;
  cruise_line?: string | null;
  ship_id?: string | null;
  departure_port?: string | null;
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

  function normalizeDepartDate(row: SailingRow): string {
    const value = row.depart_date ?? row.sail_date;
    if (!value) throw new Error("Sailing row is missing depart_date/sail_date.");
    return value;
  }

  function normalizeReturnDate(row: SailingRow): string {
    const value = row.return_date;
    if (!value) {
      // Some datasets may omit return date; keep it as the depart date as a safe fallback.
      return normalizeDepartDate(row);
    }
    return value;
  }

  function normalizeNights(row: SailingRow): number {
    const value = row.nights ?? row.duration;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    // last resort: compute from dates if possible
    const start = new Date(normalizeDepartDate(row)).getTime();
    const end = new Date(normalizeReturnDate(row)).getTime();
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return Number.isFinite(diff) ? Math.max(0, diff) : 0;
  }

  async function querySailingsByDateRange(column: "depart_date" | "sail_date", departurePort: string, start: string, end: string, shipId?: string) {
    let query = sb.from("sailings").select("*").eq("departure_port", departurePort).gte(column, start).lte(column, end);
    if (shipId) query = query.eq("ship_id", shipId);
    return await query;
  }

  return {
    async getSailingById(sailingId: string) {
      const { data, error } = await sb.from("sailings").select("*").eq("id", sailingId).single();
      if (error) throw error;

      const row = data as SailingRow;
      return {
        id: row.id,
        departurePort: row.departure_port || "Galveston",
        departDate: normalizeDepartDate(row),
        returnDate: normalizeReturnDate(row),
        nights: normalizeNights(row),
        cruiseLine: row.cruise_line || "Cruise line",
        shipId: row.ship_id || "",
        itineraryTags: row.itinerary_tags ?? [],
        itineraryLabel: row.itinerary_label ?? null,
        portsSummary: row.ports_summary ?? null,
        seaPayEligible: !!row.seapay_eligible,
      };
    },
    async getSailings({ departurePort, start, end, shipId }) {
      const primary = await querySailingsByDateRange("depart_date", departurePort, start, end, shipId);

      let data = primary.data;
      let error = primary.error;

      if (error) {
        const msg = (error as { message?: string }).message || "";
        if (msg.toLowerCase().includes("depart_date")) {
          const legacy = await querySailingsByDateRange("sail_date", departurePort, start, end, shipId);
          data = legacy.data;
          error = legacy.error;
        }
      }

      if (error) throw error;

      const rows = (data ?? []) as SailingRow[];
      return rows.map((row) => ({
        id: row.id,
        departurePort: departurePort,
        departDate: normalizeDepartDate(row),
        returnDate: normalizeReturnDate(row),
        nights: normalizeNights(row),
        cruiseLine: row.cruise_line || "Cruise line",
        shipId: row.ship_id || "",
        itineraryTags: row.itinerary_tags ?? [],
        itineraryLabel: row.itinerary_label ?? null,
        portsSummary: row.ports_summary ?? null,
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
