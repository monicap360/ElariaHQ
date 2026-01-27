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

type DeskItem = {
  id: string;
  title: string;
  summary: string | null;
  created_at: string | null;
  source?: string | null;
  kind: "draft" | "signal";
};

type ShipRow = {
  id: string;
  name: string;
  home_port?: string | null;
  is_active?: boolean | null;
};

function normalizeLineKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const LONG_SAIL_LINES = ["carnival", "royal-caribbean", "royal-caribbean-international"];
const STANDARD_NIGHTS = [4, 5, 6, 7];
const EXTENDED_NIGHTS = [4, 5, 6, 7, 8, 10, 14];

function allowedNightsForLine(lineName?: string | null) {
  if (!lineName) return EXTENDED_NIGHTS;
  const key = normalizeLineKey(lineName);
  if (LONG_SAIL_LINES.includes(key)) return EXTENDED_NIGHTS;
  return STANDARD_NIGHTS;
}

function isAllowedDuration(lineName: string, nights: number) {
  return allowedNightsForLine(lineName).includes(nights);
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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
    return value
      .filter(Boolean)
      .map((port) => normalizePortName(String(port)))
      .join(", ");
  }
  if (typeof value === "string" && value.trim().length) {
    return value
      .split(",")
      .map((port) => normalizePortName(port.trim()))
      .join(", ");
  }
  return null;
}

function normalizePortName(port: string) {
  const key = port.toLowerCase();
  if (key === "cozumel") return "Cozumel, Mexico";
  if (key === "costa maya") return "Costa Maya, Mexico";
  if (key === "falmouth") return "Falmouth, Jamaica";
  if (key === "nassau") return "Nassau, Bahamas";
  return port;
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatYear(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}`;
}

export default function Home() {
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [cruiseMatrix, setCruiseMatrix] = useState<CruiseMatrixRow[]>([]);
  const [filterLine, setFilterLine] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [sortKey, setSortKey] = useState<"price" | "duration" | "date">("date");
  const [bookingForm, setBookingForm] = useState({
    ship: "",
    month: "",
    nights: "",
    cabin: "",
    travelers: "2",
    advisorOnly: false,
  });
  const [roomsCount, setRoomsCount] = useState(1);
  const [roomGuests, setRoomGuests] = useState<number[]>([2]);
  const [deckPreference, setDeckPreference] = useState("");
  const [roomTypePreference, setRoomTypePreference] = useState("");
  const [deskItems, setDeskItems] = useState<DeskItem[]>([]);
  const [ships, setShips] = useState<ShipRow[]>([]);
  const [ports, setPorts] = useState<string[]>([]);

  useEffect(() => {
    let isActive = true;


    async function loadHomepageData() {
      try {
        const res = await fetch("/api/homepage-data");
        if (!res.ok) return;
        const data = (await res.json()) as {
          deskItems: DeskItem[];
          ships: ShipRow[];
          ports: string[];
        };
        if (!isActive) return;
        setDeskItems(data.deskItems || []);
        setShips(data.ships || []);
        setPorts(data.ports || []);
      } catch {
        // ignore homepage data errors on public page
      }
    }

    loadHomepageData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    setRoomGuests((prev) => {
      const next = [...prev];
      if (roomsCount > next.length) {
        while (next.length < roomsCount) next.push(2);
      } else if (roomsCount < next.length) {
        next.length = roomsCount;
      }
      return next;
    });
  }, [roomsCount]);

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
        const portsValue = formatPorts(row.ports) ?? formatPorts(row.itinerary) ?? "TBA";
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
          ports: portsValue,
          priceDisplay: formatPrice(priceCandidate),
          priceNumber: priceCandidate,
          scoreDisplay: formatScore(scoreCandidate),
          sailDate: row.sail_date,
        };
      });

      setCruiseMatrix(rows.filter((row) => isAllowedDuration(row.line, row.duration)));
      setMatrixLoading(false);
    }

    loadMatrix();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredCruises = useMemo(() => {
    const byLine = filterLine === "all" ? cruiseMatrix : cruiseMatrix.filter((cruise) => cruise.lineKey === filterLine);
    const byYear = filterYear === "all" ? byLine : byLine.filter((cruise) => formatYear(cruise.sailDate) === filterYear);
    const sorted = [...byYear].sort((a, b) => {
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
  }, [cruiseMatrix, filterLine, filterYear, sortKey]);

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

  const selectedShipLine = useMemo(() => {
    if (!bookingForm.ship) return null;
    const found = cruiseMatrix.find((row) => row.ship === bookingForm.ship);
    return found?.line ?? null;
  }, [bookingForm.ship, cruiseMatrix]);

  const bookingNightsOptions = useMemo(() => {
    return allowedNightsForLine(selectedShipLine);
  }, [selectedShipLine]);

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

  const availableYears = useMemo(() => {
    const unique = new Map<string, string>();
    cruiseMatrix.forEach((row) => {
      const year = formatYear(row.sailDate);
      if (year) unique.set(year, year);
    });
    return ["all", ...Array.from(unique.values()).sort()];
  }, [cruiseMatrix]);

  const stats = useMemo(() => {
    return [
      { label: "Sailings tracked", value: cruiseMatrix.length ? `${cruiseMatrix.length}` : "-" },
      { label: "Active ships", value: ships.length ? `${ships.length}` : "-" },
      { label: "AI booking support", value: "Available" },
    ];
  }, [cruiseMatrix.length, ships.length]);

  const shipBoards = useMemo(() => {
    const grouped = new Map<string, CruiseMatrixRow[]>();
    cruiseMatrix.forEach((row) => {
      if (!grouped.has(row.ship)) grouped.set(row.ship, []);
      grouped.get(row.ship)?.push(row);
    });
    return Array.from(grouped.entries()).map(([ship, rows]) => {
      const sorted = [...rows].sort((a, b) => a.sailDate.localeCompare(b.sailDate));
      return {
        ship,
        line: sorted[0]?.line ?? "Cruise line",
        rows: sorted.slice(0, 5),
      };
    });
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
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="rounded-3xl border border-white/10 bg-background-panel/80 px-10 py-12 shadow-[0_0_40px_rgba(76,111,255,0.08)]">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary-blue/30 bg-primary-blue/10 px-4 py-2 text-xs text-text-secondary">
              <span className="logo-holo h-8 w-8" aria-hidden="true">
                <img src="/brand/cfg-logo.png" alt="" loading="lazy" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-text-muted">The Cruises From Galveston Desk</div>
                <div className="text-sm font-semibold text-text-primary">Edited by Monica Pena</div>
              </div>
            </div>
            <h1 className="mt-6 text-4xl font-semibold text-text-primary md:text-5xl font-accent">
              Cruising From Galveston, clearly explained.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-text-secondary md:text-lg">
              Advisor-grade insight on which ships fit your situation, when sailings actually make sense, and what
              itinerary changes mean before you book.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#sailings" className="rounded-full bg-primary-blue px-6 py-3 text-sm font-semibold text-white">
                View sailings
              </a>
              <a
                href="#guidance"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-text-primary hover:border-primary-blue/60"
              >
                Start with guidance
              </a>
            </div>
            <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-semibold text-primary-blue">{stat.value}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <aside
            id="booking-panel"
            className="rounded-3xl border border-white/10 bg-background-panel/80 px-8 py-10"
          >
            <h2 className="text-2xl font-semibold font-accent">Search & book with clarity</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Filters sync to live sailings. We explain first, then help you book.
            </p>
            <div className="mt-6 grid gap-4">
              <label className="text-sm font-semibold text-text-secondary">
                Ship
                <select
                  value={bookingForm.ship}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, ship: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-background-card px-4 py-3 text-text-primary"
                >
                  <option value="">Any ship</option>
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
                  <option value="">Any month</option>
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
                  {bookingNightsOptions.map((night) => (
                    <option key={night} value={night}>
                      {night} nights
                    </option>
                  ))}
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
              <label className="text-sm font-semibold text-text-secondary">
                Rooms needed
                <select
                  value={roomsCount}
                  onChange={(event) => setRoomsCount(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-background-card px-4 py-3 text-text-primary"
                >
                  {[1, 2, 3, 4, 5, 6].map((count) => (
                    <option key={count} value={count}>
                      {count} room{count > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </label>
              {roomGuests.map((guests, index) => (
                <label key={`room-${index + 1}`} className="text-sm font-semibold text-text-secondary">
                  Room {index + 1} guests
                  <select
                    value={guests}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setRoomGuests((prev) => prev.map((item, idx) => (idx === index ? value : item)));
                    }}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-background-card px-4 py-3 text-text-primary"
                  >
                    {[1, 2, 3, 4].map((count) => (
                      <option key={count} value={count}>
                        {count} guest{count > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <label className="text-sm font-semibold text-text-secondary">
                Deck preference
                <select
                  value={deckPreference}
                  onChange={(event) => setDeckPreference(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-background-card px-4 py-3 text-text-primary"
                >
                  <option value="">No preference</option>
                  <option value="Lower decks">Lower decks</option>
                  <option value="Mid decks">Mid decks</option>
                  <option value="Upper decks">Upper decks</option>
                  <option value="Spa/quiet">Spa / quiet decks</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-text-secondary">
                Room type preference
                <select
                  value={roomTypePreference}
                  onChange={(event) => setRoomTypePreference(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-background-card px-4 py-3 text-text-primary"
                >
                  <option value="">No preference</option>
                  <option value="Interior">Interior</option>
                  <option value="Ocean View">Ocean view</option>
                  <option value="Balcony">Balcony</option>
                  <option value="Suite">Suite</option>
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
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/booking" className="rounded-full bg-primary-blue px-6 py-3 text-sm font-semibold text-white">
                Continue to booking
              </a>
              <a
                href="#sailings"
                onClick={() => openBookingPanel()}
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-text-primary"
              >
                Review sailings
              </a>
            </div>
            <p className="mt-4 text-xs text-text-muted">
              Prices shown include port fees and taxes. Gratuities and vacation protection are optional and shown
              separately before checkout.
            </p>
          </aside>
        </motion.section>

        {deskItems.length > 0 && (
          <section className="mt-14" id="desk">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold font-accent">From the Cruises From Galveston Desk</h2>
                <p className="text-sm text-text-secondary">Live advisories and context from our editors.</p>
              </div>
              <a href="/cruises-from-galveston/desk" className="text-sm font-semibold text-primary-blue">
                View the Desk {"->"}
              </a>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {deskItems.map((card) => (
                <div key={card.id} className="rounded-2xl border border-white/10 bg-background-card p-6">
                  <div className="text-base font-semibold text-text-primary">{card.title}</div>
                  {card.summary && <p className="mt-3 text-sm text-text-secondary">{card.summary}</p>}
                  {card.kind === "signal" && card.source && (
                    <div className="mt-3 text-xs text-text-muted">Source: {card.source}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="sailings" className="mt-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold font-accent">Galveston Sailings Board</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Live sailings snapshot with taxes and port fees included. Prices shown are per person.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {availableYears.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setFilterYear(year)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    filterYear === year
                      ? "border-primary-blue/60 bg-primary-blue/20 text-text-primary"
                      : "border-white/10 bg-background-card text-text-secondary hover:border-primary-blue/40"
                  }`}
                >
                  {year === "all" ? "All Years" : year}
                </button>
              ))}
            </div>
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
          <div className="mt-4 overflow-x-auto rounded-3xl border border-white/10 bg-background-panel">
            <table className="min-w-[840px] w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-text-muted">
                <tr>
                  <th className="px-6 py-4">Departure</th>
                  <th className="px-6 py-4">Ship & line</th>
                  <th className="px-6 py-4">Nights</th>
                  <th className="px-6 py-4">Itinerary</th>
                  <th className="px-6 py-4">Starting from</th>
                  <th className="px-6 py-4">Sail score</th>
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
                    <tr key={cruise.id} className="text-text-secondary hover:bg-white/5">
                      <td className="px-6 py-4 text-text-primary">{formatDate(cruise.sailDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#7B61FF,#C084FC)] text-xs font-semibold text-white">
                            {initials(cruise.line)}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary">{cruise.ship}</div>
                            <div className="text-xs text-text-muted">{cruise.line}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{cruise.duration}</td>
                      <td className="px-6 py-4">{cruise.ports}</td>
                      <td className="px-6 py-4">
                        <div className="text-base font-semibold text-text-primary">{cruise.priceDisplay}</div>
                        <div className="text-xs text-text-muted">per person</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-primary-blue/40 bg-primary-blue/10 px-3 py-1 text-xs font-semibold text-primary-blue">
                          {cruise.scoreDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href="#booking-panel"
                          onClick={() => openBookingPanel({ ship: cruise.ship })}
                          className="rounded-full border border-primary-blue/40 px-4 py-2 text-xs font-semibold text-primary-blue hover:border-primary-blue"
                        >
                          Request booking
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {shipBoards.length > 0 && (
          <section className="mt-16" id="ship-boards">
            <h2 className="text-2xl font-semibold font-accent">Ship-by-Ship Cruise Boards</h2>
            <p className="mt-2 text-sm text-text-secondary">
              A focused board for each ship so travelers can compare dates, nights, and itineraries quickly.
            </p>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {shipBoards.map((board) => (
                <div key={board.ship} className="rounded-3xl border border-white/10 bg-background-panel">
                  <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div>
                      <div className="text-lg font-semibold text-text-primary">{board.ship}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-text-muted">{board.line}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <a href="#booking-panel" className="rounded-full border border-primary-blue/40 px-3 py-1 text-primary-blue">
                        Request booking
                      </a>
                      <a href="#booking-panel" className="rounded-full border border-white/10 px-3 py-1 text-text-secondary">
                        24 hour hold
                      </a>
                      <a href="#booking-panel" className="rounded-full border border-white/10 px-3 py-1 text-text-secondary">
                        48 hour hold
                      </a>
                      <a href="#booking-panel" className="rounded-full border border-white/10 px-3 py-1 text-text-secondary">
                        72 hour hold
                      </a>
                    </div>
                  </div>
                  <div className="px-6 pt-3 text-xs text-text-muted">
                    Prices shown are per person and include taxes and port fees.
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[520px] w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.18em] text-text-muted">
                        <tr>
                          <th className="px-6 py-3">Departure</th>
                          <th className="px-6 py-3">Nights</th>
                          <th className="px-6 py-3">Itinerary</th>
                          <th className="px-6 py-3">From</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {board.rows.map((row) => (
                          <tr key={`${board.ship}-${row.sailDate}`} className="text-text-secondary">
                            <td className="px-6 py-3 text-text-primary">{formatDate(row.sailDate)}</td>
                            <td className="px-6 py-3">{row.duration}</td>
                            <td className="px-6 py-3">{row.ports}</td>
                            <td className="px-6 py-3">{row.priceDisplay}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 text-xs text-text-muted">
                    Common ports for Galveston itineraries include Cozumel, Costa Maya, Falmouth, and Nassau when
                    applicable.
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {ships.length > 0 && (
          <section className="mt-16" id="ships">
            <h2 className="text-2xl font-semibold font-accent">Ships sailing from Galveston</h2>
            <p className="mt-2 text-sm text-text-secondary">Advisor notes and ship profiles from our desk.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {ships.map((ship) => (
                <div key={ship.id} className="rounded-2xl border border-white/10 bg-background-card p-6">
                  <div className="text-lg font-semibold text-text-primary">{ship.name}</div>
                  {ship.home_port && (
                    <p className="mt-2 text-sm text-text-secondary">Home port: {ship.home_port}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                    <a href="/cruises-from-galveston/ships" className="text-primary-blue">
                      Advisor overview
                    </a>
                    <a
                      href="#booking-panel"
                      onClick={() => openBookingPanel({ ship: ship.name })}
                      className="text-text-primary hover:text-primary-blue"
                    >
                      View sailings
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {ports.length > 0 && (
          <section className="mt-16" id="ports">
            <h2 className="text-2xl font-semibold font-accent">Where Galveston cruises go</h2>
            <p className="mt-2 text-sm text-text-secondary">Based on live Galveston sailings and recent itineraries.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {ports.map((port) => (
                <div key={port} className="rounded-2xl border border-white/10 bg-background-card p-6">
                  <div className="text-base font-semibold text-text-primary">{port}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16" id="guidance">
          <h2 className="text-2xl font-semibold font-accent">Planning your cruise from Galveston</h2>
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

        <section className="mt-16" id="info-center">
          <h2 className="text-2xl font-semibold font-accent">Galveston Cruise Information Center</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Think of this as a local visitor bureau for cruise departures: parking guidance, drive-in timing, terminal
            logistics, and itinerary context in one place.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Driving from Dallas or North Texas",
                description: "Recommended arrival timing, overnight options, and where to park once you reach the port.",
              },
              {
                title: "Galveston parking and drop-off strategy",
                description: "Terminal 10 vs Terminal 25 arrival flow, luggage drop timing, and parking lot decisions.",
              },
              {
                title: "Airport to ship transportation",
                description: "Hobby vs Bush timing, pickup windows, and how to coordinate with embarkation schedules.",
              },
              {
                title: "Itinerary clarity",
                description: "What a Cozumel, Costa Maya, Falmouth, or Nassau stop actually means for time ashore.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-background-panel px-6 py-6">
                <div className="text-base font-semibold text-text-primary">{item.title}</div>
                <p className="mt-2 text-sm text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16" id="authority">
          <h2 className="text-center text-2xl font-semibold font-accent">Why trust the desk</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Port-specific expertise",
                description:
                  "Focused exclusively on Galveston departures, terminal logistics, and the travel realities that impact embarkation.",
              },
              {
                title: "Decision-grade context",
                description:
                  "We explain itinerary changes, ship shifts, and seasonal patterns in clear language before you commit.",
              },
              {
                title: "Independent guidance",
                description:
                  "We are not tied to a single cruise line, so recommendations prioritize fit and clarity over volume.",
              },
              {
                title: "Support across the journey",
                description:
                  "From planning to return day, our team stays available for questions and operational updates.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-background-panel px-6 py-8">
                <div className="text-lg font-semibold text-text-primary">{item.title}</div>
                <p className="mt-3 text-sm text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16" id="contact">
          <div className="rounded-3xl border border-white/10 bg-background-panel px-8 py-10 text-center">
            <h2 className="text-2xl font-semibold font-accent">Need personal guidance?</h2>
            <p className="mt-3 text-sm text-text-secondary">
              The Cruises From Galveston Desk answers complex questions and confirms the best fit before you book.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:hello@cruisesfromgalveston.net"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-text-primary"
              >
                Email the desk
              </a>
              <a
                href="tel:14096322106"
                className="rounded-full bg-primary-blue px-6 py-3 text-sm font-semibold text-white"
              >
                Call (409) 632-2106
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
