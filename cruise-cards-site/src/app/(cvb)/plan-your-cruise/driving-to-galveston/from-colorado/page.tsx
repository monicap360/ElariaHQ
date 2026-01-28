import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";
import DrivePageNextSteps from "@/components/DrivePageNextSteps";
import DrivePageLinks from "@/components/DrivePageLinks";

export const metadata: Metadata = {
  title: "Driving to Galveston from Colorado | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Colorado, including multi-day travel planning, estimated drive time, and cruise embarkation tips.",
};

export default function FromColoradoPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Colorado</h1>
          <p className="sectionDesc">
            Colorado travelers often plan multi-day drives or combine driving with flights when cruising from Galveston.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            Driving from Colorado to Galveston typically takes <strong>15 to 18+ hours</strong>, depending on your
            starting city and route.
          </p>
          <div className="card" style={{ marginTop: 18 }}>
            <div className="cardBody">
              <p>
                Most Colorado travelers benefit from a <strong>two-day drive</strong> or a pre-cruise overnight stay
                near the port.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Recommended arrival strategy</h2>
          <ul className="linkList">
            <li>Plan a two-day drive or fly into Houston and transfer.</li>
            <li>Arrive at least one day before sailing.</li>
            <li>Choose longer itineraries (6-8+ nights) to maximize travel value.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for Mountain West travelers</h2>
          <p>
            Galveston provides consistent cruise schedules and a clear planning path for travelers combining
            long-distance travel with Gulf Coast departures.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CvbSailingsSnapshot />
        </div>
      </section>

      <DrivePageLinks slug="colorado" />
      <DrivePageNextSteps />
    </main>
  );
}
