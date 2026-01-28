import { buildCalendarEntries } from "@/lib/calendarEntries";
import { providerFromSupabase } from "@/lib/cruiseDecisionEngine/provider.supabase";
import type { CruiseDecisionInput } from "@/lib/cruiseDecisionEngine/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LineCalendarPage({ params }: { params: { line: string } }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12 text-slate">
        <h1 className="text-3xl font-semibold">Cruise Line Calendar</h1>
        <p className="mt-4 text-slate">Cruise data is unavailable right now. Please check back shortly.</p>
      </main>
    );
  }

  const start = new Date().toISOString().slice(0, 10);
  const end = new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().slice(0, 10);
  const cruiseLine = titleCase(params.line.replace(/-/g, " "));

  const input: CruiseDecisionInput = {
    departurePort: "Galveston",
    dateRange: { start, end },
    passengers: { adults: 2 },
    preferences: { cruiseLine: [cruiseLine] },
  };

  const provider = providerFromSupabase();
  const entries = await buildCalendarEntries(input, provider);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-slate">
      <h1 className="text-3xl font-semibold">{cruiseLine} calendar</h1>
      <p className="mt-3 text-slate">Upcoming sail dates powered by the CruiseDecisionEngine.</p>

      <div className="mt-6 grid gap-4">
        {entries.map((entry) => (
          <div key={entry.sailingId} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate">{entry.shipName}</div>
            <div className="mt-2 text-lg font-semibold text-navy">
              {formatDate(entry.departDate)} • {entry.durationLabel}
            </div>
            <div className="mt-1 text-sm text-slate">
              {entry.priceFrom ? `From ${formatPrice(entry.priceFrom)}` : "Call for pricing"}
            </div>
            <div className="mt-3 text-xs text-slate capitalize">Demand: {entry.demandLevel}</div>
            <Link
              href={`/cruise/${entry.sailingId}`}
              className="mt-3 inline-flex text-sm font-semibold text-primary-blue"
            >
              View details →
            </Link>
          </div>
        ))}
        {!entries.length && <p className="text-slate">No sailings available right now.</p>}
      </div>
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

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(" ");
}
