"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMonthSwipe } from "./useMonthSwipe";

const NOW = new Date();
const CURRENT_YEAR = NOW.getUTCFullYear();
const CURRENT_MONTH = NOW.getUTCMonth() + 1;

function clampMonth(y: number, m: number) {
  if (m < 1) return { y: y - 1, m: 12 };
  if (m > 12) return { y: y + 1, m: 1 };
  return { y, m };
}

export default function MonthNav({
  year,
  month,
  bestMonth,
}: {
  year: number;
  month: number;
  bestMonth?: { y: number; m: number } | null;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const paramsString = sp.toString();
  const go = useCallback(
    (y: number, m: number) => {
      const p = new URLSearchParams(paramsString);
      p.set("y", String(y));
      p.set("m", String(m));
      router.push(`/cruises-from-galveston/calendar?${p.toString()}`);
    },
    [paramsString, router]
  );

  const prev = clampMonth(year, month - 1);
  const next = clampMonth(year, month + 1);

  useMonthSwipe(
    () => go(prev.y, prev.m),
    () => go(next.y, next.m)
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "select" || tag === "textarea") return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(prev.y, prev.m);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(next.y, next.m);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, prev.y, prev.m, next.y, next.m]);

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => go(prev.y, prev.m)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy hover:bg-sand/50"
          aria-label="Previous month"
          type="button"
        >
          ← Prev
        </button>

        <button
          onClick={() => go(CURRENT_YEAR, CURRENT_MONTH)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy hover:bg-sand/50"
          type="button"
        >
          Today
        </button>

        {bestMonth && (
          <button
            onClick={() => go(bestMonth.y, bestMonth.m)}
            className="rounded-lg border border-teal/40 bg-teal/5 px-3 py-2 text-sm text-teal hover:bg-teal/10"
            aria-label="Jump to best month"
            type="button"
          >
            Best Month
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <select
          aria-label="Select month"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={month}
          onChange={(event) => go(year, Number(event.target.value))}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const value = i + 1;
            const isCurrent = year === CURRENT_YEAR && value === CURRENT_MONTH;
            return (
              <option key={value} value={value}>
                {new Date(Date.UTC(2026, i, 1)).toLocaleString("en-US", {
                  month: "long",
                  timeZone: "UTC",
                })}
                {isCurrent ? " (current)" : ""}
              </option>
            );
          })}
        </select>

        <select
          aria-label="Select year"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={year}
          onChange={(event) => go(Number(event.target.value), month)}
        >
          {[2025, 2026, 2027].map((yy) => (
            <option key={yy} value={yy}>
              {yy}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => go(next.y, next.m)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy hover:bg-sand/50"
        aria-label="Next month"
        type="button"
      >
        Next →
      </button>
    </div>
  );
}
