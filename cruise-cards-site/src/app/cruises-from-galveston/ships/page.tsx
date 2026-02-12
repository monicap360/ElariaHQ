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

  const { data } = await server.client
    .from("ship_future_sailing_counts")
    .select("ship_id, ship_name, cruise_line, home_port, future_sailing_count, next_sailing_date, last_sailing_date")
    .order("future_sailing_count", { ascending: false })
    .order("next_sailing_date", { ascending: true });

  const ships = (data ?? []) as ShipCountRow[];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Ships Sailing from Galveston</h1>
      <p className="mt-4 text-slate-600">
        These ship guides explain onboard experience and show live sailings without listing prices or deals.
      </p>

      <div className="mt-8 grid gap-4">
        {ships.map((ship) => {
          const href = `/cruises-from-galveston/${slugify(ship.ship_name)}`;
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
