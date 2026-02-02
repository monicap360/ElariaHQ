import type { Metadata } from "next";
import ScrollButton from "@/components/ScrollButton";
import SailingDetailsClient from "@/components/SailingDetailsClient";
import "../../visitor-info/visitor-info.css";

type Props = { params: Promise<{ id: string }> };

export function generateMetadata(): Metadata {
  return {
    title: "Sailing Details | Cruising from Galveston",
    description:
      "Visitor-style sailing details departing from Galveston, including itinerary summary, dates, and pricing notes.",
  };
}

export default async function SailingDetailsPage({ params }: Props) {
  const { id } = await params;
  return (
    <main>
      <header className="hero">
        <div className="wrap">
          <div className="heroCard">
            <div className="heroInner">
              <div>
                <div className="kicker">Cruising from Galveston</div>
                <h1 className="heroTitle">Sailing Details</h1>
                <p className="heroLead">
                  Visitor-style information for a single sailing. Details shown reflect posted rates and itinerary data
                  provided in your directory.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                  <ScrollButton targetId="details" label="View Details" className="btn" />
                  <ScrollButton targetId="pricing" label="View Pricing" className="mutebtn" />
                </div>
              </div>

              <aside className="heroAside" aria-label="Visitor Notes">
                <h3>What this page shows</h3>
                <p>
                  This summary reflects the public directory view. For final confirmations, follow your cruise line&apos;s
                  booking documents.
                </p>
                <div className="asideRow">
                  <ScrollButton targetId="details" label="Details" className="ghost" />
                  <ScrollButton targetId="pricing" label="Pricing" className="ghost" />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </header>

      <section id="details" className="section">
        <div className="wrap">
          <SailingDetailsClient sailingId={id} />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="card" style={{ padding: 16 }}>
            <h3 className="sectionTitle" style={{ marginTop: 0 }}>
              Visitor Note
            </h3>
            <p className="sectionDesc" style={{ marginTop: 6 }}>
              Pricing (if displayed) is per person, based on double occupancy, and includes port expenses and
              government fees. Gratuities and optional add-ons are not included unless stated.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
