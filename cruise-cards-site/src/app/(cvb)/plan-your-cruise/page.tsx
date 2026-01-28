import type { Metadata } from "next";
import "../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";

export const metadata: Metadata = {
  title: "Plan Your Cruise from Galveston",
  description:
    "A visitor-style guide to planning a Galveston cruise: driving routes, arrival tips, parking guidance, and sailing search resources.",
};

const southTexas = [
  {
    slug: "corpus-christi",
    title: "Corpus Christi",
    driveTime: "~4.5-5 hours",
    route: "US-77 North -> I-69E North -> I-45 South",
    tip:
      "Many travelers choose to arrive in Galveston the evening before departure and stay overnight near the port to avoid early-morning driving.",
  },
  {
    slug: "kingsville",
    title: "Kingsville",
    driveTime: "~5-5.5 hours",
    route: "US-77 North -> I-69E North -> I-45 South",
    tip: "Traffic increases as you approach the Houston area. Plan your arrival outside of peak weekday rush hours.",
  },
  {
    slug: "mission",
    title: "Mission & Palmview (Rio Grande Valley)",
    driveTime: "~6.5-7.5 hours",
    route: "I-2 East -> US-77 North -> I-69E North -> I-45 South",
    tip:
      "Due to distance, a one-night stop near Galveston is strongly recommended. This allows for a relaxed embarkation morning and reduces travel stress.",
    note: "Asistencia en espanol disponible.",
  },
];

const centralNorthTexas = [
  {
    slug: "houston",
    title: "Houston",
    driveTime: "~1 hour (traffic dependent)",
    route: "I-45 South",
    tip: "Even short-distance travelers should arrive early due to terminal traffic and boarding schedules.",
  },
  {
    slug: "dallas-fort-worth",
    title: "Dallas-Fort Worth",
    driveTime: "~5-6 hours",
    route: "I-45 South",
    tip:
      "Depart early in the morning or travel the day before. Many travelers include a pre-cruise hotel stay in Galveston or the Houston area.",
  },
  {
    slug: "austin-san-antonio",
    title: "Austin & San Antonio",
    driveTime: "Austin: ~4-4.5 hours | San Antonio: ~4.5-5 hours",
    route: "I-35 -> TX-71 / I-10 -> I-45 South",
    tip: "These routes are popular for weekend and mid-length cruises.",
  },
];

const nearbyStates = [
  {
    slug: "louisiana",
    title: "Louisiana",
    driveTime: "~4-6 hours (city dependent)",
    route: "I-10 West -> I-45 South",
    tip:
      "Travelers from Baton Rouge, Lafayette, Lake Charles, and Shreveport commonly choose Galveston to avoid flights and baggage restrictions.",
  },
  {
    slug: "missouri",
    title: "Missouri",
    driveTime: "~12-14 hours",
    route: "I-44 -> I-49 -> I-45 South",
    tip: "Missouri travelers often split the drive over two days or fly into Houston and drive the final leg.",
  },
];

export default function PlanYourCruisePage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Plan a Drive-To Cruise from Galveston",
            description:
              "A step-by-step visitor guide for planning a cruise departure from the Port of Galveston, including transportation, arrival timing, cruise length selection, and embarkation preparation.",
            totalTime: "P1D",
            supply: [
              { "@type": "HowToSupply", name: "Government-issued photo ID or passport" },
              { "@type": "HowToSupply", name: "Cruise reservation details" },
            ],
            step: [
              {
                "@type": "HowToStep",
                name: "Determine if Galveston is the right cruise port",
                text:
                  "Confirm Galveston is a convenient departure port based on driving distance, available cruise lengths, and year-round sailing schedules.",
              },
              {
                "@type": "HowToStep",
                name: "Plan your transportation to Galveston",
                text:
                  "Decide whether to drive or fly into the Houston area. Most travelers within a regional distance choose to drive for flexibility and easier luggage handling.",
              },
              {
                "@type": "HowToStep",
                name: "Choose the appropriate cruise length",
                text:
                  "Select a cruise duration that aligns with your travel distance. Shorter cruises work well for nearby travelers, while longer itineraries are better for long-distance guests.",
              },
              {
                "@type": "HowToStep",
                name: "Arrange arrival timing and overnight stays",
                text:
                  "Plan to arrive in Galveston at least one day before departure to reduce travel stress and account for traffic or weather delays.",
              },
              {
                "@type": "HowToStep",
                name: "Prepare for embarkation day",
                text:
                  "Complete cruise check-in, print required documents, attach luggage tags, and arrive at the terminal during your assigned boarding window.",
              },
            ],
          }),
        }}
      />
      <header className="hero">
        <div className="wrap">
          <div className="heroCard">
            <div className="heroInner">
              <div>
                <div className="kicker">Visitor Information • Port of Galveston</div>
                <h1 className="heroTitle">Plan Your Cruise from Galveston</h1>
                <p className="heroLead">
                  Driving to the Port of Galveston is one of the most popular ways to begin a cruise, especially for
                  travelers across Texas and the central United States. Galveston’s location on the Texas Gulf Coast
                  makes it accessible via major highways, with clearly marked routes to cruise terminals and parking
                  facilities.
                </p>
                <div className="heroMeta" role="list" aria-label="Highlights">
                  <span className="tag" role="listitem">
                    Regional drive times
                  </span>
                  <span className="tag" role="listitem">
                    Arrival guidance
                  </span>
                  <span className="tag" role="listitem">
                    Planning checklist
                  </span>
                </div>
              </div>
              <aside className="heroAside" aria-label="Planning overview">
                <h3>What this guide covers</h3>
                <p>
                  This guide explains what to expect when driving to Galveston from different regions, including travel
                  times, route planning tips, and arrival recommendations for cruise day.
                </p>
                <div className="asideRow">
                  <a className="ghost" href="#tips">
                    General tips
                  </a>
                  <a className="ghost" href="#south-texas">
                    South Texas
                  </a>
                  <a className="ghost" href="#next-steps">
                    Next steps
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </header>

      <section id="tips" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h2 className="sectionTitle">General driving tips for cruise travelers</h2>
              <p className="sectionDesc">Before reviewing city-specific routes, keep these general tips in mind.</p>
            </div>
          </div>
          <div className="card">
            <div className="cardBody">
              <ul className="sectionDesc" style={{ margin: 0, paddingLeft: 18 }}>
                <li>Plan to arrive in Galveston the day before your cruise when possible.</li>
                <li>Allow extra time for traffic near Houston and the causeway.</li>
                <li>Pre-book cruise parking or transportation services in advance.</li>
                <li>Keep cruise documents easily accessible for embarkation day.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="south-texas" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h2 className="sectionTitle">Driving to Galveston from South Texas</h2>
              <p className="sectionDesc">Route planning guidance for Corpus Christi, Kingsville, and the Rio Grande Valley.</p>
            </div>
          </div>
          <div className="grid3">
            {southTexas.map((city) => (
              <article className="card" key={city.slug}>
                <div className="cardBody">
                  <h4>{city.title}</h4>
                  <p>
                    <strong>Estimated drive time:</strong> {city.driveTime}
                  </p>
                  <p>
                    <strong>Primary route:</strong> {city.route}
                  </p>
                  <p>
                    <strong>Planning tip:</strong> {city.tip}
                  </p>
                  {city.note ? <div className="small">{city.note}</div> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="central-texas" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h2 className="sectionTitle">Driving to Galveston from Central & North Texas</h2>
              <p className="sectionDesc">Guidance for Houston, Dallas-Fort Worth, Austin, and San Antonio travelers.</p>
            </div>
          </div>
          <div className="grid3">
            {centralNorthTexas.map((city) => (
              <article className="card" key={city.slug}>
                <div className="cardBody">
                  <h4>{city.title}</h4>
                  <p>
                    <strong>Estimated drive time:</strong> {city.driveTime}
                  </p>
                  <p>
                    <strong>Primary route:</strong> {city.route}
                  </p>
                  <p>
                    <strong>Planning tip:</strong> {city.tip}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="nearby-states" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h2 className="sectionTitle">Driving to Galveston from Nearby States</h2>
              <p className="sectionDesc">Longer-distance guidance for Louisiana and Missouri travelers.</p>
            </div>
          </div>
          <div className="grid3">
            {nearbyStates.map((city) => (
              <article className="card" key={city.slug}>
                <div className="cardBody">
                  <h4>{city.title}</h4>
                  <p>
                    <strong>Estimated drive time:</strong> {city.driveTime}
                  </p>
                  <p>
                    <strong>Primary route:</strong> {city.route}
                  </p>
                  <p>
                    <strong>Planning tip:</strong> {city.tip}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card" style={{ padding: 16 }}>
            <h3 className="sectionTitle" style={{ marginTop: 0 }}>
              Arrival in Galveston: What to expect
            </h3>
            <p className="sectionDesc" style={{ marginTop: 6 }}>
              Follow signage for Port of Galveston cruise terminals, expect increased traffic on cruise embarkation
              mornings, and look for clearly marked parking and drop-off areas. Arriving early and prepared makes the
              embarkation process smooth and predictable.
            </p>
          </div>
        </div>
      </section>

      <section id="next-steps" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h2 className="sectionTitle">Your next steps</h2>
              <p className="sectionDesc">
                Now that your drive is planned, use the site tools to finish your cruise preparation.
              </p>
            </div>
          </div>
          <div className="grid3">
            <div className="card">
              <div className="cardBody">
                <h3>Driving details</h3>
                <p>Review the full driving guide with regional routes and arrival advice.</p>
                <a className="mutebtn" href="/cruises-from-galveston/driving-to-galveston">
                  Driving guide
                </a>
              </div>
            </div>
            <div className="card">
              <div className="cardBody">
                <h3>Planning guide</h3>
                <p>Explore port tips, embarkation guidance, and pre-cruise planning reminders.</p>
                <a className="mutebtn" href="/cruises-from-galveston/how-to-plan">
                  Planning guide
                </a>
              </div>
            </div>
            <div className="card">
              <div className="cardBody">
                <h3>Explore sailings</h3>
                <p>Compare ships, itineraries, and travel dates departing from Galveston.</p>
                <a className="btn" href="/cruises-from-galveston/visitor-info#sailings">
                  Explore sailings
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CvbSailingsSnapshot />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card">
            <div className="cardBody">
              <h4>Pre-drive checklist</h4>
              <ul className="sectionDesc" style={{ margin: 0, paddingLeft: 18 }}>
                <li>Vehicle serviced (tires, oil, fluids).</li>
                <li>Printed parking reservation confirmation.</li>
                <li>Hotel confirmation if staying overnight.</li>
                <li>Boarding passes and luggage tags printed.</li>
                <li>Snacks and water for the road.</li>
                <li>
                  Terminal address: <span className="mono">2502 Harborside Drive, Galveston, TX 77550</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="grid3">
            <div className="card">
              <div className="cardBody">
                <p>
                  This site operates as a visitor-style planning resource focused on cruise departures from the Port of
                  Galveston and surrounding travel services.
                </p>
              </div>
            </div>
            <div className="card">
              <div className="cardBody">
                <strong>Asistencia en espanol disponible</strong>
                <p>
                  Ofrecemos apoyo en espanol para la planificacion de cruceros, hoteles y transporte hacia el Puerto de
                  Galveston.
                </p>
              </div>
            </div>
            <div className="card">
              <div className="cardBody">
                <p>
                  Planning assistance is available to help travelers coordinate cruises, accommodations, and
                  transportation with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
