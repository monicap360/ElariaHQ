import { NextRequest, NextResponse } from "next/server";
import { runCruiseDecisionEngine } from "@/lib/cruiseDecisionEngine/engine";
import { CruiseDecisionInput } from "@/lib/cruiseDecisionEngine/types";
import { providerFromSupabase } from "@/lib/cruiseDecisionEngine/provider.supabase";

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
    const response = await runCruiseDecisionEngine({ input, provider, limit: 12 });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unknown error" }, { status: 500 });
  }
}
