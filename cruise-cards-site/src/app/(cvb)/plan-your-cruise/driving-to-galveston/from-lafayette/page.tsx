import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";
import DrivePageNextSteps from "@/components/DrivePageNextSteps";
import DrivePageLinks from "@/components/DrivePageLinks";

export const metadata: Metadata = {
  title: "Driving to Galveston from Lafayette, LA | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Lafayette, Louisiana, including drive time and embarkation tips.",
};

export default function FromLafayettePage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Lafayette</h1>
          <p className="sectionDesc">
            Lafayette travelers often drive to Galveston for convenient Gulf Coast cruise departures.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive usually takes <strong>about 4 to 5 hours</strong>.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CvbSailingsSnapshot />
        </div>
      </section>

      <DrivePageLinks slug="lafayette" />
      <DrivePageNextSteps />
    </main>
  );
}
