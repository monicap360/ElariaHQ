import { buildCalendarEntries } from "@/lib/calendarEntries";
import { providerFromSupabase } from "@/lib/cruiseDecisionEngine/provider.supabase";
import type { CruiseDecisionInput } from "@/lib/cruiseDecisionEngine/types";

export const dynamic = "force-dynamic";

export default async function ShipCalendarPage({ params }: { params: { shipSlug: string } }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12 text-navy">
        <h1 className="text-3xl font-semibold">Ship calendar</h1>
        <p className="mt-4 text-slate">Cruise data is unavailable right now. Please check back shortly.</p>
      </main>
    );
  }

  const start = new Date().toISOString().slice(0, 10);
  const end = new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().slice(0, 10);

  const input: CruiseDecisionInput = {
    departurePort: "Galveston",
    dateRange: { start, end },
    passengers: { adults: 2 },
  };

  const provider = providerFromSupabase();
  const entries = await buildCalendarEntries(input, provider);
  const slug = params.shipSlug;
  const shipEntries = entries.filter((entry) => slugify(entry.shipName) === slug);
  const shipName = shipEntries[0]?.shipName ?? titleCase(slug.replace(/-/g, " "));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-navy">
      <h1 className="text-3xl font-semibold">{shipName} — Upcoming Sailings</h1>
      <p className="mt-3 text-slate">Engine-ranked sail dates for this ship.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-slate">
            <tr>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Length</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2">Demand</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {shipEntries.map((entry) => (
              <tr key={entry.sailingId}>
                <td className="py-2 pr-4">{formatDate(entry.departDate)}</td>
                <td className="py-2 pr-4">{entry.durationLabel}</td>
                <td className="py-2 pr-4">
                  {entry.priceFrom ? `From ${formatPrice(entry.priceFrom)}` : "Call"}
                </td>
                <td className="py-2 capitalize">{entry.demandLevel}</td>
              </tr>
            ))}
            {!shipEntries.length && (
              <tr>
                <td colSpan={4} className="py-4 text-slate">
                  No sailings available right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(" ");
}
