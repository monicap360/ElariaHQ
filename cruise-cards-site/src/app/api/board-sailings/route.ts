import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const server = createServerClient();
  if (!server) {
    return NextResponse.json(
      { sailings: [], error: "Missing Supabase environment variables." },
      { status: 500 },
    );
  }
  const supabase = server.client;

  const { data, error } = await supabase
    .from("sailings")
    .select(
      "id, depart_date, nights, itinerary_label, ports_summary, ship:ships(name), pricing:pricing_snapshots(min_per_person, as_of)"
    )
    .eq("departure_port", "Galveston")
    .eq("is_active", true)
    .order("depart_date", { ascending: true });

  if (error) {
    console.error("board-sailings", error);
    return NextResponse.json({ sailings: [] });
  }

  type BoardSailingRow = {
    id: string;
    depart_date: string | null;
    nights: number | null;
    itinerary_label: string | null;
    ports_summary: string | null;
    ship: { name: string | null } | null;
    pricing: { min_per_person: number | null; as_of: string | null }[] | null;
  };

  const rows = (data ?? []) as BoardSailingRow[];
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

  return NextResponse.json({ sailings });
}
