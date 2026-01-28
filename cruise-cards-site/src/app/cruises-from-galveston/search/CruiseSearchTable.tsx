"use client";

import { useMemo, useState } from "react";
import { formatDurationLabel } from "@/lib/formatDuration";

type Sailing = {
  ship: string | null;
  line?: string | null;
  departure_date: string | null;
  nights: number | null;
  itinerary: string | null;
  starting_price: number | string | null;
};

type Props = {
  sailings: Sailing[];
};

function formatDate(value: string | null) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatPrice(value: Sailing["starting_price"]) {
  if (value === null || value === undefined || value === "") return "Call for pricing";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return "Call for pricing";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numeric);
}

function monthKey(value: string | null) {
  if (!value) return "unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(value: string | null) {
  if (!value) return "Unknown month";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown month";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const LONG_SAIL_LINES = ["carnival", "royal-caribbean", "royal-caribbean-international"];
const STANDARD_NIGHTS = [4, 5, 6, 7];
const EXTENDED_NIGHTS = [4, 5, 6, 7, 8, 10, 14];

function normalizeLineKey(value: string | null | undefined) {
  if (!value) return "";
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function allowedNightsForLine(lineName?: string | null) {
  if (!lineName) return EXTENDED_NIGHTS;
  const key = normalizeLineKey(lineName);
  if (LONG_SAIL_LINES.includes(key)) return EXTENDED_NIGHTS;
  return STANDARD_NIGHTS;
}

function isAllowedDuration(lineName: string | null | undefined, nights: number | null) {
  if (!nights) return false;
  return allowedNightsForLine(lineName).includes(nights);
}

export default function CruiseSearchTable({ sailings }: Props) {
  const [shipFilter, setShipFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [nightsFilter, setNightsFilter] = useState("all");

  const shipOptions = useMemo(() => {
    const unique = new Map<string, string>();
    sailings.forEach((sailing) => {
      const ship = sailing.ship?.trim();
      if (ship) unique.set(ship.toLowerCase(), ship);
    });
    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  }, [sailings]);

  const monthOptions = useMemo(() => {
    const unique = new Map<string, string>();
    sailings.forEach((sailing) => {
      const key = monthKey(sailing.departure_date);
      const label = monthLabel(sailing.departure_date);
      if (key !== "unknown") unique.set(key, label);
    });
    return Array.from(unique.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [sailings]);

  const nightsOptions = useMemo(() => {
    const selectedLine =
      shipFilter === "all"
        ? null
        : sailings.find((sailing) => sailing.ship?.toLowerCase() === shipFilter)?.line ?? null;
    const allowed = new Set(allowedNightsForLine(selectedLine));
    const unique = new Set<number>();
    sailings.forEach((sailing) => {
      if (typeof sailing.nights === "number" && allowed.has(sailing.nights)) unique.add(sailing.nights);
    });
    return Array.from(unique.values()).sort((a, b) => a - b);
  }, [sailings, shipFilter]);

  const filtered = useMemo(() => {
    return sailings.filter((sailing) => {
      if (shipFilter !== "all" && sailing.ship?.toLowerCase() !== shipFilter) return false;
      if (monthFilter !== "all" && monthKey(sailing.departure_date) !== monthFilter) return false;
      if (nightsFilter !== "all" && String(sailing.nights) !== nightsFilter) return false;
      if (!isAllowedDuration(sailing.line, sailing.nights)) return false;
      return true;
    });
  }, [sailings, shipFilter, monthFilter, nightsFilter]);

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-wrap gap-3 mb-6">
        <label className="text-sm text-slate-600">
          Ship
          <select
            className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm"
            value={shipFilter}
            onChange={(event) => setShipFilter(event.target.value)}
          >
            <option value="all">All ships</option>
            {shipOptions.map((ship) => (
              <option key={ship} value={ship.toLowerCase()}>
                {ship}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-600">
          Month
          <select
            className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
          >
            <option value="all">All months</option>
            {monthOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-600">
          Length
          <select
            className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm"
            value={nightsFilter}
            onChange={(event) => setNightsFilter(event.target.value)}
          >
            <option value="all">All lengths</option>
            {nightsOptions.map((nights) => (
              <option key={nights} value={String(nights)}>
                {nights}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-3 pr-4">Ship</th>
            <th className="py-3 pr-4">Departure</th>
            <th className="py-3 pr-4">Nights</th>
            <th className="py-3 pr-4">Itinerary</th>
            <th className="py-3 pr-4">Starting Price</th>
            <th className="py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((sailing) => {
            const key = `${sailing.ship || "ship"}-${sailing.departure_date || "date"}`;
            const bookingKey = `${sailing.ship || "ship"}-${sailing.departure_date || "date"}`;
            return (
              <tr key={key} className="border-b">
                <td className="py-3 pr-4 font-medium">{sailing.ship || "TBD"}</td>
                <td className="py-3 pr-4">{formatDate(sailing.departure_date)}</td>
                <td className="py-3 pr-4">{formatDurationLabel(sailing.line, sailing.nights)}</td>
                <td className="py-3 pr-4">{sailing.itinerary || "TBA"}</td>
                <td className="py-3 pr-4">{formatPrice(sailing.starting_price)}</td>
                <td className="py-3">
                  <a
                    href={`/booking?sailing=${encodeURIComponent(bookingKey)}`}
                    className="inline-block rounded bg-primary-blue px-4 py-2 text-sm text-white hover:bg-primary-blue/90"
                  >
                    View / Book
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {!filtered.length && (
        <p className="mt-6 text-gray-500">No upcoming sailings are available at this time.</p>
      )}
    </div>
  );
}
