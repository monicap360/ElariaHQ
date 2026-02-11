"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type PathMap = Record<string, string>;

const PATH_MAP: PathMap = {
  "cruises-from-galveston": "Cruises From Galveston",
  "plan-your-cruise": "Plan Your Cruise",
  "how-to-plan": "Planning Guide",
  "driving-to-galveston": "Driving to Galveston",
  "visitor-info": "Visitor Information",
  "guest-help": "Guest Help Desk",
  "parking-and-transportation": "Parking & Transportation",
  "embarkation-day": "Embarkation Day",
  "first-time-cruisers": "First-Time Cruisers",
  board: "Cruise Board",
  search: "Search Sailings",
  calendar: "Cruise Calendar",
  desk: "Help Desk",
  ships: "Ships",
  ship: "Ship",
  cruise: "Cruise",
  destinations: "Destinations",
  "western-caribbean": "Western Caribbean",
  bahamas: "Bahamas",
  panama: "Panama & Central America",
  "private-islands": "Private Islands",
  "welcome-to-galveston": "Welcome to Galveston",
  "founders-welcome": "Founder Welcome",
  "how-to-plan-a-cruise": "Planning Guide",
  "7-night-cruises": "7-Night Cruises",
  "2026-sail-dates": "2026 Sail Dates",
};

const CITY_MAP: PathMap = {
  "corpus-christi": "Corpus Christi",
  "dallas-fort-worth": "Dallas-Fort Worth",
  houston: "Houston",
  "san-antonio": "San Antonio",
  austin: "Austin",
  mission: "Mission",
  palmview: "Palmview",
  kingsville: "Kingsville",
  "lake-charles": "Lake Charles",
  "baton-rouge": "Baton Rouge",
  lafayette: "Lafayette",
  shreveport: "Shreveport",
  "little-rock": "Little Rock",
  "oklahoma-city": "Oklahoma City",
  tulsa: "Tulsa",
  missouri: "Missouri",
  colorado: "Colorado",
  louisiana: "Louisiana",
};

function titleFromSlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((segment) => segment.length > 0);

  if (segments.length === 0) return null;

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;

    let name: string;
    if (segment.startsWith("from-")) {
      const citySlug = segment.replace("from-", "");
      name = `From ${CITY_MAP[citySlug] ?? titleFromSlug(citySlug)}`;
    } else {
      name = PATH_MAP[segment] ?? titleFromSlug(segment);
    }

    return {
      href: isLast ? null : href,
      name,
      isLast,
    };
  });

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
      <div className="breadcrumbs-inner">
        <ol className="breadcrumbs-list">
          <li className="breadcrumb-item" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link href="/" itemProp="item">
              <span itemProp="name">Home</span>
              <meta itemProp="position" content="1" />
            </Link>
            <span className="separator" aria-hidden="true">
              /
            </span>
          </li>

          {breadcrumbs.map((crumb, index) => (
            <li
              key={crumb.href ?? `${crumb.name}-${index}`}
              className={`breadcrumb-item ${crumb.isLast ? "active" : ""}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {crumb.isLast ? (
                <span itemProp="name">{crumb.name}</span>
              ) : (
                <Link href={crumb.href ?? "/"} itemProp="item">
                  <span itemProp="name">{crumb.name}</span>
                </Link>
              )}
              <meta itemProp="position" content={index + 2} />
              {!crumb.isLast && (
                <span className="separator" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          ))}
        </ol>

        {breadcrumbs.length > 1 && (
          <div className="breadcrumb-context">
            <Link
              href={breadcrumbs[breadcrumbs.length - 2].href ?? "/"}
              className="back-link"
              aria-label={`Back to ${breadcrumbs[breadcrumbs.length - 2].name}`}
            >
              Back to {breadcrumbs[breadcrumbs.length - 2].name}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
