"use client";

import Link from "next/link";

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
    { href: "/plan-your-cruise/driving-to-galveston/from-corpus-christi", label: "Corpus Christi" },
    { href: "/plan-your-cruise/driving-to-galveston/from-mission", label: "Mission (RGV)" },
  ],
  "dallas-fort-worth": [
    { href: "/plan-your-cruise/driving-to-galveston/from-houston", label: "Houston" },
    { href: "/plan-your-cruise/driving-to-galveston/from-corpus-christi", label: "Corpus Christi" },
    { href: "/plan-your-cruise/driving-to-galveston/from-kingsville", label: "Kingsville" },
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
          <Link href="/plan-your-cruise/driving-to-galveston/from-houston">driving from Houston</Link> or review the{" "}
          <Link href="/cruises-from-galveston/how-to-plan">port planning guide</Link>.
        </p>

        <p style={{ marginTop: 14 }}>
          <Link href={HUB_LINK.href} className="mutebtn">
            ← {HUB_LINK.label}
          </Link>
        </p>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="cardBody">
            <strong>Related driving guides</strong>
            <ul className="linkList" style={{ marginTop: 8 }}>
              {siblings.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
