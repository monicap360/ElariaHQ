import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";

export const metadata: Metadata = {
  title: "Driving to Galveston from Palmview | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Palmview, TX, including drive time, route details, and bilingual planning reassurance.",
};

export default function FromPalmviewPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Palmview</h1>
          <p className="sectionDesc">
            Palmview travelers often plan a relaxed overnight stop near Galveston to make embarkation day easier.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from Palmview to Galveston typically takes approximately <strong>6.5 to 7.5 hours</strong>,
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
            <li>Allow extra time for Houston-area traffic on the final leg.</li>
            <li>Pre-book parking and keep cruise documents ready.</li>
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
          <h2 className="sectionTitle">Why Galveston works for Palmview travelers</h2>
          <p>
            With consistent cruise departures and multiple parking options, Galveston remains a reliable drive-to
            cruise choice for Rio Grande Valley residents.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CvbSailingsSnapshot />
        </div>
      </section>
    </main>
  );
}
