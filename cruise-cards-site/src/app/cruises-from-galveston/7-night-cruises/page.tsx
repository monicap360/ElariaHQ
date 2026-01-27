export const metadata = {
  title: "7-Night Cruises from Galveston",
  description: "7-night cruises from Galveston offer the best overall value for Royal Caribbean and Disney sailings.",
};

export default function SevenNightCruisesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">7-Night Cruises from Galveston</h1>
      <p className="mt-4 text-slate-600">
        For Royal Caribbean, Disney, and most other cruise lines, sailings are marketed by nights. Cruises From
        Galveston follows that industry standard for 7-night cruises.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Why 7-night cruises are popular</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-600">
          <li>Best price-per-night value.</li>
          <li>Ideal for families and school breaks.</li>
          <li>Strong demand for balcony cabins.</li>
        </ul>
      </section>
    </main>
  );
}
