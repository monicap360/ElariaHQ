import Image from "next/image";

type Highlight = {
  text: string;
  tone?: "positive" | "warning";
};

type CruiseHeroProps = {
  ship: {
    name: string;
    image: string;
  };
  dates: string;
  price: string;
  highlights: Highlight[];
  viewCabinsHref?: string;
  reserveHref?: string;
};

export default function CruiseHero({
  ship,
  dates,
  price,
  highlights,
  viewCabinsHref = "#cabins",
  reserveHref = "/booking",
}: CruiseHeroProps) {
  return (
    <section className="bg-cloud overflow-hidden rounded-2xl border border-sand shadow-sm">
      <div className="relative h-64 w-full">
        <Image src={ship.image} alt={ship.name} fill sizes="100vw" className="object-cover" />
      </div>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-navy">{ship.name}</h1>
        <p className="mb-3 text-sm text-slate">{dates}</p>
        <ul className="mb-4 space-y-1">
          {highlights.map((highlight) => (
            <li
              key={highlight.text}
              className={`text-sm ${highlight.tone === "warning" ? "text-warning" : "text-slate"}`}
            >
              <span className="font-semibold text-navy">
                {highlight.tone === "warning" ? "Note:" : "Highlight:"}
              </span>{" "}
              {highlight.text}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xl font-semibold text-navy">From {price}</span>
          <div className="flex gap-2">
            <a
              href={viewCabinsHref}
              className="rounded-lg border border-primary-blue/40 bg-white px-5 py-2 text-primary-blue hover:bg-primary-blue/5"
            >
              View Cabins
            </a>
            <a
              href={reserveHref}
              className="rounded-lg bg-accent-teal px-5 py-2 text-white hover:bg-accent-teal/90"
            >
              Request booking
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
