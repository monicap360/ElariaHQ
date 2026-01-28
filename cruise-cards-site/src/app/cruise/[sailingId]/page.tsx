import CabinPreview from "@/components/cruise/CabinPreview";
import CruiseHero from "@/components/cruise/CruiseHero";
import SailingDetails from "@/components/cruise/SailingDetails";
import StickyBookBar from "@/components/cruise/StickyBookBar";
import WhyThisCruise from "@/components/cruise/WhyThisCruise";
import { runCruiseDecisionEngine } from "@/lib/cruiseDecisionEngine/engine";
import { providerFromSupabase } from "@/lib/cruiseDecisionEngine/provider.supabase";
import type { CruiseDecisionInput } from "@/lib/cruiseDecisionEngine/types";
import { formatDurationLabel } from "@/lib/formatDuration";

export const dynamic = "force-dynamic";

export default async function CruiseDetailsPage({ params }: { params: { sailingId: string } }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12 text-slate">
        <p>Supabase is not configured for this environment.</p>
      </main>
    );
  }

  const provider = providerFromSupabase();
  const sailing = provider.getSailingById ? await provider.getSailingById(params.sailingId) : null;

  if (!sailing) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12 text-slate">
        <p>This sailing is not available.</p>
      </main>
    );
  }

  const shipMap = await provider.getShipsByIds([sailing.shipId]);
  const ship = shipMap[sailing.shipId];

  const [pricingMap, availabilityMap] = await Promise.all([
    provider.getLatestPricingBySailingIds([sailing.id]),
    provider.getLatestAvailabilityBySailingIds([sailing.id]),
  ]);

  const pricing = pricingMap[sailing.id];
  const availability = availabilityMap[sailing.id];

  const baseDate = sailing.departDate || new Date().toISOString().slice(0, 10);
  const input: CruiseDecisionInput = {
    departurePort: sailing.departurePort || "Galveston",
    dateRange: { start: baseDate, end: baseDate },
    passengers: { adults: 2 },
  };

  const decision = await runCruiseDecisionEngine({ input, provider, limit: 50 });
  const result = decision.results.find((row) => row.sailingId === sailing.id);

  const reasons = result?.reasons ?? [];
  const flags = result?.flags ?? [];

  const price = pricing?.minPerPerson ? formatPrice(Number(pricing.minPerPerson)) : "Call for pricing";
  const fromPrice = price;
  const componentFactors = mapComponentsToFactors(result?.components);

  const itineraryLabel = sailing.itineraryLabel ?? titleCase(sailing.itineraryTags?.[0] ?? "Cruise");
  const portsSummary = sailing.portsSummary ?? (sailing.itineraryTags.join(", ") || "—");
  const dates = `${baseDate} • ${formatDurationLabel(sailing.cruiseLine, sailing.nights)} ${itineraryLabel}`;

  const highlights = [
    ...reasons.slice(0, 2),
    ...(flags.includes("high_demand") || (availability?.demandPressure ?? 0) >= 0.7 ? ["Popular sailing"] : []),
    ...(flags.includes("over_budget") ? ["May be above your target budget"] : []),
  ].slice(0, 3);

  const details = [
    { label: "Departure", value: "Galveston, TX" },
    { label: "Itinerary", value: itineraryLabel },
    { label: "Ports", value: portsSummary },
    { label: "Nights", value: String(sailing.nights) },
    { label: "Cruise line", value: sailing.cruiseLine },
  ];

  const cabins = buildCabins(availability?.availableCabinTypes ?? [], fromPrice);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-10 text-slate">
      <CruiseHero
        ship={{ name: ship?.name ?? "Cruise Details", image: heroImageFor(sailing.shipId, ship?.name) }}
        dates={dates}
        price={fromPrice}
        highlights={highlights}
        viewCabinsHref="#cabins"
        reserveHref="/booking"
      />
      <WhyThisCruise
        factors={[
          { label: "Overall fit", value: Math.round((result?.confidence ?? 0.6) * 100) },
          ...componentFactors,
        ]}
      />
      <SailingDetails details={details} />
      <CabinPreview cabins={cabins} />
      <StickyBookBar price={fromPrice} reserveHref="/booking" />
    </main>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function mapComponentsToFactors(c?: {
  price: number;
  cabin: number;
  preference: number;
  demand: number;
  risk: number;
}) {
  if (!c) return [];
  const pct = (x: number) => Math.round(x * 100);
  return [
    { label: "Overall value", value: pct(c.price) },
    { label: "Cabin availability", value: pct(c.cabin) },
    { label: "Preference match", value: pct(c.preference) },
    {
      label: "Demand",
      value: pct(1 - c.demand),
      warning: c.demand > 0.7,
      note: c.demand > 0.7 ? "Limited" : undefined,
    },
    {
      label: "Booking stability",
      value: pct(1 - c.risk),
      warning: c.risk > 0.7,
      note: c.risk > 0.7 ? "Tight" : undefined,
    },
  ];
}

function buildCabins(cabins: string[], fromPrice: string) {
  if (cabins.length) {
    return cabins.slice(0, 3).map((type) => ({
      type,
      note: type.toLowerCase() === "balcony" ? "Most popular" : "Available now",
      price: fromPrice || "Call",
      featured: type.toLowerCase() === "balcony",
    }));
  }
  return [
    { type: "Interior", note: "Best value", price: fromPrice || "Call" },
    { type: "Balcony", note: "Most popular", price: fromPrice ? `${fromPrice} + $200` : "Call", featured: true },
  ];
}

function heroImageFor(shipId?: string, shipName?: string | null) {
  if (shipId) {
    return `/ships/${shipId}.jpg`;
  }
  const name = shipName?.toLowerCase() ?? "";
  if (name.includes("breeze")) return "/assets/breezebalc.jpg";
  if (name.includes("dream")) return "/assets/OIP (7).jpg";
  if (name.includes("mariner")) return "/assets/symphony-of-the-seas.webp";
  if (name.includes("disney")) return "/assets/60ed9b0ab092993339d2.webp";
  return "/assets/50d77fbd1a700d20a05a.webp";
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(" ");
}
