import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";
import DrivePageNextSteps from "@/components/DrivePageNextSteps";
import DrivePageLinks from "@/components/DrivePageLinks";

export const metadata: Metadata = {
  title: "Driving to Galveston from Dallas-Fort Worth | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Dallas-Fort Worth, including drive time, arrival planning, and embarkation-day tips.",
};

export default function FromDFWPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Dallas-Fort Worth</h1>
          <p className="sectionDesc">
            Dallas-Fort Worth is one of the largest drive-to markets for cruises departing from the Port of Galveston.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from Dallas-Fort Worth to Galveston typically takes <strong>about 5 to 6 hours</strong>, depending
            on traffic and the route you choose.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Recommended arrival strategy</h2>
          <ul className="linkList">
            <li>For morning boarding, consider arriving the night before.</li>
            <li>Allow buffer time for Houston traffic and the causeway.</li>
            <li>Secure parking or transportation arrangements ahead of time.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for North Texas travelers</h2>
          <p>
            Galveston offers a practical drive-to cruise option without the added complexity of flying to distant
            coastal ports, making it a popular choice for North Texas travelers.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CvbSailingsSnapshot />
        </div>
      </section>

      <DrivePageLinks slug="dallas-fort-worth" />
      <DrivePageNextSteps />
    </main>
  );
}
