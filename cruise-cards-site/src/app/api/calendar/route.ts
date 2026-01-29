import { NextRequest, NextResponse } from "next/server";
import { providerFromSupabase } from "@/lib/cruiseDecisionEngine/provider.supabase";
import type { CruiseDecisionInput } from "@/lib/cruiseDecisionEngine/types";
import { buildCalendarEntries } from "@/lib/calendarEntries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start") || new Date().toISOString().slice(0, 10);
  const end =
    searchParams.get("end") ||
    new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().slice(0, 10);
  const adults = Number(searchParams.get("adults") || 2);
  const children = Number(searchParams.get("children") || 0);
  const max = searchParams.get("max");
  const flex = searchParams.get("flex");
  const seapay = searchParams.get("seapay");
  const line = searchParams.get("line");

  const input: CruiseDecisionInput = {
    departurePort: "Galveston",
    dateRange: { start, end },
    passengers: { adults: Number.isFinite(adults) && adults > 0 ? adults : 2, children: children || undefined },
    budget: max
      ? { maxPerPerson: Number(max), flexible: flex === "1" || flex === "true" }
      : flex
        ? { flexible: flex === "1" || flex === "true" }
        : undefined,
    preferences: line ? { cruiseLine: [line] } : undefined,
    constraints: seapay ? { seaPayEligibleOnly: seapay === "1" || seapay === "true" } : undefined,
  };

  try {
    const provider = providerFromSupabase();
    const entries = await buildCalendarEntries(input, provider);
    return NextResponse.json({ entries });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load sailings.";
    return NextResponse.json({ entries: [], error: message }, { status: 500 });
  }
}
