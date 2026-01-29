import type { Metadata } from "next";
import VisitorSearch from "./VisitorSearch";
import ScrollButton from "@/components/ScrollButton";
import "./visitor-info.css";

export const metadata: Metadata = {
  title: "Cruising from Galveston | Visitor Information",
  description:
    "Visitor-style guide to cruising from Galveston: destinations, sailings, terminals, parking, and planning tips.",
};

export default function VisitorInfoPage() {
  return (
    <main>
      <header className="topbar">
        <div className="wrap">
          <div className="nav">
            <div className="brand">
              <div className="mark" aria-hidden="true" />
              <div>
                <h1>
                  Cruising from Galveston <span className="sub">Visitor Information</span>
                </h1>
              </div>
            </div>

            <nav className="menu" aria-label="Primary">
              <a href="#destinations">Destinations</a>
              <a href="#getting-here">Getting Here</a>
              <a href="#parking">Parking</a>
              <a href="#sailings">Sailings</a>
              <a href="#guest-help">Guest Help</a>
            </nav>

            <div className="cta">
              <div className="pill" title="Information desk style">
                <span aria-hidden="true">ℹ︎</span>
                <span>Guidance, not pressure</span>
              </div>
              <ScrollButton targetId="sailings" label="Explore Sailings" className="btn" />
            </div>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div className="heroCard">
            <div className="heroInner">
              <div>
                <div className="kicker">Texas Coast • Port of Galveston</div>
                <h1 className="heroTitle">Welcome to the Real Cruises From Galveston Experience™</h1>
                <p className="heroLead">
                  Your trusted, local guide to cruising from Galveston — before, during, and after your voyage.
                </p>
                <p className="heroTrust">
                  Founded by Monica Peña • Serving Galveston cruisers since 2017 • Hospitality-first, always
                </p>
                <div className="heroActions">
                  <ScrollButton targetId="sailings" label="Explore Sailings" className="btn btn-primary" />
                  <a href="/cruises-from-galveston/guest-help" className="btn btn-secondary">
                    I’m Already Booked — Help Me
                  </a>
                </div>
              </div>

              <aside className="heroAside" aria-label="Visitor Notes">
                <h3>How to use this guide</h3>
                <p>
                  Start with destinations, then review sailings. Prices shown (when available) are displayed as posted:
                  <strong> per person, double occupancy</strong>, including port expenses and government fees.
                </p>
                <div className="asideRow">
                  <ScrollButton targetId="destinations" label="Destinations" className="ghost" />
                  <ScrollButton targetId="getting-here" label="Getting Here" className="ghost" />
                  <ScrollButton targetId="parking" label="Parking" className="ghost" />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section id="visitor-nav" className="section">
        <div className="wrap">
          <div className="navCards">
            {[
              {
                title: "Sailings & Ships",
                desc: "Live dates, ships, and prices from Galveston.",
                href: "#sailings",
                icon: "🚢",
              },
              {
                title: "First-Time Cruisers",
                desc: "Clear guidance without the jargon.",
                href: "/cruises-from-galveston/first-time-cruisers",
                icon: "🧳",
              },
              {
                title: "Getting to Galveston",
                desc: "Routes, timing, and arrival flow.",
                href: "#getting-here",
                icon: "📍",
              },
              {
                title: "Parking & Transportation",
                desc: "Compare options and pick what works.",
                href: "#parking",
                icon: "🅿️",
              },
              {
                title: "Guest Help Desk",
                desc: "Answers even if you booked elsewhere.",
                href: "#guest-help",
                icon: "❓",
              },
              {
                title: "Ports & Private Islands",
                desc: "Destination insights and private island notes.",
                href: "/cruises-from-galveston/private-islands",
                icon: "🌴",
              },
            ].map((item) => (
              <a key={item.title} className="navCard" href={item.href}>
                <span className="navIcon" aria-hidden="true">
                  {item.icon}
                </span>
                <div>
                  <div className="navTitle">{item.title}</div>
                  <div className="navDesc">{item.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="destinations" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h3 className="sectionTitle">Destinations from Galveston</h3>
              <p className="sectionDesc">
                Neutral, visitor-friendly overviews for popular routes. Use these as planning references, then verify
                the sailing details in the “Explore Sailings” section.
              </p>
            </div>
          </div>

          <div className="grid3">
            <article className="card">
              <div className="cardTop" aria-hidden="true" />
              <div className="cardBody">
                <h4>The Bahamas</h4>
                <p>
                  Typically offered as <strong>8-day sailings</strong> from Galveston. Expect a relaxed, island-focused
                  itinerary designed for beach time and easy port days.
                </p>
                <div className="small">Visitor Note: Timing varies by season</div>
              </div>
            </article>

            <article className="card">
              <div className="cardTop" aria-hidden="true" />
              <div className="cardBody">
                <h4>Western Caribbean</h4>
                <p>
                  Common ports include Mexico and nearby Caribbean favorites. Many itineraries combine cultural stops
                  with shorter port distances for smoother sea days.
                </p>
                <div className="small">Visitor Note: Port calls can change</div>
              </div>
            </article>

            <article className="card">
              <div className="cardTop" aria-hidden="true" />
              <div className="cardBody">
                <h4>6-Day Routes</h4>
                <p>
                  Some sailings include a combination of <strong>Cozumel, Costa Maya, and Belize</strong>. These are
                  efficient itineraries for travelers who prefer a shorter cruise window without sacrificing variety.
                </p>
                <div className="small">Visitor Note: Verify dates & durations</div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="getting-here" className="section section-light">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h3 className="sectionTitle">Getting to the Port of Galveston</h3>
              <p className="sectionDesc">
                Many of our guests arrive via I-10 East from Houston, Beaumont, Lake Charles, and beyond. Timing and
                approach matter more than speed.
              </p>
            </div>
          </div>

          <div className="split">
            <div className="mapPanel" aria-label="Route overview">
              <div className="mapTitle">Route overview</div>
              <ul>
                <li>I-10 East highlighted</li>
                <li>Loop 610 / Beltway 8 feeder routes</li>
                <li>Galveston Causeway entry</li>
              </ul>
            </div>
            <div className="card">
              <div className="cardBody">
                <h4>Real guidance</h4>
                <p>
                  Galveston is a working island. Arrival flow is smoother when you plan your route, respect your cruise
                  line’s arrival window, and choose a parking strategy that fits your group.
                </p>
                <div className="callout">
                  <strong>Park & Ride Option (I-10 East Travelers)</strong>
                  <p>
                    Coming from Houston or east Texas? Secure parking and cruise shuttle service available at{" "}
                    <span>11221 Market Street, Jacinto City, TX 77029</span> via{" "}
                    <a href="https://houstoncruisehuttle.com" target="_blank" rel="noreferrer">
                      houstoncruisehuttle.com
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="parking" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h3 className="sectionTitle">Parking & Transportation</h3>
              <p className="sectionDesc">
                Compare options based on what actually reduces stress, not just price.
              </p>
            </div>
          </div>
          <div className="grid3">
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
              <article key={item.title} className="card">
                <div className="cardBody">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                  <div className="small">Monica’s note: {item.note}</div>
                </div>
              </article>
            ))}
          </div>
          <p className="sectionDesc note">
            “As someone who’s driven cruise shuttles and greeted guests personally, timing and location matter more
            than price.”
          </p>
        </div>
      </section>

      <section id="sailings" className="section">
        <div className="wrap">
          <VisitorSearch />
        </div>
      </section>

      <section id="guest-help" className="section section-light">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h3 className="sectionTitle">Already Booked? We’re Still Here for You.</h3>
              <p className="sectionDesc">
                Even if you booked elsewhere, you’re welcome here. We help cruisers every day with the questions that
                come up before sailing.
              </p>
            </div>
          </div>

          <div className="accordion">
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
              <details key={item.title}>
                <summary>{item.title}</summary>
                <p>{item.body}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="monica" className="section section-light">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h3 className="sectionTitle">Your Local Galveston Cruise Expert</h3>
              <p className="sectionDesc">
                Monica Peña brings real, on-the-ground hospitality experience to every guest she helps.
              </p>
            </div>
          </div>
          <div className="split">
            <div className="portrait" aria-label="Monica Peña">
              <div className="portraitName">Monica Peña</div>
              <div className="portraitRole">Founder • Galveston-Based</div>
            </div>
            <div className="card">
              <div className="cardBody">
                <ul className="linkList">
                  <li>Former Hotel General Manager (Galveston & Abilene)</li>
                  <li>IHG Certified Director of Marketing & Sales</li>
                  <li>Cruise shuttle & port operations experience</li>
                  <li>Travel agency owner dedicated exclusively to cruises from Galveston</li>
                </ul>
                <p className="pullQuote">“This isn’t just travel to me — it’s welcoming you into my home port.”</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h3 className="sectionTitle">Join the Sea You On Deck Community</h3>
              <p className="sectionDesc">
                Connect with fellow cruisers, ask questions, share tips, and sail with confidence.
              </p>
            </div>
          </div>
          <div className="heroActions">
            <a href="/cruises-from-galveston/guest-help" className="btn btn-primary">
              Join the Community
            </a>
            <a href="/cruises-from-galveston/guest-help" className="btn btn-secondary">
              Ask a Question
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="footgrid">
            <div>
              <h4>© The Real Cruises From Galveston Experience™</h4>
              <div>Founded 2017 by Monica Peña</div>
            </div>
            <div>
              <h4>Ownership & Attribution</h4>
              <div>
                Original content based on real Galveston cruise operations and hospitality experience. Unauthorized
                imitation or use causing consumer confusion is prohibited.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
