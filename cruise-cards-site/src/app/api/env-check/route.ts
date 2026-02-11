import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function isValidHttpUrl(value: string | undefined) {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  const hasPublicUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasLegacyUrl = Boolean(process.env.SUPABASE_URL);
  const hasValidPublicUrl = isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasValidLegacyUrl = isValidHttpUrl(process.env.SUPABASE_URL);
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: hasPublicUrl,
    SUPABASE_URL: hasLegacyUrl,
    NEXT_PUBLIC_SUPABASE_URL_VALID: hasValidPublicUrl,
    SUPABASE_URL_VALID: hasValidLegacyUrl,
    SUPABASE_URL_EFFECTIVE: hasValidPublicUrl || hasValidLegacyUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  if (!env.SUPABASE_URL_EFFECTIVE || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      env,
      supabase: {
        canConnect: false,
        error: "Missing SUPABASE env vars for server-side access.",
      },
    });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    return NextResponse.json({
      env,
      supabase: {
        canConnect: false,
        error: error instanceof Error ? error.message : "Invalid Supabase configuration.",
      },
    });
  }

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
