import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-navy text-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-sand/80">Texas Coast • Port of Galveston</p>
        <h1 className="mt-4 font-heading text-4xl md:text-5xl">
          Welcome to the Real Cruises From Galveston Experience™
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-sand">
          Your trusted, local guide to cruising from Galveston — before, during, and after your voyage.
        </p>
        <p className="mt-4 text-sm text-driftwood">
          Founded 2017 by Monica Peña · Hospitality-first · Always here for you
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#sailings"
            className="rounded bg-seaglass px-6 py-3 text-sm font-semibold text-white"
          >
            Explore Sailings
          </a>
          <Link
            href="/cruises-from-galveston/guest-help"
            className="rounded border border-white px-6 py-3 text-sm font-semibold text-white"
          >
            I’m Already Booked — Help Me
          </Link>
        </div>
      </div>
    </section>
  );
}
