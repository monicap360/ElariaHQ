import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";
import DrivePageNextSteps from "@/components/DrivePageNextSteps";
import DrivePageLinks from "@/components/DrivePageLinks";

export const metadata: Metadata = {
  title: "Driving to Galveston from San Antonio | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from San Antonio, including drive time, arrival planning, and embarkation-day tips.",
};

export default function FromSanAntonioPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from San Antonio</h1>
          <p className="sectionDesc">
            San Antonio travelers frequently choose Galveston for drive-to cruising and straightforward embarkation day
            logistics.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from San Antonio to Galveston typically takes <strong>about 4.5 to 5 hours</strong>, depending on
            traffic and route.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Recommended arrival strategy</h2>
          <ul className="linkList">
            <li>For a calmer embarkation, arrive the day before sailing.</li>
            <li>Plan buffer time approaching Houston and Galveston.</li>
            <li>Confirm parking or transportation services before departure.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for San Antonio travelers</h2>
          <p>
            Galveston offers year-round cruise departures and allows travelers to start their vacation on the Texas
            coast without relying on flight schedules or baggage restrictions.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CvbSailingsSnapshot />
        </div>
      </section>

      <DrivePageLinks slug="san-antonio" />
      <DrivePageNextSteps />
    </main>
  );
}
