"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Language = "en" | "es";

type CalendarEntry = {
  sailingId: string;
  departDate: string;
  returnDate: string;
  cruiseLine: string;
  shipName: string;
  nights: number;
  durationLabel: string;
  priceFrom: number | null;
  demand: "low" | "medium" | "high";
  reasons: string[];
  flags: string[];
  score: number;
  confidence: number;
  recommended: boolean;
  seaPayEligible: boolean;
};

type TerminalNode = {
  id: string;
  short: string;
  nameEn: string;
  nameEs: string;
  lineEn: string;
  lineEs: string;
  statusEn: string;
  statusEs: string;
  parkingEn: string;
  parkingEs: string;
  left: string;
  top: string;
};

type PlanningRequestForm = {
  name: string;
  email: string;
  phone: string;
  sailingMonth: string;
  terminal: string;
  parkingOption: string;
  transportOption: string;
  wantsSeaPay: boolean;
  notes: string;
};

const REFRESH_INTERVAL_MS = 60_000;

const TERMINALS: TerminalNode[] = [
  {
    id: "terminal-25",
    short: "T25",
    nameEn: "Terminal 25",
    nameEs: "Terminal 25",
    lineEn: "Royal Caribbean departures",
    lineEs: "Salidas de Royal Caribbean",
    statusEn: "High departure activity this week",
    statusEs: "Alta actividad de salidas esta semana",
    parkingEn: "Best paired with official terminal garage",
    parkingEs: "Mejor con estacionamiento oficial del terminal",
    left: "18%",
    top: "42%",
  },
  {
    id: "terminal-28",
    short: "T28",
    nameEn: "Terminal 28",
    nameEs: "Terminal 28",
    lineEn: "Carnival main sailings",
    lineEs: "Salidas principales de Carnival",
    statusEn: "Steady boarding windows and family traffic",
    statusEs: "Ventanas de abordaje constantes y trafico familiar",
    parkingEn: "Great for terminal shuttle + garage mix",
    parkingEs: "Ideal para mezcla de shuttle y garaje",
    left: "46%",
    top: "36%",
  },
  {
    id: "terminal-10",
    short: "T10",
    nameEn: "Terminal 10",
    nameEs: "Terminal 10",
    lineEn: "Special and seasonal departures",
    lineEs: "Salidas especiales y de temporada",
    statusEn: "Moderate traffic with smooth check-in flow",
    statusEs: "Trafico moderado con check-in fluido",
    parkingEn: "Best with pre-booked lot and transfer",
    parkingEs: "Mejor con lote reservado y traslado",
    left: "73%",
    top: "50%",
  },
];

const PARKING_ROWS = [
  {
    id: "terminal-garage",
    optionEn: "Official Terminal Garage",
    optionEs: "Garaje Oficial del Terminal",
    costPerDay: "$25 - $32",
    walkTimeEn: "3-8 min walk",
    walkTimeEs: "3-8 min caminando",
    bestForEn: "Families and first-time cruisers",
    bestForEs: "Familias y primerizos",
  },
  {
    id: "private-lot",
    optionEn: "Private Cruise Parking Lots",
    optionEs: "Lotes Privados de Crucero",
    costPerDay: "$14 - $22",
    walkTimeEn: "Shuttle included",
    walkTimeEs: "Shuttle incluido",
    bestForEn: "Value-focused travelers",
    bestForEs: "Viajeros enfocados en ahorro",
  },
  {
    id: "hotel-package",
    optionEn: "Hotel + Parking Package",
    optionEs: "Paquete Hotel + Estacionamiento",
    costPerDay: "$18 - $30 (effective)",
    walkTimeEn: "Hotel shuttle schedule",
    walkTimeEs: "Horario de shuttle del hotel",
    bestForEn: "Long-drive arrivals",
    bestForEs: "Llegadas de larga distancia",
  },
];

const FEEDER_CITY_LINKS = [
  {
    href: "/plan-your-cruise/driving-to-galveston/from-houston",
    cityEn: "Houston Metro",
    cityEs: "Area de Houston",
    noteEn: "Fastest route guidance and parking timing.",
    noteEs: "Ruta mas rapida y horarios de estacionamiento.",
  },
  {
    href: "/plan-your-cruise/driving-to-galveston/from-dallas-fort-worth",
    cityEn: "Dallas - Fort Worth",
    cityEs: "Dallas - Fort Worth",
    noteEn: "Overnight buffer recommendations.",
    noteEs: "Recomendaciones para noche previa.",
  },
  {
    href: "/plan-your-cruise/driving-to-galveston/from-austin",
    cityEn: "Austin",
    cityEs: "Austin",
    noteEn: "Departure-morning traffic checkpoints.",
    noteEs: "Puntos clave de trafico en la salida.",
  },
  {
    href: "/plan-your-cruise/driving-to-galveston/from-san-antonio",
    cityEn: "San Antonio",
    cityEs: "San Antonio",
    noteEn: "Best windows for stress-free arrival.",
    noteEs: "Mejores ventanas para llegar sin estres.",
  },
  {
    href: "/plan-your-cruise/driving-to-galveston/from-baton-rouge",
    cityEn: "Baton Rouge",
    cityEs: "Baton Rouge",
    noteEn: "I-10 East strategy and backup timing.",
    noteEs: "Estrategia por I-10 East y tiempos alternos.",
  },
  {
    href: "/plan-your-cruise/driving-to-galveston/from-oklahoma-city",
    cityEn: "Oklahoma City",
    cityEs: "Oklahoma City",
    noteEn: "Long-drive planner with hotel staging.",
    noteEs: "Plan de manejo largo con hotel de apoyo.",
  },
];

const CHECKLIST_60_DAY = [
  {
    day: "-60",
    en: "Confirm passport/ID names, terminal parking choice, and SeaPay deposit timing.",
    es: "Confirma nombres en pasaporte/ID, estacionamiento del terminal y calendario de SeaPay.",
  },
  {
    day: "-45",
    en: "Lock in transportation to port and compare hotel + parking bundles.",
    es: "Define transporte al puerto y compara paquetes de hotel + estacionamiento.",
  },
  {
    day: "-30",
    en: "Complete cruise check-in, set emergency contacts, and verify cabin details.",
    es: "Completa check-in del crucero, contactos de emergencia y verifica cabina.",
  },
  {
    day: "-21",
    en: "Review baggage plan, parking QR or pass, and transfer confirmation.",
    es: "Revisa equipaje, pase o QR de estacionamiento y confirmacion de traslado.",
  },
  {
    day: "-14",
    en: "Recheck terminal assignment, sail time, and weather watch list.",
    es: "Confirma terminal asignada, hora de salida y monitoreo de clima.",
  },
  {
    day: "-7",
    en: "Prepare carry-on documents and share itinerary with family contacts.",
    es: "Prepara documentos en equipaje de mano y comparte itinerario con familia.",
  },
  {
    day: "-1",
    en: "Charge devices, set alarms, and arrive in Galveston with buffer time.",
    es: "Carga dispositivos, programa alarmas y llega a Galveston con tiempo extra.",
  },
];

const COPY = {
  en: {
    badge: "Official Galveston Departure Planning Authority",
    heading: "Authority-grade planning architecture for Galveston departures",
    intro:
      "Built for real travelers who want structured guidance, live sailings, and warm hospitality support in one official planning system.",
    subIntro:
      "Galveston departures only: Supabase-powered search, real-time pricing signals, SeaPay planning, and parking + transportation request tools.",
    architectureTitle: "Structured planning architecture",
    architectureSubtitle: "Move step-by-step from terminal strategy to confirmed booking support.",
    galvestonOnlyLabel: "Galveston departures only",
    mapTitle: "Interactive terminal map",
    mapSubtitle: "Tap a terminal to view activity notes, parking fit, and cruise line departure focus.",
    parkingTitle: "Parking and transport price comparison",
    chartTitle: "Cruise duration comparison",
    chartSubtitle: "Live sailing mix by trip length from current inventory.",
    guideTitle: "Departure guide & 60-day checklist",
    downloadGuide: "Download departure guide (PDF)",
    feederTitle: "Driving directions from major feeder cities",
    feederSubtitle: "Route guidance for high-volume origin cities.",
    searchTitle: "Supabase-powered dynamic sailing search",
    searchSubtitle:
      "Real-time pricing, cabin availability signals, and practical filters focused on Galveston departures.",
    bookingTitle: "Structured booking integration",
    bookingSubtitle:
      "View live availability, reserve your cabin, and speak with a cruise specialist in one clear flow.",
    seaPayTitle: "SeaPay deposit plans + request desk",
    seaPaySubtitle: "Scan QR for SeaPay options and request parking/transport support.",
    refreshNow: "Refresh live search",
    refreshing: "Refreshing...",
    languageSwitch: "Ver en Espanol",
    requestHeading: "Request parking and transport support",
    requestSubmit: "Send request",
    requestSending: "Sending...",
    requestSuccess: "Request received. Our cruise specialist team will follow up shortly.",
    requestError: "We could not submit your request right now.",
  },
  es: {
    badge: "Autoridad Oficial de Planificacion de Salidas en Galveston",
    heading: "Arquitectura de planificacion con autoridad para salidas en Galveston",
    intro:
      "Creado para viajeros reales que buscan guia estructurada, salidas en vivo y apoyo de hospitalidad en un sistema oficial.",
    subIntro:
      "Solo salidas desde Galveston: busqueda con Supabase, precios en tiempo real, SeaPay y solicitudes de estacionamiento + transporte.",
    architectureTitle: "Arquitectura estructurada de planificacion",
    architectureSubtitle: "Avanza paso a paso desde la terminal hasta la reservacion confirmada.",
    galvestonOnlyLabel: "Solo salidas desde Galveston",
    mapTitle: "Mapa interactivo de terminales",
    mapSubtitle: "Selecciona una terminal para ver actividad, estacionamiento y linea de salida principal.",
    parkingTitle: "Comparacion de precios de estacionamiento y transporte",
    chartTitle: "Comparacion por duracion de crucero",
    chartSubtitle: "Mezcla de salidas activas por duracion con inventario actual.",
    guideTitle: "Guia de salida y checklist de 60 dias",
    downloadGuide: "Descargar guia de salida (PDF)",
    feederTitle: "Direcciones desde ciudades alimentadoras",
    feederSubtitle: "Rutas recomendadas para ciudades de mayor flujo.",
    searchTitle: "Busqueda dinamica con Supabase",
    searchSubtitle:
      "Precios en tiempo real, senales de disponibilidad de cabina y filtros utiles enfocados en salidas de Galveston.",
    bookingTitle: "Integracion estructurada de reservacion",
    bookingSubtitle:
      "Ve disponibilidad en vivo, reserva tu cabina y habla con especialista en un solo flujo claro.",
    seaPayTitle: "Planes de deposito SeaPay + mesa de solicitudes",
    seaPaySubtitle: "Escanea QR para SeaPay y solicita apoyo de estacionamiento/transporte.",
    refreshNow: "Actualizar busqueda",
    refreshing: "Actualizando...",
    languageSwitch: "View in English",
    requestHeading: "Solicitar apoyo de estacionamiento y transporte",
    requestSubmit: "Enviar solicitud",
    requestSending: "Enviando...",
    requestSuccess: "Solicitud recibida. Nuestro equipo de especialistas te contactara pronto.",
    requestError: "No se pudo enviar la solicitud en este momento.",
  },
} as const;

const PLANNING_ARCHITECTURE = {
  en: [
    {
      step: "Step 1",
      title: "Terminal and arrival strategy",
      detail: "Use the interactive map to pick terminal flow, parking fit, and transfer timing.",
    },
    {
      step: "Step 2",
      title: "Cost and duration comparison",
      detail: "Compare parking and trip-length patterns with practical, real-world planning context.",
    },
    {
      step: "Step 3",
      title: "Live Galveston departures board",
      detail: "Filter real-time sailings, pricing signals, and cabin availability for your travel window.",
    },
    {
      step: "Step 4",
      title: "Booking and specialist support",
      detail: "Move to booking, SeaPay deposit options, and parking/transport request support.",
    },
  ],
  es: [
    {
      step: "Paso 1",
      title: "Estrategia de terminal y llegada",
      detail: "Usa el mapa interactivo para elegir flujo de terminal, estacionamiento y tiempos de traslado.",
    },
    {
      step: "Paso 2",
      title: "Comparacion de costo y duracion",
      detail: "Compara estacionamiento y duracion con contexto practico para decisiones reales.",
    },
    {
      step: "Paso 3",
      title: "Tablero en vivo de salidas en Galveston",
      detail: "Filtra salidas en tiempo real, senales de precio y disponibilidad de cabina.",
    },
    {
      step: "Paso 4",
      title: "Reservacion y apoyo especialista",
      detail: "Pasa a reservacion, opciones SeaPay y solicitud de estacionamiento/transporte.",
    },
  ],
} as const;

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatPrice(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "Call";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function cabinSignal(entry: CalendarEntry) {
  if (entry.flags.includes("high_demand") || entry.demand === "high") return "limited";
  return "open";
}

export default function PlanningToolsPage() {
  const [lang, setLang] = useState<Language>("en");
  const [selectedTerminalId, setSelectedTerminalId] = useState(TERMINALS[0].id);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [lineFilter, setLineFilter] = useState("all");
  const [maxBudget, setMaxBudget] = useState("");
  const [seaPayOnly, setSeaPayOnly] = useState(false);
  const [cabinFilter, setCabinFilter] = useState<"all" | "open" | "limited">("all");

  const [formState, setFormState] = useState<PlanningRequestForm>({
    name: "",
    email: "",
    phone: "",
    sailingMonth: "",
    terminal: "",
    parkingOption: "",
    transportOption: "",
    wantsSeaPay: false,
    notes: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");

  const copy = COPY[lang];

  const selectedTerminal = useMemo(() => {
    return TERMINALS.find((terminal) => terminal.id === selectedTerminalId) ?? TERMINALS[0];
  }, [selectedTerminalId]);

  const loadEntries = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const now = new Date();
        const start = now.toISOString().slice(0, 10);
        const end = new Date(now);
        end.setMonth(end.getMonth() + 18);

        const params = new URLSearchParams({
          start,
          end: end.toISOString().slice(0, 10),
          adults: "2",
        });

        if (lineFilter !== "all") params.set("line", lineFilter);
        if (seaPayOnly) params.set("seapay", "1");
        if (maxBudget && Number(maxBudget) > 0) params.set("max", String(Math.round(Number(maxBudget))));

        const response = await fetch(`/api/calendar?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load live sailings");

        const payload = (await response.json()) as { entries?: CalendarEntry[] };
        const nextEntries = Array.isArray(payload.entries) ? payload.entries : [];
        setEntries(nextEntries);
        setError(null);
        setLastUpdated(new Date());
      } catch (loadError) {
        console.error(loadError);
        setError(lang === "es" ? "No se pudo cargar la busqueda en vivo." : "Unable to load live search.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [lang, lineFilter, maxBudget, seaPayOnly],
  );

  useEffect(() => {
    void loadEntries(false);
  }, [loadEntries]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void loadEntries(true);
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [loadEntries]);

  const availableLines = useMemo(() => {
    const unique = new Map<string, string>();
    for (const entry of entries) {
      unique.set(entry.cruiseLine, entry.cruiseLine);
    }
    return ["all", ...Array.from(unique.values()).sort((a, b) => a.localeCompare(b))];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const rows = entries.filter((entry) => {
      if (cabinFilter !== "all" && cabinSignal(entry) !== cabinFilter) return false;

      if (!query) return true;
      const haystack = `${entry.shipName} ${entry.cruiseLine} ${entry.durationLabel}`.toLowerCase();
      return haystack.includes(query);
    });

    return rows
      .sort((a, b) => a.departDate.localeCompare(b.departDate))
      .slice(0, 20);
  }, [cabinFilter, entries, searchTerm]);

  const durationStats = useMemo(() => {
    const buckets = [
      {
        key: "short",
        labelEn: "3-5 nights",
        labelEs: "3-5 noches",
        count: 0,
      },
      {
        key: "core",
        labelEn: "6-7 nights",
        labelEs: "6-7 noches",
        count: 0,
      },
      {
        key: "long",
        labelEn: "8+ nights",
        labelEs: "8+ noches",
        count: 0,
      },
    ];

    for (const entry of entries) {
      if (entry.nights <= 5) buckets[0].count += 1;
      else if (entry.nights <= 7) buckets[1].count += 1;
      else buckets[2].count += 1;
    }

    const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);
    return buckets.map((bucket) => ({
      ...bucket,
      width: Math.round((bucket.count / maxCount) * 100),
    }));
  }, [entries]);

  const seaPayQrTarget = useMemo(() => {
    return `https://www.cruisesfromgalveston.net/booking?deposit=seapay&lang=${lang}`;
  }, [lang]);

  const seaPayQrSrc = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(seaPayQrTarget)}`;
  }, [seaPayQrTarget]);

  async function onSubmitPlanningRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormSubmitting(true);
    setFormStatus("idle");

    try {
      const response = await fetch("/api/intake/planning-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          language: lang,
        }),
      });

      if (!response.ok) throw new Error("Request failed");
      setFormStatus("success");
      setFormState((prev) => ({
        ...prev,
        notes: "",
      }));
    } catch (submitError) {
      console.error(submitError);
      setFormStatus("error");
    } finally {
      setFormSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4ede4] text-text-secondary">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#b9ccd7] bg-[#0f2f45] shadow-[0_24px_70px_rgba(15,47,69,0.25)]">
          <Image
            src="/assets/symphony-of-the-seas.webp"
            alt="Port of Galveston cruise departures"
            fill
            priority
            sizes="(min-width: 1200px) 1100px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,34,52,0.86)_0%,rgba(20,59,79,0.62)_46%,rgba(244,237,228,0.24)_100%)]" />

          <div className="relative z-10 px-8 py-14 md:px-12 md:py-16">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="rounded-full bg-white/18 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#e5eff5]">
                {copy.badge}
              </span>
              <button
                type="button"
                onClick={() => setLang((current) => (current === "en" ? "es" : "en"))}
                className="rounded-full border border-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-white/10"
              >
                {copy.languageSwitch}
              </button>
            </div>
            <h1 className="mt-6 max-w-4xl font-accent text-4xl leading-tight text-white md:text-5xl">{copy.heading}</h1>
            <p className="mt-4 max-w-3xl text-base text-[#e3edf2] md:text-lg">{copy.intro}</p>
            <p className="mt-2 max-w-3xl text-sm text-[#d4e6ef]">{copy.subIntro}</p>
            <div className="mt-4">
              <span className="rounded-full bg-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e7f2f8]">
                {copy.galvestonOnlyLabel}
              </span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#live-search"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0f2f45] hover:bg-[#f4ede4]"
              >
                {lang === "es" ? "Ver salidas disponibles" : "View available sailings"}
              </a>
              <Link
                href="/booking"
                className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {lang === "es" ? "Reserva tu cabina" : "Reserve your cabin"}
              </Link>
              <a
                href="tel:14096322106"
                className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {lang === "es" ? "Habla con especialista" : "Speak with a cruise specialist"}
              </a>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
          <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.architectureTitle}</h2>
          <p className="mt-2 text-sm text-text-secondary">{copy.architectureSubtitle}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {PLANNING_ARCHITECTURE[lang].map((item) => (
              <article key={item.step} className="rounded-2xl border border-[#dae5eb] bg-[#f8fbfd] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#5a7b8d]">{item.step}</p>
                <h3 className="mt-2 text-lg font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
            <h2 className="mt-0 text-3xl font-accent text-text-primary">{copy.mapTitle}</h2>
            <p className="mt-2 text-sm text-text-secondary">{copy.mapSubtitle}</p>

            <div className="mt-6 rounded-2xl border border-[#dbe4e8] bg-[#f6fbff] p-4">
              <div className="relative h-[280px] overflow-hidden rounded-xl border border-[#d4e2ea] bg-[linear-gradient(160deg,#d2e6f2_0%,#bdd9ea_46%,#a8ccdf_100%)]">
                <div className="absolute left-[8%] top-[20%] h-[55%] w-[82%] rounded-[28px] border border-white/55 bg-white/20" />
                <div className="absolute left-[2%] top-[56%] h-[18%] w-[96%] rounded-full bg-[#8fb5cb]/65" />
                {TERMINALS.map((terminal) => (
                  <button
                    key={terminal.id}
                    type="button"
                    onClick={() => {
                      setSelectedTerminalId(terminal.id);
                      setFormState((prev) => ({ ...prev, terminal: terminal.nameEn }));
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold shadow transition ${
                      selectedTerminalId === terminal.id
                        ? "bg-[#0f2f45] text-white"
                        : "bg-white text-[#0f2f45] hover:bg-[#e9f3f8]"
                    }`}
                    style={{ left: terminal.left, top: terminal.top }}
                  >
                    {terminal.short}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
            <h3 className="mt-0 text-xl font-accent text-text-primary">
              {lang === "es" ? selectedTerminal.nameEs : selectedTerminal.nameEn}
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              {lang === "es" ? selectedTerminal.lineEs : selectedTerminal.lineEn}
            </p>
            <div className="mt-5 rounded-xl border border-[#dce6ea] bg-[#f7fbfd] p-4 text-sm">
              <p className="font-semibold text-text-primary">{lang === "es" ? "Actividad" : "Activity"}</p>
              <p className="mt-1 text-text-secondary">
                {lang === "es" ? selectedTerminal.statusEs : selectedTerminal.statusEn}
              </p>
            </div>
            <div className="mt-4 rounded-xl border border-[#dce6ea] bg-[#f7fbfd] p-4 text-sm">
              <p className="font-semibold text-text-primary">{lang === "es" ? "Estacionamiento recomendado" : "Parking fit"}</p>
              <p className="mt-1 text-text-secondary">
                {lang === "es" ? selectedTerminal.parkingEs : selectedTerminal.parkingEn}
              </p>
            </div>
            <a
              href="#request-assist"
              className="mt-5 inline-flex rounded-full border border-[#7ca2b7] px-4 py-2 text-sm font-semibold text-[#0f2f45] hover:bg-[#eef5f9]"
            >
              {lang === "es" ? "Solicitar apoyo para esta terminal" : "Request help for this terminal"}
            </a>
          </aside>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
            <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.parkingTitle}</h2>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#dbe4e8]">
              <table className="min-w-[680px] w-full border-collapse text-sm">
                <thead className="bg-[#eef6fb] text-left text-xs uppercase tracking-[0.16em] text-[#5a7c90]">
                  <tr>
                    <th className="px-4 py-3">{lang === "es" ? "Opcion" : "Option"}</th>
                    <th className="px-4 py-3">{lang === "es" ? "Costo diario" : "Daily cost"}</th>
                    <th className="px-4 py-3">{lang === "es" ? "Acceso" : "Access"}</th>
                    <th className="px-4 py-3">{lang === "es" ? "Ideal para" : "Best for"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5edf1]">
                  {PARKING_ROWS.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-semibold text-text-primary">
                        {lang === "es" ? row.optionEs : row.optionEn}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{row.costPerDay}</td>
                      <td className="px-4 py-3 text-text-secondary">
                        {lang === "es" ? row.walkTimeEs : row.walkTimeEn}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {lang === "es" ? row.bestForEs : row.bestForEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
            <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.chartTitle}</h2>
            <p className="mt-2 text-sm text-text-secondary">{copy.chartSubtitle}</p>
            <div className="mt-5 space-y-4">
              {durationStats.map((bucket) => (
                <div key={bucket.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-text-primary">
                      {lang === "es" ? bucket.labelEs : bucket.labelEn}
                    </span>
                    <span className="text-text-secondary">{bucket.count}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#e8edf0]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#2f6f8f,#3fa9a3)]"
                      style={{ width: `${bucket.width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
            <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.guideTitle}</h2>
            <a
              href={`/api/downloads/departure-guide?lang=${lang}`}
              className="mt-5 inline-flex rounded-full bg-[#0f2f45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123a53]"
            >
              {copy.downloadGuide}
            </a>

            <div className="mt-6 space-y-3">
              {CHECKLIST_60_DAY.map((item) => (
                <div key={item.day} className="rounded-xl border border-[#e0e8ed] bg-[#f8fbfd] px-4 py-3 text-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5b7a8c]">{item.day}</div>
                  <div className="mt-1 text-text-secondary">{lang === "es" ? item.es : item.en}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
            <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.feederTitle}</h2>
            <p className="mt-2 text-sm text-text-secondary">{copy.feederSubtitle}</p>
            <div className="mt-5 grid gap-3">
              {FEEDER_CITY_LINKS.map((city) => (
                <Link
                  key={city.href}
                  href={city.href}
                  className="rounded-xl border border-[#d9e4ea] bg-[#f8fbfd] px-4 py-3 text-sm hover:border-[#8fb0c2]"
                >
                  <div className="font-semibold text-text-primary">{lang === "es" ? city.cityEs : city.cityEn}</div>
                  <div className="mt-1 text-xs text-text-secondary">{lang === "es" ? city.noteEs : city.noteEn}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="live-search" className="mt-12 rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="mt-0 text-3xl font-accent text-text-primary">{copy.searchTitle}</h2>
              <p className="mt-2 text-sm text-text-secondary">{copy.searchSubtitle}</p>
              <span className="mt-2 inline-flex rounded-full bg-[#eef6fb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#537285]">
                {copy.galvestonOnlyLabel}
              </span>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#5b7a8c]">
                {lang === "es" ? "Ultima actualizacion" : "Last updated"}:{" "}
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                  : lang === "es"
                    ? "pendiente"
                    : "pending"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadEntries(true)}
              disabled={refreshing}
              className="rounded-full border border-[#7ca2b7] px-5 py-2.5 text-sm font-semibold text-[#0f2f45] hover:bg-[#eef5f9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? copy.refreshing : copy.refreshNow}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <label className="text-sm font-semibold text-text-secondary">
              {lang === "es" ? "Buscar" : "Search"}
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={lang === "es" ? "Barco, linea o duracion" : "Ship, line, or duration"}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              {lang === "es" ? "Linea de crucero" : "Cruise line"}
              <select
                value={lineFilter}
                onChange={(event) => setLineFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              >
                {availableLines.map((line) => (
                  <option key={line} value={line}>
                    {line === "all" ? (lang === "es" ? "Todas" : "All lines") : line}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              {lang === "es" ? "Presupuesto maximo p/p" : "Max budget p/p"}
              <input
                value={maxBudget}
                onChange={(event) => setMaxBudget(event.target.value)}
                type="number"
                min={0}
                step={25}
                placeholder={lang === "es" ? "Ej: 950" : "e.g. 950"}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              {lang === "es" ? "Disponibilidad cabina" : "Cabin availability"}
              <select
                value={cabinFilter}
                onChange={(event) => setCabinFilter(event.target.value as "all" | "open" | "limited")}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              >
                <option value="all">{lang === "es" ? "Todas" : "All"}</option>
                <option value="open">{lang === "es" ? "Abierta" : "Open"}</option>
                <option value="limited">{lang === "es" ? "Limitada" : "Limited"}</option>
              </select>
            </label>
            <label className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary">
              <input
                checked={seaPayOnly}
                onChange={(event) => setSeaPayOnly(event.target.checked)}
                type="checkbox"
                className="h-4 w-4 rounded border-[#9bb8c8]"
              />
              {lang === "es" ? "Solo SeaPay" : "SeaPay only"}
            </label>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-[#dbe5ea]">
            <table className="min-w-[860px] w-full border-collapse text-sm">
              <thead className="bg-[#eef6fb] text-left text-xs uppercase tracking-[0.16em] text-[#587688]">
                <tr>
                  <th className="px-4 py-3">{lang === "es" ? "Barco" : "Ship"}</th>
                  <th className="px-4 py-3">{lang === "es" ? "Salida" : "Departure"}</th>
                  <th className="px-4 py-3">{lang === "es" ? "Duracion" : "Duration"}</th>
                  <th className="px-4 py-3">{lang === "es" ? "Precio" : "Pricing"}</th>
                  <th className="px-4 py-3">{lang === "es" ? "Cabina" : "Cabin signal"}</th>
                  <th className="px-4 py-3">SeaPay</th>
                  <th className="px-4 py-3">{lang === "es" ? "Accion" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5edf1]">
                {loading && (
                  <tr>
                    <td className="px-4 py-6 text-text-secondary" colSpan={7}>
                      {lang === "es" ? "Cargando salidas..." : "Loading sailings..."}
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td className="px-4 py-6 text-red-600" colSpan={7}>
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredEntries.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-text-secondary" colSpan={7}>
                      {lang === "es"
                        ? "No hay salidas que coincidan con los filtros."
                        : "No sailings match these filters right now."}
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  filteredEntries.map((entry) => (
                    <tr key={entry.sailingId}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary">{entry.shipName}</div>
                        <div className="text-xs text-text-secondary">{entry.cruiseLine}</div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{formatDate(entry.departDate)}</td>
                      <td className="px-4 py-3 text-text-secondary">{entry.durationLabel}</td>
                      <td className="px-4 py-3 font-semibold text-[#0f4460]">{formatPrice(entry.priceFrom)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            cabinSignal(entry) === "limited"
                              ? "bg-[#fff2df] text-[#a46d22]"
                              : "bg-[#e9f7f1] text-[#2d7f58]"
                          }`}
                        >
                          {cabinSignal(entry) === "limited"
                            ? lang === "es"
                              ? "Limitada"
                              : "Limited"
                            : lang === "es"
                              ? "Disponible"
                              : "Open"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{entry.seaPayEligible ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/cruise/${entry.sailingId}`}
                          className="inline-flex rounded-full border border-[#88a9bb] px-3 py-1 text-xs font-semibold text-[#0f2f45] hover:bg-[#eef5f9]"
                        >
                          {lang === "es" ? "Ver" : "View"}
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
            <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.bookingTitle}</h2>
            <p className="mt-2 text-sm text-text-secondary">{copy.bookingSubtitle}</p>
            <div className="mt-5 grid gap-3">
              <a
                href="#live-search"
                className="rounded-xl border border-[#d7e4ea] bg-[#f7fbfd] px-4 py-3 text-sm font-semibold text-text-primary hover:border-[#8fb0c2]"
              >
                {lang === "es" ? "Ver salidas disponibles" : "View available sailings"}
              </a>
              <Link
                href="/booking"
                className="rounded-xl border border-[#d7e4ea] bg-[#f7fbfd] px-4 py-3 text-sm font-semibold text-text-primary hover:border-[#8fb0c2]"
              >
                {lang === "es" ? "Reserva tu cabina" : "Reserve your cabin"}
              </Link>
              <a
                href="mailto:hello@cruisesfromgalveston.net"
                className="rounded-xl border border-[#d7e4ea] bg-[#f7fbfd] px-4 py-3 text-sm font-semibold text-text-primary hover:border-[#8fb0c2]"
              >
                {lang === "es" ? "Habla con especialista de crucero" : "Speak with a cruise specialist"}
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
            <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.seaPayTitle}</h2>
            <p className="mt-2 text-sm text-text-secondary">{copy.seaPaySubtitle}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#dbe5ea] bg-[#f8fbfd] p-3 text-sm">
                <div className="font-semibold text-text-primary">Plan A</div>
                <div className="text-xs text-text-secondary">30% deposit</div>
              </div>
              <div className="rounded-xl border border-[#dbe5ea] bg-[#f8fbfd] p-3 text-sm">
                <div className="font-semibold text-text-primary">Plan B</div>
                <div className="text-xs text-text-secondary">50% split payment</div>
              </div>
              <div className="rounded-xl border border-[#dbe5ea] bg-[#f8fbfd] p-3 text-sm">
                <div className="font-semibold text-text-primary">Plan C</div>
                <div className="text-xs text-text-secondary">Final payment reminder</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={seaPayQrSrc}
                alt="SeaPay QR code"
                width={160}
                height={160}
                className="rounded-xl border border-[#d7e4ea] bg-white p-2"
              />
              <div className="max-w-sm text-sm text-text-secondary">
                <p>
                  {lang === "es"
                    ? "Escanea para revisar opciones de SeaPay y continuar al flujo oficial de deposito."
                    : "Scan to review SeaPay options and continue to the official deposit flow."}
                </p>
                <a href={seaPayQrTarget} className="mt-2 inline-block text-sm font-semibold text-primary-blue">
                  {lang === "es" ? "Abrir enlace SeaPay" : "Open SeaPay link"}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="request-assist" className="mt-12 rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
          <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.requestHeading}</h2>

          <form onSubmit={onSubmitPlanningRequest} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-text-secondary">
              {lang === "es" ? "Nombre" : "Name"}
              <input
                required
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>

            <label className="text-sm font-semibold text-text-secondary">
              Email
              <input
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                type="email"
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>

            <label className="text-sm font-semibold text-text-secondary">
              {lang === "es" ? "Telefono" : "Phone"}
              <input
                value={formState.phone}
                onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>

            <label className="text-sm font-semibold text-text-secondary">
              {lang === "es" ? "Mes de salida" : "Sailing month"}
              <input
                value={formState.sailingMonth}
                onChange={(event) => setFormState((prev) => ({ ...prev, sailingMonth: event.target.value }))}
                placeholder={lang === "es" ? "Ej: Junio 2026" : "e.g. June 2026"}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>

            <label className="text-sm font-semibold text-text-secondary">
              {lang === "es" ? "Terminal" : "Terminal"}
              <select
                value={formState.terminal}
                onChange={(event) => setFormState((prev) => ({ ...prev, terminal: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              >
                <option value="">{lang === "es" ? "Selecciona terminal" : "Select terminal"}</option>
                {TERMINALS.map((terminal) => (
                  <option key={terminal.id} value={terminal.nameEn}>
                    {lang === "es" ? terminal.nameEs : terminal.nameEn}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-text-secondary">
              {lang === "es" ? "Preferencia estacionamiento" : "Parking preference"}
              <input
                value={formState.parkingOption}
                onChange={(event) => setFormState((prev) => ({ ...prev, parkingOption: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>

            <label className="text-sm font-semibold text-text-secondary">
              {lang === "es" ? "Preferencia transporte" : "Transport preference"}
              <input
                value={formState.transportOption}
                onChange={(event) => setFormState((prev) => ({ ...prev, transportOption: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>

            <label className="text-sm font-semibold text-text-secondary">
              SeaPay
              <select
                value={formState.wantsSeaPay ? "yes" : "no"}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, wantsSeaPay: event.target.value === "yes" }))
                }
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              >
                <option value="no">{lang === "es" ? "No por ahora" : "Not right now"}</option>
                <option value="yes">{lang === "es" ? "Si, interesada/o" : "Yes, interested"}</option>
              </select>
            </label>

            <label className="md:col-span-2 text-sm font-semibold text-text-secondary">
              {lang === "es" ? "Notas" : "Notes"}
              <textarea
                value={formState.notes}
                onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={formSubmitting}
                className="rounded-full bg-[#0f2f45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#123a53] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formSubmitting ? copy.requestSending : copy.requestSubmit}
              </button>
              {formStatus === "success" && <span className="text-sm text-[#2f7f58]">{copy.requestSuccess}</span>}
              {formStatus === "error" && <span className="text-sm text-[#a45135]">{copy.requestError}</span>}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
