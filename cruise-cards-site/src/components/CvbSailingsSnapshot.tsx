"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarEntry = {
  sailingId: string;
  shipName: string;
  departDate: string;
  returnDate: string;
  durationLabel: string;
  priceFrom?: number;
};

function fmtDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtMoney(value?: number) {
  if (value == null) return "Call";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function CvbSailingsSnapshot() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const windowParams = useMemo(() => {
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 6);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setStatus("loading");
      try {
        const res = await fetch(
          `/api/calendar?start=${windowParams.start}&end=${windowParams.end}&adults=2`
        );
        if (!res.ok) throw new Error("Calendar request failed");
        const json = await res.json();
        const rows = (json.entries ?? []) as CalendarEntry[];
        rows.sort((a, b) => (a.departDate || "").localeCompare(b.departDate || ""));
        if (active) {
          setEntries(rows.slice(0, 6));
          setStatus("ready");
        }
      } catch (error) {
        console.error(error);
        if (active) {
          setEntries([]);
          setStatus("error");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [windowParams.start, windowParams.end]);

  return (
    <div className="card">
      <div className="cardBody">
        <h3>Current sailings snapshot</h3>
        <p className="sectionDesc" style={{ marginTop: 6 }}>
          Updated with live departure data from the Galveston sailing calendar.
        </p>

        {status === "loading" && (
          <div className="item" style={{ marginTop: 12, gridTemplateColumns: "1fr" }}>
            <div>Loading current sailings...</div>
          </div>
        )}

        {status === "error" && (
          <div className="item" style={{ marginTop: 12, gridTemplateColumns: "1fr" }}>
            <div>Unable to load sailings right now. Please try again shortly.</div>
          </div>
        )}

        {status === "ready" && entries.length === 0 && (
          <div className="item" style={{ marginTop: 12, gridTemplateColumns: "1fr" }}>
            <div>No upcoming sailings are available in this window.</div>
          </div>
        )}

        {status === "ready" && entries.length > 0 && (
          <div className="list" style={{ marginTop: 12 }}>
            {entries.map((entry) => (
              <div key={entry.sailingId} className="item">
                <div>
                  <strong>{entry.shipName}</strong>
                  <div className="subline">
                    Departs {fmtDate(entry.departDate)} • {entry.durationLabel}
                  </div>
                </div>
                <div className="price mono" style={{ marginLeft: "auto" }}>
                  {fmtMoney(entry.priceFrom)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
