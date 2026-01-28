import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";

export const metadata: Metadata = {
  title: "Driving to Galveston from Kingsville | Cruise Planning Guide",
  description:
    "A practical visitor guide for driving to Galveston from Kingsville, including estimated drive time, route guidance, and embarkation planning tips.",
};

export default function FromKingsvillePage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Kingsville</h1>
          <p className="sectionDesc">
            Kingsville travelers often choose Galveston for its drive-to convenience and straightforward embarkation
            experience.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from Kingsville to Galveston typically takes <strong>about 5 to 5.5 hours</strong>, depending on
            traffic and departure time.
          </p>
          <p>
            <strong>Primary route:</strong> US-77 North -> I-69E North -> I-45 South.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Recommended arrival strategy</h2>
          <ul className="linkList">
            <li>Plan for an early departure or arrive the day before sailing.</li>
            <li>Allow extra time as you approach the Houston metro area.</li>
            <li>Confirm parking or transportation before cruise day.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for Kingsville travelers</h2>
          <p>
            For South Texas travelers, Galveston provides a predictable highway drive and a practical alternative to
            flying to out-of-state cruise ports.
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
