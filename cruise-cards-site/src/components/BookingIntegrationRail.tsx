import Link from "next/link";

type Language = "en" | "es";

type BookingIntegrationRailProps = {
  language?: Language;
  bookingHref?: string;
  sailingsHref?: string;
  requestHref?: string;
  phoneHref?: string;
};

const COPY = {
  en: {
    badge: "Booking tools",
    title: "Galveston booking flow with practical steps",
    subtitle:
      "Move from planning to booking in one place: review departures, reserve your cabin, and reach a cruise specialist when needed.",
    sailings: "View available sailings",
    reserve: "Reserve your cabin",
    specialist: "Speak with a cruise specialist",
    request: "Request parking + transport support",
    pillars: "Galveston departures only • Planning-first support",
  },
  es: {
    badge: "Herramientas de reservacion",
    title: "Flujo de reservacion en Galveston con pasos practicos",
    subtitle:
      "Pasa de planificacion a reservacion en un solo lugar: revisa salidas, reserva cabina y conecta con especialista cuando lo necesites.",
    sailings: "Ver salidas disponibles",
    reserve: "Reserva tu cabina",
    specialist: "Habla con especialista",
    request: "Solicitar apoyo de estacionamiento y transporte",
    pillars: "Solo salidas desde Galveston • Soporte enfocado en planificacion",
  },
} as const;

export default function BookingIntegrationRail({
  language = "en",
  bookingHref = "/booking",
  sailingsHref = "/cruises-from-galveston/board",
  requestHref = "/cruises-from-galveston/planning-tools#request-assist",
  phoneHref = "tel:14096322106",
}: BookingIntegrationRailProps) {
  const copy = COPY[language];

  return (
    <section className="rounded-3xl border border-[#d7e2e7] bg-[linear-gradient(145deg,#faf7f1,#eff5f7)] p-6 shadow-sm md:p-7">
      <p className="text-xs uppercase tracking-[0.2em] text-[#5c7684]">{copy.badge}</p>
      <h2 className="mt-3 text-2xl font-accent text-text-primary md:text-3xl">{copy.title}</h2>
      <p className="mt-2 max-w-3xl text-sm text-text-secondary">{copy.subtitle}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={sailingsHref}
          className="rounded-full border border-[#8aa8b7] bg-white px-5 py-2.5 text-sm font-semibold text-[#1d4f68] hover:bg-[#f4fafc]"
        >
          {copy.sailings}
        </Link>
        <Link
          href={bookingHref}
          className="rounded-full bg-[#1f556f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a4a61]"
        >
          {copy.reserve}
        </Link>
        <a
          href={phoneHref}
          className="rounded-full border border-[#8aa8b7] bg-white px-5 py-2.5 text-sm font-semibold text-[#1d4f68] hover:bg-[#f4fafc]"
        >
          {copy.specialist}
        </a>
        <Link
          href={requestHref}
          className="rounded-full border border-[#8aa8b7] bg-white px-5 py-2.5 text-sm font-semibold text-[#1d4f68] hover:bg-[#f4fafc]"
        >
          {copy.request}
        </Link>
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[#698593]">{copy.pillars}</p>
    </section>
  );
}
