export type BreadcrumbMeta = {
  label: string;
  category?: string;
  description?: string;
};

const PATH_SEGMENTS: Record<string, BreadcrumbMeta> = {
  "cruises-from-galveston": { label: "Cruises From Galveston", category: "core" },
  "plan-your-cruise": { label: "Plan Your Cruise", category: "planning" },
  "how-to-plan": { label: "Planning Guide", category: "planning" },
  "driving-to-galveston": { label: "Driving to Galveston", category: "driving" },
  "visitor-info": { label: "Visitor Information", category: "planning" },
  "guest-help": { label: "Guest Help Desk", category: "planning" },
  "parking-and-transportation": { label: "Parking & Transportation", category: "port" },
  "embarkation-day": { label: "Embarkation Day", category: "port" },
  "first-time-cruisers": { label: "First-Time Cruisers", category: "planning" },
  board: { label: "Cruise Board", category: "sailings" },
  search: { label: "Search Sailings", category: "sailings" },
  calendar: { label: "Cruise Calendar", category: "sailings" },
  desk: { label: "Help Desk", category: "authority" },
  ships: { label: "Ships", category: "ships" },
  ship: { label: "Ship", category: "ships" },
  cruise: { label: "Cruise", category: "sailings" },
  destinations: { label: "Destinations", category: "destinations" },
  "western-caribbean": { label: "Western Caribbean", category: "destinations" },
  bahamas: { label: "Bahamas", category: "destinations" },
  panama: { label: "Panama & Central America", category: "destinations" },
  "private-islands": { label: "Private Islands", category: "destinations" },
  "welcome-to-galveston": { label: "Welcome to Galveston", category: "authority" },
  "founders-welcome": { label: "Founder Welcome", category: "authority" },
  "7-night-cruises": { label: "7-Night Cruises", category: "sailings" },
  "2026-sail-dates": { label: "2026 Sail Dates", category: "sailings" },
};

const CITY_SEGMENTS: Record<string, BreadcrumbMeta> = {
  "corpus-christi": { label: "Corpus Christi", category: "driving" },
  "dallas-fort-worth": { label: "Dallas-Fort Worth", category: "driving" },
  houston: { label: "Houston", category: "driving" },
  "san-antonio": { label: "San Antonio", category: "driving" },
  austin: { label: "Austin", category: "driving" },
  mission: { label: "Mission", category: "driving" },
  palmview: { label: "Palmview", category: "driving" },
  kingsville: { label: "Kingsville", category: "driving" },
  "baton-rouge": { label: "Baton Rouge", category: "driving" },
  "oklahoma-city": { label: "Oklahoma City", category: "driving" },
  tulsa: { label: "Tulsa", category: "driving" },
  louisiana: { label: "Louisiana", category: "driving" },
};

export type BreadcrumbItem = {
  name: string;
  href: string | null;
  isLast: boolean;
  meta?: BreadcrumbMeta;
};

function titleFromSlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function resolveBreadcrumbSegment(segment: string) {
  if (segment.startsWith("from-")) {
    const citySlug = segment.replace("from-", "");
    const cityMeta = CITY_SEGMENTS[citySlug];
    return {
      name: `From ${cityMeta?.label ?? titleFromSlug(citySlug)}`,
      meta: cityMeta,
    };
  }

  const meta = PATH_SEGMENTS[segment];
  return {
    name: meta?.label ?? titleFromSlug(segment),
    meta,
  };
}

export function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter((segment) => segment.length > 0);

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    const { name, meta } = resolveBreadcrumbSegment(segment);

    return {
      href: isLast ? null : href,
      name,
      isLast,
      meta,
    };
  });
}
