import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

export function GET() {
  const hasPublicUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasLegacyUrl = Boolean(process.env.SUPABASE_URL);
  const hasValidPublicUrl = isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasValidLegacyUrl = isValidHttpUrl(process.env.SUPABASE_URL);
  return NextResponse.json({
    ok: true,
    hasUrl: hasValidPublicUrl || hasValidLegacyUrl,
    hasPublicUrl,
    hasLegacyUrl,
    hasValidPublicUrl,
    hasValidLegacyUrl,
    hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    nodeEnv: process.env.NODE_ENV,
  });
}
