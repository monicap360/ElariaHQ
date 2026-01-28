import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";

export const metadata: Metadata = {
  title: "Driving to Galveston from Mission | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Mission, TX, including drive time, route details, and bilingual planning reassurance.",
};

export default function FromMissionPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Mission</h1>
          <p className="sectionDesc">
            Mission and Palmview travelers often treat the drive as part of the vacation experience, planning a relaxed
            arrival in Galveston.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from Mission to Galveston typically takes approximately <strong>6.5 to 7.5 hours</strong>,
            depending on traffic and departure time.
          </p>
          <p>
            <strong>Primary route:</strong> I-2 East -> US-77 North -> I-69E North -> I-45 South.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Recommended arrival strategy</h2>
          <ul className="linkList">
            <li>Plan an overnight stay near the port the night before sailing.</li>
            <li>Build buffer time for longer highway stretches and Houston traffic.</li>
            <li>Arrive with documents and parking confirmation ready.</li>
          </ul>
          <div className="card" style={{ marginTop: 16 }}>
            <div className="cardBody">
              <strong>Asistencia en espanol disponible.</strong>
              <p>Apoyo en espanol para viajeros del Valle del Rio Grande.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for Mission travelers</h2>
          <p>
            Galveston provides year-round departures and multiple parking options, making it a dependable drive-to
            cruise option for Rio Grande Valley travelers.
          </p>
        </div>
      </section>
    </main>
  );
}
