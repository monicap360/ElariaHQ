import type { Metadata } from "next";
import "../../../../cruises-from-galveston/visitor-info/visitor-info.css";

export const metadata: Metadata = {
  title: "Driving to Galveston from Missouri | Cruise Planning Guide",
  description:
    "A visitor guide for driving to Galveston from Missouri, including long-distance planning tips, drive time, and arrival recommendations.",
};

export default function FromMissouriPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Drive-To Cruise Guide</div>
          <h1 className="heroTitle">Driving to Galveston from Missouri</h1>
          <p className="sectionDesc">
            Missouri travelers often plan a longer drive-to-cruise itinerary with an overnight stop and a more relaxed
            embarkation schedule.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Estimated drive time</h2>
          <p>
            The drive from Missouri to Galveston typically takes approximately <strong>12 to 14+ hours</strong>,
            depending on starting city, traffic, and rest stops.
          </p>
          <p>
            <strong>Primary route:</strong> I-44 -> I-49 -> I-45 South.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Recommended arrival strategy</h2>
          <ul className="linkList">
            <li>Split the drive over two days when possible.</li>
            <li>Consider a longer sailing (6-8 nights) to balance the travel time.</li>
            <li>Plan an overnight stay near the port to ensure a calm embarkation morning.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Why Galveston works for Missouri travelers</h2>
          <p>
            Galveston offers a full calendar of year-round sailings and the flexibility to drive on your own schedule,
            making it a strong option for longer-distance travelers.
          </p>
        </div>
      </section>
    </main>
  );
}
