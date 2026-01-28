import { formatDurationLabel } from "@/lib/formatDuration";
import { runCruiseDecisionEngine, type CruiseDataProvider } from "@/lib/cruiseDecisionEngine/engine";
import type { CruiseDecisionInput } from "@/lib/cruiseDecisionEngine/types";

export type CalendarSailing = {
  sailingId: string;
  cruiseLine: string;
  shipName: string;
  departDate: string;
  returnDate: string;
  nights: number;
  days: number;
  durationLabel: string;
  demandLevel: "low" | "medium" | "high";
  priceFrom?: number;
  decisionScore?: number;
  confidence?: number;
  flags?: string[];
};

export async function buildCalendarEntries(
  input: CruiseDecisionInput,
  provider: CruiseDataProvider
): Promise<CalendarSailing[]> {
  const sailings = await provider.getSailings({
    departurePort: input.departurePort,
    start: input.dateRange.start,
    end: input.dateRange.end,
  });
  if (!sailings.length) return [];

  const shipIds = Array.from(new Set(sailings.map((sailing) => sailing.shipId).filter(Boolean)));
  const sailingIds = sailings.map((sailing) => sailing.id);

  const [shipsById, pricingById] = await Promise.all([
    provider.getShipsByIds(shipIds),
    provider.getLatestPricingBySailingIds(sailingIds),
  ]);

  const decision = await runCruiseDecisionEngine({ input, provider, limit: sailingIds.length });
  const decisionMap = new Map(decision.results.map((result) => [result.sailingId, result]));

  return sailings
    .map((sailing) => {
      const ship = shipsById[sailing.shipId];
      const result = decisionMap.get(sailing.id);
      const pricing = pricingById[sailing.id];
      const demand = result?.components?.demand;

      const demandLevel: CalendarSailing["demandLevel"] =
        demand !== undefined && demand !== null
          ? demand >= 0.7
            ? "high"
            : demand >= 0.45
              ? "medium"
              : "low"
          : "medium";

      return {
        sailingId: sailing.id,
        cruiseLine: sailing.cruiseLine,
        shipName: ship?.name ?? sailing.cruiseLine,
        departDate: sailing.departDate,
        returnDate: sailing.returnDate,
        nights: sailing.nights,
        days: sailing.nights + 1,
        durationLabel: formatDurationLabel(sailing.cruiseLine, sailing.nights),
        demandLevel,
        priceFrom: pricing?.minPerPerson ?? undefined,
        decisionScore: result?.score,
        confidence: result?.confidence,
        flags: result?.flags,
      };
    })
    .filter((entry) => Boolean(entry.departDate));
}
