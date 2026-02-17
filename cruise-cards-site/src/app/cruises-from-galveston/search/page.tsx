import CruiseSearchTable from "./CruiseSearchTable";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cruises from Galveston - Search Sail Dates",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function CruiseSearchPage() {
  const server = createServerClient();
  if (!server) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-semibold">Search Cruises from Galveston</h1>
        <p className="mb-8 text-gray-600">Cruise data is unavailable right now. Please check back shortly.</p>
        <CruiseSearchTable sailings={[]} />
      </main>
    );
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const { data, error } = await server.client
    .from("sailings")
    .select(
      "id,depart_date,return_date,nights,itinerary_label,ports_summary,price_from,base_price,starting_price,min_price,departure_port,ship:ships(name,cruise_line:cruise_lines(name))"
    )
    .eq("is_active", true)
    .gte("depart_date", todayIso)
    .ilike("departure_port", "%Galveston%")
    .order("depart_date", { ascending: true });

  const sailings =
    data?.map((row) => {
      const sailDate = (row as { depart_date?: string | null }).depart_date ?? null;
      const returnDate = row.return_date;
      const nights =
        sailDate && returnDate
          ? Math.max(
              0,
              Math.round((new Date(returnDate).getTime() - new Date(sailDate).getTime()) / (1000 * 60 * 60 * 24))
            )
          : null;
      const fallbackPorts =
        row.ports_summary || row.itinerary_label || null;
      const priceCandidates = [row.price_from, row.base_price, row.starting_price, row.min_price];
      const numeric = priceCandidates.find((value) => {
        if (value === null || value === undefined) return false;
        const num = typeof value === "number" ? value : Number(value);
        return Number.isFinite(num);
      });
      const shipRow = (Array.isArray(row.ship) ? row.ship[0] : row.ship) as
        | {
            name?: string | null;
            cruise_line?: { name?: string | null } | { name?: string | null }[] | null;
          }
        | null
        | undefined;
      const cruiseLineRow = Array.isArray(shipRow?.cruise_line)
        ? shipRow?.cruise_line[0]
        : shipRow?.cruise_line;
      return {
        ship: shipRow?.name ?? null,
        line: cruiseLineRow?.name ?? null,
        departure_date: sailDate ?? null,
        nights: nights ?? (row as { nights?: number | null }).nights ?? null,
        itinerary_label: row.itinerary_label ?? null,
        ports_summary: row.ports_summary ?? fallbackPorts,
        itinerary: fallbackPorts,
        starting_price: numeric ?? null,
      };
    }) || [];

  if (error) {
    console.error("search page sailings query error", error);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-semibold">Search Cruises from Galveston</h1>

      <p className="mb-8 text-gray-600">
        Browse upcoming cruise sailings departing from Galveston. Select a ship, travel dates, and itinerary to find
        the option that fits your plans.
      </p>

      <CruiseSearchTable sailings={sailings || []} />
    </main>
  );
}
