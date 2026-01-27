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

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ sailings: [] });
  }

  const supabase = createAdminClient();

  const { data } = await supabase
    .from("sailings")
    .select("id,sail_date,return_date,ports,itinerary,price_from,base_price,starting_price,min_price,sail_score,score,ship:ships(id,name,cruise_line:cruise_lines(name))")
    .eq("is_active", true)
    .order("sail_date", { ascending: true })
    .limit(200);

  return NextResponse.json({ sailings: (data || []) as SailingRow[] });
}
