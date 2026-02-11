"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MobileActionBar from "./MobileActionBar";

type Demand = "low" | "medium" | "high";

export type CalendarEntry = {
  sailingId: string;
  departDate: string;
  returnDate: string;
  cruiseLine: string;
  shipName: string;
  nights: number;
  durationLabel: string;
  priceFrom: number | null;
  demand: Demand;
  reasons: string[];
  flags: string[];
  score: number;
  confidence: number;
  recommended: boolean;
  seaPayEligible: boolean;
};

function parseISO(iso: string) {
  return new Date(iso + "T00:00:00Z");
}

function daysInMonthUTC(year: number, month1to12: number) {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

function startWeekdayUTC(year: number, month1to12: number) {
  return new Date(Date.UTC(year, month1to12 - 1, 1)).getUTCDay();
}

function isoForDay(year: number, month1to12: number, day: number) {
  const d = new Date(Date.UTC(year, month1to12 - 1, day));
  return d.toISOString().slice(0, 10);
}

function fmtDayLabel(iso: string) {
  const d = parseISO(iso);
  return d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

function clsDemand(demand: Demand) {
  switch (demand) {
    case "low":
      return { ring: "ring-success/30", badge: "bg-success/10 text-success" };
    case "high":
      return { ring: "ring-warning/40", badge: "bg-warning/10 text-warning" };
    default:
      return { ring: "ring-teal/25", badge: "bg-teal/10 text-teal" };
  }
}

export default function MonthCalendar({
  year,
  month,
  monthStartISO,
  monthEndExclusiveISO,
  entries,
  traveler,
}: {
  year: number;
  month: number;
  monthStartISO: string;
  monthEndExclusiveISO: string;
  entries: CalendarEntry[];
  traveler: { adults: number; children: number; max?: number; flex?: boolean; line?: string };
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showRecommended, setShowRecommended] = useState(true);
  const [selectedSailing, setSelectedSailing] = useState<CalendarEntry | null>(null);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
      if (entry.departDate < monthStartISO || entry.departDate >= monthEndExclusiveISO) continue;
      const list = map.get(entry.departDate) ?? [];
      list.push(entry);
      map.set(entry.departDate, list);
    }
    for (const [key, list] of map.entries()) {
      list.sort((a, b) => b.score - a.score);
      map.set(key, list);
    }
    return map;
  }, [entries, monthEndExclusiveISO, monthStartISO]);

  const dim = daysInMonthUTC(year, month);
  const startWd = startWeekdayUTC(year, month);
  const cells = useMemo(() => {
    const arr: Array<{ iso: string | null; day: number | null }> = [];
    for (let i = 0; i < startWd; i += 1) arr.push({ iso: null, day: null });
    for (let d = 1; d <= dim; d += 1) arr.push({ iso: isoForDay(year, month, d), day: d });
    while (arr.length % 7 !== 0) arr.push({ iso: null, day: null });
    return arr;
  }, [year, month, dim, startWd]);

  const selectedList = selectedDate ? entriesByDate.get(selectedDate) ?? [] : [];

  const sp = new URLSearchParams();
  sp.set("adults", String(traveler.adults));
  sp.set("children", String(traveler.children));
  if (traveler.max != null) sp.set("max", String(traveler.max));
  if (traveler.flex) sp.set("flex", "1");
  if (traveler.line) sp.set("line", traveler.line);

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate">Highlight strong sail dates</span>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showRecommended}
              onChange={() => setShowRecommended((value) => !value)}
              className="accent-teal"
            />
            Recommended
          </label>
        </div>
        <div className="grid grid-cols-7 px-2 pb-2 text-xs text-slate">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, idx) => {
            if (!cell.iso) return <div key={`empty-${idx}`} className="h-24" />;

            const list = entriesByDate.get(cell.iso) ?? [];
            const top = showRecommended ? list.find((item) => item.recommended) ?? list[0] : list[0];
            const isSelected = selectedDate === cell.iso;

            return (
              <button
                key={cell.iso}
                onClick={() => setSelectedDate(cell.iso)}
              className={[
                  "h-24 rounded-xl border p-2 text-left transition",
                  top?.recommended
                    ? "border-teal bg-teal/5 ring-2 ring-teal/30"
                    : "border-gray-200 hover:border-primary-blue/40 hover:bg-sand/40",
                  isSelected ? "ring-2 ring-primary-blue/30" : "",
                ].join(" ")}
                type="button"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-navy">{cell.day}</span>
                  {top ? (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${clsDemand(top.demand).badge}`}>
                      {top.demand === "high" ? "Popular" : top.demand === "low" ? "Great value" : "Good option"}
                    </span>
                  ) : null}
                </div>

                {top ? (
                  <div className="mt-2">
                    <div className="line-clamp-1 text-xs font-semibold text-navy">{top.shipName}</div>
                    {top.recommended && (
                      <span className="mt-1 inline-flex rounded-full bg-teal/10 px-2 py-0.5 text-[10px] text-teal">
                        Recommended
                      </span>
                    )}
                    {top.seaPayEligible && (
                      <span className="mt-1 inline-block rounded-full bg-primary-blue/10 px-2 py-0.5 text-[10px] text-primary-blue">
                        SeaPay available
                      </span>
                    )}
                    <div className="text-[11px] text-slate">{top.durationLabel}</div>
                    <div className="mt-1 text-[11px] text-navy">
                      {top.priceFrom != null ? `From $${Math.round(top.priceFrom)}` : "Pricing varies"}
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-[11px] text-slate/70">No departures</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-navy">Sailings</h2>
        <p className="mt-1 text-sm text-slate">
          {selectedDate ? fmtDayLabel(selectedDate) : "Select a date to view departures."}
        </p>

        <div className="mt-4 space-y-3">
          {!selectedDate ? (
            <div className="text-sm text-slate">Pick a sail date on the calendar to see details here.</div>
          ) : selectedList.length === 0 ? (
            <div className="text-sm text-slate">No departures on this date.</div>
          ) : (
            selectedList.slice(0, 6).map((entry) => {
              const ring = clsDemand(entry.demand).ring;
              const href = `/cruise/${entry.sailingId}?${sp.toString()}`;

              return (
                <button
                  key={entry.sailingId}
                  onClick={() => setSelectedSailing(entry)}
                  className={`w-full rounded-xl border p-4 text-left ring-1 ${
                    entry.recommended ? "border-teal/40 bg-teal/5" : "border-gray-200"
                  } ${ring}`}
                  type="button"
                >
                  {entry.recommended && <div className="mb-2 text-xs font-medium text-teal">Recommended date</div>}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-navy">{entry.shipName}</div>
                      <div className="text-xs text-slate">
                        {entry.durationLabel} • Departs {entry.departDate}
                      </div>
                      {entry.seaPayEligible && entry.recommended && (
                        <div className="mt-1 text-xs font-medium text-primary-blue">SeaPay eligible</div>
                      )}
                      {entry.seaPayEligible && !entry.recommended && (
                        <div className="mt-1 text-xs text-primary-blue">Deposit option available</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-navy">
                        {entry.priceFrom != null ? `$${Math.round(entry.priceFrom)}` : "—"}
                      </div>
                      <div className="text-[11px] text-slate">from / person</div>
                    </div>
                  </div>

                  {entry.reasons?.length ? (
                    <ul className="mt-3 space-y-1">
                      {entry.reasons.slice(0, 2).map((reason) => (
                        <li key={reason} className="text-xs text-slate">
                          <span className="font-medium text-navy">Reason:</span> {reason}
                        </li>
                      ))}
                      {entry.flags?.includes("high_demand") ? (
                        <li className="text-xs text-warning">Limited availability</li>
                      ) : null}
                    </ul>
                  ) : null}

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={href}
                      className="inline-flex items-center justify-center rounded-lg bg-accent-teal px-4 py-2 text-sm text-white hover:bg-accent-teal/90"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        navigator.clipboard.writeText(window.location.origin + href);
                      }}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-navy hover:bg-sand/50"
                      type="button"
                    >
                      Copy Link
                    </button>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-6 text-[11px] text-slate/80">
          Duration labels follow cruise line standards: Carnival uses <span className="font-medium text-navy">days</span>,
          most other lines use <span className="font-medium text-navy">nights</span>.
        </div>
      </aside>

      <MobileActionBar
        sailing={
          selectedSailing
            ? {
                sailingId: selectedSailing.sailingId,
                shipName: selectedSailing.shipName,
                durationLabel: selectedSailing.durationLabel,
                priceFrom: selectedSailing.priceFrom,
                seaPayEligible: selectedSailing.seaPayEligible,
              }
            : undefined
        }
        queryString={sp.toString()}
      />
    </section>
  );
}
