import Link from "next/link";

export default function EmbarkationDayPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Embarkation Day</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Embarkation Day in Galveston</h1>
        <p className="mt-3 text-slate-600">What to Expect, What to Bring, and How to Arrive Calmly</p>
        <p className="mt-2 text-sm text-slate-600">The Real Cruises From Galveston Experience™ by Monica Peña</p>
        <p className="mt-4 text-slate-600">
          Embarkation day is the day your cruise begins — and for first-time cruisers, it&apos;s the most unfamiliar part
          of the journey. This guide walks you through the day exactly as it happens in Galveston, so you can arrive
          confident, calm, and ready to enjoy your vacation.
        </p>
        <p className="mt-3 text-slate-600">
          This guide is written in a CVB + hospitality tone, grounded in actual Galveston port flow, and designed to
          answer what guests really experience.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Embarkation day doesn’t have to be stressful</h2>
        <p className="mt-3 text-sm text-slate-600">
          This is the day most first-time cruisers overthink — and the day experienced cruisers stay calm because they
          know the rhythm. Here is what actually happens at the Port of Galveston, hour by hour.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Before you leave home (this matters more than you think)</h2>
        <p className="mt-3 text-sm text-slate-600">Before you even get in the car, make sure you have:</p>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Government-issued photo ID</li>
          <li>Passport or birth certificate (depending on cruise line and itinerary)</li>
          <li>Boarding pass (printed or digital)</li>
          <li>Luggage tags already attached</li>
          <li>Medications in your carry-on (never checked)</li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          If you forget something at home, there is no fixing it at the terminal.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Arrival time: earlier is NOT better</h2>
        <p className="mt-3 text-sm text-slate-600">
          One of the biggest mistakes first-time cruisers make is arriving too early. Cruise terminals operate on
          assigned arrival windows.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Arrive too early and you wait — sometimes outside, sometimes in traffic, sometimes with luggage. Arriving at
          your assigned time is almost always smoother than showing up early.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Step 1: Terminal arrival & luggage drop</h2>
        <p className="mt-3 text-sm text-slate-600">
          When you arrive at the terminal, porters take your large bags and you keep your carry-on. Bags are tagged and
          delivered to your stateroom later.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Tip from experience: pack anything you’ll want the first few hours (meds, swimsuit, documents) in your
          carry-on. Checked luggage may arrive mid-afternoon.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Step 2: Security screening</h2>
        <p className="mt-3 text-sm text-slate-600">
          Security is similar to an airport, but usually faster. You’ll walk through a scanner, have bags screened, and
          be asked basic questions.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Liquids, alcohol, and prohibited items vary by cruise line — this is where many delays happen when rules
          aren’t followed.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Step 3: Check-in & document verification</h2>
        <p className="mt-3 text-sm text-slate-600">
          This is where your documents matter. Staff verify identity, confirm citizenship documents, take your shipboard
          photo, and activate your cruise card. This step is usually efficient unless paperwork is incomplete.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Step 4: Waiting to board (this is normal)</h2>
        <p className="mt-3 text-sm text-slate-600">
          Even after check-in, you may wait briefly. The ship must be fully cleared by customs, crew is still turning
          over cabins, and safety protocols must be completed. This is not a problem — it’s part of the process.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Step 5: Boarding the ship (the best part)</h2>
        <p className="mt-3 text-sm text-slate-600">
          When boarding begins, your cruise officially starts. You’ll scan your cruise card and crew welcomes you
          onboard. Cabins may not be ready yet, but food venues, lounges, and restrooms are open.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          This is when the stress drops and the vacation begins.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">What first-time cruisers worry about (and don’t need to)</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>
            <strong>“What if I miss the ship?”</strong> If you arrive on time with proper documents, this is extremely
            rare.
          </p>
          <p>
            <strong>“What if my luggage doesn’t arrive?”</strong> It almost always does — just later in the day.
          </p>
          <p>
            <strong>“Is everyone watching me?”</strong> No. Staff does this thousands of times a week.
          </p>
          <p>
            <strong>“Am I doing this right?”</strong> Yes. If you follow instructions, you’re doing it right.
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">The Galveston difference</h2>
        <p className="mt-3 text-sm text-slate-600">
          Galveston is a cruise port, but it’s also a hospitality town. Many staff you encounter live locally, work the
          terminals daily, and understand first-time nerves. You are not an inconvenience. You are a guest.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">A personal note from Monica</h2>
        <p className="mt-3 text-sm text-slate-600">
          I’ve watched thousands of guests walk into terminals nervous… and walk onboard smiling. Embarkation day isn’t
          about perfection. It’s about arrival. You made it. We’ve got you from here.
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

      <section className="mt-10 rounded-2xl border border-primary-blue/20 bg-primary-blue/5 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Questions about embarkation day?</h2>
        <p className="mt-2 text-sm font-semibold text-slate-800">Local Galveston Cruise Help Desk</p>
        <p className="mt-1 text-sm text-slate-600">Real people. Real Galveston experience.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="tel:14096322106"
            className="rounded-full bg-accent-teal px-6 py-3 text-sm font-semibold text-white hover:bg-accent-teal/90"
          >
            Call (409) 632-2106
          </a>
          <a
            href="mailto:help@cruisesfromgalveston.net"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-primary-blue/50"
          >
            Email help@cruisesfromgalveston.net
          </a>
        </div>
      </section>
    </main>
  );
}
