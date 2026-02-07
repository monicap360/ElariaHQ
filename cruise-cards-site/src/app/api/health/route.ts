import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true });
}
export async function GET() {
  return Response.json({
    ok: true,
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    nodeEnv: process.env.NODE_ENV,
  });
}
