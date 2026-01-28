"use client";

type LinkItem = { href: string; label: string };

const HUB_LINK: LinkItem = {
  href: "/plan-your-cruise/driving-to-galveston",
  label: "View all driving guides to Galveston",
};

const SIBLINGS: Record<string, LinkItem[]> = {
  "corpus-christi": [
    { href: "/plan-your-cruise/driving-to-galveston/from-kingsville", label: "Kingsville" },
    { href: "/plan-your-cruise/driving-to-galveston/from-mission", label: "Mission (RGV)" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
  ],
  kingsville: [
    { href: "/plan-your-cruise/driving-to-galveston/from-corpus-christi", label: "Corpus Christi" },
    { href: "/plan-your-cruise/driving-to-galveston/from-mission", label: "Mission (RGV)" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
  ],
  mission: [
    { href: "/plan-your-cruise/driving-to-galveston/from-palmview", label: "Palmview" },
    { href: "/plan-your-cruise/driving-to-galveston/from-corpus-christi", label: "Corpus Christi" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
  ],
  palmview: [
    { href: "/plan-your-cruise/driving-to-galveston/from-mission", label: "Mission" },
    { href: "/plan-your-cruise/driving-to-galveston/from-corpus-christi", label: "Corpus Christi" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
  ],
  houston: [
    { href: "/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth", label: "Dallas-Fort Worth" },
    { href: "/plan-your-cruise/driving-to-galveston/from-austin", label: "Austin" },
    { href: "/plan-your-cruise/driving-to-galveston/from-san-antonio", label: "San Antonio" },
  ],
  "dallas-fort-worth": [
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
    { href: "/plan-your-cruise/driving-to-galveston/from-oklahoma-city", label: "Oklahoma City" },
    { href: "/plan-your-cruise/driving-to-galveston/from-tulsa", label: "Tulsa" },
  ],
  austin: [
    { href: "/plan-your-cruise/driving-to-galveston/from-san-antonio", label: "San Antonio" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
    { href: "/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth", label: "Dallas-Fort Worth" },
  ],
  "san-antonio": [
    { href: "/plan-your-cruise/driving-to-galveston/from-austin", label: "Austin" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
    { href: "/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth", label: "Dallas-Fort Worth" },
  ],
  "oklahoma-city": [
    { href: "/plan-your-cruise/driving-to-galveston/from-tulsa", label: "Tulsa" },
    { href: "/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth", label: "Dallas-Fort Worth" },
    { href: "/plan-your-cruise/driving-to-galveston/from-little-rock", label: "Little Rock" },
  ],
  tulsa: [
    { href: "/plan-your-cruise/driving-to-galveston/from-oklahoma-city", label: "Oklahoma City" },
    { href: "/plan-your-cruise/driving-to-galveston/from-little-rock", label: "Little Rock" },
    { href: "/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth", label: "Dallas-Fort Worth" },
  ],
  "baton-rouge": [
    { href: "/plan-your-cruise/driving-to-galveston/from-lafayette", label: "Lafayette" },
    { href: "/plan-your-cruise/driving-to-galveston/from-lake-charles", label: "Lake Charles" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
  ],
  lafayette: [
    { href: "/plan-your-cruise/driving-to-galveston/from-baton-rouge", label: "Baton Rouge" },
    { href: "/plan-your-cruise/driving-to-galveston/from-lake-charles", label: "Lake Charles" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
  ],
  "lake-charles": [
    { href: "/plan-your-cruise/driving-to-galveston/from-lafayette", label: "Lafayette" },
    { href: "/plan-your-cruise/driving-to-galveston/from-baton-rouge", label: "Baton Rouge" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
  ],
  shreveport: [
    { href: "/plan-your-cruise/driving-to-galveston/from-little-rock", label: "Little Rock" },
    { href: "/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth", label: "Dallas-Fort Worth" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
  ],
  "little-rock": [
    { href: "/plan-your-cruise/driving-to-galveston/from-shreveport", label: "Shreveport" },
    { href: "/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth", label: "Dallas-Fort Worth" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
  ],
  missouri: [
    { href: "/plan-your-cruise/driving-to-galveston/from-little-rock", label: "Little Rock" },
    { href: "/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth", label: "Dallas-Fort Worth" },
    { href: "/plan-your-cruise/driving-to-galveston/from-oklahoma-city", label: "Oklahoma City" },
  ],
  colorado: [
    { href: "/plan-your-cruise/driving-to-galveston/from-oklahoma-city", label: "Oklahoma City" },
    { href: "/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth", label: "Dallas-Fort Worth" },
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
  ],
};

type Props = {
  slug: keyof typeof SIBLINGS;
};

export default function DrivePageLinks({ slug }: Props) {
  const siblings = SIBLINGS[slug] ?? [];

  return (
    <section className="section">
      <div className="wrap">
        <p className="sectionDesc">
          Travelers comparing drive-to options may want to explore{" "}
          <a href="/plan-your-cruise/driving-to-galveston/from-houston">driving from Houston</a> or review the{" "}
          <a href="/cruises-from-galveston/how-to-plan">port planning guide</a>.
        </p>

        <p style={{ marginTop: 14 }}>
          <a href={HUB_LINK.href} className="mutebtn">
            ← {HUB_LINK.label}
          </a>
        </p>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="cardBody">
            <strong>Related driving guides</strong>
            <ul className="linkList" style={{ marginTop: 8 }}>
              {siblings.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
