import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      env,
      supabase: {
        canConnect: false,
        error: "Missing SUPABASE env vars for server-side access.",
      },
    });
  }

  const supabase = createAdminClient();
  const supabaseStatus: {
    canConnect: boolean;
    sailingsCount?: number;
    searchableCruisesCount?: number;
    error?: string;
  } = { canConnect: false };

  try {
    const { count: sailingsCount } = await supabase
      .from("sailings")
      .select("*", { count: "exact", head: true });
    supabaseStatus.sailingsCount = sailingsCount ?? 0;
    supabaseStatus.canConnect = true;
  } catch (error) {
    supabaseStatus.error = error instanceof Error ? error.message : "Unknown error";
  }

  try {
    const { count: searchableCruisesCount } = await supabase
      .from("searchable_cruises")
      .select("*", { count: "exact", head: true });
    supabaseStatus.searchableCruisesCount = searchableCruisesCount ?? 0;
  } catch {
    // If view doesn't exist or no permissions, keep silent; still useful to see sailingsCount.
  }

  return NextResponse.json({
    env,
    supabase: supabaseStatus,
  });
}
