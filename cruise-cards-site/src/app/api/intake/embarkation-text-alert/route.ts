import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TextAlertPayload = {
  phone?: string;
  sailingDate?: string;
  shipName?: string;
  language?: "en" | "es";
};

function clean(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TextAlertPayload;

    const phone = clean(payload.phone);
    const sailingDate = clean(payload.sailingDate);
    const shipName = clean(payload.shipName);
    const language = payload.language === "es" ? "es" : "en";

    if (!phone) {
      return NextResponse.json({ ok: false, error: "Phone is required." }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 500 });
    }

    const supabase = createAdminClient();
    const bodyLines = [
      "[Embarkation Text Alert Request]",
      `Phone: ${phone}`,
      `Language: ${language}`,
      `Sailing Date: ${sailingDate || "n/a"}`,
      `Ship: ${shipName || "n/a"}`,
      "Requested Updates: weather alerts, traffic congestion alerts, parking capacity indicator, embarkation day text updates",
    ];

    const { error } = await supabase.from("agent_inbox").insert({
      channel: "embarkation_text_alert",
      from_contact: phone,
      body: bodyLines.join("\n"),
      agent_name: "CruisePlanningDesk",
      task_type: "embarkation_text_alert_signup",
    });

    if (error) {
      console.error("embarkation-text-alert insert error", error);
      return NextResponse.json({ ok: false, error: "Unable to save request." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
