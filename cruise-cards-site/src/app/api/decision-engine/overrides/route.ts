import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ overrides: [] });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("decision_overrides")
    .select("sailing_id,disabled,force_review,note")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return NextResponse.json({ overrides: [] });
  }

  return NextResponse.json({ overrides: data });
}

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = (await req.json()) as {
    sailing_id: string;
    disabled?: boolean;
    force_review?: boolean;
    note?: string | null;
  };

  if (!payload.sailing_id) {
    return NextResponse.json({ ok: false, error: "Missing sailing_id" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("decision_overrides").upsert({
    sailing_id: payload.sailing_id,
    disabled: Boolean(payload.disabled),
    force_review: Boolean(payload.force_review),
    note: payload.note ?? null,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
