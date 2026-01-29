import Link from "next/link";

export default function FirstTimeCruisersPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">First-Time Cruisers</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Cruising from Galveston starts here.</h1>
        <p className="mt-4 text-slate-600">
          If this is your first cruise, welcome. If it is your first time sailing from Galveston, you&apos;re in the right
          place.
        </p>
        <p className="mt-3 text-slate-600">
          Cruising is exciting — but the first time can feel overwhelming. Documents, luggage, arrival times,
          terminals, drink packages, port days… most cruise websites assume you already know how it works. This page
          exists so you don&apos;t have to guess.
        </p>
        <p className="mt-3 text-slate-600">
          Built from real Cruises-from-Galveston experience, this hub walks you through what actually matters —
          clearly, calmly, and without judgment.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Why cruising from Galveston is different</h2>
        <p className="mt-3 text-sm text-slate-600">
          Galveston is one of the easiest cruise ports in the U.S. for first-time cruisers — but only if you understand
          how it works. Knowing where you&apos;re sailing from makes your first cruise smoother from the start.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Drive-to convenience (no flights required)</li>
          <li>Multiple cruise terminals across the island</li>
          <li>Flexible parking options</li>
          <li>Hotels, dining, and beaches nearby</li>
          <li>A cruise-focused local community</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Start here: first-time cruiser basics</h2>
        <div className="mt-4 space-y-4 text-sm text-slate-600">
          <div>
            <h3 className="font-semibold text-slate-800">Do I need a passport?</h3>
            <p className="mt-2">
              For most cruises that leave and return to Galveston, U.S. citizens can cruise with a government-issued
              photo ID and a certified birth certificate. A passport is strongly recommended for flexibility and peace
              of mind.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">What happens on embarkation day?</h3>
            <p className="mt-2">
              Embarkation day is not complicated — but it is unfamiliar the first time. Arrive at your assigned
              Galveston cruise terminal, complete security and document check, board the ship, and your vacation
              begins. Your cabin may not be ready right away — that&apos;s normal.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">What time should I arrive?</h3>
            <p className="mt-2">
              Cruise lines assign arrival windows. Showing up early does not usually get you onboard faster. Arriving
              within your window keeps the process smooth and stress-free.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Packing for your first cruise</h2>
        <div className="mt-4 space-y-4 text-sm text-slate-600">
          <div>
            <h3 className="font-semibold text-slate-800">How much luggage can I bring?</h3>
            <p className="mt-2">
              Cruises are more relaxed than airlines. Bring what you can comfortably manage, keep bags under about 50
              lbs for easy handling, and carry a small bag with essentials.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">What should I carry on?</h3>
            <p className="mt-2">
              Always keep travel documents, medications, phone chargers, and swimwear with you. Checked luggage may
              arrive at your cabin later in the day.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Can I bring toiletries and shampoo?</h3>
            <p className="mt-2">
              Yes. Toiletries are allowed, and most cabins provide basic soap and shampoo — but many guests bring their
              own.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Drink packages & onboard extras</h2>
        <p className="mt-3 text-sm text-slate-600">
          Drink packages can be worth it if you enjoy multiple cocktails per day, drink specialty coffee or bottled
          water, or want predictable pricing. They may not be worth it if you drink occasionally. You do not have to
          decide immediately — many guests wait until they understand their onboard habits.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Port days: what if I don&apos;t book excursions?</h2>
        <p className="mt-3 text-sm text-slate-600">
          You don&apos;t need a ship-sponsored excursion to enjoy ports. Many destinations offer walkable port areas,
          beaches near the ship, local taxis and transportation, and shopping and dining close by. The key rule: always
          return to the ship before “all aboard” time.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Parking & arriving in Galveston</h2>
        <p className="mt-3 text-sm text-slate-600">
          Galveston has multiple cruise terminals, and not all ships use the same pier. Parking options include
          official port parking, covered and uncovered private lots, and valet services near terminals. Choosing the
          right option depends on your terminal, arrival time, and comfort level — this is where local knowledge helps.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Already booked? You&apos;re still welcome here.</h2>
        <p className="mt-3 text-sm text-slate-600">
          Many first-time cruisers arrive here after booking because their agent did not explain things clearly, they
          booked online and still have questions, or they want local insight before cruise day. You don&apos;t need to
          rebook or switch agents to use this information. Hospitality doesn&apos;t stop once you&apos;ve booked.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Sea You On Deck — cruise community for first-timers</h2>
        <p className="mt-3 text-sm text-slate-600">
          Cruising feels easier when you&apos;re not doing it alone. Sea You On Deck is our cruise community created for
          first-time cruisers, Galveston sailings, ship-specific questions, and pre-cruise planning.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Questions are encouraged</li>
          <li>Experience is shared</li>
          <li>No one is judged for being new</li>
          <li>Learning from others sailing soon</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">A welcome from Galveston</h2>
        <p className="mt-3 text-sm text-slate-600">
          Cruising is supposed to feel exciting — not stressful. This hub exists to answer the questions others skip,
          help you feel prepared, welcome you to Galveston Island, and support you before you ever board the ship.
          If this is your first cruise, you&apos;re exactly who this page was built for.
        </p>
        <p className="mt-3 text-sm text-slate-600">Welcome to cruising. Welcome to Galveston. Sea you on deck.</p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Where to start</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/cruises-from-galveston/guest-help" className="rounded-full border border-slate-200 px-4 py-2">
            Already Booked? Start Here
          </Link>
          <Link
            href="/plan-your-cruise/driving-to-galveston"
            className="rounded-full border border-slate-200 px-4 py-2"
          >
            Galveston Parking & Terminals
          </Link>
        </div>
      </section>
    </main>
  );
}
