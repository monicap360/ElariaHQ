import { createServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Ships Sailing from Galveston",
};

export const dynamic = "force-dynamic";

type ShipCountRow = {
  ship_id: string;
  ship_name: string;
  cruise_line: string | null;
  home_port: string | null;
  future_sailing_count: number | null;
  next_sailing_date: string | null;
  last_sailing_date: string | null;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatDate(value: string | null) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ShipsIndexPage() {
  const server = createServerClient();
  if (!server) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Ships Sailing from Galveston</h1>
        <p className="mt-4 text-slate-600">Cruise data is unavailable right now. Please check back shortly.</p>
      </main>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await server.client
    .from("ship_future_sailing_counts")
    .select("ship_id, ship_name, cruise_line, home_port, future_sailing_count, next_sailing_date, last_sailing_date")
    .order("future_sailing_count", { ascending: false })
    .order("next_sailing_date", { ascending: true });

  let ships = (data ?? []) as ShipCountRow[];

  // Fallback: if the view doesn't exist yet (migrations not applied) or returns
  // no rows (home_port not standardized), build counts directly from sailings.
  if (error || ships.length === 0) {
    type SailingJoinRow = {
      id: string;
      depart_date: string | null;
      departure_port?: string | null;
      ship_id: string | null;
      ship:
        | {
            id: string;
            name: string;
            cruise_line: string | null;
            home_port: string | null;
          }
        | {
            id: string;
            name: string;
            cruise_line: string | null;
            home_port: string | null;
          }[]
        | null;
    };

    const fallbackRes = await server.client
      .from("sailings")
      .select("id, depart_date, departure_port, ship_id, ship:ships(id,name,cruise_line,home_port)")
      .eq("is_active", true)
      .gte("depart_date", today)
      .order("depart_date", { ascending: true })
      .limit(1200);

    const rows = (fallbackRes.data ?? []) as SailingJoinRow[];
    const byShip = new Map<string, ShipCountRow>();

    rows.forEach((row) => {
      const shipRow = Array.isArray(row.ship) ? row.ship[0] : row.ship;
      if (!shipRow?.id || !shipRow.name) return;

      const homePort = shipRow.home_port || "";
      const departurePort = String((row as { departure_port?: string | null }).departure_port || "");
      const isGalveston =
        homePort.toLowerCase().includes("galveston") || departurePort.toLowerCase().includes("galveston");
      if (!isGalveston) return;

      const existing = byShip.get(shipRow.id);
      const departDate = row.depart_date ?? null;
      if (!existing) {
        byShip.set(shipRow.id, {
          ship_id: shipRow.id,
          ship_name: shipRow.name,
          cruise_line: shipRow.cruise_line ?? null,
          home_port: shipRow.home_port ?? null,
          future_sailing_count: 1,
          next_sailing_date: departDate,
          last_sailing_date: departDate,
        });
        return;
      }

      const nextCount = (existing.future_sailing_count ?? 0) + 1;
      existing.future_sailing_count = nextCount;
      if (departDate) {
        if (!existing.next_sailing_date || departDate < existing.next_sailing_date) {
          existing.next_sailing_date = departDate;
        }
        if (!existing.last_sailing_date || departDate > existing.last_sailing_date) {
          existing.last_sailing_date = departDate;
        }
      }
    });

    ships = Array.from(byShip.values()).sort((a, b) => {
      const countA = a.future_sailing_count ?? 0;
      const countB = b.future_sailing_count ?? 0;
      if (countA !== countB) return countB - countA;
      return (a.next_sailing_date || "").localeCompare(b.next_sailing_date || "");
    });
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Ships Sailing from Galveston</h1>
      <p className="mt-4 text-slate-600">
        These ship guides explain onboard experience and show live sailings without listing prices or deals.
      </p>

      <div className="mt-8 grid gap-4">
        {ships.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-600">
            No Galveston ships are available right now. This can happen if the sailing inventory is still syncing or if
            database views haven&apos;t been deployed yet.
          </div>
        ) : null}
        {ships.map((ship) => {
          const href = `/cruises-from-galveston/ships/${slugify(ship.ship_name)}`;
          const countLabel =
            typeof ship.future_sailing_count === "number"
              ? `${ship.future_sailing_count} upcoming sailings`
              : "Upcoming sailings";
          return (
            <a
              key={ship.ship_id}
              href={href}
              className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-700 hover:border-slate-300"
            >
              <div className="text-sm font-semibold">{ship.ship_name}</div>
              <div className="text-xs text-slate-500">
                {countLabel} · Next sail date {formatDate(ship.next_sailing_date)}
              </div>
            </a>
          );
        })}
      </div>
    </main>
  );
}
