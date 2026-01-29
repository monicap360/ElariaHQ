import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type SearchRow = {
  id?: string;
  sailing_id?: string;
  ship_name?: string | null;
  destination?: string | null;
  itinerary_label?: string | null;
  ports_summary?: string | null;
  departure_date?: string | null;
  duration_days?: number | null;
  price_pp?: number | null;
  price_from?: number | null;
};

type FutureSailingRow = {
  sailing_id: string;
  sail_date: string | null;
  return_date: string | null;
  duration: number | null;
  itinerary_code: string | null;
  ship_id: string | null;
  ship_name: string | null;
  cruise_line: string | null;
  home_port: string | null;
};

type SearchParams = {
  destination?: string;
  startDate?: string;
  endDate?: string;
  minDuration?: number;
  maxDuration?: number;
};

function todayUtcDate() {
  return new Date(new Date().toISOString().slice(0, 10));
}

function readFilters(searchParams: URLSearchParams): SearchParams {
  const destination = searchParams.get("destination")?.trim() || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const minDuration = searchParams.get("minDuration");
  const maxDuration = searchParams.get("maxDuration");

  return {
    destination,
    startDate,
    endDate,
    minDuration: minDuration ? Number(minDuration) : undefined,
    maxDuration: maxDuration ? Number(maxDuration) : undefined,
  };
}

export async function GET(request: NextRequest) {
  const server = createServerClient();
  if (!server) {
    return NextResponse.json(
      { sailings: [], error: "Missing Supabase environment variables." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const filters = readFilters(searchParams);
  const defaultStart = todayUtcDate().toISOString().slice(0, 10);
  const startDate = filters.startDate || defaultStart;
  const supabase = server.client;

  const destination = filters.destination?.trim();
  let viewQuery = supabase
    .from("future_sailings_list")
    .select(
      "sailing_id, sail_date, return_date, duration, itinerary_code, ship_id, ship_name, cruise_line, home_port",
    )
    .order("sail_date", { ascending: true });

  viewQuery = viewQuery.gte("sail_date", startDate);
  if (filters.endDate) viewQuery = viewQuery.lte("sail_date", filters.endDate);
  if (typeof filters.minDuration === "number") viewQuery = viewQuery.gte("duration", filters.minDuration);
  if (typeof filters.maxDuration === "number") viewQuery = viewQuery.lte("duration", filters.maxDuration);
  if (destination) {
    viewQuery = viewQuery.or(
      `itinerary_code.ilike.%${destination}%,ship_name.ilike.%${destination}%,cruise_line.ilike.%${destination}%`,
    );
  }

  const viewResult = await viewQuery;
  if (!viewResult.error) {
    const rows = (viewResult.data ?? []) as FutureSailingRow[];
    if (rows.length) {
      const mapped: SearchRow[] = rows.map((row) => ({
        sailing_id: row.sailing_id,
        ship_name: row.ship_name ?? null,
        destination: row.itinerary_code ?? null,
        itinerary_label: row.itinerary_code ?? null,
        departure_date: row.sail_date ?? null,
        duration_days: row.duration ?? null,
        price_from: null,
      }));
      return NextResponse.json({ sailings: mapped, source: "future_sailings_list" });
    }
  }

  const selectColumns =
    "id, sailing_id, ship_name, destination, itinerary_label, ports_summary, departure_date, duration_days, price_pp, price_from";

  let searchQuery = supabase.from("searchable_cruises").select(selectColumns).order("departure_date", {
    ascending: true,
  });

  if (destination) {
    searchQuery = searchQuery.ilike("destination", `%${destination}%`);
  }
  searchQuery = searchQuery.gte("departure_date", startDate);
  if (filters.endDate) searchQuery = searchQuery.lte("departure_date", filters.endDate);
  if (typeof filters.minDuration === "number") searchQuery = searchQuery.gte("duration_days", filters.minDuration);
  if (typeof filters.maxDuration === "number") searchQuery = searchQuery.lte("duration_days", filters.maxDuration);

  const searchResult = await searchQuery;
  if (!searchResult.error) {
    return NextResponse.json({
      sailings: (searchResult.data as SearchRow[]) ?? [],
      source: "searchable_cruises",
    });
  }

  return NextResponse.json(
    {
      sailings: [],
      error: viewResult.error?.message || searchResult.error?.message || "Unable to load sailings.",
    },
    { status: 500 },
  );
}
