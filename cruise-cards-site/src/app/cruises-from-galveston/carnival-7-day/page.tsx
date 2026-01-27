export const metadata = {
  title: "Carnival 7-Day Cruises from Galveston",
  description: "Carnival 7-day cruises from Galveston balance time, destinations, and onboard experience.",
};

export default function CarnivalSevenDayPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">7-Day Carnival Cruises from Galveston</h1>
      <p className="mt-4 text-slate-600">
        Carnival uses days (not nights) across its marketing and booking confirmations. Cruises From Galveston follows
        that standard for 7-day sailings.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Why 7-day Carnival cruises are in high demand</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-600">
          <li>Best value per day for families and groups.</li>
          <li>More ports and longer time onboard.</li>
          <li>Strong fit for payment plans and SeaPay candidates.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Sample 7-day Carnival sail dates (2026)</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-600">
          <li>Sun May 3 – Sun May 10, 2026</li>
          <li>Sun May 10 – Sun May 17, 2026</li>
          <li>Sun May 17 – Sun May 24, 2026</li>
          <li>Sun May 24 – Sun May 31, 2026</li>
        </ul>
      </section>
    </main>
  );
}
