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

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#eff6ff" }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "48px 24px",
          fontFamily: "system-ui",
          color: "#0f172a",
        }}
      >
        <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#64748b", marginBottom: 8 }}>
          Galveston Cruise Cards
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 10 }}>
          Texas&apos; only Galveston-only cruise experts
        </h1>
        <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 20 }}>
          A client-facing booking experience built for families, groups, and verified inventory.
        </p>

        <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "white" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Our winning angle</div>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Galveston-only inventory (no noise)</li>
              <li>Multi-room booking experience for families and groups</li>
              <li>SeaPay deposit plans (Deposit Now, Cruise Later)</li>
              <li>Featured Top-10 off-island and island roster (curated, approved)</li>
              <li>Group contracts and rate proof inside the workflow</li>
            </ul>
            <p style={{ fontSize: 12, opacity: 0.7, marginTop: 10 }}>
              This is client-facing; contract and rate mechanics remain private.
            </p>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "white" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>The Galveston advantage</div>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              We do not book Miami or Alaska. We specialize in one port, so we know it better than anyone.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 12 }}>
              <div style={{ textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>247</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Galveston sailings tracked</div>
              </div>
              <div style={{ textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>89%</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Texas-based clients</div>
              </div>
              <div style={{ textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>$142</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Average client savings</div>
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "white" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Upcoming deployments</div>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Symphony of the Seas and Liberty of the Seas begin homeport Galveston in April 2027. Icon of the Seas
              begins Galveston sailings in August 2027.
            </p>
          </div>
        </div>

        <a
          href="/booking"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            background: "#0f172a",
            color: "white",
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Start a Booking
        </a>
        <div style={{ marginTop: 16, fontSize: 14, color: "#334155" }}>
          Call or text: <span style={{ fontWeight: 800 }}>(409) 632-2106</span>
        </div>

        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Galveston Cruise Matrix</h2>
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
                        <a
                          href="/booking"
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: 8,
                            background: "#0f172a",
                            color: "white",
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          Get Quote
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>Matrix is powered by live sailings data.</p>
        </section>

        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Galveston Parking Guide</h2>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, background: "white", padding: 14 }}>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>Port of Galveston Parking</h3>
                <p style={{ margin: 0 }}>$15/day</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.7 }}>0.2 miles to terminal</p>
                <div style={{ marginTop: 6, fontSize: 12, color: "#166534", fontWeight: 700 }}>Spaces Available</div>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>Falcon Cruise Parking</h3>
                <p style={{ margin: 0 }}>$12/day</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.7 }}>0.5 miles to terminal</p>
                <div style={{ marginTop: 6, fontSize: 12, color: "#166534", fontWeight: 700 }}>Spaces Available</div>
              </div>
            </div>
            <iframe
              title="Galveston cruise terminal map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11125.71432696339!2d-94.797695!3d29.301348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDE4JzA0LjkiTiA5NMKwNDcnNTEuNyJX!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
              width="100%"
              height="300"
              style={{ border: 0, marginTop: 12, borderRadius: 10 }}
              loading="lazy"
            />
          </div>
        </section>

        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Get help from a Galveston expert</h2>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, background: "white", padding: 14 }}>
            <p style={{ marginTop: 0 }}>
              Call or text <strong>(409) 632-2106</strong> or email{" "}
              <a href="mailto:hello@cruisesfromgalveston.net">hello@cruisesfromgalveston.net</a>.
            </p>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <input
                placeholder="Full name"
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5f5" }}
              />
              <input
                placeholder="Email"
                type="email"
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5f5" }}
              />
              <input
                placeholder="Phone"
                type="tel"
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5f5" }}
              />
            </div>
            <textarea
              placeholder="Tell us your dates, group size, and budget"
              rows={4}
              style={{ width: "100%", marginTop: 10, padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5f5" }}
            />
            <div style={{ marginTop: 10 }}>
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
                Start booking now
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


