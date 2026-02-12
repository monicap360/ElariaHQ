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
    badge: "Official Booking Integration",
    title: "Authority booking flow, with hospitality clarity",
    subtitle:
      "Move from planning to booking with one consistent path: verify departures, reserve your cabin, and connect with a cruise specialist.",
    sailings: "View available sailings",
    reserve: "Reserve your cabin",
    specialist: "Speak with a cruise specialist",
    request: "Request parking + transport support",
    pillars: "Authority • Hospitality • Galveston departures only",
  },
  es: {
    badge: "Integracion Oficial de Reservacion",
    title: "Flujo de reservacion con autoridad y hospitalidad",
    subtitle:
      "Pasa de planificacion a reservacion con un camino claro: verifica salidas, reserva tu cabina y conecta con especialista.",
    sailings: "Ver salidas disponibles",
    reserve: "Reserva tu cabina",
    specialist: "Habla con especialista",
    request: "Solicitar apoyo de estacionamiento y transporte",
    pillars: "Autoridad • Hospitalidad • Solo salidas desde Galveston",
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
    <section className="rounded-3xl border border-[#cfddd5] bg-[linear-gradient(145deg,#f7fbfd,#edf5f9)] p-6 shadow-sm md:p-7">
      <p className="text-xs uppercase tracking-[0.2em] text-[#59788a]">{copy.badge}</p>
      <h2 className="mt-3 text-2xl font-accent text-text-primary md:text-3xl">{copy.title}</h2>
      <p className="mt-2 max-w-3xl text-sm text-text-secondary">{copy.subtitle}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={sailingsHref}
          className="rounded-full border border-[#88a9bb] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2f45] hover:bg-[#f5fafc]"
        >
          {copy.sailings}
        </Link>
        <Link
          href={bookingHref}
          className="rounded-full bg-[#0f2f45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#123a53]"
        >
          {copy.reserve}
        </Link>
        <a
          href={phoneHref}
          className="rounded-full border border-[#88a9bb] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2f45] hover:bg-[#f5fafc]"
        >
          {copy.specialist}
        </a>
        <Link
          href={requestHref}
          className="rounded-full border border-[#88a9bb] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2f45] hover:bg-[#f5fafc]"
        >
          {copy.request}
        </Link>
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[#648293]">{copy.pillars}</p>
    </section>
  );
}
