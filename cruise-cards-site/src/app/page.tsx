"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CruiseMatrixRow = {
  id: string;
  line: string;
  lineKey: string;
  ship: string;
  duration: number;
  ports: string;
  priceDisplay: string;
  priceNumber: number | null;
  scoreDisplay: string;
  sailDate: string;
};

type SailingRow = {
  id: string;
  sail_date: string;
  return_date: string;
  ports?: string[] | string | null;
  itinerary?: string | null;
  price_from?: number | string | null;
  base_price?: number | string | null;
  starting_price?: number | string | null;
  min_price?: number | string | null;
  sail_score?: number | string | null;
  score?: number | string | null;
  ship: {
    id: string;
    name: string;
    cruise_line: {
      name: string;
    } | null;
  } | null;
};

function normalizeLineKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function calcNights(sailDate: string, returnDate: string) {
  const start = new Date(sailDate);
  const end = new Date(returnDate);
  const diffMs = end.getTime() - start.getTime();
  if (Number.isNaN(diffMs)) return 0;
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

function formatPorts(value: SailingRow["ports"] | SailingRow["itinerary"]) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }
  if (typeof value === "string" && value.trim().length) {
    return value.trim();
  }
  return null;
}

function parsePrice(value: SailingRow[keyof SailingRow]) {
  if (value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
}

function formatPrice(value: number | null) {
  if (value === null) return "Call for pricing";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatScore(value: number | null) {
  if (value === null) return "TBD";
  return `${Math.round(value)}/100`;
}

export default function Home() {
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [cruiseMatrix, setCruiseMatrix] = useState<CruiseMatrixRow[]>([]);
  const [filterLine, setFilterLine] = useState("all");
  const [sortKey, setSortKey] = useState<"price" | "duration" | "date">("date");
  const [siteStatus, setSiteStatus] = useState<{
    draftsInReview: number;
    openSignals: number;
    upcomingSailings: number;
  } | null>(null);
  const [bookingForm, setBookingForm] = useState({
    ship: "",
    month: "",
    nights: "",
    cabin: "",
    travelers: "2",
    advisorOnly: false,
  });

  useEffect(() => {
    let isActive = true;

    async function loadStatus() {
      try {
        const res = await fetch("/api/site-status");
        if (!res.ok) return;
        const data = (await res.json()) as {
          draftsInReview: number;
          openSignals: number;
          upcomingSailings: number;
        };
        if (isActive) setSiteStatus(data);
      } catch {
        // ignore status widget errors on public page
      }
    }

    loadStatus();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadMatrix() {
      setMatrixLoading(true);
      setMatrixError(null);

      const { data, error } = await supabase
        .from("sailings")
        .select("*, ship:ships(id,name,cruise_line:cruise_lines(name))")
        .eq("is_active", true)
        .order("sail_date", { ascending: true })
        .limit(20);

      if (!isActive) return;

      if (error) {
        console.error("Matrix load error", error);
        setMatrixError("Unable to load sailings right now.");
        setCruiseMatrix([]);
        setMatrixLoading(false);
        return;
      }

      const rows = (data || []).map((row: SailingRow) => {
        const lineName = row.ship?.cruise_line?.name ?? "Unknown cruise line";
        const lineKey = normalizeLineKey(lineName);
        const duration = calcNights(row.sail_date, row.return_date);
        const ports = formatPorts(row.ports) ?? formatPorts(row.itinerary) ?? "TBA";
        const priceCandidate =
          parsePrice(row.price_from) ??
          parsePrice(row.base_price) ??
          parsePrice(row.starting_price) ??
          parsePrice(row.min_price);
        const scoreCandidate = parsePrice(row.sail_score) ?? parsePrice(row.score);
        return {
          id: row.id,
          line: lineName,
          lineKey,
          ship: row.ship?.name ?? "Unknown ship",
          duration,
          ports,
          priceDisplay: formatPrice(priceCandidate),
          priceNumber: priceCandidate,
          scoreDisplay: formatScore(scoreCandidate),
          sailDate: row.sail_date,
        };
      });

      setCruiseMatrix(rows);
      setMatrixLoading(false);
    }

    loadMatrix();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredCruises = useMemo(() => {
    const byLine = filterLine === "all" ? cruiseMatrix : cruiseMatrix.filter((cruise) => cruise.lineKey === filterLine);
    const sorted = [...byLine].sort((a, b) => {
      if (sortKey === "price") {
        const aPrice = a.priceNumber ?? Number.POSITIVE_INFINITY;
        const bPrice = b.priceNumber ?? Number.POSITIVE_INFINITY;
        return aPrice - bPrice;
      }
      if (sortKey === "duration") {
        return a.duration - b.duration;
      }
      return a.sailDate.localeCompare(b.sailDate);
    });
    return sorted;
  }, [cruiseMatrix, filterLine, sortKey]);

  const availableLines = useMemo(() => {
    const unique = new Map<string, string>();
    cruiseMatrix.forEach((row) => {
      if (row.lineKey) unique.set(row.lineKey, row.line);
    });
    return Array.from(unique.entries()).map(([key, label]) => ({ key, label }));
  }, [cruiseMatrix]);

  const availableShips = useMemo(() => {
    const unique = new Map<string, string>();
    cruiseMatrix.forEach((row) => {
      unique.set(row.ship, row.ship);
    });
    return Array.from(unique.values()).sort();
  }, [cruiseMatrix]);

  const availableMonths = useMemo(() => {
    const unique = new Map<string, string>();
    cruiseMatrix.forEach((row) => {
      if (!row.sailDate) return;
      const date = new Date(row.sailDate);
      if (Number.isNaN(date.getTime())) return;
      const label = date.toLocaleString("en-US", { month: "long", year: "numeric" });
      unique.set(label, label);
    });
    return Array.from(unique.values());
  }, [cruiseMatrix]);

  function openBookingPanel(prefill?: Partial<typeof bookingForm>) {
    setBookingForm((prev) => ({ ...prev, ...prefill }));
    const target = document.getElementById("booking-panel");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(76,111,255,0.08),transparent_55%)] bg-background-base text-text-primary">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(123,97,255,0.08),transparent_60%)] px-10 py-14 shadow-[0_0_40px_rgba(76,111,255,0.08)]"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background-card px-4 py-1 text-xs uppercase tracking-[0.3em] text-text-muted">
            CruisesFromGalveston.net
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-text-primary md:text-5xl font-accent">
            Cruising From Galveston, Clearly Explained
          </h1>
          <p className="mt-4 max-w-2xl text-base text-text-secondary md:text-lg">
            Independent guidance on ships, itineraries, and planning from people who actually work the port.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#guidance" className="rounded-full bg-primary-blue px-6 py-3 text-sm font-semibold text-white">
              Start With Guidance
            </a>
            <a
              href="#booking-panel"
              onClick={() => openBookingPanel()}
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-text-primary hover:border-primary-blue/60"
            >
              Book a Cruise
            </a>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-background-card px-5 py-4 text-sm text-text-secondary">
              Decision-first guidance, booking second.
            </div>
            <div className="rounded-2xl border border-white/10 bg-background-card px-5 py-4 text-sm text-text-secondary">
              Independent, not affiliated with cruise lines.
            </div>
            <div className="rounded-2xl border border-white/10 bg-background-card px-5 py-4 text-sm text-text-secondary">
              Local operations view of the port.
            </div>
          </div>
        </motion.section>

        <section
          id="booking-panel"
          className="mt-10 rounded-3xl border border-white/10 bg-background-panel px-8 py-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold font-accent">Book With Confidence</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Booking exists to support informed decisions, not impulse clicks.
              </p>
            </div>
            <a href="/booking" className="text-sm font-semibold text-primary-blue">
              Continue to Booking →
            </a>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-text-secondary">
              Ship
              <select
                value={bookingForm.ship}
                onChange={(event) => setBookingForm((prev) => ({ ...prev, ship: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-background-card px-4 py-3 text-text-primary"
              >
                <option value="">Select ship</option>
                {availableShips.map((ship) => (
                  <option key={ship} value={ship}>
                    {ship}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              Month / Year
              <select
                value={bookingForm.month}
                onChange={(event) => setBookingForm((prev) => ({ ...prev, month: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-background-card px-4 py-3 text-text-primary"
              >
                <option value="">Select month</option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              Nights
              <select
                value={bookingForm.nights}
                onChange={(event) => setBookingForm((prev) => ({ ...prev, nights: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-background-card px-4 py-3 text-text-primary"
              >
                <option value="">Any length</option>
                {[3, 4, 5, 6, 7, 8].map((night) => (
                  <option key={night} value={night}>
                    {night} nights
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              Cabin type
              <select
                value={bookingForm.cabin}
                onChange={(event) => setBookingForm((prev) => ({ ...prev, cabin: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-background-card px-4 py-3 text-text-primary"
              >
                <option value="">Any cabin</option>
                <option value="Interior">Interior</option>
                <option value="Ocean View">Ocean View</option>
                <option value="Balcony">Balcony</option>
                <option value="Suite">Suite</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              Travelers
              <select
                value={bookingForm.travelers}
                onChange={(event) => setBookingForm((prev) => ({ ...prev, travelers: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-background-card px-4 py-3 text-text-primary"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
              <input
                type="checkbox"
                checked={bookingForm.advisorOnly}
                onChange={(event) => setBookingForm((prev) => ({ ...prev, advisorOnly: event.target.checked }))}
                className="h-4 w-4 rounded border-white/10 bg-background-card text-primary-blue"
              />
              Show advisor-recommended sailings only
            </label>
          </div>
          <p className="mt-4 text-xs text-text-muted">
            Prices shown include port fees and taxes. Gratuities and vacation protection are optional and shown
            separately before checkout.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-background-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">Positioning</h3>
              <p className="mt-3 text-sm text-text-secondary">
                We explain first and enable booking second. Recommendations are built to reduce confusion and protect
                decisions.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">Operational status</h3>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-white/10 bg-background-panel px-3 py-3">
                  <div className="text-lg font-semibold text-text-primary">
                    {siteStatus ? siteStatus.draftsInReview : "-"}
                  </div>
                  <div className="text-xs text-text-muted">Insights</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-background-panel px-3 py-3">
                  <div className="text-lg font-semibold text-text-primary">
                    {siteStatus ? siteStatus.openSignals : "-"}
                  </div>
                  <div className="text-xs text-text-muted">Signals</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-background-panel px-3 py-3">
                  <div className="text-lg font-semibold text-text-primary">
                    {siteStatus ? siteStatus.upcomingSailings : "-"}
                  </div>
                  <div className="text-xs text-text-muted">Sailings</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">Booking clarity</h3>
              <p className="mt-3 text-sm text-text-secondary">
                Taxes and port fees are included in displayed prices. Gratuities and vacation protection remain
                optional.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14" id="desk">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold font-accent">From The Cruises From Galveston Desk</h2>
              <p className="text-sm text-text-secondary">Edited by Monica Pena</p>
            </div>
            <a href="/cruises-from-galveston/desk" className="text-sm font-semibold text-primary-blue">
              View the Desk →
            </a>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Port operations outlook",
                summary: "How terminal flow and staffing affect embarkation timing this season.",
              },
              {
                title: "Deployment updates",
                summary: "Ship rotations that change Galveston sailing patterns in 2026-2028.",
              },
              {
                title: "Weather watch",
                summary: "What Gulf weather shifts actually mean for Galveston departures.",
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-background-card p-6">
                <div className="text-base font-semibold text-text-primary">{card.title}</div>
                <p className="mt-3 text-sm text-text-secondary">{card.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14" id="ships">
          <h2 className="text-2xl font-semibold font-accent">Ships Sailing From Galveston</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                name: "Carnival Breeze",
                bestFor: "Families and first-time cruisers",
                note: "Smooth Galveston embarkation flow.",
              },
              {
                name: "Carnival Dream",
                bestFor: "Short trips with flexible dining",
                note: "Reliable weekend sailings.",
              },
              {
                name: "Disney Magic",
                bestFor: "Family groups with younger kids",
                note: "Character programming works well from Galveston.",
              },
              {
                name: "Mariner of the Seas",
                bestFor: "Active travelers who want variety",
                note: "Balanced entertainment and quiet spaces.",
              },
            ].map((ship) => (
              <div key={ship.name} className="rounded-2xl border border-white/10 bg-background-card p-6">
                <div className="text-lg font-semibold text-text-primary">{ship.name}</div>
                <p className="mt-3 text-sm text-text-secondary">
                  <span className="text-text-primary">Best for:</span> {ship.bestFor}
                </p>
                <p className="mt-2 text-sm text-text-secondary">{ship.note}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                  <a
                    href={`/cruises-from-galveston/ships/${ship.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-primary-blue"
                  >
                    Read Advisor Overview
                  </a>
                  <a
                    href="#booking-panel"
                    onClick={() => openBookingPanel({ ship: ship.name })}
                    className="text-text-primary hover:text-primary-blue"
                  >
                    View Sailings
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14" id="ports">
          <h2 className="text-2xl font-semibold font-accent">Where Galveston Cruises Go - And Why</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Cozumel",
                detail: "A consistent stop because it pairs well with 4-7 night itineraries and easy port flow.",
              },
              {
                name: "Costa Maya",
                detail: "Popular for shorter sailings with calmer port logistics and beach access.",
              },
              {
                name: "Roatan",
                detail: "Favored by travelers who want a strong excursion day and reef access.",
              },
              {
                name: "Belize",
                detail: "Great for adventure-focused cruisers who plan for tender timing.",
              },
              {
                name: "Grand Cayman",
                detail: "A premium stop when longer itineraries are on the calendar.",
              },
            ].map((port) => (
              <div key={port.name} className="rounded-2xl border border-white/10 bg-background-card p-6">
                <div className="text-base font-semibold text-text-primary">{port.name}</div>
                <p className="mt-3 text-sm text-text-secondary">{port.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14" id="guidance">
          <h2 className="text-2xl font-semibold font-accent">Planning Your Cruise From Galveston</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { label: "Driving vs Flying", href: "/cruises-from-galveston/how-to-plan" },
              { label: "Transportation options (airport to ship)", href: "https://houstoncruiseshuttle.com" },
              { label: "Short vs long sailings", href: "/cruises-from-galveston/how-to-plan" },
              { label: "First cruise vs repeat cruisers", href: "/cruises-from-galveston/how-to-plan" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-2xl border border-white/10 bg-background-card px-5 py-4 text-sm font-semibold text-text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-14" id="booking-confidence">
          <h2 className="text-2xl font-semibold font-accent">Booking Through Cruises From Galveston</h2>
          <div className="mt-6 rounded-2xl border border-white/10 bg-background-panel p-6">
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>Real humans, local to Galveston.</li>
              <li>Transparent pricing with taxes and port fees included.</li>
              <li>Optional vacation protection explained clearly.</li>
              <li>Support before, during, and after travel.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/booking" className="rounded-full bg-primary-blue px-6 py-3 text-sm font-semibold text-white">
                Continue to Booking
              </a>
              <a
                href="mailto:hello@cruisesfromgalveston.net"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-text-primary"
              >
                Ask an Advisor
              </a>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold font-accent">Galveston Cruise Matrix</h2>
            <p className="text-xs text-text-muted">Live sailings snapshot (prices include taxes and fees).</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <select
              value={filterLine}
              onChange={(event) => setFilterLine(event.target.value)}
              className="rounded-full border border-white/10 bg-background-card px-4 py-2 text-xs text-text-primary"
              aria-label="Cruise line filter"
            >
              <option value="all">All Cruise Lines</option>
              {availableLines.map((line) => (
                <option key={line.key} value={line.key}>
                  {line.label}
                </option>
              ))}
            </select>
            {["price", "duration", "date"].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSortKey(key as "price" | "duration" | "date")}
                className="rounded-full border border-white/10 bg-background-card px-4 py-2 text-xs font-semibold text-text-primary hover:border-primary-blue/50"
              >
                Sort by {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-background-panel">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-text-muted">
                <tr>
                  <th className="px-6 py-4">Cruise Line</th>
                  <th className="px-6 py-4">Ship</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Ports</th>
                  <th className="px-6 py-4">Price from</th>
                  <th className="px-6 py-4">Sail Score</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {matrixLoading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-5 text-text-secondary">
                      Loading sailings...
                    </td>
                  </tr>
                )}
                {!matrixLoading && matrixError && (
                  <tr>
                    <td colSpan={7} className="px-6 py-5 text-red-300">
                      {matrixError}
                    </td>
                  </tr>
                )}
                {!matrixLoading && !matrixError && filteredCruises.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-5 text-text-secondary">
                      No sailings available yet.
                    </td>
                  </tr>
                )}
                {!matrixLoading &&
                  !matrixError &&
                  filteredCruises.map((cruise) => (
                    <tr key={cruise.id} className="text-text-secondary">
                      <td className="px-6 py-4 font-semibold text-text-primary">{cruise.line}</td>
                      <td className="px-6 py-4">{cruise.ship}</td>
                      <td className="px-6 py-4">{cruise.duration} nights</td>
                      <td className="px-6 py-4">{cruise.ports}</td>
                      <td className="px-6 py-4">{cruise.priceDisplay}</td>
                      <td className="px-6 py-4">{cruise.scoreDisplay}</td>
                      <td className="px-6 py-4">
                        <a
                          href="#booking-panel"
                          onClick={() => openBookingPanel({ ship: cruise.ship })}
                          className="rounded-full border border-primary-blue/40 px-4 py-2 text-xs font-semibold text-primary-blue hover:border-primary-blue"
                        >
                          Get Quote
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
