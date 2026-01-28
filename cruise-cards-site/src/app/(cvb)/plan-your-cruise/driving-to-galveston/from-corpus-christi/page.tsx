import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";

export const metadata: Metadata = {
  title: "Driving to Galveston from Corpus Christi | Cruise Planning Guide",
  description:
    "A practical visitor guide for driving to Galveston from Corpus Christi, including drive time, route tips, and embarkation planning.",
};

export default function FromCorpusChristiPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Corpus Christi</h1>
          <p className="sectionDesc">
            Corpus Christi is a popular starting point for drive-to cruises departing from the Port of Galveston.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from Corpus Christi to Galveston typically takes approximately <strong>4.5 to 5 hours</strong>,
            depending on traffic and departure time.
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
            <li>Depart Corpus Christi early morning or the day before sailing.</li>
            <li>Consider overnight lodging near the port.</li>
            <li>Allow buffer time for coastal traffic and Houston-area congestion.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for Corpus Christi travelers</h2>
          <p>
            Galveston offers a straightforward drive route, multiple parking options, and year-round cruise departures
            — making it a practical choice for South Texas travelers.
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
