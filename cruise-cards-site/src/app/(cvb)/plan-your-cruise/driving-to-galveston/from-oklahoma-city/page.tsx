import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";

export const metadata: Metadata = {
  title: "Driving to Galveston from Oklahoma City | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Oklahoma City, including drive time, overnight planning, and embarkation tips.",
};

export default function FromOKCPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Oklahoma City</h1>
          <p className="sectionDesc">
            Oklahoma City travelers often choose Galveston for drive-to cruise departures and predictable logistics.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive typically takes <strong>about 8 to 9 hours</strong>, depending on route and stops.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Recommended arrival strategy</h2>
          <ul className="linkList">
            <li>Arrive the day before sailing.</li>
            <li>Consider an overnight stop if departing late.</li>
            <li>Allow buffer time for Houston-area traffic.</li>
          </ul>
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
