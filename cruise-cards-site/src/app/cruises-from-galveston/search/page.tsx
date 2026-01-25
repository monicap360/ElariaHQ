import CruiseSearchTable from "./CruiseSearchTable";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Cruises from Galveston - Search Sail Dates",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function CruiseSearchPage() {
  const supabase = createClient();

  const { data: sailings } = await supabase
    .from("upcoming_sailings")
    .select("*")
    .order("departure_date", { ascending: true });

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
