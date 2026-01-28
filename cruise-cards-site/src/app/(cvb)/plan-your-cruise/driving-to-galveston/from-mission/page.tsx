import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";

export const metadata: Metadata = {
  title: "Driving to Galveston from Mission, TX | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Mission, Texas (Rio Grande Valley), with estimated drive time and practical embarkation planning tips.",
};

export default function FromMissionPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Mission, Texas</h1>
          <p className="sectionDesc">
            Mission and Rio Grande Valley travelers commonly drive to Galveston to begin their cruise with greater
            flexibility and fewer flight variables.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from Mission to Galveston typically takes <strong>about 6.5 to 7.5 hours</strong>, depending on
            route, traffic, and stops.
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
            <li>Strongly consider arriving in Galveston the day before sailing.</li>
            <li>Plan buffer time for Houston-area traffic.</li>
            <li>Confirm parking, luggage plan, and terminal arrival window.</li>
          </ul>
          <div className="card" style={{ marginTop: 16 }}>
            <div className="cardBody">
              <strong>Asistencia en espanol disponible</strong>
              <p>
                Ofrecemos apoyo en espanol para la planificacion de cruceros, hoteles y transporte hacia el Puerto de
                Galveston.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for Mission travelers</h2>
          <p>
            Galveston offers a reliable Gulf Coast departure point with year-round sailings and practical drive-to
            planning for South Texas guests.
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
