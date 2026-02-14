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

  const { data, error } = await supabase
    .from("sailings")
    .select("id, depart_date, nights, itinerary_label, ports_summary, ship:ships(name)")
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
  };

  const rows = (data ?? []) as BoardSailingRow[];
  const sailingIds = rows.map((row) => row.id);

  let latestPriceBySailingId = new Map<string, number | null>();
  if (sailingIds.length) {
    const { data: pricingData, error: pricingError } = await supabase
      .from("pricing_latest")
      .select("sailing_id,min_per_person")
      .in("sailing_id", sailingIds);

    if (pricingError) {
      console.error("board-sailings pricing_latest", pricingError);
    } else {
      latestPriceBySailingId = new Map(
        (pricingData ?? []).map((row) => [row.sailing_id as string, (row.min_per_person as number | null) ?? null]),
      );
    }
  }

  const sailings = rows.map((row) => {
    return {
      id: row.id,
      depart_date: row.depart_date,
      nights: row.nights,
      itinerary_label: row.itinerary_label,
      ports_summary: row.ports_summary,
      ship: row.ship?.name ?? null,
      min_price: latestPriceBySailingId.get(row.id) ?? null,
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
