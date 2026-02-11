import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type PlanningRequestPayload = {
  name?: string;
  email?: string;
  phone?: string;
  language?: "en" | "es";
  sailingMonth?: string;
  terminal?: string;
  parkingOption?: string;
  transportOption?: string;
  wantsSeaPay?: boolean;
  notes?: string;
};

function clean(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PlanningRequestPayload;

    const name = clean(payload.name);
    const email = clean(payload.email);
    const phone = clean(payload.phone);
    const language = payload.language === "es" ? "es" : "en";
    const sailingMonth = clean(payload.sailingMonth);
    const terminal = clean(payload.terminal);
    const parkingOption = clean(payload.parkingOption);
    const transportOption = clean(payload.transportOption);
    const notes = clean(payload.notes);
    const wantsSeaPay = Boolean(payload.wantsSeaPay);

    if (!name) {
      return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
    }
    if (!email && !phone) {
      return NextResponse.json(
        { ok: false, error: "Email or phone is required." },
        { status: 400 },
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 500 });
    }

    const supabase = createAdminClient();
    const fromContact = [name, email, phone].filter(Boolean).join(" | ");
    const bodyLines = [
      "[Planning Toolkit Request]",
      `Language: ${language}`,
      `Name: ${name}`,
      `Email: ${email || "n/a"}`,
      `Phone: ${phone || "n/a"}`,
      `Sailing Month: ${sailingMonth || "n/a"}`,
      `Terminal: ${terminal || "n/a"}`,
      `Parking: ${parkingOption || "n/a"}`,
      `Transport: ${transportOption || "n/a"}`,
      `SeaPay Interest: ${wantsSeaPay ? "yes" : "no"}`,
      `Notes: ${notes || "n/a"}`,
    ];

    const { error } = await supabase.from("agent_inbox").insert({
      channel: "planning_tool",
      from_contact: fromContact,
      body: bodyLines.join("\n"),
      agent_name: "CruisePlanningDesk",
      task_type: "parking_transport_request",
    });

    if (error) {
      console.error("planning-request insert error", error);
      return NextResponse.json({ ok: false, error: "Unable to save request." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
