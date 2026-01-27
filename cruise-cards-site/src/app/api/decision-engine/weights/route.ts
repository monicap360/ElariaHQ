import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_WEIGHTS } from "@/lib/cruiseDecisionEngine/engine";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ weights: DEFAULT_WEIGHTS });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("decision_weights").select("*").limit(1).maybeSingle();
  if (error || !data) {
    return NextResponse.json({ weights: DEFAULT_WEIGHTS });
  }

  return NextResponse.json({
    weights: {
      price: Number(data.price ?? DEFAULT_WEIGHTS.price),
      cabin: Number(data.cabin ?? DEFAULT_WEIGHTS.cabin),
      preference: Number(data.preference ?? DEFAULT_WEIGHTS.preference),
      demand: Number(data.demand ?? DEFAULT_WEIGHTS.demand),
      risk: Number(data.risk ?? DEFAULT_WEIGHTS.risk),
    },
  });
}

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = (await req.json()) as Partial<typeof DEFAULT_WEIGHTS>;
  const supabase = createAdminClient();
  const weights = {
    price: Number(payload.price ?? DEFAULT_WEIGHTS.price),
    cabin: Number(payload.cabin ?? DEFAULT_WEIGHTS.cabin),
    preference: Number(payload.preference ?? DEFAULT_WEIGHTS.preference),
    demand: Number(payload.demand ?? DEFAULT_WEIGHTS.demand),
    risk: Number(payload.risk ?? DEFAULT_WEIGHTS.risk),
  };

  const { error } = await supabase.from("decision_weights").upsert({ id: 1, ...weights });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, weights });
}
