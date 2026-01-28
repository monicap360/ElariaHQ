import type { Metadata } from "next";
import VisitorSearch from "./VisitorSearch";

export const metadata: Metadata = {
  title: "Cruising from Galveston | Visitor Information",
  description:
    "Visitor-style guide to cruising from Galveston: destinations, sailings, terminals, parking, and planning tips.",
};

const styleText = `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap");
:root{
  --navy:#0F2A3D;
  --slate:#152F3A;
  --sand:#EDE9E3;
  --ivory:#F8F6F2;
  --mist:#E7EEF1;
  --teal:#6FA3A1;
  --text:#121417;
  --muted:#5C6B74;
  --line:rgba(15,42,61,.14);
  --shadow:0 18px 50px rgba(15,42,61,.10);
  --radius:20px;
  --radius2:28px;
  --max:1140px;
}

*{ box-sizing:border-box; }
html,body{ height:100%; }
body{
  margin:0;
  font-family:Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color:var(--text);
  background:linear-gradient(180deg, var(--ivory), #ffffff 55%);
  letter-spacing:.1px;
}
a{ color:inherit; text-decoration:none; }
button, input, select{ font:inherit; }

/* Layout */
.wrap{ max-width:var(--max); margin:0 auto; padding:0 22px; }
.topbar{
  position:sticky; top:0; z-index:10;
  background:rgba(248,246,242,.82);
  backdrop-filter: blur(14px);
  border-bottom:1px solid var(--line);
}
.nav{
  display:flex; align-items:center; justify-content:space-between;
  height:74px;
  gap:18px;
}
.brand{
  display:flex; align-items:center; gap:12px;
  min-width:220px;
}
.mark{
  width:40px; height:40px; border-radius:14px;
  background:conic-gradient(from 210deg, var(--navy), var(--teal), var(--navy));
  box-shadow:0 10px 24px rgba(15,42,61,.18);
}
.brand h1{
  margin:0;
  font-family:"Cormorant Garamond", serif;
  font-weight:600;
  letter-spacing:.2px;
  font-size:20px;
  line-height:1;
  color:var(--navy);
}
.brand .sub{
  display:block;
  font-size:12px;
  color:var(--muted);
  margin-top:4px;
  letter-spacing:.22em;
  text-transform:uppercase;
}
.menu{
  display:flex; gap:16px; align-items:center;
  color:var(--slate);
  font-size:13px;
  letter-spacing:.06em;
  text-transform:uppercase;
  white-space:nowrap;
}
.menu a{
  padding:10px 10px;
  border-radius:12px;
  transition:background .2s ease;
}
.menu a:hover{ background:rgba(15,42,61,.06); }
.cta{
  display:flex; align-items:center; gap:10px;
  min-width:240px; justify-content:flex-end;
}
.pill{
  display:inline-flex; align-items:center; gap:10px;
  padding:10px 14px;
  border-radius:999px;
  border:1px solid var(--line);
  background:rgba(255,255,255,.72);
  color:var(--slate);
  font-size:12px;
}
.btn{
  display:inline-flex; align-items:center; justify-content:center;
  padding:11px 14px;
  border-radius:999px;
  border:1px solid var(--navy);
  background:var(--navy);
  color:#fff;
  font-size:12px;
  letter-spacing:.08em;
  text-transform:uppercase;
  box-shadow:0 14px 30px rgba(15,42,61,.18);
  transition:transform .15s ease, box-shadow .15s ease, opacity .15s ease;
  cursor:pointer;
}
.btn:hover{ transform:translateY(-1px); box-shadow:0 16px 36px rgba(15,42,61,.22); }
.btn:disabled{ opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }

/* Hero */
.hero{
  padding:48px 0 22px;
}
.heroCard{
  border-radius:var(--radius2);
  overflow:hidden;
  border:1px solid var(--line);
  background:
    radial-gradient(1200px 600px at 10% 0%, rgba(111,163,161,.24), transparent 60%),
    radial-gradient(900px 520px at 90% 20%, rgba(15,42,61,.18), transparent 55%),
    linear-gradient(180deg, rgba(15,42,61,.92), rgba(15,42,61,.82));
  color:#fff;
  box-shadow:var(--shadow);
  position:relative;
}
.heroInner{
  padding:44px 32px 32px;
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap:26px;
  align-items:end;
}
.kicker{
  font-size:12px;
  letter-spacing:.28em;
  text-transform:uppercase;
  opacity:.85;
}
.heroTitle{
  margin:10px 0 12px;
  font-family:"Cormorant Garamond", serif;
  font-weight:600;
  font-size:46px;
  line-height:1.04;
  letter-spacing:.2px;
}
.heroLead{
  margin:0;
  font-size:15.5px;
  line-height:1.55;
  opacity:.9;
  max-width:56ch;
}
.heroMeta{
  display:flex; flex-wrap:wrap; gap:10px;
  margin-top:18px;
}
.tag{
  display:inline-flex; align-items:center;
  padding:10px 12px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.22);
  background:rgba(255,255,255,.06);
  font-size:12px;
  letter-spacing:.06em;
  text-transform:uppercase;
  opacity:.95;
}
.heroAside{
  border:1px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.06);
  border-radius:22px;
  padding:18px 18px 16px;
}
.heroAside h3{
  margin:0 0 10px;
  font-family:"Cormorant Garamond", serif;
  font-weight:600;
  font-size:20px;
  letter-spacing:.2px;
}
.heroAside p{
  margin:0 0 14px;
  font-size:13.5px;
  line-height:1.5;
  opacity:.9;
}
.asideRow{
  display:flex; gap:10px; align-items:center; flex-wrap:wrap;
}
.ghost{
  display:inline-flex; align-items:center; justify-content:center;
  padding:10px 12px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.22);
  background:transparent;
  color:#fff;
  font-size:12px;
  letter-spacing:.08em;
  text-transform:uppercase;
  cursor:pointer;
}
.ghost:hover{ background:rgba(255,255,255,.08); }

/* Sections */
.section{
  padding:28px 0;
}
.sectionHeader{
  display:flex; justify-content:space-between; align-items:flex-end;
  gap:18px;
  margin-bottom:14px;
}
.sectionTitle{
  margin:0;
  font-family:"Cormorant Garamond", serif;
  font-weight:600;
  font-size:30px;
  letter-spacing:.2px;
  color:var(--navy);
}
.sectionDesc{
  margin:0;
  color:var(--muted);
  font-size:14px;
  line-height:1.55;
  max-width:70ch;
}
.grid3{
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:14px;
}
.card{
  border:1px solid var(--line);
  border-radius:var(--radius);
  background:#fff;
  box-shadow:0 10px 28px rgba(15,42,61,.06);
  overflow:hidden;
}
.cardBody{ padding:16px 16px 14px; }
.cardTop{
  height:108px;
  background:
    radial-gradient(280px 160px at 20% 0%, rgba(111,163,161,.26), transparent 60%),
    linear-gradient(180deg, rgba(15,42,61,.90), rgba(15,42,61,.74));
}
.card h4{
  margin:0 0 8px;
  font-family:"Cormorant Garamond", serif;
  font-weight:600;
  font-size:20px;
  color:var(--navy);
}
.card p{
  margin:0;
  color:var(--muted);
  font-size:13.8px;
  line-height:1.55;
}
.card .small{
  margin-top:10px;
  color:rgba(21,47,58,.72);
  font-size:12px;
  letter-spacing:.06em;
  text-transform:uppercase;
}

/* Search (CVB-style: quiet, editorial) */
.searchShell{
  border:1px solid var(--line);
  border-radius:var(--radius2);
  background:linear-gradient(180deg, #ffffff, rgba(237,233,227,.55));
  box-shadow:var(--shadow);
  overflow:hidden;
}
.searchTop{
  padding:18px 18px 10px;
  display:flex; align-items:flex-end; justify-content:space-between;
  gap:14px;
  border-bottom:1px solid var(--line);
  background:rgba(255,255,255,.72);
}
.searchTop h3{
  margin:0;
  font-family:"Cormorant Garamond", serif;
  font-weight:600;
  font-size:24px;
  color:var(--navy);
}
.searchTop .note{
  margin:0;
  font-size:12.5px;
  color:var(--muted);
  line-height:1.45;
  max-width:72ch;
}
.filters{
  padding:14px 18px 16px;
  display:grid;
  grid-template-columns: 1.25fr .9fr .9fr .7fr .7fr auto;
  gap:10px;
  align-items:end;
}
.field label{
  display:block;
  font-size:11px;
  color:rgba(21,47,58,.72);
  letter-spacing:.18em;
  text-transform:uppercase;
  margin:0 0 6px;
}
.field input, .field select{
  width:100%;
  padding:11px 12px;
  border-radius:14px;
  border:1px solid var(--line);
  background:#fff;
  outline:none;
  transition:border-color .15s ease, box-shadow .15s ease;
}
.field input:focus, .field select:focus{
  border-color:rgba(111,163,161,.8);
  box-shadow:0 0 0 4px rgba(111,163,161,.18);
}
.mutebtn{
  padding:11px 14px;
  border-radius:999px;
  border:1px solid var(--line);
  background:rgba(255,255,255,.75);
  color:var(--slate);
  font-size:12px;
  letter-spacing:.08em;
  text-transform:uppercase;
  cursor:pointer;
}
.mutebtn:hover{ background:#fff; }
.loading {
  opacity: 0.7;
  pointer-events: none;
}
.loading::after {
  content: "";
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-left: 8px;
  border: 2px solid var(--line);
  border-top-color: var(--teal);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}

.results{
  padding:6px 18px 18px;
}
.statusRow{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  padding:10px 0 12px;
  color:var(--muted);
  font-size:13px;
  border-bottom:1px solid var(--line);
  margin-bottom:12px;
}
.statusRow strong{ color:var(--slate); font-weight:600; }
.list{
  display:grid;
  grid-template-columns: 1fr;
  gap:10px;
}
.item{
  display:grid;
  grid-template-columns: 1.1fr .8fr .6fr .6fr auto;
  gap:12px;
  align-items:center;
  padding:14px 14px;
  border-radius:18px;
  border:1px solid var(--line);
  background:rgba(255,255,255,.88);
}
.item h5{
  margin:0;
  font-weight:600;
  color:var(--slate);
  font-size:14px;
  line-height:1.2;
}
.item .subline{
  margin-top:6px;
  font-size:12.5px;
  color:var(--muted);
  line-height:1.35;
}
.mono{
  font-variant-numeric: tabular-nums;
  font-feature-settings:"tnum" 1;
}
.price{
  font-weight:600;
  color:var(--navy);
  text-align:right;
}
.fineprint{
  display:block;
  margin-top:6px;
  font-size:11px;
  color:rgba(92,107,116,.92);
  line-height:1.35;
  text-align:right;
}

/* Footer */
.footer{
  margin-top:26px;
  padding:24px 0 36px;
  border-top:1px solid var(--line);
  color:var(--muted);
  font-size:12.8px;
  line-height:1.6;
}
.footgrid{
  display:grid;
  grid-template-columns: 1.2fr .8fr;
  gap:18px;
  align-items:start;
}
.footgrid h4{
  margin:0 0 8px;
  font-family:"Cormorant Garamond", serif;
  font-weight:600;
  color:var(--navy);
  font-size:18px;
}
.footlinks{
  display:flex; gap:10px; flex-wrap:wrap;
}
.footlinks a{
  padding:8px 10px;
  border:1px solid var(--line);
  border-radius:999px;
  background:#fff;
}

/* Responsive */
@media (max-width: 980px){
  .heroInner{ grid-template-columns:1fr; }
  .filters{ grid-template-columns:1fr 1fr; }
  .item{ grid-template-columns:1fr; text-align:left; }
  .price, .fineprint{ text-align:left; }
  .grid3{ grid-template-columns:1fr; }
  .menu{ display:none; }
  .cta{ min-width:auto; }
}

@media (prefers-reduced-motion: reduce){
  *{ scroll-behavior:auto !important; transition:none !important; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

export default function VisitorInfoPage() {
  return (
    <main>
      <style jsx global>
        {styleText}
      </style>

      <header className="topbar">
        <div className="wrap">
          <div className="nav">
            <div className="brand">
              <div className="mark" aria-hidden="true" />
              <div>
                <h1>
                  Cruising from Galveston <span className="sub">Visitor Information</span>
                </h1>
              </div>
            </div>

            <nav className="menu" aria-label="Primary">
              <a href="#destinations">Destinations</a>
              <a href="#port">Port Guide</a>
              <a href="#sailings">Sailings</a>
              <a href="#planning">Planning</a>
            </nav>

            <div className="cta">
              <div className="pill" title="Information desk style">
                <span aria-hidden="true">ℹ︎</span>
                <span>Guidance, not pressure</span>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() => document.querySelector("#sailings")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Sailings
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div className="heroCard">
            <div className="heroInner">
              <div>
                <div className="kicker">Texas Coast • Port of Galveston</div>
                <h2 className="heroTitle">A calm, informed start to your cruise journey.</h2>
                <p className="heroLead">
                  This site is designed in a Convention & Visitors Bureau tone—clear, neutral, and helpful. Explore
                  destinations and sailings departing from Galveston, plus practical guidance for terminal arrival,
                  parking, and planning.
                </p>
                <div className="heroMeta" role="list" aria-label="Highlights">
                  <span className="tag" role="listitem">
                    Year-round departures
                  </span>
                  <span className="tag" role="listitem">
                    Visitor-style guidance
                  </span>
                  <span className="tag" role="listitem">
                    Port & planning tips
                  </span>
                </div>
              </div>

              <aside className="heroAside" aria-label="Visitor Notes">
                <h3>How to use this guide</h3>
                <p>
                  Start with destinations, then review sailings. Prices shown (when available) are displayed as posted:
                  <strong> per person, double occupancy</strong>, including port expenses and government fees.
                </p>
                <div className="asideRow">
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => document.querySelector("#destinations")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Destinations
                  </button>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => document.querySelector("#port")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Port Guide
                  </button>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => document.querySelector("#sailings")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Sailings
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section id="destinations" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h3 className="sectionTitle">Destinations from Galveston</h3>
              <p className="sectionDesc">
                Neutral, visitor-friendly overviews for popular routes. Use these as planning references, then verify
                the sailing details in the “Explore Sailings” section.
              </p>
            </div>
          </div>

          <div className="grid3">
            <article className="card">
              <div className="cardTop" aria-hidden="true" />
              <div className="cardBody">
                <h4>The Bahamas</h4>
                <p>
                  Typically offered as <strong>8-day sailings</strong> from Galveston. Expect a relaxed, island-focused
                  itinerary designed for beach time and easy port days.
                </p>
                <div className="small">Visitor Note: Timing varies by season</div>
              </div>
            </article>

            <article className="card">
              <div className="cardTop" aria-hidden="true" />
              <div className="cardBody">
                <h4>Western Caribbean</h4>
                <p>
                  Common ports include Mexico and nearby Caribbean favorites. Many itineraries combine cultural stops
                  with shorter port distances for smoother sea days.
                </p>
                <div className="small">Visitor Note: Port calls can change</div>
              </div>
            </article>

            <article className="card">
              <div className="cardTop" aria-hidden="true" />
              <div className="cardBody">
                <h4>6-Day Routes</h4>
                <p>
                  Some sailings include a combination of <strong>Cozumel, Costa Maya, and Belize</strong>. These are
                  efficient itineraries for travelers who prefer a shorter cruise window without sacrificing variety.
                </p>
                <div className="small">Visitor Note: Verify dates & durations</div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="port" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h3 className="sectionTitle">Port of Galveston Guide</h3>
              <p className="sectionDesc">
                Planning essentials: arrival timing, terminals, and a calm checklist approach. This is informational—
                always follow your cruise line’s instructions.
              </p>
            </div>
          </div>

          <div className="grid3">
            <article className="card">
              <div className="cardBody">
                <h4>Arrival Timing</h4>
                <p>
                  Plan to arrive early enough for parking and check-in. Keep documents accessible and allow extra time
                  for traffic near the terminals.
                </p>
              </div>
            </article>
            <article className="card">
              <div className="cardBody">
                <h4>Parking & Drop-Off</h4>
                <p>
                  Use the terminal signage and official directions. If traveling with family, consider a drop-off plan
                  before parking.
                </p>
              </div>
            </article>
            <article className="card">
              <div className="cardBody">
                <h4>Pre-Cruise Stay</h4>
                <p>
                  A night near the island can reduce stress, especially for early check-in times. Confirm shuttle or
                  rideshare options ahead of time.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="sailings" className="section">
        <div className="wrap">
          <VisitorSearch />
        </div>
      </section>

      <section id="planning" className="section">
        <div className="wrap">
          <div className="sectionHeader">
            <div>
              <h3 className="sectionTitle">Planning Notes</h3>
              <p className="sectionDesc">
                A few quiet, practical reminders—styled like a visitor center desk: helpful, neutral, and easy to scan.
              </p>
            </div>
          </div>

          <div className="grid3">
            <article className="card">
              <div className="cardBody">
                <h4>Documents</h4>
                <p>
                  Confirm your travel documents and cruise line requirements well in advance. Keep digital backups and
                  printed copies where appropriate.
                </p>
              </div>
            </article>
            <article className="card">
              <div className="cardBody">
                <h4>Accessibility</h4>
                <p>
                  If you need accessibility accommodations, contact your cruise line early. Planning ahead usually
                  improves the experience.
                </p>
              </div>
            </article>
            <article className="card">
              <div className="cardBody">
                <h4>Weather & Packing</h4>
                <p>
                  Pack for warm days and indoor cooling. Check forecasts close to departure and consider a small day
                  bag for port calls.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="footgrid">
            <div>
              <h4>Visitor Information Tone</h4>
              <div>
                This layout is intentionally upscale and neutral—more “CVB desk” than sales funnel. If you want, we can
                tailor it to the live Supabase content and your brand assets.
              </div>
            </div>
            <div>
              <h4>Quick Links</h4>
              <div className="footlinks">
                <a href="#destinations">Destinations</a>
                <a href="#port">Port Guide</a>
                <a href="#sailings">Sailings</a>
                <a href="#planning">Planning</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
