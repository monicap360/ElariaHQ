import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TextAlertPayload = {
  phone?: string;
  sailingId?: string;
  sailingDate?: string;
  shipName?: string;
  language?: "en" | "es";
  consent?: boolean;
  notes?: string;
};

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function isValidPhone(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function isValidIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
  let payload: TextAlertPayload;
  try {
    payload = (await request.json()) as TextAlertPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const phone = normalizePhone(payload.phone || "");
  const language = payload.language === "es" ? "es" : "en";
  const sailingDate = (payload.sailingDate || "").trim();
  const shipName = (payload.shipName || "").trim();
  const sailingId = (payload.sailingId || "").trim();
  const notes = (payload.notes || "").trim();

  if (!isValidPhone(phone)) {
    return NextResponse.json({ ok: false, error: "Valid phone is required." }, { status: 400 });
  }

  if (!payload.consent) {
    return NextResponse.json({ ok: false, error: "Text alert consent is required." }, { status: 400 });
  }

  if (sailingDate && !isValidIsoDate(sailingDate)) {
    return NextResponse.json({ ok: false, error: "sailingDate must be YYYY-MM-DD." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 500 });
  }

  const intakeBody = [
    "Embarkation text alert request",
    `language: ${language}`,
    `phone: ${phone}`,
    sailingId ? `sailingId: ${sailingId}` : null,
    shipName ? `shipName: ${shipName}` : null,
    sailingDate ? `sailingDate: ${sailingDate}` : null,
    notes ? `notes: ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { error } = await supabase.from("agent_inbox").insert({
    channel: "embarkation_text_alert",
    from_contact: phone,
    body: intakeBody,
    agent_name: null,
    task_type: "embarkation_text_alert",
    status: "received",
  });

  if (error) {
    console.error("embarkation-text-alert intake error", error);
    return NextResponse.json({ ok: false, error: "Unable to save request." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message:
      language === "es"
        ? "Solicitud recibida. Te enviaremos actualizaciones para el dia de embarque."
        : "Request received. We will send embarkation-day updates.",
  });
}
