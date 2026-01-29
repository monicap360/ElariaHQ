const items = [
  { title: "Sailings & Ships", href: "#sailings" },
  { title: "First-Time Cruisers", href: "/cruises-from-galveston/first-time-cruisers" },
  { title: "Getting to Galveston", href: "#getting-here" },
  { title: "Parking & Transportation", href: "#parking" },
  { title: "Guest Help Desk", href: "#guest-help" },
  { title: "Ports & Private Islands", href: "/cruises-from-galveston/private-islands" },
];

export function VisitorNav() {
  return (
    <section className="bg-sand py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 md:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="rounded bg-white p-4 text-navy shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-heading text-lg">{item.title}</h3>
            <p className="mt-1 text-sm text-driftwood">Helpful local guidance</p>
          </a>
        ))}
      </div>
    </section>
  );
}
