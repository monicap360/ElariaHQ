import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const server = createServerClient();
  if (!server) {
    return NextResponse.json(
      { sailings: [], error: "Missing Supabase environment variables." },
      { status: 500 },
    );
  }
  const supabase = server.client;

  type BoardSailingRow = {
    id: string;
    depart_date: string | null;
    nights: number | null;
    itinerary_label: string | null;
    ports_summary: string | null;
    ship: { name: string | null } | null;
    pricing: { min_per_person: number | null; as_of: string | null }[] | null;
  };

  const primary = await supabase
    .from("sailings")
    .select(
      "id, depart_date, nights, itinerary_label, ports_summary, ship:ships(name), pricing:pricing_snapshots(min_per_person, as_of)"
    )
    .eq("departure_port", "Galveston")
    .eq("is_active", true)
    .order("depart_date", { ascending: true });

  let rows = (primary.data ?? []) as BoardSailingRow[];

  // Fallback: some schemas use sail_date/duration (older column names).
  if (primary.error) {
    const msg = (primary.error as { message?: string }).message || "";
    const looksLikeMissingColumns =
      msg.toLowerCase().includes("depart_date") || msg.toLowerCase().includes("nights");

    if (!looksLikeMissingColumns) {
      console.error("board-sailings", primary.error);
      return NextResponse.json({ sailings: [] });
    }

    const legacy = await supabase
      .from("sailings")
      .select(
        "id, sail_date, duration, itinerary_label, ports_summary, ship:ships(name), pricing:pricing_snapshots(min_per_person, as_of)"
      )
      .eq("departure_port", "Galveston")
      .eq("is_active", true)
      .order("sail_date", { ascending: true });

    if (legacy.error) {
      console.error("board-sailings legacy", legacy.error);
      return NextResponse.json({ sailings: [] });
    }

    type LegacyRow = {
      id: string;
      sail_date: string | null;
      duration: number | null;
      itinerary_label: string | null;
      ports_summary: string | null;
      ship: { name: string | null } | null;
      pricing: { min_per_person: number | null; as_of: string | null }[] | null;
    };

    rows = ((legacy.data ?? []) as LegacyRow[]).map((row) => ({
      id: row.id,
      depart_date: row.sail_date,
      nights: row.duration,
      itinerary_label: row.itinerary_label,
      ports_summary: row.ports_summary,
      ship: row.ship,
      pricing: row.pricing,
    }));
  }
  const sailings = rows.map((row) => {
    const pricing = Array.isArray(row.pricing) ? row.pricing : [];
    const latest = pricing
      .slice()
      .sort((a, b) => (a.as_of || "").localeCompare(b.as_of || ""))
      .pop();
    return {
      id: row.id,
      depart_date: row.depart_date,
      nights: row.nights,
      itinerary_label: row.itinerary_label,
      ports_summary: row.ports_summary,
      ship: row.ship?.name ?? null,
      min_price: latest?.min_per_person ?? null,
    };
  });

  return NextResponse.json(
    { sailings },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    },
  );
}
