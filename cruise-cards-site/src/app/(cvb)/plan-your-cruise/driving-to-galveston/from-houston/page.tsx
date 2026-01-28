import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";

export const metadata: Metadata = {
  title: "Driving to Galveston from Houston | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Houston, including drive time, traffic considerations, and embarkation-day tips.",
};

export default function FromHoustonPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Houston</h1>
          <p className="sectionDesc">
            Houston is the closest major metro area to the Port of Galveston and a primary starting point for cruise
            travelers.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from Houston to Galveston typically takes <strong>about 1 to 1.25 hours</strong>, depending on
            traffic and departure time.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Recommended arrival strategy</h2>
          <ul className="linkList">
            <li>Plan extra buffer time during morning rush hours.</li>
            <li>Account for causeway traffic approaching the island.</li>
            <li>Confirm terminal assignment before departure.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for Houston travelers</h2>
          <p>Proximity allows flexible arrival times and same-day travel for many sailings.</p>
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
