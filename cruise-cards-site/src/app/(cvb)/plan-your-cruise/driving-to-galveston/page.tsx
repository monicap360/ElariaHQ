import type { Metadata } from "next";
import "../../../cruises-from-galveston/visitor-info/visitor-info.css";
import CvbSailingsSnapshot from "@/components/CvbSailingsSnapshot";

export const metadata: Metadata = {
  title: "Driving to Galveston for a Cruise | Visitor Guide",
  description:
    "A visitor-style guide to driving to Galveston for your cruise, including drive times, parking, and planning tips from major cities and states.",
};

export default function DrivingToGalvestonPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="kicker">Visitor Planning</div>
          <h1 className="heroTitle">Driving to Galveston for Your Cruise</h1>
          <p className="sectionDesc">
            Driving to Galveston is one of the most popular ways to begin a cruise, particularly for travelers from
            Texas, the central United States, and northern Mexico.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p>
            Many cruise guests choose Galveston because it allows them to travel on their own schedule, manage luggage
            easily, and arrive close to the terminal on embarkation day.
          </p>

          <div className="card" style={{ marginTop: 20 }}>
            <div className="cardBody">
              <p>
                Based on observed travel patterns, most drive-to cruise travelers aim to arrive in Galveston either the
                night before sailing or early on embarkation morning.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="sectionTitle">Common drive-to regions</h2>

          <ul className="linkList">
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-corpus-christi">Driving from Corpus Christi</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-kingsville">Driving from Kingsville</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-mission">Driving from Mission, TX</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-palmview">Driving from Palmview, TX</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-houston">Driving from Houston</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth">
                Driving from Dallas-Fort Worth
              </a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-austin">Driving from Austin</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-san-antonio">Driving from San Antonio</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-oklahoma-city">Driving from Oklahoma City</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-tulsa">Driving from Tulsa</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-baton-rouge">Driving from Baton Rouge</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-lafayette">Driving from Lafayette</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-lake-charles">Driving from Lake Charles</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-shreveport">Driving from Shreveport</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-little-rock">Driving from Little Rock</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-missouri">Driving from Missouri</a>
            </li>
            <li>
              <a href="/plan-your-cruise/driving-to-galveston/from-colorado">Driving from Colorado</a>
            </li>
          </ul>
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
