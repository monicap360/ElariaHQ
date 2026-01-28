const fs = require("fs");
const path = require("path");

// 1. DATA: Define all your target cities/states here
const locations = [
  {
    slug: "corpus-christi",
    title: "Corpus Christi",
    driveTime: "~4.5–5 hours",
    route: "US-77 North → I-69E North → I-45 South",
    tip:
      "Many travelers choose to arrive in Galveston the evening before departure and stay overnight near the port to avoid early-morning driving.",
    region: "South Texas",
  },
  {
    slug: "kingsville",
    title: "Kingsville",
    driveTime: "~5–5.5 hours",
    route: "US-77 North → I-69E North → I-45 South",
    tip: "Traffic increases as you approach the Houston area. Plan your arrival outside of peak weekday rush hours when possible.",
    region: "South Texas",
  },
  {
    slug: "mission",
    title: "Mission & Palmview (Rio Grande Valley)",
    driveTime: "~6.5–7.5 hours",
    route: "I-2 East → US-77 North → I-69E North → I-45 South",
    tip:
      "Due to distance, a one-night stop near Galveston is strongly recommended. This allows for a relaxed embarkation morning and reduces travel stress.",
    region: "South Texas",
    note: "Asistencia en español disponible.",
  },
  {
    slug: "dallas-fort-worth",
    title: "Dallas–Fort Worth",
    driveTime: "~5–6 hours",
    route: "I-45 South",
    tip: "Depart early in the morning or travel the day before. Many travelers include a pre-cruise hotel stay in Galveston or the Houston area.",
    region: "Central & North Texas",
  },
  {
    slug: "missouri",
    title: "Missouri",
    driveTime: "~12–14 hours",
    route: "I-44 → I-49 → I-45 South",
    tip: "Missouri travelers often split the drive over two days or fly into Houston and drive the final leg to Galveston.",
    region: "Nearby States",
  },
];

// 2. TEMPLATE: The HTML structure for each individual page
const pageTemplate = (data) => `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Driving to Galveston from ${data.title} for Your Cruise | Port of Galveston</title>
  <meta name="description" content="Detailed driving guide from ${data.title} to the Port of Galveston for your cruise. Includes route (${data.route}), time (${data.driveTime}), and planning tips.">
  <!-- Link to your main CSS file -->
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <!-- Reuse your site's header/navigation here -->
  <main class="wrap">
    <article>
      <h1>Driving to Galveston from ${data.title}</h1>
      <p class="kicker">${data.region} • Port of Galveston Cruise Guide</p>
      
      <div class="heroCard">
        <div class="heroInner">
          <div>
            <p>Travelers from <strong>${data.title}</strong> have a straightforward drive to the Port of Galveston, making it a convenient drive-to-cruise option.</p>
            <div class="heroMeta">
              <span class="tag">Drive Time: ${data.driveTime}</span>
              <span class="tag">Primary Route: ${data.route}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Route & Planning Details</h2>
        <p><strong>Estimated drive time:</strong> ${data.driveTime}</p>
        <p><strong>Primary route:</strong> ${data.route}</p>
        <p><strong>Planning tip:</strong> ${data.tip}</p>
        ${data.note ? `<p><em>${data.note}</em></p>` : ""}
      </div>

      <!-- Internal linking blocks for SEO -->
      <div class="grid3">
        <a href="/hotels-near-port" class="card">
          <div class="cardBody">
            <h4>Pre-Cruise Hotels</h4>
            <p>Find recommended hotels near the Port of Galveston for an overnight stay.</p>
          </div>
        </a>
        <a href="/parking" class="card">
          <div class="cardBody">
            <h4>Port Parking Guide</h4>
            <p>Compare secure parking options at the terminal and nearby lots.</p>
          </div>
        </a>
        <a href="/sailings" class="card">
          <div class="cardBody">
            <h4>Current Sailings</h4>
            <p>Browse cruise departures from Galveston to plan your trip dates.</p>
          </div>
        </a>
      </div>

      <nav aria-label="Breadcrumb" style="margin-top: 2rem; font-size: 0.9em;">
        <a href="/">Home</a> &gt; 
        <a href="/driving-to-galveston">Driving to Galveston</a> &gt; 
        <span>From ${data.title}</span>
      </nav>
    </article>
  </main>
</body>
</html>
`;

// 3. GENERATE: Create the directory and all pages
const outputDir = path.join(__dirname, "driving-pages");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

locations.forEach((location) => {
  const filePath = path.join(outputDir, `from-${location.slug}.html`);
  fs.writeFileSync(filePath, pageTemplate(location));
  console.log(`✅ Created: ${filePath}`);
});

console.log("\n🎉 All pages generated! Next steps:");
console.log("1. Upload the /driving-pages/ folder to your website.");
console.log("2. Add these pages to your sitemap.xml.");
console.log("3. Link to them from your main \"Driving to Galveston\" page.");
