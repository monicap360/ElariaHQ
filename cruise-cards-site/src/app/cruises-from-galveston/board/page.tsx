"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Sailing = {
  id: string;
  ship: string | null;
  depart_date: string | null;
  nights: number | null;
  itinerary_label: string | null;
  ports_summary: string | null;
  min_price: number | null;
};

const REFRESH_INTERVAL_MS = 60_000;

function dateValue(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function formatDate(value: string | null) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatWeekday(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function formatPrice(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "Call";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLastUpdated(value: Date | null) {
  if (!value) return "Waiting for first update";
  return value.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CruiseBoardPage() {
  const isMountedRef = useRef(true);
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadSailings = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch("/api/board-sailings", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Board sailings request failed");
      }

      const json = (await res.json()) as { sailings?: Sailing[] };
      if (!isMountedRef.current) return;

      setSailings(Array.isArray(json.sailings) ? json.sailings : []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      if (!isMountedRef.current) return;
      setError("Unable to load the live departure board right now.");
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSailings(false);
    const id = window.setInterval(() => {
      void loadSailings(true);
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [loadSailings]);

  const filteredSailings = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return sailings;

    return sailings.filter((sailing) => {
      const ship = sailing.ship?.toLowerCase() ?? "";
      const itinerary = sailing.itinerary_label?.toLowerCase() ?? "";
      const ports = sailing.ports_summary?.toLowerCase() ?? "";
      return ship.includes(query) || itinerary.includes(query) || ports.includes(query);
    });
  }, [searchText, sailings]);

  const orderedSailings = useMemo(() => {
    return [...filteredSailings].sort((a, b) => dateValue(a.depart_date) - dateValue(b.depart_date));
  }, [filteredSailings]);

  const nextDeparture = orderedSailings[0] ?? null;
  const lowestFare = useMemo(() => {
    let current: number | null = null;
    for (const sailing of orderedSailings) {
      if (sailing.min_price == null || !Number.isFinite(sailing.min_price)) continue;
      if (current == null || sailing.min_price < current) current = sailing.min_price;
    }
    return current;
  }, [orderedSailings]);

  return (
    <main className="min-h-screen bg-[#f4ede4] text-text-secondary">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#b9ccd7] bg-[#0f2f45] shadow-[0_20px_60px_rgba(15,47,69,0.24)]">
          <Image
            src="/assets/symphony-of-the-seas.webp"
            alt="Cruise ship departing Port of Galveston"
            fill
            priority
            sizes="(min-width: 1200px) 1100px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,34,52,0.84)_0%,rgba(18,58,81,0.6)_42%,rgba(244,237,228,0.2)_100%)]" />
          <div className="relative z-10 max-w-3xl px-8 py-16 md:px-12 md:py-20">
            <p className="text-xs uppercase tracking-[0.32em] text-[#d9eaf2]">Port of Galveston · Live Departures</p>
            <h1 className="mt-4 font-accent text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
              Authority-grade live departure board for Galveston travelers
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#e3edf2] md:text-lg">
              Real upcoming sailings, updated continuously from our live data feed, presented with hospitality-first
              clarity so you can plan with confidence.
            </p>
            <div className="mt-4">
              <span className="rounded-full bg-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#e7f2f8]">
                Galveston departures only
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#live-board"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0f2f45] transition hover:bg-[#f6efe6]"
              >
                View live departures
              </a>
              <Link
                href="/cruises-from-galveston/planning-tools"
                className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open planning toolkit (EN/ES)
              </Link>
              <Link
                href="/booking"
                className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Speak with the Galveston desk
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/18 px-4 py-2 text-xs text-[#e8f2f6]">
                Hospitality-first guidance
              </span>
              <span className="rounded-full bg-white/18 px-4 py-2 text-xs text-[#e8f2f6]">
                Port activity updated each minute
              </span>
              <span className="rounded-full bg-white/18 px-4 py-2 text-xs text-[#e8f2f6]">
                Real sailings, no pressure
              </span>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Calm planning rhythm",
              detail: "Browse departures, compare timing, and narrow options without sales pressure.",
            },
            {
              title: "Galveston-focused data",
              detail: "Only ships and sailings departing from the Port of Galveston are shown here.",
            },
            {
              title: "Hospitality tone",
              detail: "Designed with breathing room, clear language, and a welcoming desk-style experience.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-[#d9d2c8] bg-white px-6 py-5 shadow-sm">
              <h2 className="mt-0 text-lg font-semibold font-accent text-text-primary">{item.title}</h2>
              <p className="mt-2 text-sm text-text-secondary">{item.detail}</p>
            </article>
          ))}
        </section>

        <section id="live-board" className="mt-12 rounded-[2rem] border border-[#d9d2c8] bg-white px-6 py-8 md:px-8 md:py-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#5f7f90]">Live cruise departure board</p>
              <h2 className="mt-3 font-accent text-3xl text-text-primary md:text-4xl">Upcoming sailings from Galveston</h2>
              <p className="mt-3 max-w-2xl text-sm text-text-secondary">
                Search by ship or itinerary, monitor departure timing, and refresh instantly when you need the latest
                terminal activity snapshot.
              </p>
              <span className="mt-2 inline-flex rounded-full bg-[#eef6fb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#537285]">
                Galveston departures only
              </span>
            </div>
            <button
              type="button"
              onClick={() => void loadSailings(true)}
              disabled={refreshing}
              className="rounded-full border border-[#7ba2b7] px-5 py-2.5 text-sm font-semibold text-[#0f2f45] transition hover:bg-[#f1f7fb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh now"}
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <article className="rounded-xl border border-[#dfe7eb] bg-[#f8fbfd] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#658497]">Departures listed</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{orderedSailings.length}</p>
            </article>
            <article className="rounded-xl border border-[#dfe7eb] bg-[#f8fbfd] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#658497]">Next departure</p>
              <p className="mt-2 text-base font-semibold text-text-primary">
                {nextDeparture ? formatDate(nextDeparture.depart_date) : "TBD"}
              </p>
            </article>
            <article className="rounded-xl border border-[#dfe7eb] bg-[#f8fbfd] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#658497]">Lowest fare shown</p>
              <p className="mt-2 text-base font-semibold text-text-primary">{formatPrice(lowestFare)}</p>
            </article>
            <article className="rounded-xl border border-[#dfe7eb] bg-[#f8fbfd] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#658497]">Last update</p>
              <p className="mt-2 text-base font-semibold text-text-primary">{formatLastUpdated(lastUpdated)}</p>
            </article>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="w-full text-sm font-semibold text-text-secondary md:w-[360px]">
              Find a ship or itinerary
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search by ship name, itinerary, or ports..."
                className="mt-2 w-full rounded-xl border border-[#d4dfe5] bg-[#fcfefd] px-4 py-3 text-sm text-text-primary outline-none transition focus:border-[#6f98ad] focus:ring-2 focus:ring-[#d7e7f0]"
              />
            </label>
            <p className="text-xs text-[#6e7c87]">
              Auto-refresh runs every {Math.floor(REFRESH_INTERVAL_MS / 1000)} seconds.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-[#dbe4e8]">
            <table className="min-w-[880px] w-full border-collapse bg-white text-sm">
              <thead className="bg-[#f0f7fb] text-left text-xs uppercase tracking-[0.18em] text-[#567387]">
                <tr>
                  <th className="px-5 py-4">Ship</th>
                  <th className="px-5 py-4">Departure</th>
                  <th className="px-5 py-4">Nights</th>
                  <th className="px-5 py-4">Itinerary</th>
                  <th className="px-5 py-4">From</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ecef]">
                {loading && (
                  <tr>
                    <td className="px-5 py-8 text-text-secondary" colSpan={6}>
                      Loading departures from the live board...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td className="px-5 py-8 text-red-600" colSpan={6}>
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && orderedSailings.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-text-secondary" colSpan={6}>
                      No departures matched your search. Try a broader term.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  orderedSailings.map((sailing) => (
                    <tr key={sailing.id} className="align-top text-text-secondary">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-text-primary">{sailing.ship ?? "Ship TBA"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-text-primary">{formatDate(sailing.depart_date)}</div>
                        <div className="mt-1 text-xs text-[#6f808b]">{formatWeekday(sailing.depart_date)}</div>
                      </td>
                      <td className="px-5 py-4">{sailing.nights ?? "TBD"}</td>
                      <td className="px-5 py-4 max-w-[300px]">
                        <div className="font-semibold text-text-primary">
                          {sailing.itinerary_label ?? "Itinerary pending"}
                        </div>
                        {sailing.ports_summary && <div className="mt-1 text-xs text-[#6f808b]">{sailing.ports_summary}</div>}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#0f4460]">{formatPrice(sailing.min_price)}</td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/cruise/${sailing.id}`}
                          className="inline-flex rounded-full border border-[#88a9bb] px-4 py-2 text-xs font-semibold text-[#0f2f45] transition hover:bg-[#eef5f9]"
                        >
                          View sailing
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-[#6e7c87]">
            Prices shown are starting per-person fares and may change as inventory updates. Taxes and port fees are
            generally included in displayed starting rates.
          </p>
        </section>
      </div>
    </main>
  );
}
