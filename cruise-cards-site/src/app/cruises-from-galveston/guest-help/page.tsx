import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 3600;

type GuestHelpQuestion = {
  question: string;
  answer: string;
  category: string;
  cruise_line: string | null;
  destination: string | null;
  last_reviewed_date: string | null;
};

const CATEGORY_ORDER = [
  {
    key: "documents",
    title: "Passports & Travel Documents",
    description:
      "Requirements vary by itinerary and nationality. We explain what is typically needed for cruises departing Galveston.",
  },
  {
    key: "drink-packages",
    title: "Drink Packages & Onboard Extras",
    description: "Guidance on what is included, what costs extra, and when a package makes sense.",
  },
  {
    key: "luggage-packing",
    title: "Luggage & Packing",
    description: "Simple packing guidance for ship days, port days, and private islands.",
  },
  {
    key: "parking-port",
    title: "Parking & Getting to the Port (Galveston-specific)",
    description: "Local Galveston guidance on parking, arrival timing, and terminal access.",
  },
  {
    key: "port-days",
    title: "Port Days & Exploring on Your Own",
    description: "What to expect in port and how to enjoy your day with or without an excursion.",
  },
  {
    key: "onboard-life",
    title: "Onboard Life & Daily Flow",
    description: "Embarkation, dining, and the day-to-day rhythm at sea.",
  },
  {
    key: "accessibility",
    title: "Accessibility & Special Needs",
    description: "Guidance for mobility needs, dietary considerations, and medical devices.",
  },
] as const;

function groupByCategory(items: GuestHelpQuestion[]) {
  const groups: Record<string, GuestHelpQuestion[]> = {};
  items.forEach((item) => {
    const key = item.category || "other";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });
  return groups;
}

export default async function GuestHelpPage() {
  const server = createServerClient();
  const { data } = server
    ? await server.client
        .from("guest_help_questions")
        .select("question, answer, category, cruise_line, destination, last_reviewed_date")
        .order("category", { ascending: true })
        .order("question", { ascending: true })
    : { data: null };

  const questions = (data ?? []) as GuestHelpQuestion[];
  const grouped = groupByCategory(questions);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Guest Desk</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Welcome to Your First Cruise from Galveston
        </h1>
        <p className="mt-4 text-slate-600">
          You&apos;re in the right place — and you&apos;re not doing this alone.
        </p>
        <p className="mt-3 text-slate-600">
          If this is your first cruise, welcome. If you&apos;re sailing from Galveston for the first time, double welcome.
          Cruising can feel overwhelming at first — documents, ports, packing, parking, timing — and most cruise
          websites assume you already know how it all works. We&apos;re here to walk you through it, step by step, from
          Galveston Island.
        </p>
        <p className="mt-3 text-slate-600">
          Whether you booked through us, another agent, directly with the cruise line, or years ago… you&apos;re welcome
          here.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Written from real Galveston embarkation experience by the founder of Cruises From Galveston®, established
          2017.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/cruises-from-galveston/plan-your-cruise" className="text-primary-blue">
            Plan your cruise
          </Link>
          <Link href="/cruises-from-galveston/visitor-info" className="text-slate-700">
            Visitor information
          </Link>
        </div>
      </div>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Why Galveston matters (especially for first-time cruisers)</h2>
        <p className="mt-3 text-sm text-slate-600">
          Galveston isn&apos;t just a port — it&apos;s a departure experience. Many first-time cruisers don&apos;t realize how much
          smoother cruising feels when you understand where you&apos;re sailing from, not just where you&apos;re going.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Easy drive-in port (no flights required)</li>
          <li>Multiple cruise terminals across the island</li>
          <li>Dedicated cruise parking options</li>
          <li>Hotels, dining, and beaches nearby</li>
          <li>A cruise-focused local community</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">First-time cruiser basics (plain English)</h2>
        <div className="mt-4 space-y-4 text-sm text-slate-600">
          <div>
            <h3 className="font-semibold text-slate-800">Do I need a passport?</h3>
            <p className="mt-2">
              For most cruises that leave and return to Galveston, U.S. citizens can sail with a government-issued
              photo ID and a certified birth certificate. A passport is strongly recommended for flexibility and peace
              of mind if plans change unexpectedly.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">What happens on embarkation day?</h3>
            <p className="mt-2">
              Think of embarkation day as airport plus hotel check-in: arrive at your assigned Galveston terminal,
              complete security and document check, board the ship, and your vacation begins. Your cabin may not be
              ready right away — that&apos;s normal.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">What time should I arrive?</h3>
            <p className="mt-2">
              Your cruise line assigns an arrival window. Showing up early doesn&apos;t get you on faster — it usually
              just means waiting outside. Arrive within your window and things move smoothly.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Packing without stress</h2>
        <div className="mt-4 space-y-4 text-sm text-slate-600">
          <div>
            <h3 className="font-semibold text-slate-800">How much luggage can I bring?</h3>
            <p className="mt-2">
              Cruises are more relaxed than airlines. There is no strict bag count, but pack what you can comfortably
              manage and keep bags under about 50 lbs for handling. Carry a small day bag with essentials.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Can I bring toiletries and shampoo?</h3>
            <p className="mt-2">
              Yes. Toiletries are allowed, and most cabins include basic shampoo and soap — bringing your own favorites
              is common.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">What should I put in my carry-on?</h3>
            <p className="mt-2">
              Always keep travel documents, medications, a phone charger, and swimwear with you since checked bags can
              arrive later.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Drink packages & “is it worth it?”</h2>
        <p className="mt-3 text-sm text-slate-600">
          This is one of the most common first-time cruiser questions. Drink packages can be worth it depending on how
          you cruise: multiple cocktails per day tends to justify it, occasional drinks usually do not. You don&apos;t need
          to decide immediately — many guests wait until they understand their onboard habits.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Port days: what if I don&apos;t book excursions?</h2>
        <p className="mt-3 text-sm text-slate-600">
          You don&apos;t have to book a ship excursion to enjoy ports. Many destinations offer walkable areas, beaches
          close to port, local taxis and transport, and shopping and food right outside the terminal. The key rule:
          always return to the ship before “all aboard” time.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Parking, terminals & getting around Galveston</h2>
        <p className="mt-3 text-sm text-slate-600">
          Galveston has multiple cruise terminals, and ships do not all use the same pier. Parking options include
          official port parking, covered and uncovered private lots, and valet services near terminals. Each option has
          different pricing, proximity, and services — knowing your terminal location matters, and we help with that.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Already booked? You&apos;re still welcome here.</h2>
        <p className="mt-3 text-sm text-slate-600">
          You don&apos;t need to rebook. You don&apos;t need to switch agents. You don&apos;t need to feel awkward asking questions.
          Many guests come here because their agent is hard to reach, they booked online and have questions, it&apos;s
          their first cruise, or they want local insight. We&apos;re happy to help.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Sea You On Deck — our cruise community</h2>
        <p className="mt-3 text-sm text-slate-600">
          Cruising is better when you&apos;re not doing it alone. Sea You On Deck is our cruise community built around
          first-time cruisers, Galveston sailings, ship-specific conversations, port tips, and packing advice.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Ask questions without judgment</li>
          <li>See what others on your sailing are doing</li>
          <li>Learn from experienced cruisers</li>
          <li>Feel connected before you step onboard</li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          Whether you&apos;re sailing next month or next year — you belong there.
        </p>
      </section>

      {CATEGORY_ORDER.map((category) => {
        const items = grouped[category.key] ?? [];
        if (!items.length) return null;
        return (
          <section key={category.key} className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">{category.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{category.description}</p>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <details key={item.question} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">{item.question}</summary>
                  <p className="mt-3 text-sm text-slate-600">{item.answer}</p>
                  {item.cruise_line || item.destination ? (
                    <p className="mt-3 text-xs text-slate-400">
                      {item.cruise_line ? `${item.cruise_line} specific` : null}
                      {item.cruise_line && item.destination ? " • " : null}
                      {item.destination ? `${item.destination} guidance` : null}
                    </p>
                  ) : null}
                </details>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Written from real Cruises-from-Galveston experience</h2>
        <p className="mt-2 text-sm text-slate-600">With a heart for hospitality — by Monica Peña</p>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>
            This guide is written from real Cruises-from-Galveston experience, grounded in years of hands-on
            hospitality, transportation, and cruise-day operations on Galveston Island.
          </p>
          <p>
            Monica Peña is the owner of a Galveston-based travel agency focused exclusively on cruises departing from
            the Port of Galveston. Her work is shaped not only by industry knowledge, but by direct responsibility for
            the guest experience — from the moment travelers arrive on the island to the day they return home.
          </p>
          <p>
            Before dedicating her business fully to cruising, Monica served as a hotel general manager on Galveston&apos;s
            West End (formerly La Quinta, now the Galveston Beach Hotel). In that role, she worked closely with cruise
            guests preparing to sail — managing early arrivals, luggage logistics, timing concerns, and the real
            questions that surface just before embarkation.
          </p>
          <p>Her experience also includes:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Operating and driving cruise shuttles to and from Galveston cruise terminals</li>
            <li>Coordinating meet-and-greet arrivals for cruise guests</li>
            <li>Supporting travelers on embarkation and debarkation days</li>
            <li>Guiding guests through terminal locations, arrival timing, and port flow</li>
            <li>Assisting first-time cruisers who had already booked but needed clarity and reassurance</li>
          </ul>
          <p>
            As a travel agency owner, Monica made a deliberate decision to specialize in cruises from Galveston. She
            saw that guests needed more than booking links — they needed a local, informed, and human source of truth
            that understood how cruising actually works on this island. That&apos;s why this platform exists.
          </p>
          <p>
            Every page is created, reviewed, and maintained with operational accuracy, guest clarity, and hospitality
            first. The information here is not scraped, generic, or written from afar — it reflects real questions,
            real sailings, and real experiences.
          </p>
          <p>
            Whether you booked through us, another agent, or directly with the cruise line, this site is here to:
            welcome you to Galveston, help you feel prepared and confident, support first-time cruisers without
            judgment, offer guidance even after booking, and build community through Sea You On Deck.
          </p>
          <p>
            This work is not automated, outsourced, or impersonal. It&apos;s personal, intentional, and rooted in a
            lifetime commitment to hospitality.
          </p>
          <p>Welcome to Galveston. Welcome to cruising with clarity. Sea you on deck.</p>
        </div>
        <div
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600"
          style={{ background: "rgba(15, 23, 42, 0.02)" }}
        >
          <div className="text-sm font-semibold text-slate-800">Monica Peña</div>
          <div>Founder, Cruises From Galveston® (Est. 2017)</div>
          <div>Hotel General Manager · Cruise Shuttle Operations · Galveston Port Logistics</div>
        </div>
      </section>

      {!questions.length && (
        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Guest help is on the way</h2>
          <p className="mt-2 text-sm text-slate-600">
            We are building this guest desk now. If you have a specific question, reach out and we will add it to the
            guide.
          </p>
        </section>
      )}

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Our promise to you</h2>
        <p className="mt-2 text-sm text-slate-600">
          We are based in Galveston and proudly support guests sailing from our island. Even if you already booked
          elsewhere, you are welcome here. Our goal is simple: clear answers, honest guidance, and a calm, welcoming
          start to your cruise.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          If you have questions that are not answered here, we are happy to help point you in the right direction.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-primary-blue/20 bg-primary-blue/5 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Need to talk to someone?</h2>
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
