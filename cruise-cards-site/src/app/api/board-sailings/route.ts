import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ sailings: [] });
  }

  const supabase = createAdminClient();

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

  const sailings =
    data?.map((row) => {
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
    }) ?? [];

  return NextResponse.json({ sailings });
}
