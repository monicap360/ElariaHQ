import Link from "next/link";

export default function EmbarkationDayPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Embarkation Day</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Embarkation Day from Galveston</h1>
        <p className="mt-3 text-slate-600">What to expect, where to go, and how to feel prepared</p>
        <p className="mt-4 text-slate-600">
          Embarkation day is the day your cruise begins — and for first-time cruisers, it&apos;s the most unfamiliar part
          of the journey. This guide walks you through what actually happens on embarkation day in Galveston, so you
          can arrive confident, calm, and ready to enjoy your vacation.
        </p>
        <p className="mt-3 text-slate-600">
          This information is based on real Cruises-from-Galveston operational experience, not generic cruise line
          instructions.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Before you leave for the port</h2>
        <p className="mt-3 text-sm text-slate-600">
          Arriving in Galveston the night before is strongly recommended if you&apos;re driving from outside the island or
          flying into Houston. Staying local removes most day-of stress.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Morning traffic delays are unpredictable</li>
          <li>Cruise arrival windows are specific</li>
          <li>Parking and terminal flow move more smoothly early</li>
        </ul>
        <p className="mt-4 text-sm text-slate-600">Double-check these before leaving:</p>
        <ul className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Government-issued ID and required documents</li>
          <li>Cruise line app installed and logged in</li>
          <li>Arrival time window confirmed</li>
          <li>Terminal location noted</li>
          <li>Medications packed in carry-on</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Arriving in Galveston on embarkation day</h2>
        <p className="mt-3 text-sm text-slate-600">
          Galveston has multiple cruise terminals, and ships do not all sail from the same pier. Your cruise line
          confirmation or app will tell you which terminal your ship uses and your assigned arrival window. Do not
          assume all ships leave from the same place.
        </p>
        <p className="mt-4 text-sm text-slate-600">Parking options in Galveston include:</p>
        <ul className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Official port parking</li>
          <li>Private cruise parking lots</li>
          <li>Covered or uncovered options</li>
          <li>Drop-off if someone is driving you</li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          Each option has different walking distances and shuttle setups. Knowing your terminal matters more than
          knowing your ship name.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Arrival time: earlier is not better</h2>
        <p className="mt-3 text-sm text-slate-600">
          Cruise lines assign arrival windows for a reason. Showing up hours early does not get you onboard faster and
          often means waiting outside. Arriving within your window keeps the process smooth.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Arriving from I-45 South or Mainland Galveston</h2>
        <p className="mt-3 text-sm text-slate-600">
          If you&apos;re traveling south toward Galveston on I-45, you&apos;re coming from the most common cruise approach
          route in Texas. This route serves guests driving in from Central Texas, North Texas, and the Houston metro,
          and it&apos;s the primary artery into the island on sailing days.
        </p>
        <p className="mt-3 text-sm text-slate-600">Cruise guests regularly arrive from:</p>
        <div className="mt-3 grid gap-4 text-sm text-slate-600 md:grid-cols-3">
          <div>
            <div className="font-semibold text-slate-800">Houston metro (north & central)</div>
            <ul className="mt-2 space-y-1">
              <li>Downtown Houston</li>
              <li>The Heights</li>
              <li>Midtown</li>
              <li>Montrose</li>
              <li>Spring</li>
              <li>The Woodlands</li>
              <li>Conroe</li>
              <li>Cypress</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-800">Mainland Gulf Coast</div>
            <ul className="mt-2 space-y-1">
              <li>League City</li>
              <li>Clear Lake</li>
              <li>Webster</li>
              <li>Friendswood</li>
              <li>Dickinson</li>
              <li>Texas City</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-800">Central & North Texas</div>
            <ul className="mt-2 space-y-1">
              <li>Austin</li>
              <li>San Antonio</li>
              <li>Waco</li>
              <li>College Station</li>
              <li>Dallas–Fort Worth</li>
              <li>Bryan / College Station</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          If you&apos;re coming from any of these areas, I-45 South is your main route into Galveston.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">What to know about I-45 on embarkation day</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Traffic increases significantly after 7:30–8:00 AM.</li>
          <li>Backups are common near Texas City, Dickinson, and the Causeway.</li>
          <li>Lane closures or weather can slow entry to the island.</li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          Because of this, experienced cruisers often arrive in Galveston the night before, plan extra buffer time, and
          choose parking options close to their terminal. This site helps you decide what makes sense based on your
          route, not just distance.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">A local insight</h2>
        <p className="mt-3 text-sm text-slate-600">
          From real embarkation-day operations, guests coming down I-45 often underestimate how long the final stretch
          can take. Galveston is an island — once traffic backs up, there are limited alternate routes. Planning ahead
          isn&apos;t overthinking — it&apos;s how you start your cruise relaxed instead of rushed.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Where are you coming from? Choose your arrival route</h2>
        <p className="mt-3 text-sm text-slate-600">
          Every cruiser&apos;s journey to Galveston is different. That&apos;s why Cruises From Galveston is organized by how
          guests actually arrive, not just by ship or cruise line.
        </p>
        <div className="mt-6 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-800">Coming from I-10 East / Houston side</div>
            <p className="mt-2">
              Best for travelers from East Houston, Baytown, Beaumont, Port Arthur, Louisiana, and East Texas.
            </p>
            <p className="mt-2">Helpful if you want park-and-ride options or a guided terminal arrival.</p>
            <Link
              href="/plan-your-cruise/driving-to-galveston/from-houston"
              className="mt-3 inline-flex text-sm font-semibold text-primary-blue"
            >
              Driving from Houston →
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-800">Coming from I-45 South</div>
            <p className="mt-2">Best for travelers from Houston metro, Central Texas, and North Texas.</p>
            <p className="mt-2">Helpful if you want overnight hotel options and timing tips for Causeway traffic.</p>
            <Link
              href="/plan-your-cruise/driving-to-galveston"
              className="mt-3 inline-flex text-sm font-semibold text-primary-blue"
            >
              Driving to Galveston →
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-800">Flying into Houston</div>
            <p className="mt-2">Best for travelers flying into Hobby (HOU) or Bush Intercontinental (IAH).</p>
            <p className="mt-2">Helpful for shuttle vs. rental car advice and arrival-day planning.</p>
            <Link
              href="/cruises-from-galveston/how-to-plan"
              className="mt-3 inline-flex text-sm font-semibold text-primary-blue"
            >
              Airport-to-ship guidance →
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-800">Staying overnight in Galveston</div>
            <p className="mt-2">Best for travelers who want a relaxed embarkation morning.</p>
            <p className="mt-2">Helpful for hotel location guidance and park-and-cruise options.</p>
            <Link href="/cruises-from-galveston/guest-help" className="mt-3 inline-flex text-sm font-semibold text-primary-blue">
              Overnight planning help →
            </Link>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Most cruise websites assume everyone arrives the same way. In real life, how you get to Galveston determines
          everything: when you should leave, where you should park, whether a shuttle makes sense, and how stressful
          embarkation day feels. That&apos;s why this site starts with you, not the ship.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Cruising from Galveston works best when you understand your route, give yourself margin, and arrive informed,
          not rushed. That&apos;s the heart of this site. Welcome to Galveston. No matter how you arrive, we&apos;re glad you&apos;re
          here.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Luggage drop-off</h2>
        <p className="mt-3 text-sm text-slate-600">
          When you arrive, port staff will tag your larger luggage and take it onboard separately. You keep your
          carry-on with essentials. Checked bags may arrive at your cabin later in the afternoon — this is normal.
        </p>
        <p className="mt-4 text-sm text-slate-600">Carry on:</p>
        <ul className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Documents</li>
          <li>Medications</li>
          <li>Phone charger</li>
          <li>Swimsuit or change of clothes</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Security & check-in</h2>
        <p className="mt-3 text-sm text-slate-600">
          Embarkation includes security screening similar to airport security, document verification, and a facial
          photo or boarding confirmation. Staff guide you step by step — if something is unclear, ask. First-time
          questions are expected.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Boarding the ship</h2>
        <p className="mt-3 text-sm text-slate-600">
          Once onboard, you can explore public areas immediately. Lunch venues are open, and activities may already be
          happening. Cabins may not be ready until early afternoon — a great time to get lunch, walk the ship, relax by
          the pool, and get familiar with the layout.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">What first-time cruisers worry about (and don&apos;t need to)</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>
            <strong>“What if I do something wrong?”</strong> You won&apos;t. The process is designed to guide you through
            each step.
          </p>
          <p>
            <strong>“What if I miss something important?”</strong> Crew announcements and the cruise app keep you
            informed.
          </p>
          <p>
            <strong>“What if my luggage doesn&apos;t arrive?”</strong> It almost always does. If there is a delay, guest
            services handles it quickly.
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Sail away from Galveston</h2>
        <p className="mt-3 text-sm text-slate-600">
          One of the best parts of cruising from Galveston is sail-away. As the ship departs, you&apos;ll see the island,
          Gulf waters, and horizon open up. The mood shifts from travel to vacation — that&apos;s when it clicks for most
          first-time cruisers. You made it. The hard part is over.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Already booked and still nervous? That&apos;s normal.</h2>
        <p className="mt-3 text-sm text-slate-600">
          Many first-time cruisers feel unsure even after booking. That&apos;s why this page exists. You don&apos;t need to
          have everything memorized. You just need to know where to go, when to arrive, and what to expect. The rest
          falls into place.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Sea You On Deck — support before you sail</h2>
        <p className="mt-3 text-sm text-slate-600">
          If you want reassurance before embarkation day, Sea You On Deck is our cruise community for Galveston
          sailings — especially helpful for first-time cruisers. Ask questions, see what others are doing, and learn
          from experienced cruisers. You don&apos;t have to figure this out alone.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">A final word from Galveston</h2>
        <p className="mt-3 text-sm text-slate-600">
          Embarkation day feels big because it&apos;s new — not because it&apos;s hard. Galveston welcomes cruise guests every
          week, and this guide exists to make sure you feel prepared, informed, welcomed, and confident. Your cruise
          starts here. Welcome to Galveston. Welcome aboard. Sea you on deck.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Recommended next pages</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/cruises-from-galveston/first-time-cruisers" className="rounded-full border border-slate-200 px-4 py-2">
            First-Time Cruisers Hub
          </Link>
          <Link
            href="/plan-your-cruise/driving-to-galveston"
            className="rounded-full border border-slate-200 px-4 py-2"
          >
            Parking & Terminals in Galveston
          </Link>
          <Link href="/cruises-from-galveston/guest-help" className="rounded-full border border-slate-200 px-4 py-2">
            Already Booked? Start Here
          </Link>
        </div>
      </section>
    </main>
  );
}
