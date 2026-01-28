import { providerFromSupabase } from "@/lib/cruiseDecisionEngine/provider.supabase";
import CalendarPage from "@/app/cruises-from-galveston/calendar/page";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function ShipCalendarPage({
  params,
  searchParams,
}: {
  params: { shipSlug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const provider = providerFromSupabase();
  const ships = (await provider.getAllShips?.()) ?? [];
  const ship = ships.find((item) => slugify(item.name) === params.shipSlug);

  if (!ship) {
    throw new Error("Ship not found");
  }

  const sp = new URLSearchParams(searchParams as Record<string, string>);
  sp.set("shipId", ship.id);

  return <CalendarPage searchParams={Object.fromEntries(sp.entries())} />;
}
