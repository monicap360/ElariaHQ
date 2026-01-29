import Link from "next/link";

export default function FirstTimeCruisersPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">First-Time Cruiser Help</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          The Real Cruises From Galveston Experience™
        </h1>
        <p className="mt-3 text-slate-600">By Monica Peña — based on real embarkation-day and onboard experience</p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">What should I wear on embarkation day?</h2>
        <p className="mt-3 text-sm text-slate-600">
          Embarkation day in Galveston is not a fashion show — it&apos;s a logistics day. You&apos;ll be checking luggage,
          standing in security lines, walking ramps, waiting in terminals, and boarding in mid-day Texas heat.
        </p>
        <p className="mt-3 text-sm text-slate-600">What actually works best:</p>
        <ul className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Comfortable clothes you&apos;d wear to the airport</li>
          <li>Breathable fabrics</li>
          <li>Closed-toe shoes or supportive sandals</li>
          <li>A light layer (ships can feel cool inside)</li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          <strong>Local tip:</strong> Your checked luggage may not arrive until late afternoon or early evening. Wear
          something you&apos;re happy staying in all day.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">What not to pack (from experience)</h2>
        <p className="mt-3 text-sm text-slate-600">
          These are the items guests most often say, “I wish I hadn&apos;t brought that.”
        </p>
        <ul className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Too many shoes</li>
          <li>Full-size toiletries (ship bathrooms are compact)</li>
          <li>Expensive jewelry</li>
          <li>Multiple bulky outfits “just in case”</li>
          <li>Hair tools you don&apos;t normally use</li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">What to pack instead:</p>
        <ul className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Mix-and-match outfits</li>
          <li>Travel-size toiletries (yes, you can bring shampoo)</li>
          <li>One nicer outfit if you want photos</li>
          <li>Comfortable walking shoes for ports</li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          Cruise cabins are designed for smart packing, not overpacking.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">First-night dining: what to expect</h2>
        <p className="mt-3 text-sm text-slate-600">
          This causes more anxiety than it should. On your first night, you can eat as casually as you want. Buffets,
          casual dining, and main dining rooms are all open. No one expects you dressed up, and reservations are not
          required on most ships.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Many Galveston guests grab something easy, explore the ship, unpack, and watch sail-away. You are not missing
          out if you keep it simple on night one.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">“Cruise anxiety” most first-timers don&apos;t talk about</h2>
        <p className="mt-3 text-sm text-slate-600">
          We hear this every week — and it&apos;s completely normal. Common worries include: “What if I don&apos;t know what to
          do?” “What if I mess something up?” “What if I miss the ship in port?” “What if I packed wrong?”
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Here&apos;s the truth: cruise ships are designed for first-timers. There are signs, staff, announcements, and
          help everywhere. And if you ever feel unsure, ask crew, ask guest services, or ask us — even if you already
          booked elsewhere.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          What can I do in port if I don&apos;t book a shore excursion?
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          A lot — and sometimes more comfortably. You can walk the port area, take a local taxi, visit beaches, eat at
          local restaurants, shop at your own pace, or return to the ship early and enjoy a quieter onboard experience.
          Shore excursions are optional, not required.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          We help guests choose based on mobility, comfort level, budget, and travel style — not pressure.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Parking, passports, drink packages & real questions</h2>
        <p className="mt-3 text-sm text-slate-600">
          These are the questions we answer every single week: Do I need a passport? Is the drink package worth it? How
          much luggage can I bring? Where should I park in Galveston? Can I bring soda or water? What happens if I get
          seasick? What if I already booked but still have questions?
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Yes — we help with all of that. Because cruising isn&apos;t just about booking. It&apos;s about feeling prepared.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Already booked? You&apos;re still welcome here.</h2>
        <p className="mt-3 text-sm text-slate-600">
          Cruises From Galveston® exists to support guests before, during, and after their cruise — not just to sell
          one. Whether you booked with us, booked with someone else, booked direct, or booked years ago, we&apos;re still
          here to help. That&apos;s hospitality.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Join the community: Sea You On Deck</h2>
        <p className="mt-3 text-sm text-slate-600">
          Cruising is better when you&apos;re not doing it alone. Sea You On Deck is our cruise community where guests ask
          real questions, share embarkation tips, meet fellow Galveston cruisers, and learn what to expect before
          sailing.
        </p>
        <p className="mt-3 text-sm text-slate-600">Especially helpful for:</p>
        <ul className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>First-time cruisers</li>
          <li>Solo travelers</li>
          <li>Families</li>
          <li>Guests sailing from Galveston for the first time</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">A note from Monica</h2>
        <p className="mt-3 text-sm text-slate-600">
          This site was built from real work: hotel general manager experience in Galveston, cruise shuttle and
          terminal operations, meet-and-greet guest services, travel agency ownership, and years of hands-on
          embarkation day reality. Cruising isn&apos;t theoretical here — it&apos;s lived.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          The Real Cruises From Galveston Experience™ — by Monica Peña. Founded 2017. Built on real Galveston cruise
          operations and a heart for hospitality.
        </p>
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
          <Link
            href="/cruises-from-galveston/embarkation-day"
            className="rounded-full border border-slate-200 px-4 py-2"
          >
            What to Expect on Embarkation Day
          </Link>
        </div>
      </section>
    </main>
  );
}
