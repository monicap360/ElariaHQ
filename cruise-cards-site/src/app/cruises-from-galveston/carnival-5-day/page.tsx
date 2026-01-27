export const metadata = {
  title: "Carnival 5-Day Cruises from Galveston",
  description: "Carnival 5-day cruises from Galveston are ideal for short getaways and first-time cruisers.",
};

export default function CarnivalFiveDayPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">5-Day Carnival Cruises from Galveston</h1>
      <p className="mt-4 text-slate-600">
        Carnival Cruise Line officially markets sailings by days. Cruises From Galveston follows Carnival’s naming
        standard exactly for 5-day sailings.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Why travelers choose 5-day Carnival cruises</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-600">
          <li>Lower overall cost for a quick getaway.</li>
          <li>High onboard energy and entertainment.</li>
          <li>Fewer days away from home.</li>
          <li>Popular dates that sell quickly.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Sample 5-day Carnival sail dates (2026)</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-600">
          <li>Sat Apr 25 – Thu Apr 30, 2026</li>
          <li>Sat May 2 – Thu May 7, 2026</li>
          <li>Sat May 9 – Thu May 14, 2026</li>
          <li>Sat May 16 – Thu May 21, 2026</li>
        </ul>
      </section>
    </main>
  );
}
