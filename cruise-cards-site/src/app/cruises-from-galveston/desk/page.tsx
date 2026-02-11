export const metadata = {
  title: "From The Cruises From Galveston Desk",
  description:
    "Independent cruise desk updates that explain what changed and what it means for Galveston travelers.",
};

const deskCards = [
  {
    title: "Port operations outlook",
    summary: "How terminal flow and staffing affect embarkation timing this season.",
  },
  {
    title: "Deployment updates",
    summary: "Ship rotations that change Galveston sailing patterns in 2026-2028.",
  },
  {
    title: "Weather watch",
    summary: "What Gulf weather shifts actually mean for Galveston departures.",
  },
];

export default function DeskPage() {
  return (
    <main className="min-h-screen bg-background-base text-text-primary">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-14">
        <div className="rounded-3xl border border-white/10 bg-background-panel px-8 py-10">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">The Cruises From Galveston Desk</p>
          <h1 className="mt-4 text-3xl font-semibold font-accent">What’s changed for Galveston cruisers</h1>
          <p className="mt-3 max-w-2xl text-sm text-text-secondary">
            These desk notes explain impact, not headlines. Each update is meant to help travelers make calm, informed
            decisions.
          </p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {deskCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-background-card p-6">
              <div className="text-base font-semibold text-text-primary">{card.title}</div>
              <p className="mt-3 text-sm text-text-secondary">{card.summary}</p>
              <div className="mt-4 text-xs text-text-muted">Draft pending editorial review.</div>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-background-card p-6">
          <h2 className="text-lg font-semibold font-accent">Need an advisor view?</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Ask the desk to review your dates, ship preferences, or travel constraints.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:bookings@cruisesfromgalveston.net"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-text-primary"
            >
              Ask an Advisor
            </a>
            <a href="/booking" className="rounded-full bg-accent-teal px-6 py-3 text-sm font-semibold text-white hover:bg-accent-teal/90">
              Request booking help
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
