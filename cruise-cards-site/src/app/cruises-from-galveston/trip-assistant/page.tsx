"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type Language = "en" | "es";

type AssistantResponse = {
  assistant: {
    type: string;
    language: Language;
    focus: string;
    summary: string;
    generatedAt: string;
    source: string;
  };
  travelerProfile: {
    adults: number;
    children: number;
    preferredNights: number | null;
    budgetMax: number | null;
  };
  routeBrief: {
    key: string;
    title: string;
    overview: string;
    typicalNights: string;
    commonPorts: string[];
    regulations: string[];
  };
  terminalPlaybook: {
    terminals: Array<{
      name: string;
      arrivalNote: string;
      parkingLogistics: string;
    }>;
  };
  recommendations: Array<{
    sailingId: string;
    shipName: string;
    cruiseLine: string;
    departDate: string | null;
    nights: number | null;
    itinerary: string;
    portsSummary: string | null;
    priceFrom: number | null;
    seaPayEligible: boolean;
    terminalName: string;
    terminalArrivalNote: string;
    parkingLogistics: string;
    score: number;
  }>;
  nextActions: string[];
};

type AssistantForm = {
  question: string;
  destinationFocus:
    | "any"
    | "bahamas"
    | "eastern_caribbean"
    | "western_caribbean"
    | "panama_canal"
    | "jamaica";
  adults: string;
  children: string;
  preferredNights: string;
  budgetMax: string;
};

const COPY = {
  en: {
    badge: "Localized AI Trip Planning Assistant",
    heading: "Galveston-specific cruise planning intelligence",
    intro:
      "This assistant is trained on local Galveston departure context: ships, terminals, route patterns, port regulations, parking logistics, and booking operations.",
    subIntro:
      "Coverage includes Bahamas, Eastern Caribbean, Western Caribbean, Panama Canal, and Jamaica routes from Galveston.",
    askTitle: "Ask the assistant for a personalized plan",
    askSubtitle: "Share your route goals, length preference, and budget for localized recommendations.",
    submit: "Generate localized trip plan",
    submitting: "Building plan...",
    questionLabel: "What do you need help planning?",
    destinationLabel: "Destination focus",
    adultsLabel: "Adults",
    childrenLabel: "Children",
    nightsLabel: "Preferred nights",
    budgetLabel: "Budget max per person",
    summaryLabel: "Assistant summary",
    routeLabel: "Route guidance",
    terminalsLabel: "Terminal and parking playbook",
    recommendationsLabel: "Top Galveston sailing matches",
    actionsLabel: "Recommended next steps",
    sourceLabel: "Data source",
    reserve: "Reserve cabin",
    viewSailing: "View sailing",
    specialist: "Speak with specialist",
    emptyRecommendations:
      "No exact sailing matches right now. Try broadening destination focus, budget, or preferred nights.",
    languageSwitch: "Ver en Espanol",
    galvestonOnly: "Galveston departures only",
  },
  es: {
    badge: "Asistente IA Local de Planificacion",
    heading: "Inteligencia de planificacion enfocada en Galveston",
    intro:
      "Este asistente esta entrenado con contexto real de salidas en Galveston: barcos, terminales, rutas, regulaciones, estacionamiento y operaciones de reservacion.",
    subIntro:
      "Incluye Bahamas, Caribe Oriental, Caribe Occidental, Canal de Panama y rutas con Jamaica desde Galveston.",
    askTitle: "Pide un plan personalizado",
    askSubtitle: "Comparte tu meta de ruta, duracion y presupuesto para recomendaciones locales.",
    submit: "Generar plan localizado",
    submitting: "Creando plan...",
    questionLabel: "Que necesitas planificar?",
    destinationLabel: "Ruta objetivo",
    adultsLabel: "Adultos",
    childrenLabel: "Ninos",
    nightsLabel: "Noches preferidas",
    budgetLabel: "Presupuesto maximo por persona",
    summaryLabel: "Resumen del asistente",
    routeLabel: "Guia de ruta",
    terminalsLabel: "Playbook de terminal y estacionamiento",
    recommendationsLabel: "Mejores salidas desde Galveston",
    actionsLabel: "Siguientes pasos recomendados",
    sourceLabel: "Fuente de datos",
    reserve: "Reservar cabina",
    viewSailing: "Ver salida",
    specialist: "Hablar con especialista",
    emptyRecommendations:
      "No hay coincidencias exactas en este momento. Amplia ruta, presupuesto o noches preferidas.",
    languageSwitch: "View in English",
    galvestonOnly: "Solo salidas desde Galveston",
  },
} as const;

function formatDate(value: string | null) {
  if (!value) return "TBD";
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

export default function TripAssistantPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [form, setForm] = useState<AssistantForm>({
    question: "",
    destinationFocus: "any",
    adults: "2",
    children: "0",
    preferredNights: "",
    budgetMax: "",
  });

  const copy = COPY[language];

  const destinationOptions = useMemo(
    () => [
      { value: "any", labelEn: "Any (let assistant infer best route)", labelEs: "Cualquiera (asistente infiere)" },
      { value: "bahamas", labelEn: "Bahamas", labelEs: "Bahamas" },
      { value: "eastern_caribbean", labelEn: "Eastern Caribbean", labelEs: "Caribe Oriental" },
      { value: "western_caribbean", labelEn: "Western Caribbean", labelEs: "Caribe Occidental" },
      { value: "panama_canal", labelEn: "Panama Canal", labelEs: "Canal de Panama" },
      { value: "jamaica", labelEn: "Jamaica", labelEs: "Jamaica" },
    ],
    [],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/trip-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: form.question,
          destinationFocus: form.destinationFocus,
          language,
          adults: Number(form.adults || 2),
          children: Number(form.children || 0),
          preferredNights: form.preferredNights ? Number(form.preferredNights) : null,
          budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
        }),
      });
      if (!res.ok) throw new Error("Assistant request failed");
      const payload = (await res.json()) as AssistantResponse;
      setResponse(payload);
    } catch (submitError) {
      console.error(submitError);
      setError(language === "es" ? "No se pudo generar el plan." : "Unable to generate plan right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4ede4] text-text-secondary">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-14">
        <section className="rounded-3xl border border-[#c7d8e2] bg-[linear-gradient(145deg,#f7fbfd,#edf5f9)] p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="rounded-full bg-[#0f2f45] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white">
              {copy.badge}
            </span>
            <button
              type="button"
              onClick={() => setLanguage((current) => (current === "en" ? "es" : "en"))}
              className="rounded-full border border-[#88a9bb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0f2f45] hover:bg-white"
            >
              {copy.languageSwitch}
            </button>
          </div>
          <h1 className="mt-5 font-accent text-4xl text-text-primary md:text-5xl">{copy.heading}</h1>
          <p className="mt-3 max-w-4xl text-sm text-text-secondary md:text-base">{copy.intro}</p>
          <p className="mt-2 max-w-4xl text-sm text-text-secondary">{copy.subIntro}</p>
          <div className="mt-4">
            <span className="rounded-full bg-[#e6f1f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4f7184]">
              {copy.galvestonOnly}
            </span>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
          <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.askTitle}</h2>
          <p className="mt-2 text-sm text-text-secondary">{copy.askSubtitle}</p>
          <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="md:col-span-2 lg:col-span-3 text-sm font-semibold text-text-secondary">
              {copy.questionLabel}
              <textarea
                required
                value={form.question}
                onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
                placeholder={
                  language === "es"
                    ? "Ejemplo: Quiero Jamaica en 7 noches con estacionamiento facil y ayuda de documentos"
                    : "Example: I want a 7-night Jamaica route with easier parking and clear document guidance"
                }
              />
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              {copy.destinationLabel}
              <select
                value={form.destinationFocus}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    destinationFocus: event.target.value as AssistantForm["destinationFocus"],
                  }))
                }
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              >
                {destinationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {language === "es" ? option.labelEs : option.labelEn}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              {copy.adultsLabel}
              <input
                type="number"
                min={1}
                max={8}
                value={form.adults}
                onChange={(event) => setForm((prev) => ({ ...prev, adults: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              {copy.childrenLabel}
              <input
                type="number"
                min={0}
                max={6}
                value={form.children}
                onChange={(event) => setForm((prev) => ({ ...prev, children: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              {copy.nightsLabel}
              <input
                type="number"
                min={3}
                max={21}
                value={form.preferredNights}
                onChange={(event) => setForm((prev) => ({ ...prev, preferredNights: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm font-semibold text-text-secondary">
              {copy.budgetLabel}
              <input
                type="number"
                min={0}
                step={25}
                value={form.budgetMax}
                onChange={(event) => setForm((prev) => ({ ...prev, budgetMax: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-[#fcfefe] px-4 py-3 text-sm text-text-primary"
              />
            </label>
            <div className="md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#0f2f45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#123a53] disabled:opacity-60"
              >
                {loading ? copy.submitting : copy.submit}
              </button>
              {error && <span className="ml-3 text-sm text-[#a45135]">{error}</span>}
            </div>
          </form>
        </section>

        {response && (
          <>
            <section className="mt-8 rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.16em] text-[#5d7d8e]">{copy.summaryLabel}</p>
              <p className="mt-3 text-sm text-text-secondary">{response.assistant.summary}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-[#6a8393]">
                {copy.sourceLabel}: {response.assistant.source}
              </p>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <article className="rounded-3xl border border-[#d7cec4] bg-white p-6">
                <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.routeLabel}</h2>
                <p className="mt-2 text-sm font-semibold text-[#0f4460]">{response.routeBrief.title}</p>
                <p className="mt-2 text-sm text-text-secondary">{response.routeBrief.overview}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#617f90]">
                  {language === "es" ? "Duracion tipica" : "Typical length"}: {response.routeBrief.typicalNights}
                </p>
                <p className="mt-2 text-xs text-text-secondary">
                  {language === "es" ? "Puertos comunes" : "Common ports"}: {response.routeBrief.commonPorts.join(", ")}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                  {response.routeBrief.regulations.map((item) => (
                    <li key={item} className="rounded-xl border border-[#e0e8ed] bg-[#f8fbfd] px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-3xl border border-[#d7cec4] bg-white p-6">
                <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.terminalsLabel}</h2>
                <div className="mt-4 space-y-3">
                  {response.terminalPlaybook.terminals.map((terminal) => (
                    <div key={terminal.name} className="rounded-xl border border-[#e0e8ed] bg-[#f8fbfd] p-4">
                      <p className="font-semibold text-text-primary">{terminal.name}</p>
                      <p className="mt-1 text-sm text-text-secondary">{terminal.arrivalNote}</p>
                      <p className="mt-1 text-xs text-[#5f7f90]">{terminal.parkingLogistics}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="mt-8 rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
              <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.recommendationsLabel}</h2>
              {response.recommendations.length === 0 ? (
                <p className="mt-3 text-sm text-text-secondary">{copy.emptyRecommendations}</p>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {response.recommendations.map((item) => (
                    <article key={item.sailingId} className="rounded-2xl border border-[#dbe5ea] bg-[#f8fbfd] p-5">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#5f7f90]">{item.cruiseLine}</p>
                      <h3 className="mt-2 text-xl font-semibold text-text-primary">{item.shipName}</h3>
                      <p className="mt-2 text-sm text-text-secondary">
                        {formatDate(item.departDate)} · {item.nights ?? "?"} {language === "es" ? "noches" : "nights"}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">{item.itinerary}</p>
                      {item.portsSummary && <p className="mt-1 text-xs text-[#617f90]">{item.portsSummary}</p>}
                      <p className="mt-3 text-base font-semibold text-[#0f4460]">{formatPrice(item.priceFrom)}</p>
                      <div className="mt-3 rounded-xl border border-[#dce7ec] bg-white p-3 text-xs text-text-secondary">
                        <div className="font-semibold text-text-primary">{item.terminalName}</div>
                        <div className="mt-1">{item.terminalArrivalNote}</div>
                        <div className="mt-1">{item.parkingLogistics}</div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/cruise/${item.sailingId}`}
                          className="rounded-full border border-[#88a9bb] px-4 py-2 text-xs font-semibold text-[#0f2f45] hover:bg-[#eef5f9]"
                        >
                          {copy.viewSailing}
                        </Link>
                        <Link
                          href={`/booking?sailingId=${item.sailingId}&source=trip-assistant${item.seaPayEligible ? "&deposit=seapay" : ""}`}
                          className="rounded-full bg-[#0f2f45] px-4 py-2 text-xs font-semibold text-white hover:bg-[#123a53]"
                        >
                          {copy.reserve}
                        </Link>
                        <a
                          href="tel:14096322106"
                          className="rounded-full border border-[#88a9bb] px-4 py-2 text-xs font-semibold text-[#0f2f45] hover:bg-[#eef5f9]"
                        >
                          {copy.specialist}
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8 rounded-3xl border border-[#d7cec4] bg-white p-6">
              <h2 className="mt-0 text-2xl font-accent text-text-primary">{copy.actionsLabel}</h2>
              <ol className="mt-4 space-y-2 text-sm text-text-secondary">
                {response.nextActions.map((item, index) => (
                  <li key={item} className="rounded-xl border border-[#e0e8ed] bg-[#f8fbfd] px-3 py-2">
                    <span className="mr-2 font-semibold text-text-primary">{index + 1}.</span>
                    {item}
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}

        <section className="mt-8 rounded-3xl border border-[#d7cec4] bg-white p-6">
          <h2 className="mt-0 text-2xl font-accent text-text-primary">
            {language === "es" ? "Integracion de reservacion" : "Booking integration"}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {language === "es"
              ? "Pasa del plan a accion con enlaces claros para revisar salidas, reservar cabina o hablar con especialista."
              : "Move from planning to action with clear links to review sailings, reserve a cabin, or speak with a specialist."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/cruises-from-galveston/board"
              className="rounded-full border border-[#88a9bb] px-5 py-2 text-sm font-semibold text-[#0f2f45] hover:bg-[#eef5f9]"
            >
              {language === "es" ? "Ver tablero en vivo" : "View live departures"}
            </Link>
            <Link
              href="/booking?source=trip-assistant"
              className="rounded-full bg-[#0f2f45] px-5 py-2 text-sm font-semibold text-white hover:bg-[#123a53]"
            >
              {language === "es" ? "Reservar ahora" : "Reserve now"}
            </Link>
            <a
              href="tel:14096322106"
              className="rounded-full border border-[#88a9bb] px-5 py-2 text-sm font-semibold text-[#0f2f45] hover:bg-[#eef5f9]"
            >
              {language === "es" ? "Llamar especialista" : "Call specialist"}
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
