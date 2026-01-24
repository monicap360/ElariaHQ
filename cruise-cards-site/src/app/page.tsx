export default function Home() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#eff6ff" }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "48px 24px",
          fontFamily: "system-ui",
          color: "#0f172a",
        }}
      >
        <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#64748b", marginBottom: 8 }}>
          Galveston Cruise Cards
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 10 }}>Cruise smarter out of Galveston</h1>
        <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 20 }}>
          A client-facing booking experience built for families, groups, and verified inventory.
        </p>

        <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "white" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Our winning angle</div>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Galveston-only inventory (no noise)</li>
              <li>Multi-room booking experience for families and groups</li>
              <li>SeaPay deposit plans (Deposit Now, Cruise Later)</li>
              <li>Featured Top-10 off-island and island roster (curated, approved)</li>
              <li>Group contracts and rate proof inside the workflow</li>
            </ul>
            <p style={{ fontSize: 12, opacity: 0.7, marginTop: 10 }}>
              This is client-facing; contract and rate mechanics remain private.
            </p>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "white" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Upcoming deployments</div>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Symphony of the Seas and Liberty of the Seas begin homeport Galveston in April 2027. Icon of the Seas
              begins Galveston sailings in August 2027.
            </p>
          </div>
        </div>

        <a
          href="/booking"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            background: "#0f172a",
            color: "white",
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Start a Booking
        </a>
      </div>
    </main>
  );
}


