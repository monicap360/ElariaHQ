"use client";

import { useEffect, useState } from "react";
type Sailing = {
  id: string;
  ship: string | null;
  depart_date: string | null;
  nights: number | null;
  itinerary_label: string | null;
  ports_summary: string | null;
  min_price: number | null;
};

function formatDate(value: string | null) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPrice(value: number | null) {
  if (value == null) return "Call";
  if (!Number.isFinite(value)) return "Call";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function CruiseBoardPage() {
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/board-sailings");
        if (!res.ok) {
          throw new Error("Board sailings request failed");
        }
        const json = await res.json();
        if (active) {
          setSailings((json.sailings as Sailing[]) || []);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setSailings([]);
          setError("Unable to load sailings right now.");
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f4ede4] text-text-secondary">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <section className="rounded-3xl border border-[#c7d8e2] bg-[linear-gradient(145deg,#f7fbfd,#edf5f9)] p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#5f7f90]">Cruises From Galveston</p>
              <h1 className="mt-2 font-accent text-4xl text-text-primary">Live departure board</h1>
              <p className="mt-3 max-w-3xl text-sm text-text-secondary md:text-base">
                Browse upcoming sailings from Galveston with a calm, practical view of dates, itineraries, and starting
                fares.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/cruises-from-galveston/trip-assistant"
                className="rounded-full border border-[#88a9bb] px-5 py-2 text-sm font-semibold text-[#0f2f45] hover:bg-white"
              >
                Ask trip assistant
              </a>
              <a
                href="/booking?source=board"
                className="rounded-full bg-[#0f2f45] px-5 py-2 text-sm font-semibold text-white hover:bg-[#123a53]"
              >
                Reserve cabin
              </a>
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-[#d7cec4] bg-white shadow-sm">
          <div className="border-b border-[#dce8ee] bg-[#f2f8fb] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[#587688]">
            Galveston departures only
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#eef6fb] text-left text-xs uppercase tracking-[0.16em] text-[#587688]">
                  <th className="px-5 py-3">Ship</th>
                  <th className="px-5 py-3">Depart</th>
                  <th className="px-5 py-3">Nights</th>
                  <th className="px-5 py-3">Itinerary</th>
                  <th className="px-5 py-3">From</th>
                  <th className="px-5 py-3">Next step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6edf1]">
                {loading && (
                  <tr>
                    <td className="px-5 py-6 text-text-secondary" colSpan={6}>
                      Loading sailings...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td className="px-5 py-6 text-[#a45135]" colSpan={6}>
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && sailings.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-text-secondary" colSpan={6}>
                      No upcoming sailings are available at this time.
                    </td>
                  </tr>
                )}
                {!loading &&
                  sailings.map((sailing) => (
                    <tr key={sailing.id} className="hover:bg-[#fbfdff]">
                      <td className="px-5 py-4 font-semibold text-text-primary">{sailing.ship || "TBD"}</td>
                      <td className="px-5 py-4 text-text-secondary">{formatDate(sailing.depart_date)}</td>
                      <td className="px-5 py-4 text-text-secondary">{sailing.nights ?? "TBD"}</td>
                      <td className="px-5 py-4 text-text-secondary">
                        {sailing.itinerary_label || sailing.ports_summary || "TBA"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#0f4460]">{formatPrice(sailing.min_price)}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`/cruise/${sailing.id}`}
                            className="rounded-full border border-[#88a9bb] px-3 py-1.5 text-xs font-semibold text-[#0f2f45] hover:bg-[#eef5f9]"
                          >
                            View details
                          </a>
                          <a
                            href={`/booking?sailingId=${sailing.id}&source=board`}
                            className="rounded-full bg-[#0f2f45] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#123a53]"
                          >
                            Reserve
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-5 text-xs text-[#667a86]">
          Starting fares shown are per person and may change with inventory updates.
        </div>
      </div>
    </main>
  );
}
