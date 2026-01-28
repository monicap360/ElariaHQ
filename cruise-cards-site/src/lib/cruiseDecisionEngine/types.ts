export type ISODate = string;

export type CruiseDecisionInput = {
  departurePort: string;
  dateRange: {
    start: ISODate;
    end: ISODate;
  };
  passengers: {
    adults: number;
    children?: number;
  };
  budget?: {
    maxPerPerson?: number;
    flexible?: boolean;
  };
  preferences?: {
    cruiseLine?: string[];
    shipClass?: string[];
    itinerary?: string[];
    cabinType?: string[];
  };
  constraints?: {
    mustSailWeekend?: boolean;
    seaPayEligibleOnly?: boolean;
  };
};

export type CruiseDecisionResult = {
  sailingId: string;
  score: number;
  confidence: number;
  reasons: string[];
  flags?: string[];
  components?: DecisionComponents;
};

export type DecisionComponents = {
  price: number;
  cabin: number;
  preference: number;
  demand: number;
  risk: number;
};

export type Sailing = {
  id: string;
  departurePort: string;
  departDate: ISODate;
  returnDate: ISODate;
  nights: number;
  cruiseLine: string;
  shipId: string;
  itineraryTags: string[];
  itineraryLabel?: string | null;
  portsSummary?: string | null;
  seaPayEligible: boolean;
};

export type Ship = {
  id: string;
  name: string;
  cruiseLine: string;
  shipClass?: string;
};

export type PricingSnapshot = {
  sailingId: string;
  asOf: ISODate;
  currency: "USD";
  minPerPerson: number;
  marketMedianPerPerson?: number;
};

export type AvailabilitySnapshot = {
  sailingId: string;
  asOf: ISODate;
  demandPressure?: number;
  availableCabinTypes?: string[];
};

export type RiskSnapshot = {
  sailingId: string;
  asOf: ISODate;
  riskScore?: number;
};

export type DecisionWeights = {
  price: number;
  cabin: number;
  preference: number;
  demand: number;
  risk: number;
};

export function stableHash(input: unknown): string {
  const s = stableStringify(input);
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return String(value);
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`).join(",")}}`;
}

export function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export function parseISODate(d: ISODate): number {
  return Date.parse(`${d}T00:00:00Z`);
}

export function isWeekend(d: ISODate): boolean {
  const dt = new Date(parseISODate(d));
  const day = dt.getUTCDay();
  return day === 0 || day === 6;
}
