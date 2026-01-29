"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDurationLabel } from "@/lib/formatDuration";
import { useEffect, useMemo, useState } from "react";

type CruiseMatrixRow = {
  id: string;
  line: string;
  lineKey: string;
  ship: string;
  duration: number;
  itineraryLabel: string;
  portsSummary: string;
  priceDisplay: string;
  priceNumber: number | null;
  scoreDisplay: string;
  engineScore: number;
  confidence: number;
  reasons: string[];
  departureDay: string;
  demandTier: "short" | "standard" | "long";
  sailDate: string;
};

type SailingRow = {
  id: string;
  sail_date: string;
  return_date: string;
  ports?: string[] | string | null;
  itinerary?: string | null;
  itinerary_label?: string | null;
  ports_summary?: string | null;
  price_from?: number | string | null;
  base_price?: number | string | null;
  starting_price?: number | string | null;
  min_price?: number | string | null;
  sail_score?: number | string | null;
  score?: number | string | null;
  cruise_line?: string | null;
  ship: {
    id: string;
    name: string;
    cruise_line: {
      name: string;
    } | null;
  } | null;
};

type DecisionResult = {
  sailingId: string;
  score: number;
  confidence: number;
  reasons: string[];
  flags?: string[];
  sailing: {
    id: string;
    sail_date: string;
    return_date: string;
    ports?: string[] | string | null;
    itinerary?: string | null;
    itinerary_label?: string | null;
    ports_summary?: string | null;
    cruise_line?: string | null;
    price_from?: number | string | null;
    base_price?: number | string | null;
    starting_price?: number | string | null;
    min_price?: number | string | null;
    ship: {
      id: string;
      name: string;
      cruise_line: {
        name: string;
      } | null;
    } | null;
  };
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
  ship_id: string;
  ship_name: string;
  cruise_line?: string | null;
  home_port?: string | null;
  future_sailing_count?: number | null;
  next_sailing_date?: string | null;
  last_sailing_date?: string | null;
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
  const [sortKey, setSortKey] = useState<"score" | "price" | "duration" | "date">("score");
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
  }, [bookingForm.travelers]);

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

      let results: DecisionResult[] = [];
      try {
        const today = new Date();
        const start = today.toISOString().slice(0, 10);
        const endDate = new Date(today);
        endDate.setMonth(endDate.getMonth() + 18);
        const end = endDate.toISOString().slice(0, 10);

        const input = {
          departurePort: "Galveston",
          dateRange: { start, end },
          passengers: { adults: Number(bookingForm.travelers || 2) },
        };

        const res = await fetch("/api/cruise/decision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Failed to load cruise matrix");
        const payload = (await res.json()) as { results: DecisionResult[] };
        results = payload.results || [];
      } catch (error) {
        console.error("Matrix load error", error);
        if (!isActive) return;
        setMatrixError("Unable to load sailings right now.");
        setCruiseMatrix([]);
        setMatrixLoading(false);
        return;
      }

      if (!isActive) return;

      const rows = (results || []).map((result) => {
        const row = result.sailing;
        const lineName = row.cruise_line ?? row.ship?.cruise_line?.name ?? "Unknown cruise line";
        const lineKey = normalizeLineKey(lineName);
        const duration = calcNights(row.sail_date, row.return_date);
            const itineraryLabel = row.itinerary_label ?? "Cruise";
            const portsSummary = row.ports_summary ?? formatPorts(row.ports) ?? formatPorts(row.itinerary) ?? "Ports TBA";
        const priceCandidate =
          parsePrice(row.price_from) ??
          parsePrice(row.base_price) ??
          parsePrice(row.starting_price) ??
          parsePrice(row.min_price);
        const departureDay = row.sail_date
          ? new Date(row.sail_date).toLocaleDateString("en-US", { weekday: "long" })
          : "TBD";
            const demandTier: CruiseMatrixRow["demandTier"] = duration >= 8 ? "long" : duration >= 6 ? "standard" : "short";
        return {
          id: row.id,
          line: lineName,
          lineKey,
          ship: row.ship?.name ?? "Unknown ship",
          duration,
                itineraryLabel,
                portsSummary,
          priceDisplay: formatPrice(priceCandidate),
          priceNumber: priceCandidate,
          scoreDisplay: `${Math.round(result.score * 100)}/100`,
          engineScore: result.score,
          confidence: result.confidence,
          reasons: result.reasons || [],
          departureDay,
          demandTier,
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
  }, [bookingForm.travelers]);

  const filteredCruises = useMemo(() => {
    const byLine = filterLine === "all" ? cruiseMatrix : cruiseMatrix.filter((cruise) => cruise.lineKey === filterLine);
    const byYear = filterYear === "all" ? byLine : byLine.filter((cruise) => formatYear(cruise.sailDate) === filterYear);
    const sorted = [...byYear].sort((a, b) => {
      if (sortKey === "score") {
        return b.engineScore - a.engineScore;
      }
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
    const coreShips = [
      "Carnival Breeze",
      "Carnival Dream",
      "Carnival Jubilee",
      "Harmony of the Seas",
      "Disney Magic",
    ];
    const grouped = new Map<string, CruiseMatrixRow[]>();
    cruiseMatrix.forEach((row) => {
      if (!grouped.has(row.ship)) grouped.set(row.ship, []);
      grouped.get(row.ship)?.push(row);
    });
    const boards = Array.from(grouped.entries()).map(([ship, rows]) => {
      const sorted = [...rows].sort((a, b) => a.sailDate.localeCompare(b.sailDate));
      return {
        ship,
        line: sorted[0]?.line ?? "Cruise line",
        rows: sorted.slice(0, 5),
      };
    });
    return boards.sort((a, b) => {
      const aIndex = coreShips.indexOf(a.ship);
      const bIndex = coreShips.indexOf(b.ship);
      if (aIndex === -1 && bIndex === -1) return a.ship.localeCompare(b.ship);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [cruiseMatrix]);

  const photoGallery = [
    {
      title: "Modern ship exterior",
      description: "Open-deck views and outdoor spaces on Galveston sailings.",
      src: "/assets/50d77fbd1a700d20a05a.webp",
    },
    {
      title: "Royal Caribbean-class exterior",
      description: "High-capacity ships with multiple neighborhoods.",
      src: "/assets/symphony-of-the-seas.webp",
    },
    {
      title: "Carnival Dream exterior",
      description: "Mid-size ship scale with wraparound promenade decks.",
      src: "/assets/OIP (7).jpg",
    },
    {
      title: "Balcony stateroom",
      description: "Private outdoor space for longer sailings.",
      src: "/assets/breezebalc.jpg",
    },
    {
      title: "Twin interior stateroom",
      description: "Efficient layout for families traveling together.",
      src: "/assets/IMG_4317.jpg",
    },
    {
      title: "Oceanview stateroom",
      description: "Natural light with flexible seating space.",
      src: "/assets/6mxl.jpg",
    },
    {
      title: "Twin-bed stateroom",
      description: "Ideal when friends share a room.",
      src: "/assets/affordable-way-to-sail.5fed36671945b8.38390523.webp",
    },
    {
      title: "Onboard waterpark",
      description: "Family-friendly deck activities on sea days.",
      src: "/assets/60ed9b0ab092993339d2.webp",
    },
    {
      title: "Cozumel shoreline",
      description: "One of the most common Galveston port stops.",
      src: "/assets/Cozumel-Beach-Resort-Aerial-NBS.jpg",
    },
    {
      title: "Long-route transits",
      description: "Occasional longer itineraries and repositioning routes.",
      src: "/assets/7710151000_2684b53384_b.jpg",
    },
  ];

  const portImageFor = (port: string) => {
    const key = port.toLowerCase();
    if (key.includes("cozumel")) return "/assets/Cozumel-Beach-Resort-Aerial-NBS.jpg";
    return null;
  };

  function openBookingPanel(prefill?: Partial<typeof bookingForm>) {
    setBookingForm((prev) => ({ ...prev, ...prefill }));
    const target = document.getElementById("booking-panel");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function shipImageFor(shipName: string) {
    const key = shipName.toLowerCase();
    if (key.includes("breeze")) return "/assets/breezebalc.jpg";
    if (key.includes("dream")) return "/assets/OIP (7).jpg";
    if (key.includes("mariner")) return "/assets/symphony-of-the-seas.webp";
    if (key.includes("disney")) return "/assets/60ed9b0ab092993339d2.webp";
    return "/assets/50d77fbd1a700d20a05a.webp";
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.08),transparent_55%)] bg-background-base text-text-secondary">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-background-panel/80 px-10 py-12 shadow-[0_0_40px_rgba(76,111,255,0.08)]">
            <Image
              src="/assets/symphony-of-the-seas.webp"
              alt="Cruise ship at sea"
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover opacity-25"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(11,14,20,0.92),rgba(11,14,20,0.55))]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-primary-blue/30 bg-primary-blue/10 px-4 py-2 text-xs text-text-secondary">
                <span className="logo-holo h-8 w-8" aria-hidden="true">
                  <Image src="/brand/cfg-logo.webp" alt="" fill sizes="32px" className="object-cover" />
                </span>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.25em] text-text-muted">Cruises From Galveston</div>
                  <div className="text-sm font-semibold text-text-primary">Your trusted guide since 2017</div>
                </div>
              </div>
              <h1 className="mt-6 text-4xl font-semibold text-text-primary md:text-5xl font-accent">
                Cruises From Galveston
              </h1>
              <p className="mt-4 max-w-2xl text-base text-text-secondary md:text-lg">
                Your trusted guide to sailing from our home port.
              </p>
              <p className="mt-4 max-w-2xl text-sm text-text-secondary md:text-base">
                Real local guidance for first-time cruisers, returning guests, and anyone sailing from our home port.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/cruises-from-galveston/first-time-cruisers"
                  className="rounded-full bg-primary-blue px-6 py-3 text-center text-sm font-semibold text-white"
                >
                  Start Here
                </Link>
                <Link
                  href="/cruises-from-galveston/guest-help"
                  className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold text-text-primary hover:border-primary-blue/60"
                >
                  Already Booked? Guest Help
                </Link>
              </div>
              <div className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-semibold text-primary-blue">{stat.value}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside
            id="booking-panel"
            className="rounded-3xl border border-slate-200 bg-background-panel/80 px-8 py-10"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-background-card px-4 py-3 text-text-primary"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-background-card px-4 py-3 text-text-primary"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-background-card px-4 py-3 text-text-primary"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-background-card px-4 py-3 text-text-primary"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-background-card px-4 py-3 text-text-primary"
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-background-card px-4 py-3 text-text-primary"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-background-card px-4 py-3 text-text-primary"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-background-card px-4 py-3 text-text-primary"
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
                  className="h-4 w-4 rounded border-slate-200 bg-background-card text-primary-blue"
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
              <Link href="/cruises-from-galveston/desk" className="text-sm font-semibold text-primary-blue">
                View the Desk {"->"}
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {deskItems.map((card) => (
                <div key={card.id} className="rounded-2xl border border-slate-200 bg-background-card p-6">
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

        <section className="mt-16" id="arrival-selector">
          <h2 className="text-2xl font-semibold font-accent">How are you arriving?</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Choose the route that matches your starting point for calm, local guidance.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Driving from Houston / I-10 East",
                desc: "East Houston, Baytown, Beaumont, Port Arthur, Louisiana, East Texas.",
                href: "/plan-your-cruise/driving-to-galveston/from-houston",
              },
              {
                title: "Driving down I-45",
                desc: "Houston metro, Central Texas, North Texas.",
                href: "/plan-your-cruise/driving-to-galveston",
              },
              {
                title: "Flying into Houston",
                desc: "Hobby (HOU) or Bush Intercontinental (IAH).",
                href: "/cruises-from-galveston/how-to-plan",
              },
              {
                title: "Staying overnight in Galveston",
                desc: "Relaxed embarkation morning and short port transfer.",
                href: "/cruises-from-galveston/parking-and-transportation",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-2xl border border-slate-200 bg-background-card px-6 py-5 text-sm font-semibold text-text-primary hover:border-primary-blue/50"
              >
                <div className="text-base">{item.title}</div>
                <div className="mt-2 text-xs text-text-muted">{item.desc}</div>
              </Link>
            ))}
          </div>
        </section>

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
                      : "border-slate-200 bg-background-card text-text-secondary hover:border-primary-blue/40"
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
              className="rounded-full border border-slate-200 bg-background-card px-4 py-2 text-xs text-text-primary"
              aria-label="Cruise line filter"
            >
              <option value="all">All Cruise Lines</option>
              {availableLines.map((line) => (
                <option key={line.key} value={line.key}>
                  {line.label}
                </option>
              ))}
            </select>
            {["score", "price", "duration", "date"].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSortKey(key as "price" | "duration" | "date" | "score")}
                className="rounded-full border border-slate-200 bg-background-card px-4 py-2 text-xs font-semibold text-text-primary hover:border-primary-blue/50"
              >
                Sort by {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-4">
            {matrixLoading && <p className="text-text-secondary">Loading sailings...</p>}
            {!matrixLoading && matrixError && <p className="text-red-500">{matrixError}</p>}
            {!matrixLoading && !matrixError && filteredCruises.length === 0 && (
              <p className="text-text-secondary">No sailings available yet.</p>
            )}
            {!matrixLoading && !matrixError && filteredCruises.length > 0 && (
              <section className="results">
                {filteredCruises.map((cruise) => (
                  <article key={cruise.id} className="cruise-card">
                    <Image
                      src={shipImageFor(cruise.ship)}
                      alt={cruise.ship}
                      width={360}
                      height={260}
                      className="h-full w-full object-cover"
                      sizes="180px"
                    />
                    <div className="cruise-info">
                      <h3>{cruise.ship}</h3>
                      <p className="meta">
                        {formatDurationLabel(cruise.line, cruise.duration)} {cruise.itineraryLabel} •{" "}
                        {formatDate(cruise.sailDate)}
                      </p>
                      <p className="meta-secondary">{cruise.portsSummary}</p>
                      <ul className="reasons">
                        {(cruise.reasons || []).slice(0, 3).map((reason) => {
                          const isWarn = reason.toLowerCase().includes("limited");
                          return (
                            <li key={reason} className={isWarn ? "warn" : "good"}>
                              {reason}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div className="cruise-action">
                      <span className="price">{cruise.priceDisplay}</span>
                      <a href={`/cruise/${cruise.id}?adults=2&children=0&max=900&flex=1&seapay=0`}>
                        View Details
                      </a>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </div>
        </section>

        {shipBoards.length > 0 && (
          <section className="mt-16" id="ship-boards">
            <h2 className="text-2xl font-semibold font-accent">Choose your ship</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Pick a ship first, then browse the upcoming sail dates by week.
            </p>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {shipBoards.map((board) => (
                <div key={board.ship} className="rounded-3xl border border-slate-200 bg-background-panel">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                      <div className="text-lg font-semibold text-text-primary">{board.ship}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-text-muted">{board.line}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <a href="#booking-panel" className="rounded-full border border-primary-blue/40 px-3 py-1 text-primary-blue">
                        Request booking
                      </a>
                      <a href="#booking-panel" className="rounded-full border border-slate-200 px-3 py-1 text-text-secondary">
                        24 hour hold
                      </a>
                      <a href="#booking-panel" className="rounded-full border border-slate-200 px-3 py-1 text-text-secondary">
                        48 hour hold
                      </a>
                      <a href="#booking-panel" className="rounded-full border border-slate-200 px-3 py-1 text-text-secondary">
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
                          <th className="px-6 py-3">Day</th>
                          <th className="px-6 py-3">Length</th>
                          <th className="px-6 py-3">Itinerary</th>
                          <th className="px-6 py-3">Tier</th>
                          <th className="px-6 py-3">From</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {board.rows.map((row) => (
                          <tr key={`${board.ship}-${row.sailDate}`} className="text-text-secondary">
                            <td className="px-6 py-3 text-text-primary">{formatDate(row.sailDate)}</td>
                            <td className="px-6 py-3">{row.departureDay}</td>
                            <td className="px-6 py-3">{formatDurationLabel(row.line, row.duration)}</td>
                            <td className="px-6 py-3">
                              <div className="text-xs font-semibold text-text-primary">{row.itineraryLabel}</div>
                              <div className="text-xs text-text-secondary">{row.portsSummary}</div>
                            </td>
                            <td className="px-6 py-3 capitalize">{row.demandTier}</td>
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

        <section className="mt-16" id="gallery">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold font-accent">Onboard & itinerary photo guide</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Real visuals from Galveston sailings, stateroom styles, and port expectations.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {photoGallery.map((item) => (
              <div key={item.src} className="overflow-hidden rounded-2xl border border-slate-200 bg-background-card">
                <Image
                  src={item.src}
                  alt={item.title}
                  width={640}
                  height={352}
                  className="h-44 w-full object-cover"
                  sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
                />
                <div className="px-5 py-4">
                  <div className="text-sm font-semibold text-text-primary">{item.title}</div>
                  <p className="mt-2 text-xs text-text-secondary">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {ships.length > 0 && (
          <section className="mt-16" id="ships">
            <h2 className="text-2xl font-semibold font-accent">Ships sailing from Galveston</h2>
            <p className="mt-2 text-sm text-text-secondary">Advisor notes and ship profiles from our desk.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {ships.map((ship) => {
                const shipSlug = normalizeLineKey(ship.ship_name);
                const countLabel =
                  typeof ship.future_sailing_count === "number"
                    ? `${ship.future_sailing_count} upcoming sailings`
                    : "Upcoming sailings";
                const nextDate = ship.next_sailing_date ? formatDate(ship.next_sailing_date) : null;
                return (
                  <div key={ship.ship_id} className="rounded-2xl border border-slate-200 bg-background-card p-6">
                    <div className="text-lg font-semibold text-text-primary">{ship.ship_name}</div>
                    {ship.home_port && (
                      <p className="mt-2 text-sm text-text-secondary">Home port: {ship.home_port}</p>
                    )}
                    <p className="mt-2 text-sm text-text-secondary">
                      {countLabel}
                      {nextDate ? ` · Next sail date ${nextDate}` : ""}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                    <a href={`/cruises-from-galveston/${shipSlug}`} className="text-primary-blue">
                        Ship overview
                      </a>
                      <a
                        href="#booking-panel"
                        onClick={() => openBookingPanel({ ship: ship.ship_name })}
                        className="text-text-primary hover:text-primary-blue"
                      >
                        View sailings
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {ports.length > 0 && (
          <section className="mt-16" id="ports">
            <h2 className="text-2xl font-semibold font-accent">Where Cruises From Galveston go</h2>
            <p className="mt-2 text-sm text-text-secondary">Based on live Galveston sailings and recent itineraries.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {ports.map((port) => {
                const portImage = portImageFor(port);
                const portSlug = normalizeLineKey(port);
                return (
                  <Link
                    key={port}
                    href={`/cruises-from-galveston/${portSlug}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-background-card transition hover:border-slate-300"
                  >
                    {portImage && (
                      <Image
                        src={portImage}
                        alt={port}
                        width={640}
                        height={288}
                        className="h-36 w-full object-cover"
                        sizes="(min-width: 1024px) 320px, 100vw"
                      />
                    )}
                    <div className="p-6">
                      <div className="text-base font-semibold text-text-primary">{port}</div>
                      <div className="mt-2 text-xs text-text-muted">
                        Common Galveston itinerary stop with day-visit timing and curated excursions.
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-16" id="trust-statement">
          <h2 className="text-2xl font-semibold font-accent">The Real Cruises From Galveston Experience™</h2>
          <p className="mt-2 text-sm text-text-secondary">By Monica Peña</p>
          <p className="mt-4 text-sm text-text-secondary">
            Cruises From Galveston was created to serve travelers who want more than marketing — they want accurate,
            local, human guidance. This site is shaped by years of hands-on hospitality experience on Galveston Island,
            real embarkation-day operations, guest meet-and-greet service, cruise shuttle and terminal coordination,
            hotel and visitor service experience, and ongoing work as a local travel agency owner.
          </p>
          <p className="mt-3 text-sm text-text-secondary">
            This isn&apos;t a generic cruise site. It&apos;s a Galveston-based visitor resource, designed to help you feel
            prepared, welcomed, and supported.
          </p>
        </section>

        <section className="mt-16" id="who-for">
          <h2 className="text-2xl font-semibold font-accent">You&apos;re welcome here if…</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "It’s your first cruise and you don’t know what to expect.",
              "You’ve already booked, but still have questions.",
              "Your agent can’t answer practical, day-of questions.",
              "You’re unsure about passports, luggage, or what to wear.",
              "You’re wondering where to park, stay, or arrive.",
              "You just want to make sure you’re doing things right.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-background-panel px-6 py-4 text-sm">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            You don&apos;t need to be a planner. You don&apos;t need to be an expert. You just need honest information — and
            that&apos;s what we provide.
          </p>
        </section>

        <section className="mt-16" id="galveston-different">
          <h2 className="text-2xl font-semibold font-accent">What makes cruising from Galveston different</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Cruising from Galveston is not the same as Miami, Port Canaveral, or Fort Lauderdale. Here, timing matters.
            Location matters. Local knowledge matters.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "The difference between Galveston cruise terminals.",
              "What embarkation day really looks like.",
              "How early to arrive (and when not to).",
              "Where to park safely.",
              "How traffic actually flows on sailing days.",
              "What to expect before you ever step on the ship.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-background-panel px-6 py-4 text-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16" id="guest-help">
          <h2 className="text-2xl font-semibold font-accent">Already Booked? We&apos;re Still Here for You.</h2>
          <p className="mt-3 text-sm text-text-secondary">
            One of the most common things we hear is: “I’ve already booked… but I still have questions.” That’s exactly
            why the Guest Help Desk exists.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
            <li>Do I really need a passport?</li>
            <li>Is the drink package worth it?</li>
            <li>How much luggage can I bring?</li>
            <li>Can I take shampoo and toiletries?</li>
            <li>What can I do in port without an excursion?</li>
            <li>What should I wear on embarkation day?</li>
            <li>Where should I park in Galveston?</li>
            <li>What time should I arrive at the terminal?</li>
          </ul>
          <p className="mt-3 text-sm text-text-secondary">No pressure. No upselling. Just help.</p>
          <div className="mt-4">
            <Link href="/cruises-from-galveston/guest-help" className="text-sm font-semibold text-primary-blue">
              Visit the Guest Help Desk →
            </Link>
          </div>
        </section>

        <section className="mt-16" id="private-islands">
          <h2 className="text-2xl font-semibold font-accent">Private islands, ports & experiences</h2>
          <p className="mt-3 text-sm text-text-secondary">
            Cruises from Galveston visit the Caribbean, Central America, Panama, the Bahamas, and exclusive private
            islands. We explain what makes each destination different, which cruise lines dock where, and what
            experiences are worth your time.
          </p>
          <p className="mt-3 text-sm text-text-secondary">
            You&apos;ll also find dedicated guidance for private island destinations like RelaxAway, Half Moon Cay
            (Carnival) and Great Stirrup Cay (Norwegian). Because not all “private islands” are the same — and you
            deserve to know the difference.
          </p>
        </section>

        <section className="mt-16" id="community">
          <h2 className="text-2xl font-semibold font-accent">Sea You On Deck®</h2>
          <p className="mt-3 text-sm text-text-secondary">
            Cruising is better when you don&apos;t feel alone. Sea You On Deck® is our cruise community — a place for
            first-time cruisers, returning guests, and shared experiences. It&apos;s not about hype. It&apos;s about support.
          </p>
        </section>

        <section className="mt-16" id="welcome">
          <h2 className="text-2xl font-semibold font-accent">From our home port to yours</h2>
          <p className="mt-3 text-sm text-text-secondary">
            Galveston isn&apos;t just where cruises depart — it&apos;s a community that welcomes travelers from all over the
            world. This site was built with that same spirit: respectful, informative, calm, honest, and always
            guest-focused.
          </p>
          <p className="mt-3 text-sm text-text-secondary">
            Whether you sail with us or simply use this site to prepare, we&apos;re glad you found your way here. Welcome
            to Cruises From Galveston. We can&apos;t wait to see you on the island — and on deck.
          </p>
        </section>

        <section className="mt-16" id="contact">
          <div className="rounded-3xl border border-slate-200 bg-background-panel px-8 py-10 text-center">
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
