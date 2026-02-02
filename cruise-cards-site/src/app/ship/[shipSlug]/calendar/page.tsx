import { providerFromSupabase } from "@/lib/cruiseDecisionEngine/provider.supabase";
import CalendarPage from "@/app/cruises-from-galveston/calendar/page";

type CalendarSearchParams = {
  y?: string;
  m?: string;
  adults?: string;
  children?: string;
  max?: string;
  flex?: string;
  line?: string;
  shipId?: string;
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function ShipCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ shipSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { shipSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const provider = providerFromSupabase();
  const ships = (await provider.getAllShips?.()) ?? [];
  const ship = ships.find((item) => slugify(item.name) === shipSlug);

  if (!ship) {
    throw new Error("Ship not found");
  }

  const sp = new URLSearchParams(resolvedSearchParams as Record<string, string>);
  sp.set("shipId", ship.id);

  return <CalendarPage searchParams={Promise.resolve(Object.fromEntries(sp.entries()) as CalendarSearchParams)} />;
}
