import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Inventory Health Check Endpoint
 * Returns the status of future sailings inventory
 * Use this for monitoring, alerts, or dashboard displays
 */
export async function GET() {
  const server = createServerClient();
  if (!server) {
    return NextResponse.json(
      {
        error: "Missing Supabase configuration",
        healthy: false,
      },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await server.client
      .from("inventory_health_check")
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          healthy: false,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "No health check data available",
          healthy: false,
        },
        { status: 500 }
      );
    }

    const isHealthy = data.status === "✅ OK";
    const statusCode = isHealthy ? 200 : 503; // 503 Service Unavailable if unhealthy

    return NextResponse.json(
      {
        ...data,
        healthy: isHealthy,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        healthy: false,
      },
      { status: 500 }
    );
  }
}
