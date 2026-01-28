"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type SailingRow = {
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

type PriceRow = {
  sailing_id?: string;
  cabin_type?: string | null;
  price?: number | null;
  currency?: string | null;
};

type Props = {
  sailingId: string;
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

function fmtMoney(value?: number | null, currency = "USD") {
  if (value == null) return "—";
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SailingDetailsClient({ sailingId }: Props) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [sailing, setSailing] = useState<SailingRow | null>(null);
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [status, setStatus] = useState("Loading…");

  useEffect(() => {
    if (!supabase) {
      setStatus("Missing Supabase env");
      return;
    }

    let cancelled = false;

    async function load() {
      setStatus("Loading…");
      try {
        const { data: sailingData, error: sailingError } = await supabase
          .from("searchable_cruises")
          .select("*")
          .eq("id", sailingId)
          .maybeSingle();

        if (sailingError) throw sailingError;
        if (!cancelled) setSailing((sailingData as SailingRow) ?? null);

        const { data: priceData, error: priceError } = await supabase
          .from("public_sailing_prices")
          .select("sailing_id,cabin_type,price,currency")
          .eq("sailing_id", sailingId);

        if (priceError) {
          console.warn(priceError);
          if (!cancelled) setPrices([]);
        } else if (!cancelled) {
          setPrices((priceData as PriceRow[]) ?? []);
        }

        if (!cancelled) setStatus("Updated");
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setSailing(null);
          setPrices([]);
          setStatus("Error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, sailingId]);

  if (status === "Error") {
    return (
      <div className="item" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <strong>Unable to load this sailing.</strong>
          <div className="subline">Check your Supabase connection and permissions.</div>
        </div>
      </div>
    );
  }

  if (!sailing) {
    return (
      <div className="item" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <strong>{status === "Missing Supabase env" ? "Missing Supabase configuration." : "Loading…"}</strong>
          <div className="subline">This section will populate once data is available.</div>
        </div>
      </div>
    );
  }

  const destination = sailing.destination ?? sailing.itinerary_label ?? "—";
  const pricePP = sailing.price_pp ?? sailing.price_from ?? null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="card" style={{ padding: 16 }}>
        <div className="kicker" style={{ color: "rgba(21,47,58,.72)" }}>
          {sailing.ship_name ?? "Cruise Sailing"}
        </div>
        <h3 className="sectionTitle" style={{ marginTop: 6 }}>
          {destination}
        </h3>
        {sailing.ports_summary ? <p className="sectionDesc">{sailing.ports_summary}</p> : null}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 14 }}>
          <div>
            <div className="kicker" style={{ color: "rgba(21,47,58,.72)" }}>
              Departure
            </div>
            <div className="mono">{fmtDate(sailing.departure_date)}</div>
          </div>
          <div>
            <div className="kicker" style={{ color: "rgba(21,47,58,.72)" }}>
              Duration
            </div>
            <div className="mono">{sailing.duration_days ?? "—"} days</div>
          </div>
          <div>
            <div className="kicker" style={{ color: "rgba(21,47,58,.72)" }}>
              Posted Price
            </div>
            <div className="mono">{fmtMoney(pricePP)}</div>
          </div>
          <div>
            <div className="kicker" style={{ color: "rgba(21,47,58,.72)" }}>
              Basis
            </div>
            <div className="mono">Per person (double occupancy)</div>
          </div>
        </div>
      </div>

      <div id="pricing" className="card" style={{ padding: 16 }}>
        <h3 className="sectionTitle" style={{ marginTop: 0 }}>
          Pricing (Cabin Types)
        </h3>
        <p className="sectionDesc" style={{ marginTop: 6 }}>
          Rates shown include port expenses and government fees. Gratuities are not included unless stated.
        </p>

        {prices.length === 0 ? (
          <div className="item" style={{ marginTop: 10, gridTemplateColumns: "1fr" }}>
            <div>
              <strong>Cabin-level pricing is not available to display.</strong>
              <div className="subline">
                If you want it visible publicly, grant SELECT on <span className="mono">public.public_sailing_prices</span>{" "}
                (or expose a read-only view).
              </div>
            </div>
          </div>
        ) : (
          <div className="list" style={{ marginTop: 10 }}>
            {prices.map((p) => (
              <div key={`${p.cabin_type}-${p.price}`} className="item">
                <div>
                  <strong style={{ textTransform: "capitalize" }}>{p.cabin_type ?? "Cabin"}</strong>
                  <div className="subline">Posted rate (per person)</div>
                </div>
                <div className="price mono" style={{ marginLeft: "auto" }}>
                  {fmtMoney(p.price, p.currency ?? "USD")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
