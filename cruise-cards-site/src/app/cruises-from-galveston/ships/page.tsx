export const metadata = {
  title: "Ships Sailing from Galveston",
};

const ships = [
  { name: "Carnival Breeze", href: "/cruises-from-galveston/ships/carnival-breeze" },
  { name: "Carnival Dream", href: "/cruises-from-galveston/ships/carnival-dream" },
  { name: "Disney Magic", href: "/cruises-from-galveston/ships/disney-magic" },
  { name: "Mariner of the Seas", href: "/cruises-from-galveston/ships/mariner-of-the-seas" },
];

export default function ShipsIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Ships Sailing from Galveston</h1>
      <p className="mt-4 text-slate-600">
        These ship guides explain onboard experience and show live sailings without listing prices or deals.
      </p>

      <div className="mt-8 grid gap-4">
        {ships.map((ship) => (
          <a
            key={ship.href}
            href={ship.href}
            className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-700 hover:border-slate-300"
          >
            <div className="text-sm font-semibold">{ship.name}</div>
            <div className="text-xs text-slate-500">Advisor-grade ship overview + live sailings</div>
          </a>
        ))}
      </div>
    </main>
  );
}
