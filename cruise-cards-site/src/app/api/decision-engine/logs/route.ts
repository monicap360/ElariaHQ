import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ logs: [] });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("decision_logs")
    .select("id,input_hash,top_sailing_id,score_spread,confidence,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return NextResponse.json({ logs: [] });
  }

  return NextResponse.json({ logs: data });
}
