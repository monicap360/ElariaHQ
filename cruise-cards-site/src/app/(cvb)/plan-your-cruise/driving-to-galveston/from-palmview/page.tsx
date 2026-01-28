import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";

export const metadata: Metadata = {
  title: "Driving to Galveston from Palmview, TX | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Palmview, Texas (Rio Grande Valley), including drive time, route planning, and embarkation tips.",
};

export default function FromPalmviewPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Palmview, Texas</h1>
          <p className="sectionDesc">
            Palmview and nearby Rio Grande Valley communities often travel to Galveston by car to simplify cruise
            logistics and maintain schedule control.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from Palmview to Galveston typically takes <strong>about 6.5 to 7.5 hours</strong>, depending on
            traffic, departure time, and stops.
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
            <li>Arrive the night before sailing whenever possible.</li>
            <li>Build extra time for Houston-area congestion.</li>
            <li>Confirm parking or transfer arrangements in advance.</li>
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
          <h2 className="sectionTitle">Why Galveston works for Palmview travelers</h2>
          <p>
            Galveston offers a Gulf Coast cruise departure that is accessible by highway and well-suited for
            multi-family or group travel from South Texas.
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
