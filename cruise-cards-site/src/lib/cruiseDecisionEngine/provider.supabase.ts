import { createClient } from "@supabase/supabase-js";
import { AvailabilitySnapshot, PricingSnapshot, RiskSnapshot, Sailing, Ship } from "./types";
import { CruiseDataProvider } from "./engine";

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
    async getSailings({ departurePort, start, end }) {
      const { data, error } = await sb
        .from("sailings")
        .select("*")
        .eq("departure_port", departurePort)
        .gte("depart_date", start)
        .lte("depart_date", end);

      if (error) throw error;

      return (data ?? []).map((r: any) => ({
        id: r.id,
        departurePort: "Galveston",
        departDate: r.depart_date,
        returnDate: r.return_date,
        nights: r.nights,
        cruiseLine: r.cruise_line,
        shipId: r.ship_id,
        itineraryTags: r.itinerary_tags ?? [],
        seaPayEligible: !!r.seapay_eligible,
      })) as Sailing[];
    },

    async getShipsByIds(shipIds) {
      if (!shipIds.length) return {};
      const { data, error } = await sb.from("ships").select("*").in("id", shipIds);
      if (error) throw error;

      const out: Record<string, Ship> = {};
      for (const r of data ?? []) {
        out[r.id] = {
          id: r.id,
          name: r.name,
          cruiseLine: r.cruise_line,
          shipClass: r.ship_class ?? undefined,
        };
      }
      return out;
    },

    async getLatestPricingBySailingIds(sailingIds) {
      if (!sailingIds.length) return {};
      const { data, error } = await sb.from("pricing_latest").select("*").in("sailing_id", sailingIds);
      if (error) throw error;

      const out: Record<string, PricingSnapshot | undefined> = {};
      for (const r of data ?? []) {
        out[r.sailing_id] = {
          sailingId: r.sailing_id,
          asOf: r.as_of,
          currency: "USD",
          minPerPerson: Number(r.min_per_person),
          marketMedianPerPerson: r.market_median_per_person != null ? Number(r.market_median_per_person) : undefined,
        };
      }
      return out;
    },

    async getLatestAvailabilityBySailingIds(sailingIds) {
      if (!sailingIds.length) return {};
      const { data, error } = await sb.from("availability_latest").select("*").in("sailing_id", sailingIds);
      if (error) throw error;

      const out: Record<string, AvailabilitySnapshot | undefined> = {};
      for (const r of data ?? []) {
        out[r.sailing_id] = {
          sailingId: r.sailing_id,
          asOf: r.as_of,
          demandPressure: r.demand_pressure != null ? Number(r.demand_pressure) : undefined,
          availableCabinTypes: r.available_cabin_types ?? undefined,
        };
      }
      return out;
    },

    async getLatestRiskBySailingIds(sailingIds) {
      if (!sailingIds.length) return {};
      const { data, error } = await sb.from("risk_latest").select("*").in("sailing_id", sailingIds);
      if (error) throw error;

      const out: Record<string, RiskSnapshot | undefined> = {};
      for (const r of data ?? []) {
        out[r.sailing_id] = {
          sailingId: r.sailing_id,
          asOf: r.as_of,
          riskScore: r.risk_score != null ? Number(r.risk_score) : undefined,
        };
      }
      return out;
    },
  };
}
