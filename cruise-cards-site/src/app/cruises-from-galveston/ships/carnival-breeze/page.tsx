import { createClient } from "@/lib/supabase/server";
import { formatDurationLabel } from "@/lib/formatDuration";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carnival Breeze | Cruises from Galveston",
  robots: {
    index: true,
    follow: true,
  },
};

type Sailing = {
  departure_date: string;
  nights: number | null;
  itinerary: string | null;
  starting_price: number | string | null;
};

function formatPrice(value: Sailing["starting_price"]) {
  if (value === null || value === undefined || value === "") return "Call for pricing";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return "Call for pricing";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numeric);
}

export default async function CarnivalBreezePage() {
  const supabase = createClient();
  if (!supabase) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section>
          <p className="text-sm uppercase tracking-wide text-slate-500">Cruises from Galveston</p>
          <h1 className="mt-2 text-3xl font-semibold">Carnival Breeze</h1>
          <p className="mt-4 text-gray-600">Cruise data is unavailable right now. Please check back shortly.</p>
        </section>
      </main>
    );
  }

  const { data: sailings } = await supabase
    .from("cruise_sailings")
    .select("departure_date,nights,itinerary,starting_price")
    .eq("ship", "Carnival Breeze")
    .eq("bookable", true)
    .order("departure_date", { ascending: true });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section>
        <p className="text-sm uppercase tracking-wide text-slate-500">Cruises from Galveston</p>
        <h1 className="mt-2 text-3xl font-semibold">Carnival Breeze</h1>
        <p className="mt-4 text-gray-600">
          Carnival Breeze is a family-friendly ship known for spacious public areas, multiple dining options, and
          onboard activities that work well for groups. This page keeps the ship details evergreen while showing live
          sailing dates.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Upcoming sailings</h2>
        <p className="mt-2 text-gray-600">
          Only bookable sailings are shown. Use the search page for cross-ship comparisons.
        </p>

        {!sailings?.length && (
          <p className="mt-6 text-gray-500">No upcoming sailings are available at this time.</p>
        )}

        {!!sailings?.length && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 pr-4">Departure</th>
                  <th className="py-3 pr-4">Length</th>
                  <th className="py-3 pr-4">Itinerary</th>
                  <th className="py-3 pr-4">Starting Price</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sailings.map((sailing) => (
                  <tr key={sailing.departure_date} className="border-b">
                    <td className="py-3 pr-4">
                      {new Date(sailing.departure_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 pr-4">{formatDurationLabel("Carnival", sailing.nights)}</td>
                    <td className="py-3 pr-4">{sailing.itinerary || "TBA"}</td>
                    <td className="py-3 pr-4">{formatPrice(sailing.starting_price)}</td>
                    <td className="py-3">
                      <a
                        href="/cruises-from-galveston/search"
                        className="inline-block rounded bg-primary-blue px-4 py-2 text-sm text-white hover:bg-primary-blue/90"
                      >
                        View / Book
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <p className="text-gray-600">
          For a broader overview of planning a cruise departure, visit our{" "}
          <a href="/cruises-from-galveston/how-to-plan" className="text-blue-600 underline">
            Cruises from Galveston planning guide
          </a>
          .
        </p>
      </section>
    </main>
  );
}
