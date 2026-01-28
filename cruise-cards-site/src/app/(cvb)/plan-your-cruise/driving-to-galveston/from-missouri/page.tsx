import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";
import DrivePageNextSteps from "@/components/DrivePageNextSteps";
import DrivePageLinks from "@/components/DrivePageLinks";

export const metadata: Metadata = {
  title: "Driving to Galveston from Missouri | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Missouri, including travel time expectations, multi-day planning tips, and cruise embarkation guidance.",
};

export default function FromMissouriPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Missouri</h1>
          <p className="sectionDesc">
            Missouri travelers often choose Galveston for Gulf Coast cruise departures, particularly when planning
            longer itineraries and a more extended vacation window.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            Driving from Missouri to Galveston typically takes <strong>about 12 to 14+ hours</strong>, depending on your
            starting city, route, and stops.
          </p>
          <p>
            <strong>Primary route:</strong> I-44 -> I-49 -> I-45 South.
          </p>
          <div className="card" style={{ marginTop: 18 }}>
            <div className="cardBody">
              <p>
                For most Missouri travelers, a <strong>two-day drive</strong> or an overnight stop is recommended to
                reduce travel fatigue before embarkation day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Recommended arrival strategy</h2>
          <ul className="linkList">
            <li>Plan an overnight stop en route or arrive 1-2 days early.</li>
            <li>Consider a pre-cruise hotel near the port for a calmer departure.</li>
            <li>Choose longer cruise lengths (6-8+ nights) to maximize travel value.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for Midwest travelers</h2>
          <p>
            Galveston offers a consistent cruise schedule and a clear drive-to planning path for travelers who prefer
            to control their itinerary and avoid flight disruptions.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CvbSailingsSnapshot />
        </div>
      </section>

      <DrivePageLinks slug="missouri" />
      <DrivePageNextSteps />
    </main>
  );
}
