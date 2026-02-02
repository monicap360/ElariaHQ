import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      draftsInReview: 0,
      openSignals: 0,
      upcomingSailings: 0,
      hasSupabase: false,
      error: "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
    });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    return NextResponse.json({
      draftsInReview: 0,
      openSignals: 0,
      upcomingSailings: 0,
      hasSupabase: false,
      error: error instanceof Error ? error.message : "Failed to create Supabase client",
    });
  }

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
    // Use inventory_health_check view for accurate count
    const { data: health } = await supabase
      .from("inventory_health_check")
      .select("upcoming_sailings, status, next_sailing")
      .maybeSingle<{ upcoming_sailings: number; status: string; next_sailing: string | null }>();
    status.upcomingSailings = health?.upcoming_sailings || 0;
  } catch {
    // Fallback to direct query if view doesn't exist yet
    try {
      const { count } = await supabase
        .from("sailings")
        .select("*", { count: "exact", head: true })
        .eq("departure_port", "Galveston")
        .gte("depart_date", new Date().toISOString().slice(0, 10))
        .eq("is_active", true);
      status.upcomingSailings = count || 0;
    } catch {
      status.upcomingSailings = 0;
    }
  }

  return NextResponse.json(status);
}
