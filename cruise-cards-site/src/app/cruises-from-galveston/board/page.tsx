"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Sailing = {
  id: string;
  ship: string | null;
  departure_date: string | null;
  nights: number | null;
  itinerary: string | null;
  starting_price: number | string | null;
};

function formatDate(value: string | null) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPrice(value: Sailing["starting_price"]) {
  if (value === null || value === undefined || value === "") return "Call";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return "Call";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numeric);
}

export default function CruiseBoardPage() {
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("upcoming_sailings")
        .select("*")
        .order("departure_date", { ascending: true });
      if (active) {
        setSailings((data as Sailing[]) || []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Cruises From Galveston</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Cruise Board</h1>
            <p className="mt-2 text-sm text-slate-300">
              A live-style board for upcoming sailings. Select a ship and add optional travel services.
            </p>
          </div>
          <a
            href="/booking"
            className="rounded-full border border-cyan-400 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/10"
          >
            Create Booking
          </a>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-cyan-500/40 bg-slate-900/70 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
          <div className="border-b border-cyan-500/30 bg-slate-900 px-5 py-3 text-xs uppercase tracking-[0.2em] text-cyan-200">
            Live Sailings Board
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-cyan-200">
                  <th className="px-5 py-3">Ship</th>
                  <th className="px-5 py-3">Depart</th>
                  <th className="px-5 py-3">Nights</th>
                  <th className="px-5 py-3">Itinerary</th>
                  <th className="px-5 py-3">Start</th>
                  <th className="px-5 py-3">Add-ons</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="px-5 py-6 text-slate-400" colSpan={6}>
                      Loading sailings...
                    </td>
                  </tr>
                )}
                {!loading && sailings.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-slate-400" colSpan={6}>
                      No upcoming sailings are available at this time.
                    </td>
                  </tr>
                )}
                {!loading &&
                  sailings.map((sailing) => (
                    <tr key={sailing.id} className="border-t border-slate-800">
                      <td className="px-5 py-4 font-semibold text-white">{sailing.ship || "TBD"}</td>
                      <td className="px-5 py-4">{formatDate(sailing.departure_date)}</td>
                      <td className="px-5 py-4">{sailing.nights ?? "TBD"}</td>
                      <td className="px-5 py-4 text-slate-300">{sailing.itinerary || "TBA"}</td>
                      <td className="px-5 py-4 text-cyan-200">{formatPrice(sailing.starting_price)}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-full border border-cyan-400/60 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-500/10">
                            Add flight
                          </button>
                          <button className="rounded-full border border-cyan-400/60 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-500/10">
                            Add hotel
                          </button>
                          <button className="rounded-full border border-cyan-400/60 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-500/10">
                            Add transport
                          </button>
                          <button className="rounded-full border border-cyan-400/60 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-500/10">
                            Add scooter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 text-xs text-slate-400">
          Starting prices include taxes and port fees. Gratuities and vacation protection are not included.
        </div>
      </div>
    </main>
  );
}
