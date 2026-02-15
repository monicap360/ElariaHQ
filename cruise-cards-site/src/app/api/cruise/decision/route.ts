import { NextRequest, NextResponse } from "next/server";
import { runCruiseDecisionEngine } from "@/lib/cruiseDecisionEngine/engine";
import { CruiseDecisionInput } from "@/lib/cruiseDecisionEngine/types";
import { providerFromSupabase } from "@/lib/cruiseDecisionEngine/provider.supabase";

const DEFAULT_RESULT_LIMIT = 8;
const MAX_RESULT_LIMIT = 12;

function resolveResultLimit() {
  const raw = Number(process.env.DECISION_ENGINE_RESULT_LIMIT || "");
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_RESULT_LIMIT;
  return Math.min(Math.floor(raw), MAX_RESULT_LIMIT);
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

export async function POST(req: NextRequest) {
  try {
    const input = (await req.json()) as CruiseDecisionInput;

    if (input?.departurePort !== "Galveston") {
      return NextResponse.json({ error: "departurePort must be Galveston" }, { status: 400 });
    }
    if (!input?.dateRange?.start || !input?.dateRange?.end) {
      return NextResponse.json({ error: "dateRange.start and dateRange.end are required" }, { status: 400 });
    }
    if (!input?.passengers?.adults || input.passengers.adults < 1) {
      return NextResponse.json({ error: "passengers.adults must be >= 1" }, { status: 400 });
    }

    const provider = providerFromSupabase();
    const response = await runCruiseDecisionEngine({ input, provider, limit: resolveResultLimit() });

    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
