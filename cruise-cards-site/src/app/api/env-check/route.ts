import { NextResponse } from "next/server";

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

  return NextResponse.json({
    env,
    supabase: {
      configured: env.SUPABASE_URL_EFFECTIVE && env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
}
