import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";
import DrivePageNextSteps from "@/components/DrivePageNextSteps";
import DrivePageLinks from "@/components/DrivePageLinks";

export const metadata: Metadata = {
  title: "Driving to Galveston from Tulsa | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Tulsa, including estimated drive time and embarkation planning tips.",
};

export default function FromTulsaPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Tulsa</h1>
          <p className="sectionDesc">
            Tulsa travelers often plan a one-day drive or overnight stop when cruising from Galveston.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            Expect <strong>9 to 10 hours</strong> of driving time depending on route and traffic.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CvbSailingsSnapshot />
        </div>
      </section>

      <DrivePageLinks slug="tulsa" />
      <DrivePageNextSteps />
    </main>
  );
}
