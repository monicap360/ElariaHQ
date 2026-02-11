import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const hasPublicUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasLegacyUrl = Boolean(process.env.SUPABASE_URL);
  return NextResponse.json({
    ok: true,
    hasUrl: hasPublicUrl || hasLegacyUrl,
    hasPublicUrl,
    hasLegacyUrl,
    hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    nodeEnv: process.env.NODE_ENV,
  });
}
