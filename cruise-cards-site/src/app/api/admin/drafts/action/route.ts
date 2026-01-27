import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionRequest = {
  id: string;
  action: "approve" | "revision" | "hold" | "reject";
  note?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ActionRequest;

  if (!payload?.id || !payload?.action) {
    return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  switch (payload.action) {
    case "approve":
      updates.status = "approved_for_publish";
      updates.approved_for_publish = true;
      updates.ready_for_content = false;
      break;
    case "revision":
      updates.status = "revision_requested";
      updates.revision_notes = payload.note || "Revision requested";
      updates.ready_for_content = false;
      break;
    case "hold":
      updates.status = "held";
      updates.hold_notes = payload.note || "Placed on hold";
      break;
    case "reject":
      updates.status = "rejected";
      updates.rejection_reason = payload.note || "Rejected";
      updates.ready_for_content = false;
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { error } = await supabase.from("agent_tasks").update(updates).eq("id", payload.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
