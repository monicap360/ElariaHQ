import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-semibold text-text-primary">Cruises From Galveston</h1>
      <p className="mt-4 text-base text-text-secondary">
        Simple, low-memory build of the site focused on core visitor guidance pages.
      </p>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/cruises-from-galveston/first-time-cruisers"
          className="rounded-xl border border-border bg-background-card px-4 py-3 text-sm font-semibold text-text-primary"
        >
          First-time cruisers guide
        </Link>
        <Link
          href="/cruises-from-galveston/how-to-plan"
          className="rounded-xl border border-border bg-background-card px-4 py-3 text-sm font-semibold text-text-primary"
        >
          Planning guide
        </Link>
        <Link
          href="/cruises-from-galveston/parking-and-transportation"
          className="rounded-xl border border-border bg-background-card px-4 py-3 text-sm font-semibold text-text-primary"
        >
          Parking & transportation
        </Link>
        <Link
          href="/cruises-from-galveston/embarkation-day"
          className="rounded-xl border border-border bg-background-card px-4 py-3 text-sm font-semibold text-text-primary"
        >
          Embarkation day
        </Link>
        <Link
          href="/cruises-from-galveston/guest-help"
          className="rounded-xl border border-border bg-background-card px-4 py-3 text-sm font-semibold text-text-primary"
        >
          Guest help
        </Link>
        <Link
          href="/plan-your-cruise/driving-to-galveston"
          className="rounded-xl border border-border bg-background-card px-4 py-3 text-sm font-semibold text-text-primary"
        >
          Driving directions
        </Link>
      </section>
    </main>
  );
}
