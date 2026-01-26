import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();

  const status = {
    draftsInReview: 0,
    openSignals: 0,
    upcomingSailings: 0,
  };

  try {
    const { count } = await supabase
      .from("content_drafts")
      .select("*", { count: "exact", head: true })
      .eq("status", "drafted")
      .eq("site_target", "cruisesfromgalveston");
    status.draftsInReview = count || 0;
  } catch {
    status.draftsInReview = 0;
  }

  try {
    const { count } = await supabase
      .from("news_signals")
      .select("*", { count: "exact", head: true })
      .eq("processed", false);
    status.openSignals = count || 0;
  } catch {
    status.openSignals = 0;
  }

  try {
    const { count } = await supabase
      .from("upcoming_sailings")
      .select("*", { count: "exact", head: true });
    status.upcomingSailings = count || 0;
  } catch {
    status.upcomingSailings = 0;
  }

  return NextResponse.json(status);
}
