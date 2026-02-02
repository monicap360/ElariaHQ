import type { Metadata } from "next";
import Link from "next/link";
import VisitorSearch from "./VisitorSearch";
import "./visitor-info.css";
import { CvbFooter } from "@/components/cvb/CvbFooter";
import { Founder } from "@/components/cvb/Founder";
import { GettingHere } from "@/components/cvb/GettingHere";
import { Hero } from "@/components/cvb/Hero";
import { VisitorNav } from "@/components/cvb/VisitorNav";

export const metadata: Metadata = {
  title: "Cruising from Galveston | Visitor Information",
  description:
    "Visitor-style guide to cruising from Galveston: destinations, sailings, terminals, parking, and planning tips.",
};

export const revalidate = 3600;

export default function VisitorInfoPage() {
  return (
    <main className="bg-sand text-navy">
      <Hero />
      <VisitorNav />

      <section id="destinations" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-heading text-3xl text-navy">Destinations from Galveston</h2>
        <p className="mt-3 max-w-3xl text-driftwood">
          Neutral, visitor-friendly overviews for popular routes. Use these as planning references, then verify the
          sailing details in the “Explore Sailings” section.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "The Bahamas",
              body: "Typically offered as 8-day sailings from Galveston. Expect a relaxed, island-focused itinerary designed for beach time and easy port days.",
              note: "Visitor note: Timing varies by season",
            },
            {
              title: "Western Caribbean",
              body: "Common ports include Mexico and nearby Caribbean favorites. Many itineraries combine cultural stops with shorter port distances for smoother sea days.",
              note: "Visitor note: Port calls can change",
            },
            {
              title: "6-Day Routes",
              body: "Some sailings include a combination of Cozumel, Costa Maya, and Belize. These are efficient itineraries for travelers who prefer a shorter cruise window without sacrificing variety.",
              note: "Visitor note: Verify dates & durations",
            },
          ].map((item) => (
            <article key={item.title} className="rounded bg-white p-5 shadow-sm">
              <h3 className="font-heading text-xl text-navy">{item.title}</h3>
              <p className="mt-3 text-driftwood">{item.body}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-driftwood">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <GettingHere />

      <section id="parking" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-heading text-3xl text-navy">Parking & Transportation</h2>
        <p className="mt-3 max-w-3xl text-driftwood">
          Compare options based on what actually reduces stress, not just price.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Port Parking",
              desc: "Best for experienced cruisers who want to walk straight to the terminal.",
              note: "Close to the ship, but can be slow during peak arrival waves.",
            },
            {
              title: "Hotel + Cruise Parking",
              desc: "Ideal for travelers arriving the night before.",
              note: "Wake up on island time and start the day relaxed.",
            },
            {
              title: "Park & Ride (I-10 East)",
              desc: "Best for Houston/East Texas arrivals who want a smoother entry and exit.",
              note: "Timing and location matter more than price.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded bg-white p-5 shadow-sm">
              <h3 className="font-heading text-xl text-navy">{item.title}</h3>
              <p className="mt-3 text-driftwood">{item.desc}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-driftwood">Monica’s note: {item.note}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 italic text-driftwood">
          “As someone who’s driven cruise shuttles and greeted guests personally, timing and location matter more than
          price.”
        </p>
      </section>

      <section id="sailings" className="mx-auto max-w-6xl px-6 py-16">
        <VisitorSearch />
      </section>

      <section id="guest-help" className="bg-sand py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-heading text-3xl text-navy">Already Booked? We’re Still Here for You.</h2>
          <p className="mt-3 max-w-3xl text-driftwood">
            Even if you booked elsewhere, you’re welcome here. We help cruisers every day with the questions that come
            up before sailing.
          </p>
          <div className="mt-8 space-y-3">
            {[
              {
                title: "Passports & Documents",
                body: "Closed-loop itineraries may allow a birth certificate and ID, but a passport is always recommended for flexibility and peace of mind.",
              },
              {
                title: "Drink Packages — Worth It?",
                body: "They can be worth it if you plan to enjoy multiple specialty drinks daily. If not, pay-as-you-go is often cheaper.",
              },
              {
                title: "Do I Have to Dress Up?",
                body: "No. Cruises are relaxed. Dress up if you want, but comfortable clothing is always acceptable.",
              },
              {
                title: "What Can I Bring?",
                body: "Toiletries, medications, and comfort items are fine. Keep essentials in your carry-on for embarkation day.",
              },
              {
                title: "What to Do in Port Without Excursions",
                body: "Many ports are walkable and easy to explore independently. You can also stay onboard and enjoy quieter ship time.",
              },
              {
                title: "Luggage Rules Explained",
                body: "Cruise lines are more flexible than airlines, but you must carry what you bring. Two checked bags per person is typical.",
              },
              {
                title: "Embarkation Day — What Really Happens",
                body: "Arrive within your assigned window, drop luggage, clear security, check in, then wait for boarding. It’s a process, not a rush.",
              },
            ].map((item) => (
              <details key={item.title} className="rounded border border-sand bg-white p-4">
                <summary className="cursor-pointer font-semibold text-navy">{item.title}</summary>
                <p className="mt-3 text-driftwood">{item.body}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Founder />

      <section id="community" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-heading text-3xl text-navy">Join the Sea You On Deck Community</h2>
        <p className="mt-3 max-w-3xl text-driftwood">
          Connect with fellow cruisers, ask questions, share tips, and sail with confidence.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/cruises-from-galveston/guest-help"
            className="rounded bg-seaglass px-6 py-3 text-sm font-semibold text-white"
          >
            Join the Community
          </Link>
          <Link
            href="/cruises-from-galveston/guest-help"
            className="rounded border border-harbor px-6 py-3 text-sm font-semibold text-harbor"
          >
            Ask a Question
          </Link>
        </div>
      </section>

      <CvbFooter />
    </main>
  );
}
