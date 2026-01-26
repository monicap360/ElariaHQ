"use client";

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
  const [showBookingPanel, setShowBookingPanel] = useState(false);
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
        const ports =
          formatPorts(row.ports) ??
          formatPorts(row.itinerary) ??
          "TBA";
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
    setShowBookingPanel(true);
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "56px 24px 80px",
          fontFamily: "system-ui",
          color: "#0f172a",
        }}
      >
        <section style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#64748b", marginBottom: 10 }}>
            CruisesFromGalveston.net
          </p>
          <h1 style={{ fontSize: 38, fontWeight: 900, marginBottom: 12 }}>
            Cruising From Galveston, Clearly Explained
          </h1>
          <p style={{ fontSize: 17, opacity: 0.85, marginBottom: 18, maxWidth: 720 }}>
            Independent guidance on ships, itineraries, and planning from people who actually work the port.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <a
              href="#guidance"
              style={{
                display: "inline-block",
                padding: "12px 16px",
                borderRadius: 10,
                background: "#0f172a",
                color: "white",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Start With Guidance
            </a>
            <button
              type="button"
              onClick={() => openBookingPanel()}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid #94a3b8",
                background: "transparent",
                color: "#0f172a",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Book a Cruise
            </button>
          </div>
        </section>

        <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, background: "white" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Our positioning</div>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              We explain first and enable booking second. Every recommendation is built to reduce confusion, not push
              urgency.
            </p>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, background: "white" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Operational status</div>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Live visibility into desk signals, draft reviews, and the sailing pipeline.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 12 }}>
              <div style={{ textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {siteStatus ? siteStatus.draftsInReview : "—"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Insights in review</div>
              </div>
              <div style={{ textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {siteStatus ? siteStatus.openSignals : "—"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Signals monitored</div>
              </div>
              <div style={{ textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {siteStatus ? siteStatus.upcomingSailings : "—"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Upcoming sailings</div>
              </div>
            </div>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, background: "white" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Booking clarity</div>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Prices shown include port fees and taxes. Gratuities and vacation protection remain optional and are
              shown separately before checkout.
            </p>
          </div>
        </section>

        <section style={{ marginTop: 40 }} id="desk">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>From The Cruises From Galveston Desk</h2>
              <p style={{ margin: 0, color: "#475569" }}>Edited by Monica Peña</p>
            </div>
            <a href="/cruises-from-galveston/desk" style={{ color: "#0f172a", fontWeight: 700 }}>
              View the Desk
            </a>
          </div>
          <div style={{ display: "grid", gap: 12, marginTop: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {[
              {
                title: "Port operations outlook",
                summary: "How terminal flow and staffing affect embarkation timing this season.",
              },
              {
                title: "Deployment updates",
                summary: "Ship rotations that change Galveston sailing patterns in 2026–2028.",
              },
              {
                title: "Weather watch",
                summary: "What Gulf weather shifts actually mean for Galveston departures.",
              },
            ].map((card) => (
              <div key={card.title} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, background: "white" }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>{card.title}</div>
                <p style={{ margin: 0, color: "#475569" }}>{card.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 40 }} id="ships">
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Ships Sailing From Galveston</h2>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {[
              { name: "Carnival Breeze", bestFor: "Families and first-time cruisers", note: "Smooth Galveston embarkation flow." },
              { name: "Carnival Dream", bestFor: "Short trips with flexible dining", note: "Reliable weekend sailings." },
              { name: "Disney Magic", bestFor: "Family groups with younger kids", note: "Character programming works well from Galveston." },
              { name: "Mariner of the Seas", bestFor: "Active travelers who want variety", note: "Good balance of entertainment and quiet spaces." },
            ].map((ship) => (
              <div key={ship.name} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, background: "white" }}>
                <div style={{ fontWeight: 800 }}>{ship.name}</div>
                <p style={{ margin: "8px 0 6px", color: "#475569" }}>
                  <strong>Best for:</strong> {ship.bestFor}
                </p>
                <p style={{ margin: 0, color: "#475569" }}>{ship.note}</p>
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <a href={`/cruises-from-galveston/ships/${ship.name.toLowerCase().replace(/\s+/g, "-")}`} style={{ fontWeight: 700 }}>
                    Read Advisor Overview
                  </a>
                  <button
                    type="button"
                    onClick={() => openBookingPanel({ ship: ship.name })}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#0f172a",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    View Sailings
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 40 }} id="ports">
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Where Galveston Cruises Go — And Why</h2>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {[
              { name: "Cozumel", detail: "A consistent stop because it pairs well with 4–7 night itineraries and easy port flow." },
              { name: "Costa Maya", detail: "Popular for shorter sailings with calmer port logistics and beach access." },
              { name: "Roatán", detail: "Favored by travelers who want a strong excursion day and reef access." },
              { name: "Belize", detail: "Great for adventure-focused cruisers who plan for tender timing." },
              { name: "Grand Cayman", detail: "A premium stop when longer itineraries are on the calendar." },
            ].map((port) => (
              <div key={port.name} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, background: "white" }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>{port.name}</div>
                <p style={{ margin: 0, color: "#475569" }}>{port.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 40 }} id="guidance">
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Planning Your Cruise From Galveston</h2>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {[
              { label: "Driving vs Flying", href: "/cruises-from-galveston/how-to-plan" },
              { label: "Transportation options (airport ↔ ship)", href: "https://houstoncruiseshuttle.com" },
              { label: "Short vs long sailings", href: "/cruises-from-galveston/how-to-plan" },
              { label: "First cruise vs repeat cruisers", href: "/cruises-from-galveston/how-to-plan" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 14,
                  background: "white",
                  fontWeight: 700,
                  color: "#0f172a",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 40 }} id="booking-confidence">
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Booking Through Cruises From Galveston</h2>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, background: "white" }}>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: "#475569" }}>
              <li>Real humans, local to Galveston.</li>
              <li>Transparent pricing with taxes and port fees included.</li>
              <li>Optional vacation protection explained clearly.</li>
              <li>Support before, during, and after travel.</li>
            </ul>
            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <a
                href="/booking"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#0f172a",
                  color: "white",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Continue to Booking
              </a>
              <a
                href="mailto:hello@cruisesfromgalveston.net"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #94a3b8",
                  color: "#0f172a",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Ask an Advisor
              </a>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Galveston Cruise Matrix</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <select
              value={filterLine}
              onChange={(event) => setFilterLine(event.target.value)}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5f5" }}
              aria-label="Cruise line filter"
            >
              <option value="all">All Cruise Lines</option>
              {availableLines.map((line) => (
                <option key={line.key} value={line.key}>
                  {line.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSortKey("price")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5f5",
                background: "white",
                fontWeight: 700,
              }}
            >
              Sort by Price
            </button>
            <button
              type="button"
              onClick={() => setSortKey("duration")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5f5",
                background: "white",
                fontWeight: 700,
              }}
            >
              Sort by Duration
            </button>
            <button
              type="button"
              onClick={() => setSortKey("date")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5f5",
                background: "white",
                fontWeight: 700,
              }}
            >
              Sort by Date
            </button>
          </div>
          <div style={{ overflowX: "auto", background: "white", border: "1px solid #e2e8f0", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ textAlign: "left", background: "#f8fafc" }}>
                  <th style={{ padding: 10 }}>Cruise Line</th>
                  <th style={{ padding: 10 }}>Ship</th>
                  <th style={{ padding: 10 }}>Duration</th>
                  <th style={{ padding: 10 }}>Ports</th>
                  <th style={{ padding: 10 }}>Price from</th>
                  <th style={{ padding: 10 }}>Sail Score</th>
                  <th style={{ padding: 10 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {matrixLoading && (
                  <tr>
                    <td colSpan={7} style={{ padding: 14 }}>
                      Loading sailings...
                    </td>
                  </tr>
                )}
                {!matrixLoading && matrixError && (
                  <tr>
                    <td colSpan={7} style={{ padding: 14, color: "#b91c1c" }}>
                      {matrixError}
                    </td>
                  </tr>
                )}
                {!matrixLoading && !matrixError && filteredCruises.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 14 }}>
                      No sailings available yet.
                    </td>
                  </tr>
                )}
                {!matrixLoading &&
                  !matrixError &&
                  filteredCruises.map((cruise) => (
                    <tr key={cruise.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td style={{ padding: 10, fontWeight: 700 }}>{cruise.line}</td>
                      <td style={{ padding: 10 }}>{cruise.ship}</td>
                      <td style={{ padding: 10 }}>{cruise.duration} nights</td>
                      <td style={{ padding: 10 }}>{cruise.ports}</td>
                      <td style={{ padding: 10 }}>{cruise.priceDisplay}</td>
                      <td style={{ padding: 10 }}>{cruise.scoreDisplay}</td>
                      <td style={{ padding: 10 }}>
                        <button
                          type="button"
                          onClick={() => openBookingPanel({ ship: cruise.ship })}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            background: "#0f172a",
                            color: "white",
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Get Quote
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>Matrix is powered by live sailings data.</p>
        </section>
      </div>

      {showBookingPanel && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 50,
          }}
        >
          <div style={{ width: "100%", maxWidth: 520, background: "white", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Book With Confidence</h3>
              <button
                type="button"
                onClick={() => setShowBookingPanel(false)}
                style={{ border: "none", background: "transparent", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              <label style={{ fontWeight: 700 }}>
                Ship
                <select
                  value={bookingForm.ship}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, ship: event.target.value }))}
                  style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5f5" }}
                >
                  <option value="">Select ship</option>
                  {availableShips.map((ship) => (
                    <option key={ship} value={ship}>
                      {ship}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ fontWeight: 700 }}>
                Month / Year
                <select
                  value={bookingForm.month}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, month: event.target.value }))}
                  style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5f5" }}
                >
                  <option value="">Select month</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
                <label style={{ fontWeight: 700 }}>
                  Nights
                  <select
                    value={bookingForm.nights}
                    onChange={(event) => setBookingForm((prev) => ({ ...prev, nights: event.target.value }))}
                    style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5f5" }}
                  >
                    <option value="">Any</option>
                    {[3, 4, 5, 6, 7, 8].map((night) => (
                      <option key={night} value={night}>
                        {night} nights
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ fontWeight: 700 }}>
                  Cabin type
                  <select
                    value={bookingForm.cabin}
                    onChange={(event) => setBookingForm((prev) => ({ ...prev, cabin: event.target.value }))}
                    style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5f5" }}
                  >
                    <option value="">Any</option>
                    <option value="Interior">Interior</option>
                    <option value="Ocean View">Ocean View</option>
                    <option value="Balcony">Balcony</option>
                    <option value="Suite">Suite</option>
                  </select>
                </label>
              </div>
              <label style={{ fontWeight: 700 }}>
                Travelers
                <select
                  value={bookingForm.travelers}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, travelers: event.target.value }))}
                  style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5f5" }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={bookingForm.advisorOnly}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, advisorOnly: event.target.checked }))}
                />
                Show advisor-recommended sailings only
              </label>
            </div>
            <p style={{ marginTop: 14, fontSize: 12, color: "#475569" }}>
              Prices shown include port fees and taxes. Gratuities and vacation protection are optional and shown
              separately before checkout.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <a
                href="/booking"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#0f172a",
                  color: "white",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Continue to Booking
              </a>
              <button
                type="button"
                onClick={() => setShowBookingPanel(false)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #94a3b8",
                  background: "transparent",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


