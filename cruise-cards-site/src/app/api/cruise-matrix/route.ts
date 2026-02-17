import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type SailingRow = {
  id: string;
  sail_date: string;
  return_date: string;
  ports?: string[] | string | null;
  itinerary?: string | null;
  price_from?: number | string | null;
  base_price?: number | string | null;
  starting_price?: number | string | null;
  min_price?: number | string | null;
  sail_score?: number | string | null;
  score?: number | string | null;
  ship: {
    id: string;
    name: string;
    cruise_line: {
      name: string;
    } | null;
  } | null;
};

type RawSailingRow = {
  id: string;
  depart_date: string;
  return_date: string;
  ports_summary?: string | null;
  itinerary_label?: string | null;
  ports?: string[] | string | null;
  itinerary?: string | null;
  price_from?: number | string | null;
  base_price?: number | string | null;
  starting_price?: number | string | null;
  min_price?: number | string | null;
  sail_score?: number | string | null;
  score?: number | string | null;
  departure_port?: string | null;
  ship:
    | {
        id: string;
        name: string;
        cruise_line: { name: string } | { name: string }[] | null;
      }
    | {
        id: string;
        name: string;
        cruise_line: { name: string } | { name: string }[] | null;
      }[]
    | null;
};

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ sailings: [] });
  }

  const supabase = createAdminClient();
  const todayIso = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("sailings")
    .select(
      "id,depart_date,return_date,nights,itinerary_label,ports_summary,ports,itinerary,departure_port,price_from,base_price,starting_price,min_price,sail_score,score,ship:ships(id,name,cruise_line:cruise_lines(name))",
    )
    .eq("is_active", true)
    .gte("depart_date", todayIso)
    .order("depart_date", { ascending: true })
    .limit(500);

  const sailings = (data as RawSailingRow[] | null | undefined)?.map((row) => {
    const shipRow = Array.isArray(row.ship) ? row.ship[0] : row.ship;
    const cruiseLineRow = Array.isArray(shipRow?.cruise_line)
      ? shipRow?.cruise_line[0]
      : shipRow?.cruise_line;
    const itinerary =
      (row.itinerary_label && row.itinerary_label.trim().length ? row.itinerary_label : null) ||
      (row.ports_summary && row.ports_summary.trim().length ? row.ports_summary : null) ||
      row.itinerary ||
      null;
    return {
      ...row,
      sail_date: row.depart_date,
      itinerary,
      ship: shipRow
        ? {
            id: shipRow.id,
            name: shipRow.name,
            cruise_line: cruiseLineRow ? { name: cruiseLineRow.name } : null,
          }
        : null,
    } satisfies SailingRow;
  }) ?? [];

  if (error) {
    console.error("cruise-matrix", error);
  }

  // Only show Galveston sailings; be flexible about port naming.
  const filtered = sailings.filter((row) => {
    const port = String((row as { departure_port?: string | null }).departure_port || "");
    return port.toLowerCase().includes("galveston") || port.trim().length === 0;
  });

  return NextResponse.json({ sailings: filtered });
}
