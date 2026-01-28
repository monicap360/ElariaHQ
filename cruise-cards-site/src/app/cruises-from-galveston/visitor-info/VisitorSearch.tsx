"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type SearchRow = {
  id?: string;
  sailing_id?: string;
  ship_name?: string | null;
  destination?: string | null;
  itinerary_label?: string | null;
  ports_summary?: string | null;
  departure_date?: string | null;
  duration_days?: number | null;
  price_pp?: number | null;
  price_from?: number | null;
};

type Filters = {
  destination?: string;
  startDate?: string;
  endDate?: string;
  minDuration?: number;
  maxDuration?: number;
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

function fmtMoney(value?: number | null) {
  if (value == null) return "—";
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    value,
  );
}

export default function VisitorSearch() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [status, setStatus] = useState<string>("Ready");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    destination: "",
    startDate: "",
    endDate: "",
  });

  async function runSearch(nextFilters: Filters, label: string) {
    if (!supabase) {
      setRows([]);
      setStatus("Missing Supabase env");
      return;
    }

    setLoading(true);
    setStatus(label);

    try {
      let query = supabase.from("searchable_cruises").select("*").order("departure_date", { ascending: true });

      if (nextFilters.destination?.trim()) {
        query = query.ilike("destination", `%${nextFilters.destination.trim()}%`);
      }
      if (nextFilters.startDate) query = query.gte("departure_date", nextFilters.startDate);
      if (nextFilters.endDate) query = query.lte("departure_date", nextFilters.endDate);
      if (typeof nextFilters.minDuration === "number") query = query.gte("duration_days", nextFilters.minDuration);
      if (typeof nextFilters.maxDuration === "number") query = query.lte("duration_days", nextFilters.maxDuration);

      const { data, error } = await query;
      if (error) throw error;

      setRows((data as SearchRow[]) ?? []);
      setStatus("Updated");
      setErrorMessage(null);
    } catch (err) {
      console.error(err);
      setRows([]);
      setStatus("Error");
      setErrorMessage("Unable to load sailings. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const today = new Date();
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    const next = {
      ...filters,
      startDate: today.toISOString().slice(0, 10),
      endDate: sixMonths.toISOString().slice(0, 10),
    };
    setFilters(next);
    runSearch(next, "Loading…");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [supabase]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(filters, "Searching…");
  }

  function onReset() {
    const cleared = { destination: "", startDate: "", endDate: "", minDuration: undefined, maxDuration: undefined };
    setFilters(cleared);
    runSearch(cleared, "Loading…");
  }

  const count = rows.length;

  return (
    <div className={`searchShell ${loading ? "loading" : ""}`}>
      <div className="searchTop">
        <div>
          <h3>Explore Sailings</h3>
          <p className="note">
            Search is intentionally understated—this is a visitor-style directory. Results are sourced from your
            canonical Supabase view: <strong>public.searchable_cruises</strong>.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="pill" title="Search source">
            <span aria-hidden="true">⟡</span>
            <span>Canonical view</span>
          </div>
        </div>
      </div>

      <form className="filters" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="qDestination">Destination / Label</label>
          <input
            id="qDestination"
            name="destination"
            placeholder="e.g., Bahamas, Cozumel, Western Caribbean"
            autoComplete="off"
            value={filters.destination ?? ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, destination: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="qStart">From</label>
          <input
            id="qStart"
            name="startDate"
            type="date"
            value={filters.startDate ?? ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="qEnd">To</label>
          <input
            id="qEnd"
            name="endDate"
            type="date"
            value={filters.endDate ?? ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="qMinDays">Min Days</label>
          <select
            id="qMinDays"
            name="minDuration"
            value={filters.minDuration ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minDuration: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          >
            <option value="">Any</option>
            <option value="3">3+</option>
            <option value="5">5+</option>
            <option value="6">6+</option>
            <option value="7">7+</option>
            <option value="8">8+</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="qMaxDays">Max Days</label>
          <select
            id="qMaxDays"
            name="maxDuration"
            value={filters.maxDuration ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxDuration: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          >
            <option value="">Any</option>
            <option value="5">Up to 5</option>
            <option value="6">Up to 6</option>
            <option value="7">Up to 7</option>
            <option value="8">Up to 8</option>
            <option value="10">Up to 10</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button className="mutebtn" type="button" onClick={onReset} disabled={loading}>
            Reset
          </button>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      <div className="results">
        <div className="statusRow">
          <div>
            <strong className="mono">{count}</strong> sailings shown
          </div>
          <div className="mono">{status}</div>
        </div>

        <div className="list" aria-live="polite">
          {status === "Error" ? (
            <div className="item" style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <h5>Unable to load sailings</h5>
                <div className="subline">
                  {errorMessage ??
                    "Verify your Supabase URL + anon key and grant SELECT on public.searchable_cruises."}
                </div>
                <div className="subline" style={{ marginTop: "8px" }}>
                  Try refreshing the page or contact support if the issue persists.
                </div>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="item" style={{ gridTemplateColumns: "1fr", textAlign: "center", padding: "40px 20px" }}>
              <div style={{ maxWidth: "400px", margin: "0 auto" }}>
                <div style={{ fontSize: "42px", marginBottom: "12px" }} aria-hidden="true">
                  ⛵
                </div>
                <h5>No sailings match your criteria</h5>
                <div className="subline" style={{ marginTop: "10px" }}>
                  Try adjusting your filters or{" "}
                  <button
                    type="button"
                    className="mutebtn"
                    style={{ padding: "6px 10px", marginLeft: "6px" }}
                    onClick={onReset}
                  >
                    view all sailings
                  </button>
                  .
                </div>
              </div>
            </div>
          ) : (
            rows.map((row) => {
              const price = row.price_pp ?? row.price_from ?? null;
              const destination = row.destination ?? row.itinerary_label ?? "—";
              const days = row.duration_days ?? "—";
              const priceLine = price != null ? `${fmtMoney(price)} per person` : "Pricing not displayed";
              const fine =
                price != null
                  ? "Double occupancy. Includes port expenses & government fees."
                  : "Details vary by sailing; confirm final totals with your cruise line.";
              const sailingId = row.id ?? row.sailing_id;

              return (
                <div key={sailingId ?? `${row.ship_name}-${row.departure_date}`} className="item">
                  <div>
                    <h5>{row.ship_name ?? "Cruise Sailing"}</h5>
                    <div className="subline">
                      {destination} • <span className="mono">{fmtDate(row.departure_date)}</span>
                    </div>
                    {row.ports_summary ? <div className="subline">{row.ports_summary}</div> : null}
                  </div>
                  <div className="mono">{days} days</div>
                  <div className="mono">{fmtDate(row.departure_date)}</div>
                  <div className="price mono">
                    {priceLine}
                    <span className="fineprint">{fine}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {sailingId ? (
                      <a className="mutebtn" href={`/cruises-from-galveston/sailings/${sailingId}`}>
                        View details
                      </a>
                    ) : (
                      <span className="mutebtn" aria-disabled="true" style={{ opacity: 0.6 }}>
                        View details
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: "12px", color: "rgba(92,107,116,.92)", fontSize: "12.5px", lineHeight: 1.55 }}>
          Pricing, if displayed, reflects posted rates as provided: <strong>per person, double occupancy</strong>,
          including port expenses and government fees. Gratuities and optional add-ons are not included unless stated.
        </div>
      </div>
    </div>
  );
}
