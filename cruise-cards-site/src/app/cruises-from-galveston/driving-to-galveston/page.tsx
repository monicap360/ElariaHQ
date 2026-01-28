import type { Metadata } from "next";
import "../visitor-info/visitor-info.css";

export const metadata: Metadata = {
  title: "Driving to Galveston for Your Cruise",
  description:
    "A visitor-style driving guide to the Port of Galveston with regional routes, travel times, and planning tips for cruise travelers.",
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
    note: "Asistencia en espanol disponible: apoyo en planificacion de transporte y hoteles.",
  },
];

const centralNorthTexas = [
  {
    slug: "houston",
    title: "Houston",
    driveTime: "~1 hour (traffic dependent)",
    route: "I-45 South",
    tip:
      "Even short-distance travelers should arrive early due to terminal traffic and boarding schedules, especially on weekends.",
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
    tip: "These routes are popular for weekend and mid-length cruises. Leave extra time for Houston traffic.",
  },
];

const nearbyStates = [
  {
    slug: "louisiana",
    title: "Louisiana",
    driveTime: "~4-6 hours (city dependent)",
    route: "I-10 West -> I-45 South",
    tip:
      "Travelers from Baton Rouge, Lafayette, Lake Charles, and Shreveport often drive to avoid flights and baggage restrictions.",
  },
  {
    slug: "missouri",
    title: "Missouri",
    driveTime: "~12-14 hours",
    route: "I-44 -> I-49 -> I-45 South",
    tip: "Missouri travelers often split the drive over two days or fly into Houston and drive the final leg.",
  },
];

export default function DrivingToGalvestonPage() {
  return (
    <main>
      <header className="hero">
        <div className="wrap">
          <div className="heroCard">
            <div className="heroInner">
              <div>
                <div className="kicker">Texas Gulf Coast • Port of Galveston</div>
                <h1 className="heroTitle">Driving to the Port of Galveston</h1>
                <p className="heroLead">
                  Driving to Galveston is one of the most popular ways to start a cruise, especially for travelers
                  across Texas and the central United States. This guide covers travel times, route planning tips, and
                  arrival recommendations for cruise day.
                </p>
                <div className="heroMeta" role="list" aria-label="Highlights">
                  <span className="tag" role="listitem">
                    Regional drive times
                  </span>
                  <span className="tag" role="listitem">
                    Planning tips
                  </span>
                  <span className="tag" role="listitem">
                    Arrival guidance
                  </span>
                </div>
              </div>
              <aside className="heroAside" aria-label="Visitor Notes">
                <h3>General driving tips</h3>
                <p>
                  Plan to arrive the day before when possible, allow extra time near Houston and the causeway, and
                  pre-book parking or transportation services in advance.
                </p>
                <div className="asideRow">
                  <a className="ghost" href="#south-texas">
                    South Texas
                  </a>
                  <a className="ghost" href="#central-texas">
                    Central & North Texas
                  </a>
                  <a className="ghost" href="#nearby-states">
                    Nearby States
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h2 className="sectionTitle">General driving tips</h2>
              <p className="sectionDesc">
                Before reviewing city-specific routes, keep these cruise-day essentials in mind.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="cardBody">
              <ul className="sectionDesc" style={{ margin: 0, paddingLeft: 18 }}>
                <li>Arrive in Galveston the day before your cruise when possible.</li>
                <li>Allow extra time for traffic near Houston and the causeway.</li>
                <li>Pre-book cruise parking or transportation services.</li>
                <li>Keep cruise documents easily accessible on embarkation day.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="south-texas" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h2 className="sectionTitle">Driving from South Texas</h2>
              <p className="sectionDesc">Routes and recommendations for Corpus Christi, Kingsville, and the Rio Grande Valley.</p>
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
                  {city.note ? <p className="small">{city.note}</p> : null}
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
              <h2 className="sectionTitle">Driving from Central & North Texas</h2>
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
              <h2 className="sectionTitle">Driving from Nearby States</h2>
              <p className="sectionDesc">Longer-distance guidance for regional drive-to-cruise travelers.</p>
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
              Follow signage for the Port of Galveston cruise terminals, expect increased traffic on embarkation
              mornings, and look for clearly marked parking and drop-off areas. Arriving early and prepared helps make
              the boarding process smooth and predictable.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h2 className="sectionTitle">Your next steps</h2>
              <p className="sectionDesc">
                Now that your drive is planned, continue with the rest of your trip preparation.
              </p>
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/cruises-from-galveston/visitor-info#sailings" className="btn">
                Explore current sailings
              </a>
              <a href="/cruises-from-galveston/how-to-plan" className="ghost" style={{ color: "var(--navy)" }}>
                Review port planning tips
              </a>
            </div>
            <p className="sectionDesc" style={{ marginTop: 10 }}>
              Pro tip: Use the search filters to align sailings with your preferred travel dates.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card">
            <div className="cardBody">
              <h4>Pre-drive checklist</h4>
              <ul className="sectionDesc" style={{ margin: 0, paddingLeft: 18 }}>
                <li>Vehicle serviced (tires, oil, fluids).</li>
                <li>Parking reservation confirmation saved or printed.</li>
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
    </main>
  );
}
