export const metadata = {
  title: "Cruises from Galveston — 2025 & 2026 Sail Dates",
  description: "Official Galveston sail date guidance for 2025 and 2026 with correct day vs night naming.",
};

export default function SailDates2026Page() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Cruises from Galveston — 2025 & 2026 Sail Dates</h1>
      <p className="mt-4 text-slate-600">
        We use cruise-line accurate terminology. Carnival sailings are measured in days, while Royal Caribbean and
        Disney sailings are measured in nights.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Carnival cruises from Galveston (Days)</h2>
        <p className="text-slate-600">
          Carnival Cruise Line officially markets sailings by days. Cruises From Galveston follows Carnival’s naming
          standard exactly.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">5-Day Carnival cruises</h3>
        <p className="text-slate-600">
          Ideal for quick getaways, first-time cruisers, and travelers with limited vacation time.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-slate-600">
          <li>Sat Apr 25 – Thu Apr 30, 2026</li>
          <li>Sat May 2 – Thu May 7, 2026</li>
          <li>Sat May 9 – Thu May 14, 2026</li>
          <li>Sat May 16 – Thu May 21, 2026</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">7-Day Carnival cruises</h3>
        <p className="text-slate-600">
          Best balance of time, destinations, and onboard experience. These sailings sell quickly.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-slate-600">
          <li>Sun May 3 – Sun May 10, 2026</li>
          <li>Sun May 10 – Sun May 17, 2026</li>
          <li>Sun May 17 – Sun May 24, 2026</li>
          <li>Sun May 24 – Sun May 31, 2026</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Non-Carnival cruises from Galveston (Nights)</h2>
        <p className="text-slate-600">
          Royal Caribbean and Disney Cruise Line market sailings by nights, which is standard outside Carnival.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">4-Night cruises</h3>
        <p className="text-slate-600">
          Perfect for shorter vacations and weekend-focused travelers. Limited availability.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">6-Night cruises</h3>
        <p className="text-slate-600">
          A balanced option for travelers who want more onboard time without a full week commitment.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-slate-600">
          <li>Relaxed sailing pace with better cabin availability.</li>
          <li>Fewer crowds than peak sailings.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">7-Night cruises</h3>
        <p className="text-slate-600">
          The most popular option for Royal Caribbean and Disney sailings, with strong demand for balcony cabins.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">How Cruises From Galveston helps you choose</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-600">
          <li>Cruise line duration standards (days vs nights).</li>
          <li>Departure day patterns and weekly sailing rhythm.</li>
          <li>Demand levels and cabin availability.</li>
          <li>Budget flexibility for better alternatives.</li>
        </ul>
      </section>
    </main>
  );
}
