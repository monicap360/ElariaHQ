import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";
import DrivePageNextSteps from "@/components/DrivePageNextSteps";
import DrivePageLinks from "@/components/DrivePageLinks";

export const metadata: Metadata = {
  title: "Driving to Galveston from Houston | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Houston, including drive time, traffic considerations, and embarkation-day tips.",
};

export default function FromHoustonPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How long does it take to drive to Galveston from Houston?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Driving from Houston to the Port of Galveston typically takes about 1 to 1.25 hours depending on traffic and departure time.",
                },
              },
              {
                "@type": "Question",
                name: "Is same-day driving to a Galveston cruise realistic from Houston?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Yes. Many Houston-area travelers drive the same day, but it is still recommended to allow extra buffer time for traffic and causeway delays.",
                },
              },
              {
                "@type": "Question",
                name: "What is the primary driving route from Houston to Galveston?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "The most common route is I-45 South directly to the island, following terminal signage once you arrive in Galveston.",
                },
              },
            ],
          }),
        }}
      />
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

      <DrivePageLinks slug="houston" />
      <DrivePageNextSteps />
    </main>
  );
}
