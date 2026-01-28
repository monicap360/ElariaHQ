import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";
import DrivePageNextSteps from "@/components/DrivePageNextSteps";
import DrivePageLinks from "@/components/DrivePageLinks";

export const metadata: Metadata = {
  title: "Driving to Galveston from Little Rock | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Little Rock, Arkansas, including drive time and embarkation planning tips.",
};

export default function FromLittleRockPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Little Rock</h1>
          <p className="sectionDesc">
            Little Rock travelers frequently choose Galveston for Gulf Coast cruise departures.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            Expect <strong>about 7 to 8 hours</strong> of driving time.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CvbSailingsSnapshot />
        </div>
      </section>

      <DrivePageLinks slug="little-rock" />
      <DrivePageNextSteps />
    </main>
  );
}
