import Link from "next/link";

export const metadata = {
  title: "How to Plan a Cruise from Galveston",
  description:
    "A visitor-style planning guide for Galveston departures covering timing, logistics, cruise length, and arrival preparation.",
};

export default function HowToPlanPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="rounded-3xl border border-border bg-background-panel px-8 py-10 shadow-sm md:px-12 md:py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Port of Galveston · Visitor Guide</p>
        <h1 className="mt-4 text-4xl font-semibold text-text-primary md:text-5xl font-accent">
          How to plan a cruise from Galveston
        </h1>
        <p className="mt-4 max-w-3xl text-base text-text-secondary md:text-lg">
          You&apos;re in the right place for a calm, informed start. This guide organizes the key decisions that shape a
          Galveston cruise — timing, logistics, and onboard choices — so you can plan with clarity and confidence.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-text-muted">
          <span className="rounded-full border border-border px-3 py-1">Timing & logistics</span>
          <span className="rounded-full border border-border px-3 py-1">Port readiness</span>
          <span className="rounded-full border border-border px-3 py-1">Cabin & dining</span>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-border bg-background-card p-6">
            <h2 className="text-xl font-semibold font-accent text-text-primary">What this guide covers</h2>
            <ul className="mt-4 grid gap-3 text-sm text-text-secondary">
              <li>
                <span className="font-semibold text-text-primary">Is Galveston the right port?</span> A quick fit check
                for distance, cruise length, and embarkation day simplicity.
              </li>
              <li>
                <span className="font-semibold text-text-primary">Driving vs flying.</span> Travel-time guidance and
                buffer-day recommendations.
              </li>
              <li>
                <span className="font-semibold text-text-primary">Cabins, dining, and group planning.</span> Clear
                decision points without pressure.
              </li>
            </ul>
          </div>
          <aside className="rounded-2xl border border-border bg-background-card p-6">
            <h2 className="text-lg font-semibold font-accent text-text-primary">Visitor notes</h2>
            <p className="mt-3 text-sm text-text-secondary">
              Many guests ask about pricing displays. When prices appear, they reflect posted rates per person, double
              occupancy, including port expenses and government fees.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/cruises-from-galveston/board"
                className="rounded-full bg-accent-teal px-5 py-2 text-xs font-semibold text-white hover:bg-accent-teal/90"
              >
                Explore sailings
              </Link>
              <Link
                href="/plan-your-cruise/driving-to-galveston"
                className="rounded-full border border-border px-5 py-2 text-xs font-semibold text-text-primary hover:border-primary-blue/50"
              >
                Driving guidance
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "1. Confirm Galveston is the right port",
            description:
              "Galveston is the most accessible cruise port for many travelers across Texas and nearby states. It is a strong choice if you prefer shorter travel distances and a calmer embarkation day.",
          },
          {
            title: "2. Choose your travel mode",
            description:
              "Driving offers luggage flexibility and control. Flying works best for long-distance travelers — build a buffer day and plan ground transfer from Houston airports.",
          },
          {
            title: "3. Match cruise length to distance",
            description:
              "Local travelers often prefer 3–5 nights. First-time cruisers usually find 4–6 nights ideal. Long-distance travelers get better value from 6–8 nights.",
          },
        ].map((card) => (
          <article key={card.title} className="rounded-2xl border border-border bg-background-card p-6">
            <h2 className="text-lg font-semibold font-accent text-text-primary">{card.title}</h2>
            <p className="mt-3 text-sm text-text-secondary">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-3xl border border-border bg-background-panel p-8">
        <h2 className="text-2xl font-semibold font-accent text-text-primary">Decision points that matter most</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background-card p-6">
            <h3 className="text-lg font-semibold text-text-primary">Driving vs flying</h3>
            <ul className="mt-4 grid gap-3 text-sm text-text-secondary">
              <li>
                <span className="font-semibold text-text-primary">Driving:</span> Best for travelers within a day&apos;s
                drive. Flexible for luggage, family gear, and early arrival plans.
              </li>
              <li>
                <span className="font-semibold text-text-primary">Flying:</span> Best for long-distance travelers. Fly
                into IAH or HOU and plan a buffer day to protect against delays.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-background-card p-6">
            <h3 className="text-lg font-semibold text-text-primary">Arrival timing</h3>
            <ul className="mt-4 grid gap-3 text-sm text-text-secondary">
              <li>
                <span className="font-semibold text-text-primary">Check-in window:</span> Arrive 2–3 hours before your
                assigned time to allow for parking and terminal flow.
              </li>
              <li>
                <span className="font-semibold text-text-primary">Document kit:</span> Keep IDs, boarding passes, and
                luggage tags printed and accessible.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-background-card p-6">
          <h2 className="text-xl font-semibold font-accent text-text-primary">Cabin & dining choices</h2>
          <ul className="mt-4 grid gap-3 text-sm text-text-secondary">
            <li>
              <span className="font-semibold text-text-primary">Cabin categories:</span> Balcony for outdoor space,
              oceanview for natural light, interior for the lowest price point.
            </li>
            <li>
              <span className="font-semibold text-text-primary">Dining style:</span> Choose early, late, or flexible
              dining. Specialty dining can be added after booking.
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-background-card p-6">
          <h2 className="text-xl font-semibold font-accent text-text-primary">Families & groups</h2>
          <ul className="mt-4 grid gap-3 text-sm text-text-secondary">
            <li>
              <span className="font-semibold text-text-primary">Families:</span> Reserve connecting or adjacent cabins
              to reduce coordination stress.
            </li>
            <li>
              <span className="font-semibold text-text-primary">Groups:</span> Book early to keep rooms close and use one
              organizer for payments and confirmations.
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-border bg-background-panel p-8">
        <h2 className="text-2xl font-semibold font-accent text-text-primary">Next steps</h2>
        <p className="mt-3 text-sm text-text-secondary">
          Many guests ask what to do after planning. Compare real sailings, review port logistics, and then finalize
          your cabin and dining preferences.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/cruises-from-galveston/search"
            className="rounded-full bg-accent-teal px-6 py-3 text-sm font-semibold text-white hover:bg-accent-teal/90"
          >
            Search sailings
          </Link>
          <Link
            href="/cruises-from-galveston/parking-and-transportation"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:border-primary-blue/50"
          >
            Parking & transportation
          </Link>
          <Link
            href="/cruises-from-galveston/embarkation-day"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:border-primary-blue/50"
          >
            Embarkation day checklist
          </Link>
        </div>
      </section>
    </main>
  );
}
