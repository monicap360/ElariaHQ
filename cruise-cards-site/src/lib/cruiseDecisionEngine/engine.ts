import {
  AvailabilitySnapshot,
  clamp01,
  CruiseDecisionInput,
  CruiseDecisionResult,
  DecisionWeights,
  isWeekend,
  parseISODate,
  PricingSnapshot,
  RiskSnapshot,
  Sailing,
  Ship,
} from "./types";

export type CruiseDecisionContext = {
  sailings: Sailing[];
  ships: Ship[];
  pricing: PricingSnapshot[];
  availability: AvailabilitySnapshot[];
  risks: RiskSnapshot[];
};

export type CruiseDataProvider = {
  getSailings: (params: { departurePort: string; start: string; end: string; shipId?: string }) => Promise<Sailing[]>;
  getShipsByIds: (shipIds: string[]) => Promise<Record<string, Ship>>;
  getLatestPricingBySailingIds: (sailingIds: string[]) => Promise<Record<string, PricingSnapshot | undefined>>;
  getLatestAvailabilityBySailingIds: (
    sailingIds: string[]
  ) => Promise<Record<string, AvailabilitySnapshot | undefined>>;
  getLatestRiskBySailingIds: (sailingIds: string[]) => Promise<Record<string, RiskSnapshot | undefined>>;
  getSailingById?: (sailingId: string) => Promise<Sailing>;
  getAllShips?: () => Promise<Ship[]>;
};

export const DEFAULT_WEIGHTS: DecisionWeights = {
  price: 0.25,
  cabin: 0.2,
  preference: 0.2,
  demand: 0.15,
  risk: 0.2,
};

export function rankCruiseSailings(
  input: CruiseDecisionInput,
  context: CruiseDecisionContext,
  weights: DecisionWeights = DEFAULT_WEIGHTS
): CruiseDecisionResult[] {
  const shipsById = new Map(context.ships.map((ship) => [ship.id, ship]));
  const pricingBySailing = groupBySailing(context.pricing);
  const availabilityBySailing = groupBySailing(context.availability);
  const riskBySailing = groupBySailing(context.risks);

  const candidates = context.sailings.filter((sailing) => isEligible(input, sailing));

  const scored = candidates.map((sailing) => {
    const ship = shipsById.get(sailing.shipId);
    const pricing = pricingBySailing.get(sailing.id);
    const availability = availabilityBySailing.get(sailing.id);
    const risk = riskBySailing.get(sailing.id);

    const priceScore = scorePrice(input, pricing);
    const cabinScore = scoreCabin(input, availability);
    const preferenceScore = scorePreference(input, sailing, ship, availability);
    const demandScore = scoreDemand(availability);
    const riskScore = scoreRisk(risk);

    const finalScore =
      priceScore * weights.price +
      cabinScore * weights.cabin +
      preferenceScore * weights.preference -
      demandScore * weights.demand -
      riskScore * weights.risk;

    const completeness = dataCompleteness(pricing, availability, risk);
    const reasons = finalizeReasons(
      buildReasons({
        priceScore,
        cabinScore,
        preferenceScore,
        demandScore,
        riskScore,
        input,
        sailing,
      }),
      input
    );

    const flags = buildFlags({ demandScore, riskScore, pricing, availability });

    return {
      sailing,
      score: round3(clamp01(finalScore)),
      completeness,
      reasons,
      flags,
      priceScore,
      cabinScore,
      preferenceScore,
      demandScore,
      riskScore,
    };
  });

  const meta = buildMeta(
    scored.map((item) => ({ score: item.score, completeness: item.completeness })),
    weights
  );

  return scored
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      sailingId: item.sailing.id,
      score: item.score,
      confidence: round3(clamp01(meta.dataCompleteness * meta.scoreSpread * ruleStability(input, item.sailing))),
      reasons: item.reasons,
      flags: item.flags?.length ? item.flags : undefined,
      components: {
        price: round3(item.priceScore),
        cabin: round3(item.cabinScore),
        preference: round3(item.preferenceScore),
        demand: round3(item.demandScore),
        risk: round3(item.riskScore),
      },
    }));
}

export async function runCruiseDecisionEngine({
  input,
  provider,
  limit = 12,
}: {
  input: CruiseDecisionInput;
  provider: CruiseDataProvider;
  limit?: number;
}) {
  const sailings = await provider.getSailings({
    departurePort: input.departurePort,
    start: input.dateRange.start,
    end: input.dateRange.end,
  });

  const shipIds = Array.from(new Set(sailings.map((sailing) => sailing.shipId).filter(Boolean)));
  const sailingIds = sailings.map((sailing) => sailing.id);

  const [shipsById, pricingById, availabilityById, risksById] = await Promise.all([
    provider.getShipsByIds(shipIds),
    provider.getLatestPricingBySailingIds(sailingIds),
    provider.getLatestAvailabilityBySailingIds(sailingIds),
    provider.getLatestRiskBySailingIds(sailingIds),
  ]);

  const context: CruiseDecisionContext = {
    sailings,
    ships: Object.values(shipsById),
    pricing: Object.values(pricingById).filter(Boolean) as PricingSnapshot[],
    availability: Object.values(availabilityById).filter(Boolean) as AvailabilitySnapshot[],
    risks: Object.values(risksById).filter(Boolean) as RiskSnapshot[],
  };

  const results = rankCruiseSailings(input, context, DEFAULT_WEIGHTS);
  return {
    input,
    results: results.slice(0, limit),
  };
}

function groupBySailing<T extends { sailingId: string }>(items: T[]) {
  const map = new Map<string, T>();
  items.forEach((item) => {
    if (!map.has(item.sailingId)) {
      map.set(item.sailingId, item);
    }
  });
  return map;
}

function isEligible(input: CruiseDecisionInput, sailing: Sailing) {
  if (input.departurePort && !equalsLoose(input.departurePort, sailing.departurePort)) return false;
  if (input.constraints?.mustSailWeekend && !isWeekend(sailing.departDate)) return false;
  if (input.constraints?.seaPayEligibleOnly && !sailing.seaPayEligible) return false;

  const start = parseISODate(input.dateRange.start);
  const end = parseISODate(input.dateRange.end);
  const depart = parseISODate(sailing.departDate);
  if (Number.isNaN(start) || Number.isNaN(end) || Number.isNaN(depart)) return false;
  return depart >= start && depart <= end;
}

function scorePrice(input: CruiseDecisionInput, pricing?: PricingSnapshot) {
  if (!pricing?.minPerPerson || pricing.minPerPerson <= 0) return 0.45;

  let score = 0.6;
  if (pricing.marketMedianPerPerson && pricing.marketMedianPerPerson > 0) {
    const ratio = pricing.minPerPerson / pricing.marketMedianPerPerson;
    score = clamp01(1.15 - ratio);
  }

  if (input.budget?.maxPerPerson && pricing.minPerPerson <= input.budget.maxPerPerson) {
    score += 0.1;
  }

  return clamp01(score);
}

function scoreCabin(input: CruiseDecisionInput, availability?: AvailabilitySnapshot) {
  const cabinTypes = availability?.availableCabinTypes?.map(normalizeValue) ?? [];
  if (!cabinTypes.length) return 0.5;

  const cabinScoreMap: Record<string, number> = {
    suite: 1,
    balcony: 0.85,
    "ocean view": 0.65,
    oceanview: 0.65,
    interior: 0.45,
  };

  let best = 0.5;
  cabinTypes.forEach((type) => {
    const score = cabinScoreMap[type] ?? 0.5;
    if (score > best) best = score;
  });

  if (input.preferences?.cabinType?.length) {
    const preferred = input.preferences.cabinType.map(normalizeValue);
    if (preferred.some((type) => cabinTypes.includes(type))) {
      best += 0.05;
    }
  }

  return clamp01(best);
}

function scorePreference(
  input: CruiseDecisionInput,
  sailing: Sailing,
  ship?: Ship,
  availability?: AvailabilitySnapshot
) {
  const prefs = input.preferences;
  if (!prefs) return 0.6;

  const total = [
    prefs.cruiseLine?.length,
    prefs.shipClass?.length,
    prefs.itinerary?.length,
    prefs.cabinType?.length,
  ].filter(Boolean).length;

  if (!total) return 0.6;

  let matches = 0;

  if (prefs.cruiseLine?.length && prefs.cruiseLine.some((line) => equalsLoose(line, sailing.cruiseLine))) {
    matches += 1;
  }

  if (prefs.shipClass?.length && ship?.shipClass) {
    if (prefs.shipClass.some((cls) => equalsLoose(cls, ship.shipClass ?? ""))) {
      matches += 1;
    }
  }

  if (prefs.itinerary?.length && sailing.itineraryTags.length) {
    const itineraryMatches = prefs.itinerary.some((tag) =>
      sailing.itineraryTags.map(normalizeValue).includes(normalizeValue(tag))
    );
    if (itineraryMatches) matches += 1;
  }

  if (prefs.cabinType?.length && availability?.availableCabinTypes?.length) {
    const cabins = availability.availableCabinTypes.map(normalizeValue);
    const cabinMatches = prefs.cabinType.some((type) => cabins.includes(normalizeValue(type)));
    if (cabinMatches) matches += 1;
  }

  if (!matches) return 0.2;
  return clamp01(0.2 + (matches / total) * 0.8);
}

function scoreDemand(availability?: AvailabilitySnapshot) {
  if (availability?.demandPressure === undefined || availability?.demandPressure === null) return 0.4;
  return clamp01(availability.demandPressure);
}

function scoreRisk(risk?: RiskSnapshot) {
  if (risk?.riskScore === undefined || risk?.riskScore === null) return 0.3;
  return clamp01(risk.riskScore);
}

function dataCompleteness(
  pricing?: PricingSnapshot,
  availability?: AvailabilitySnapshot,
  risk?: RiskSnapshot
) {
  let score = 0;
  if (pricing?.minPerPerson) score += 0.34;
  if (availability?.availableCabinTypes?.length) score += 0.33;
  if (risk?.riskScore !== undefined) score += 0.33;
  return clamp01(score);
}

function ruleStability(input: CruiseDecisionInput, sailing: Sailing) {
  let s = 1.0;

  const rangeDays = Math.round(
    (parseISODate(input.dateRange.end) - parseISODate(input.dateRange.start)) / 86400000
  );
  if (rangeDays > 60) s *= 0.85;
  if (rangeDays > 120) s *= 0.75;

  const hasBudget = input.budget?.maxPerPerson != null;
  const hasPrefs =
    !!input.preferences?.cruiseLine?.length ||
    !!input.preferences?.shipClass?.length ||
    !!input.preferences?.itinerary?.length ||
    !!input.preferences?.cabinType?.length;

  if (!hasBudget && !hasPrefs) s *= 0.8;

  if (input.constraints?.seaPayEligibleOnly && sailing.seaPayEligible) s *= 1.05;

  return clamp01(s);
}

function buildReasons({
  priceScore,
  cabinScore,
  preferenceScore,
  demandScore,
  riskScore,
  input,
}: {
  priceScore: number;
  cabinScore: number;
  preferenceScore: number;
  demandScore: number;
  riskScore: number;
  input: CruiseDecisionInput;
  sailing: Sailing;
}) {
  const reasons: string[] = [];

  if (priceScore >= 0.8) reasons.push("Strong value for your budget");
  if (input.budget?.maxPerPerson && priceScore >= 0.7) reasons.push("Fits your target price");
  if (cabinScore >= 0.85) reasons.push("Balcony upgrade likely");
  if (cabinScore >= 0.65 && cabinScore < 0.85) reasons.push("Good cabin availability");
  if (preferenceScore >= 0.75) reasons.push("Matches your preferred cruise line and itinerary");
  if (demandScore >= 0.7) reasons.push("High demand — limited availability");
  if (riskScore <= 0.35) reasons.push("Low cancellation risk");
  if (riskScore >= 0.7) reasons.push("Higher policy risk than average");

  return reasons;
}

function finalizeReasons(reasons: string[], input: CruiseDecisionInput): string[] {
  const uniq = Array.from(new Set(reasons)).slice(0, 4);
  if (!uniq.length) {
    if (input.budget?.maxPerPerson != null) return ["Good match for your date range"];
    return ["Matches your date range"];
  }
  return uniq;
}

function buildFlags({
  demandScore,
  riskScore,
  pricing,
  availability,
}: {
  demandScore: number;
  riskScore: number;
  pricing?: PricingSnapshot;
  availability?: AvailabilitySnapshot;
}) {
  const flags: string[] = [];
  if (!pricing?.minPerPerson) flags.push("missing_pricing");
  if (!availability?.availableCabinTypes?.length) flags.push("missing_availability");
  if (demandScore >= 0.75) flags.push("high_demand");
  if (riskScore >= 0.75) flags.push("high_risk");
  return flags;
}

function buildMeta(items: Array<{ score: number; completeness: number }>, weights: DecisionWeights) {
  if (!items.length) return { scoreSpread: 0, dataCompleteness: 0 };

  const scores = items.map((x) => x.score).sort((a, b) => a - b);
  const top = scores[scores.length - 1] ?? 0;
  const median = scores[Math.floor(scores.length / 2)] ?? 0;
  const spread = clamp01(top - median);

  const avgCompleteness = items.reduce((sum, x) => sum + x.completeness, 0) / items.length;

  return {
    scoreSpread: round3(spread),
    dataCompleteness: round3(avgCompleteness),
    weights,
  };
}

function equalsLoose(a: string, b: string) {
  return normalizeValue(a) === normalizeValue(b);
}

function normalizeValue(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
