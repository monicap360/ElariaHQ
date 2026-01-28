import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";
import DrivePageNextSteps from "@/components/DrivePageNextSteps";
import DrivePageLinks from "@/components/DrivePageLinks";

export const metadata: Metadata = {
  title: "Driving to Galveston from Austin | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Austin, including drive time, arrival planning, and embarkation day tips for cruise travelers.",
};

export default function FromAustinPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Austin</h1>
          <p className="sectionDesc">
            Austin travelers often drive to Galveston to begin their cruise with predictable logistics and flexible
            arrival timing.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from Austin to Galveston typically takes <strong>about 4 to 4.5 hours</strong>, depending on
            traffic and departure time.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Recommended arrival strategy</h2>
          <ul className="linkList">
            <li>Depart early or arrive the day before for morning check-in windows.</li>
            <li>Build buffer time for Houston-area traffic.</li>
            <li>Confirm parking or port transfer details before travel day.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for Austin travelers</h2>
          <p>
            Galveston provides a Gulf Coast departure that is accessible by highway and offers year-round cruise
            options suited to weekend, mid-length, and longer itineraries.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CvbSailingsSnapshot />
        </div>
      </section>

      <DrivePageLinks slug="austin" />
      <DrivePageNextSteps />
    </main>
  );
}
