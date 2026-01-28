import MonthCalendar from "@/components/cruiseCalendar/MonthCalendar";
import MonthNav from "@/components/cruiseCalendar/MonthNav";
import { formatDurationLabel } from "@/lib/formatDuration";
import { runCruiseDecisionEngine } from "@/lib/cruiseDecisionEngine/engine";
import { providerFromSupabase } from "@/lib/cruiseDecisionEngine/provider.supabase";
import type { CruiseDecisionInput } from "@/lib/cruiseDecisionEngine/types";
import Link from "next/link";

type CalendarGroup = {
  label: string;
  entries: CalendarEntry[];
};

type CalendarEntry = {
  shipId: string;
  sailingId: string;
  cruiseLine: string;
  shipName: string;
  departDate: string;
  returnDate: string;
  nights: number;
  durationLabel: string;
  priceFrom: number | null;
  demand: "low" | "medium" | "high";
  reasons: string[];
  flags: string[];
  score: number;
  confidence: number;
  recommended: boolean;
  seaPayEligible: boolean;
};

export const metadata = {
  title: "Cruises from Galveston Calendar",
  description: "Engine-ranked sail dates from Galveston by month and ship.",
};

type CalendarSearchParams = {
  y?: string;
  m?: string;
  adults?: string;
  children?: string;
  max?: string;
  flex?: string;
  line?: string;
  shipId?: string;
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams?: CalendarSearchParams;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 text-slate">
        <h1 className="text-3xl font-semibold">Cruises from Galveston Calendar</h1>
        <p className="mt-4 text-slate">Cruise data is unavailable right now. Please check back shortly.</p>
      </main>
    );
  }

  const today = new Date();
  const CURRENT_YEAR = today.getUTCFullYear();
  const CURRENT_MONTH = today.getUTCMonth() + 1;
  const shipId = sParam(searchParams, "shipId");
  const hasExplicitMonth = sParam(searchParams, "y") !== undefined || sParam(searchParams, "m") !== undefined;
  let y = Number(searchParams?.y || CURRENT_YEAR);
  const mInput = Number(searchParams?.m || CURRENT_MONTH);
  let m = Number.isFinite(mInput) && mInput >= 1 && mInput <= 12 ? mInput : CURRENT_MONTH;
  let start = new Date(Date.UTC(y, m - 1, 1)).toISOString().slice(0, 10);
  let endExclusive = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  if (shipId && !hasExplicitMonth) {
    start = new Date(Date.UTC(CURRENT_YEAR, CURRENT_MONTH - 1, 1)).toISOString().slice(0, 10);
    endExclusive = new Date(Date.UTC(CURRENT_YEAR + 1, CURRENT_MONTH - 1, 1)).toISOString().slice(0, 10);
  }
  const adults = Number(searchParams?.adults || 2);
  const children = Number(searchParams?.children || 0);
  const max = searchParams?.max ? Number(searchParams.max) : undefined;
  const flex = searchParams?.flex === "1" || searchParams?.flex === "true";
  const line = searchParams?.line;
  const input: CruiseDecisionInput = {
    departurePort: "Galveston",
    dateRange: { start, end: endExclusive },
    passengers: {
      adults: Number.isFinite(adults) && adults > 0 ? adults : 2,
      children: Number.isFinite(children) && children > 0 ? children : undefined,
    },
    budget: max
      ? { maxPerPerson: Number(max), flexible: flex }
      : flex
        ? { flexible: true }
        : undefined,
    preferences: line ? { cruiseLine: [line] } : undefined,
  };

  const provider = providerFromSupabase();
  const sailings = await provider.getSailings({
    departurePort: input.departurePort,
    start,
    end: endExclusive,
    ...(shipId ? { shipId } : {}),
  });

  const shipIds = Array.from(new Set(sailings.map((sailing) => sailing.shipId)));
  const shipsById = await provider.getShipsByIds(shipIds);
  const pricingById = await provider.getLatestPricingBySailingIds(sailings.map((sailing) => sailing.id));
  const sailingMap = new Map(sailings.map((sailing) => [sailing.id, sailing]));

  const decision = await runCruiseDecisionEngine({ input, provider, limit: sailings.length || 1 });
  const bestMonth = bestMonthFromResults(
    decision.results.map((result) => ({
      sailingId: result.sailingId,
      score: result.score,
      confidence: result.confidence,
    })),
    sailingMap
  );

  const entries = decision.results
    .map((result) => {
      const sailing = sailingMap.get(result.sailingId);
      if (!sailing) return null;

      const ship = shipsById[sailing.shipId];
      const price = pricingById[sailing.id]?.minPerPerson ?? null;

      return {
        shipId: sailing.shipId,
        sailingId: sailing.id,
        departDate: sailing.departDate,
        returnDate: sailing.returnDate,
        cruiseLine: sailing.cruiseLine,
        shipName: ship?.name ?? "Cruise",
        nights: sailing.nights,
        durationLabel: formatDurationLabel(sailing.cruiseLine, sailing.nights),
        priceFrom: price,
        demand: demandLevelFromFlags(result.flags, result.components?.demand),
        reasons: result.reasons,
        flags: result.flags ?? [],
        score: result.score,
        confidence: result.confidence,
        recommended: isRecommended(result.score, result.confidence),
        seaPayEligible: isSeaPayEligible(sailing.cruiseLine, sailing.nights),
      } as CalendarEntry;
    })
    .filter(Boolean)
    .filter((entry) => entry!.departDate >= start && entry!.departDate < endExclusive) as CalendarEntry[];

  const shipEntries = shipId ? entries.filter((entry) => entry.shipId === shipId) : entries;
  const shipName = shipId ? shipEntries[0]?.shipName : undefined;
  const bestShipMonth = shipId ? computeBestMonth(shipEntries) : null;
  if (shipId && bestShipMonth && !hasExplicitMonth) {
    y = bestShipMonth.y;
    m = bestShipMonth.m;
  }
  const isCurrentMonth = y === CURRENT_YEAR && m === CURRENT_MONTH;
  const displayStart = new Date(Date.UTC(y, m - 1, 1)).toISOString().slice(0, 10);
  const displayEndExclusive = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  const displayEntries = shipEntries.filter(
    (entry) => entry.departDate >= displayStart && entry.departDate < displayEndExclusive
  );

  const shipGroups = groupByShip(displayEntries);
  const recommended = [...displayEntries]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-slate">
      <header className="flex items-center justify-between gap-4 pb-4 pt-8">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-navy">
            {shipId && shipName ? `${shipName} — Sail Dates` : `Cruises from Galveston — ${fmtMonthTitle(y, m - 1)}`}
            {isCurrentMonth && (
              <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs text-teal">Current month</span>
            )}
            {shipId && bestShipMonth && !hasExplicitMonth && (
              <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs text-teal">Best month selected</span>
            )}
          </h1>
          <p className="mt-1 text-sm text-slate">
            {shipId
              ? "View available sail dates for this ship. Dates are ranked by value and availability."
              : "Pick a sail date. We highlight strong options based on value, availability, and fit."}
          </p>
          <p className="mt-1 text-xs text-slate md:hidden">Swipe left or right to change months</p>
        </div>
      </header>

      <MonthNav year={y} month={m} bestMonth={bestMonth} />

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Recommended dates</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {recommended.map((entry) => (
            <div key={entry.sailingId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-slate">{entry.shipName}</div>
              <div className="mt-2 text-lg font-semibold text-navy">
                {formatDate(entry.departDate)} • {entry.durationLabel}
              </div>
              <div className="mt-2 text-sm text-slate">
                {entry.priceFrom ? `From ${formatPrice(entry.priceFrom)}` : "Call for pricing"}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate">
                {badgeFrom(entry).map((badge) => (
                  <span key={badge} className="rounded-full border border-slate-200 px-3 py-1">
                    {badge}
                  </span>
                ))}
              </div>
              <Link
                className="mt-4 inline-flex rounded-lg bg-primary-blue px-4 py-2 text-sm font-semibold text-white hover:bg-primary-blue/90"
                href={buildTravelerHref(entry.sailingId, {
                  adults,
                  children,
                  max,
                  flex,
                  line,
                })}
              >
                View details
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Month view</h2>
        <div className="mt-6">
          <MonthCalendar
            year={y}
            month={m}
            monthStartISO={displayStart}
            monthEndExclusiveISO={displayEndExclusive}
            entries={displayEntries}
            traveler={{
              adults: Number.isFinite(adults) && adults > 0 ? adults : 2,
              children: Number.isFinite(children) ? children : 0,
              max,
              flex,
              line: line || undefined,
            }}
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Ship calendars</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {shipGroups.map((group) => (
            <div key={group.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-navy">{group.label}</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.2em] text-slate">
                    <tr>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Length</th>
                      <th className="py-2 pr-4">Price</th>
                      <th className="py-2">Demand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {group.entries.map((entry) => (
                      <tr key={entry.sailingId}>
                        <td className="py-2 pr-4">{formatDate(entry.departDate)}</td>
                        <td className="py-2 pr-4">{entry.durationLabel}</td>
                        <td className="py-2 pr-4">
                          {entry.priceFrom ? `From ${formatPrice(entry.priceFrom)}` : "Call"}
                        </td>
                        <td className="py-2 capitalize">{entry.demand}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link
                href={`/cruises-from-galveston/ship/${slugify(group.label)}`}
                className="mt-4 inline-flex text-sm font-semibold text-primary-blue"
              >
                View full ship calendar →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function groupByShip(entries: CalendarEntry[]): CalendarGroup[] {
  const map = new Map<string, typeof entries>();
  entries.forEach((entry) => {
    const label = entry.shipName || entry.cruiseLine;
    if (!map.has(label)) map.set(label, []);
    map.get(label)?.push(entry);
  });
  return Array.from(map.entries()).map(([label, groupEntries]) => ({
    label,
    entries: groupEntries.sort((a, b) => a.departDate.localeCompare(b.departDate)).slice(0, 8),
  }));
}

function badgeFrom(entry: CalendarEntry) {
  const badges: string[] = [];
  if ((entry.score ?? 0) >= 0.8) badges.push("Best value");
  if ((entry.confidence ?? 0) >= 0.75) badges.push("Strong fit");
  if (entry.demand === "high") badges.push("Popular sailing");
  return badges.length ? badges : ["Good option"];
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function fmtMonthTitle(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleString("en-US", { month: "long", year: "numeric" });
}

function demandLevelFromFlags(flags?: string[], demand?: number) {
  if (flags?.includes("high_demand")) return "high";
  if (demand !== undefined && demand !== null) {
    if (demand >= 0.7) return "high";
    if (demand >= 0.45) return "medium";
    return "low";
  }
  return "medium";
}

function isRecommended(score: number, confidence: number) {
  return score >= 0.72 && confidence >= 0.65;
}

function isSeaPayEligible(cruiseLine: string, nights: number) {
  const line = cruiseLine.toLowerCase();
  if (line === "carnival" || line.includes("carnival")) {
    return nights + 1 >= 7;
  }
  return nights >= 6;
}

function buildTravelerHref(
  sailingId: string,
  traveler: {
    adults: number;
    children: number;
    max?: number;
    flex?: boolean;
    line?: string;
  }
) {
  const params = new URLSearchParams();
  params.set("adults", String(traveler.adults));
  params.set("children", String(traveler.children));
  if (traveler.max != null && Number.isFinite(traveler.max)) params.set("max", String(traveler.max));
  if (traveler.flex) params.set("flex", "1");
  if (traveler.line) params.set("line", traveler.line);
  return `/cruise/${sailingId}?${params.toString()}`;
}

function sParam(params: CalendarSearchParams | undefined, key: string) {
  if (!params) return undefined;
  const value = params[key as keyof CalendarSearchParams];
  return value ?? undefined;
}

function computeBestMonth(entries: CalendarEntry[]) {
  const map = new Map<string, { y: number; m: number; total: number; count: number }>();
  entries.forEach((entry) => {
    const date = new Date(entry.departDate);
    if (Number.isNaN(date.getTime())) return;
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const key = `${y}-${m}`;
    const score = (entry.score ?? 0) * (entry.confidence ?? 0);
    const item = map.get(key) ?? { y, m, total: 0, count: 0 };
    item.total += score;
    item.count += 1;
    map.set(key, item);
  });
  let best: { y: number; m: number; avg: number } | null = null;
  for (const item of map.values()) {
    const avg = item.count ? item.total / item.count : 0;
    if (!best || avg > best.avg) {
      best = { y: item.y, m: item.m, avg };
    }
  }
  return best ? { y: best.y, m: best.m } : null;
}

function bestMonthFromResults(
  results: { sailingId: string; score: number; confidence: number }[],
  sailingMap: Map<string, { departDate: string }>
) {
  const buckets = new Map<string, { sum: number; count: number }>();

  for (const result of results) {
    const sailing = sailingMap.get(result.sailingId);
    if (!sailing) continue;
    const ym = sailing.departDate.slice(0, 7);
    const weight = result.score * (0.6 + 0.4 * result.confidence);
    const bucket = buckets.get(ym) ?? { sum: 0, count: 0 };
    bucket.sum += weight;
    bucket.count += 1;
    buckets.set(ym, bucket);
  }

  let best: { ym: string; avg: number } | null = null;
  for (const [ym, bucket] of buckets.entries()) {
    if (bucket.count < 2) continue;
    const avg = bucket.sum / bucket.count;
    if (!best || avg > best.avg) best = { ym, avg };
  }

  if (!best) return null;
  const [y, m] = best.ym.split("-").map(Number);
  return { y, m };
}
