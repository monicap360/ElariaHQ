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
              <a href="#port">Port Guide</a>
              <a href="#sailings">Sailings</a>
              <a href="#planning">Planning</a>
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
                <h2 className="heroTitle">A calm, informed start to your cruise journey.</h2>
                <p className="heroLead">
                  This site is designed in a Convention & Visitors Bureau tone—clear, neutral, and helpful. Explore
                  destinations and sailings departing from Galveston, plus practical guidance for terminal arrival,
                  parking, and planning.
                </p>
                <div className="heroMeta" role="list" aria-label="Highlights">
                  <span className="tag" role="listitem">
                    Year-round departures
                  </span>
                  <span className="tag" role="listitem">
                    Visitor-style guidance
                  </span>
                  <span className="tag" role="listitem">
                    Port & planning tips
                  </span>
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
                  <ScrollButton targetId="port" label="Port Guide" className="ghost" />
                  <ScrollButton targetId="sailings" label="Sailings" className="ghost" />
                </div>
              </aside>
            </div>
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

      <section id="port" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h3 className="sectionTitle">Port of Galveston Guide</h3>
              <p className="sectionDesc">
                Planning essentials: arrival timing, terminals, and a calm checklist approach. This is informational—
                always follow your cruise line’s instructions.
              </p>
            </div>
          </div>

          <div className="grid3">
            <article className="card">
              <div className="cardBody">
                <h4>Arrival Timing</h4>
                <p>
                  Plan to arrive early enough for parking and check-in. Keep documents accessible and allow extra time
                  for traffic near the terminals.
                </p>
              </div>
            </article>
            <article className="card">
              <div className="cardBody">
                <h4>Parking & Drop-Off</h4>
                <p>
                  Use the terminal signage and official directions. If traveling with family, consider a drop-off plan
                  before parking.
                </p>
              </div>
            </article>
            <article className="card">
              <div className="cardBody">
                <h4>Pre-Cruise Stay</h4>
                <p>
                  A night near the island can reduce stress, especially for early check-in times. Confirm shuttle or
                  rideshare options ahead of time.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="sailings" className="section">
        <div className="wrap">
          <VisitorSearch />
        </div>
      </section>

      <section id="planning" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h3 className="sectionTitle">Planning Notes</h3>
              <p className="sectionDesc">
                A few quiet, practical reminders—styled like a visitor center desk: helpful, neutral, and easy to scan.
              </p>
            </div>
          </div>

          <div className="grid3">
            <article className="card">
              <div className="cardBody">
                <h4>Documents</h4>
                <p>
                  Confirm your travel documents and cruise line requirements well in advance. Keep digital backups and
                  printed copies where appropriate.
                </p>
              </div>
            </article>
            <article className="card">
              <div className="cardBody">
                <h4>Accessibility</h4>
                <p>
                  If you need accessibility accommodations, contact your cruise line early. Planning ahead usually
                  improves the experience.
                </p>
              </div>
            </article>
            <article className="card">
              <div className="cardBody">
                <h4>Weather & Packing</h4>
                <p>
                  Pack for warm days and indoor cooling. Check forecasts close to departure and consider a small day
                  bag for port calls.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="footgrid">
            <div>
              <h4>Visitor Information Tone</h4>
              <div>
                This layout is intentionally upscale and neutral—more “CVB desk” than sales funnel. If you want, we can
                tailor it to the live Supabase content and your brand assets.
              </div>
            </div>
            <div>
              <h4>Quick Links</h4>
              <div className="footlinks">
                <a href="#destinations">Destinations</a>
                <a href="#port">Port Guide</a>
                <a href="#sailings">Sailings</a>
                <a href="#planning">Planning</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
