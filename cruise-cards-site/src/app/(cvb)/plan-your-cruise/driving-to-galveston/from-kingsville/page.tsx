import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";

export const metadata: Metadata = {
  title: "Driving to Galveston from Kingsville | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Kingsville, including drive time, route details, and planning recommendations.",
};

export default function FromKingsvillePage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Kingsville</h1>
          <p className="sectionDesc">
            Kingsville is a common starting point for South Texas travelers heading to cruises departing from Galveston.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from Kingsville to Galveston typically takes approximately <strong>5 to 5.5 hours</strong>,
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
            <li>Plan an early departure to avoid afternoon congestion.</li>
            <li>Allow extra time as you approach Houston.</li>
            <li>Consider overnight lodging near the port for early boarding windows.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for Kingsville travelers</h2>
          <p>
            The route from Kingsville is straightforward and well-suited for families or travelers with extra luggage,
            making Galveston a practical drive-to cruise choice.
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
