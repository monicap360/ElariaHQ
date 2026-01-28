import Link from "next/link";

export default function DrivePageNextSteps() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">Next steps for cruise planning</h2>
            <p className="sectionDesc">
              Continue planning your trip with the Galveston driving hub, visitor sailing search, and planning guide.
            </p>
          </div>
        </div>
        <div className="grid3">
          <div className="card">
            <div className="cardBody">
              <h4>Driving hub</h4>
              <p>Return to the full drive-to guide and compare regional routes.</p>
              <Link className="mutebtn" href="/plan-your-cruise/driving-to-galveston">
                Driving hub
              </Link>
            </div>
          </div>
          <div className="card">
            <div className="cardBody">
              <h4>Planning guide</h4>
              <p>Review port arrival tips, parking guidance, and embarkation reminders.</p>
              <Link className="mutebtn" href="/cruises-from-galveston/how-to-plan">
                Planning guide
              </Link>
            </div>
          </div>
          <div className="card">
            <div className="cardBody">
              <h4>Explore sailings</h4>
              <p>Browse upcoming departures and match dates to your travel plan.</p>
              <Link className="btn" href="/cruises-from-galveston/visitor-info#sailings">
                Explore sailings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
