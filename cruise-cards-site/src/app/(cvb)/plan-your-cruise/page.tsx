import type { Metadata } from "next";
import Link from "next/link";
import { CvbFooter } from "@/components/cvb/CvbFooter";
import { Founder } from "@/components/cvb/Founder";
import { GettingHere } from "@/components/cvb/GettingHere";
import { Hero } from "@/components/cvb/Hero";
import { VisitorNav } from "@/components/cvb/VisitorNav";

export const metadata: Metadata = {
  title: "Plan Your Cruise | Galveston Visitor Guide",
  description:
    "A convention-and-visitors style guide to planning a Galveston cruise: sailings, driving routes, parking, and embarkation-day confidence.",
};

const driveGuides = [
  { title: "From Houston", href: "/plan-your-cruise/driving-to-galveston/from-houston" },
  { title: "From Dallas–Fort Worth", href: "/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth" },
  { title: "From Austin", href: "/plan-your-cruise/driving-to-galveston/from-austin" },
  { title: "From San Antonio", href: "/plan-your-cruise/driving-to-galveston/from-san-antonio" },
  { title: "From Oklahoma City", href: "/plan-your-cruise/driving-to-galveston/from-oklahoma-city" },
  { title: "From Baton Rouge", href: "/plan-your-cruise/driving-to-galveston/from-baton-rouge" },
];

export default function PlanYourCruisePage() {
  return (
    <main className="bg-sand text-navy">
      <Hero />
      <VisitorNav />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-heading text-3xl text-navy">Plan your cruise, step by step</h2>
        <p className="mt-3 max-w-3xl text-driftwood">
          This is the convention-and-visitors style hub for Galveston cruise planning: calm, local, and focused on what
          actually reduces stress on embarkation day.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Find sailings & ships",
              body: "Search by dates, ship, and nights. Compare options without pressure.",
              href: "/cruises-from-galveston/search",
              cta: "Explore sailings",
            },
            {
              title: "Driving & arrival strategy",
              body: "Pick the arrival plan that matches your route, timing, and group size.",
              href: "/plan-your-cruise/driving-to-galveston",
              cta: "Driving guide",
            },
            {
              title: "Parking & transportation",
              body: "Compare terminal parking, hotel parking, and park-and-ride by stress level (not hype).",
              href: "/cruises-from-galveston/parking-and-transportation",
              cta: "Parking guide",
            },
          ].map((card) => (
            <article key={card.title} className="rounded bg-white p-6 shadow-sm">
              <h3 className="font-heading text-xl text-navy">{card.title}</h3>
              <p className="mt-3 text-driftwood">{card.body}</p>
              <Link
                href={card.href}
                className="mt-5 inline-flex rounded bg-seaglass px-6 py-3 text-sm font-semibold text-white"
              >
                {card.cta}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded bg-white p-6 shadow-sm">
          <h3 className="font-heading text-xl text-navy">Need booking help (multi-room, family, groups)?</h3>
          <p className="mt-3 text-driftwood">
            If you want us to help place rooms, match cabins, and confirm embarkation-day logistics, use the booking
            form. We’ll keep it calm and clear.
          </p>
          <div className="mt-5 flex flex-wrap gap-4">
            <Link href="/booking" className="rounded bg-seaglass px-6 py-3 text-sm font-semibold text-white">
              Request booking help
            </Link>
            <Link
              href="/cruises-from-galveston/embarkation-day"
              className="rounded border border-harbor px-6 py-3 text-sm font-semibold text-harbor"
            >
              Embarkation day guide
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-heading text-3xl text-navy">Driving guides by starting city</h2>
          <p className="mt-3 max-w-3xl text-driftwood">
            Choose your starting city for a route-first plan and the simplest “arrive calm” strategy.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {driveGuides.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded bg-white p-5 text-navy shadow-sm transition hover:shadow-md"
              >
                <div className="font-heading text-lg">{item.title}</div>
                <div className="mt-1 text-sm text-driftwood">Drive time, traffic notes, and embarkation tips</div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/plan-your-cruise/driving-to-galveston"
              className="inline-flex rounded border border-harbor px-6 py-3 text-sm font-semibold text-harbor"
            >
              View the full driving hub
            </Link>
          </div>
        </div>
      </section>

      <GettingHere />
      <Founder />
      <CvbFooter />
    </main>
  );
}
