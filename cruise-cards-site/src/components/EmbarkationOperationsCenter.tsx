"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Language = "en" | "es";
type ParkingStatus = "open" | "limited" | "full";
type TrafficStatus = "low" | "moderate" | "high";
type WeatherLevel = "none" | "watch" | "warning";

type OperationsPayload = {
  updatedAt: string;
  weather: {
    condition: string;
    temperatureF: number | null;
    windMph: number | null;
    precipitationChance: number | null;
    advisoryLevel: WeatherLevel;
    advisories: Array<{
      event: string;
      severity: string;
      expires: string | null;
    }>;
    message: string;
    source: string;
  };
  traffic: {
    status: TrafficStatus;
    congestionPct: number | null;
    speedMph: number | null;
    freeFlowMph: number | null;
    message: string;
    source: string;
  };
  parking: {
    source: string;
    indicators: Array<{
      pier: "pier10" | "pier25";
      status: ParkingStatus;
      occupancyPct: number;
      note: string | null;
      reportedAt: string | null;
    }>;
  };
  embarkation: {
    sailingsToday: number;
    topShips: string[];
  };
};

type TextAlertForm = {
  phone: string;
  sailingDate: string;
  shipName: string;
};

const REFRESH_INTERVAL_MS = 60_000;

const COPY = {
  en: {
    badge: "Real-time embarkation technology",
    title: "Embarkation Operations Center",
    subtitle:
      "Live weather alerts, congestion signals, parking capacity indicators, and text update requests for sailing day.",
    weather: "Weather alerts",
    traffic: "Traffic congestion",
    parking: "Parking capacity",
    textUpdates: "Text updates for embarkation day",
    refresh: "Refresh operations feed",
    refreshing: "Refreshing...",
    sailingLoad: "Galveston sailings departing today",
    shipsToday: "Ships in today's departure set",
    submit: "Request text updates",
    sending: "Sending...",
    success: "Text update request received. We will notify your embarkation-day updates.",
    error: "Unable to save your text update request right now.",
    advisories: "Active advisories",
    source: "Source",
  },
  es: {
    badge: "Tecnologia en tiempo real para embarque",
    title: "Centro de Operaciones de Embarque",
    subtitle:
      "Alertas de clima, congestion vial, indicador de capacidad de estacionamiento y solicitud de actualizaciones por texto.",
    weather: "Alertas de clima",
    traffic: "Congestion vial",
    parking: "Capacidad de estacionamiento",
    textUpdates: "Actualizaciones por texto para dia de embarque",
    refresh: "Actualizar operaciones",
    refreshing: "Actualizando...",
    sailingLoad: "Salidas de Galveston para hoy",
    shipsToday: "Barcos en salidas de hoy",
    submit: "Solicitar actualizaciones por texto",
    sending: "Enviando...",
    success: "Solicitud recibida. Te enviaremos actualizaciones para tu dia de embarque.",
    error: "No se pudo guardar tu solicitud en este momento.",
    advisories: "Avisos activos",
    source: "Fuente",
  },
} as const;

function levelTone(level: WeatherLevel) {
  if (level === "warning") return "bg-[#ffe8e0] text-[#a54528]";
  if (level === "watch") return "bg-[#fff3e2] text-[#9f6b17]";
  return "bg-[#e8f5ed] text-[#2f7f58]";
}

function trafficTone(status: TrafficStatus) {
  if (status === "high") return "bg-[#ffe8e0] text-[#a54528]";
  if (status === "moderate") return "bg-[#fff3e2] text-[#9f6b17]";
  return "bg-[#e8f5ed] text-[#2f7f58]";
}

function parkingTone(status: ParkingStatus) {
  if (status === "full") return "bg-[#ffe8e0] text-[#a54528]";
  if (status === "limited") return "bg-[#fff3e2] text-[#9f6b17]";
  return "bg-[#e8f5ed] text-[#2f7f58]";
}

export default function EmbarkationOperationsCenter({ language = "en" }: { language?: Language }) {
  const [data, setData] = useState<OperationsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [textForm, setTextForm] = useState<TextAlertForm>({
    phone: "",
    sailingDate: "",
    shipName: "",
  });
  const [textSubmitting, setTextSubmitting] = useState(false);
  const [textStatus, setTextStatus] = useState<"idle" | "success" | "error">("idle");

  const copy = COPY[language];

  const loadOperations = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch("/api/embarkation/operations", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed operations request");
        const payload = (await response.json()) as OperationsPayload;
        setData(payload);
        setError(null);
      } catch (loadError) {
        console.error(loadError);
        setError(language === "es" ? "No se pudo cargar operaciones en vivo." : "Unable to load live operations feed.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [language],
  );

  useEffect(() => {
    void loadOperations(false);
  }, [loadOperations]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void loadOperations(true);
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [loadOperations]);

  const sailingsTodayList = useMemo(() => {
    return data?.embarkation.topShips?.join(", ") || "—";
  }, [data?.embarkation.topShips]);

  async function submitTextUpdates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTextSubmitting(true);
    setTextStatus("idle");

    try {
      const response = await fetch("/api/intake/embarkation-text-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: textForm.phone,
          sailingDate: textForm.sailingDate,
          shipName: textForm.shipName,
          language,
        }),
      });
      if (!response.ok) throw new Error("Embarkation text request failed");
      setTextStatus("success");
    } catch (submitError) {
      console.error(submitError);
      setTextStatus("error");
    } finally {
      setTextSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[#d7cec4] bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#5e7d8e]">{copy.badge}</p>
          <h2 className="mt-2 text-3xl font-accent text-text-primary">{copy.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-text-secondary">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => void loadOperations(true)}
          disabled={refreshing}
          className="rounded-full border border-[#7ca2b7] px-5 py-2.5 text-sm font-semibold text-[#0f2f45] hover:bg-[#eef5f9] disabled:opacity-60"
        >
          {refreshing ? copy.refreshing : copy.refresh}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#dbe4ea] bg-[#f8fbfd] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[#5c7d90]">{copy.weather}</p>
          {loading ? (
            <p className="mt-2 text-sm text-text-secondary">Loading...</p>
          ) : (
            <>
              <p className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${levelTone(data?.weather.advisoryLevel || "none")}`}>
                {(data?.weather.advisoryLevel || "none").toUpperCase()}
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {data?.weather.condition || "—"} · {data?.weather.temperatureF != null ? `${data.weather.temperatureF}F` : "—"}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Wind {data?.weather.windMph != null ? `${data.weather.windMph} mph` : "—"} · Precip{" "}
                {data?.weather.precipitationChance != null ? `${data.weather.precipitationChance}%` : "—"}
              </p>
              <p className="mt-2 text-xs text-text-secondary">{data?.weather.message}</p>
            </>
          )}
        </article>

        <article className="rounded-2xl border border-[#dbe4ea] bg-[#f8fbfd] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[#5c7d90]">{copy.traffic}</p>
          {loading ? (
            <p className="mt-2 text-sm text-text-secondary">Loading...</p>
          ) : (
            <>
              <p className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${trafficTone(data?.traffic.status || "low")}`}>
                {(data?.traffic.status || "low").toUpperCase()}
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {data?.traffic.congestionPct != null ? `${data.traffic.congestionPct}% congestion` : "Congestion signal unavailable"}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                {data?.traffic.speedMph != null ? `Speed ${data.traffic.speedMph} mph` : "Speed n/a"}
                {data?.traffic.freeFlowMph != null ? ` · Free flow ${data.traffic.freeFlowMph} mph` : ""}
              </p>
              <p className="mt-2 text-xs text-text-secondary">{data?.traffic.message}</p>
            </>
          )}
        </article>

        <article className="rounded-2xl border border-[#dbe4ea] bg-[#f8fbfd] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[#5c7d90]">{copy.parking}</p>
          {loading ? (
            <p className="mt-2 text-sm text-text-secondary">Loading...</p>
          ) : (
            <div className="mt-2 space-y-3">
              {data?.parking.indicators?.map((indicator) => (
                <div key={indicator.pier}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-primary">{indicator.pier.toUpperCase()}</span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${parkingTone(indicator.status)}`}>
                      {indicator.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#dde7ec]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#2f6f8f,#3fa9a3)]"
                      style={{ width: `${indicator.occupancyPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-[#dbe4ea] bg-[#f8fbfd] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[#5c7d90]">{copy.sailingLoad}</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">{data?.embarkation.sailingsToday ?? "—"}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#5c7d90]">{copy.shipsToday}</p>
          <p className="mt-1 text-xs text-text-secondary">{sailingsTodayList}</p>
          <p className="mt-2 text-[11px] text-[#6f808b]">
            {copy.source}: {data?.weather.source || "—"} · {data?.traffic.source || "—"}
          </p>
        </article>
      </div>

      {(data?.weather.advisories?.length || 0) > 0 && (
        <div className="mt-6 rounded-2xl border border-[#e7ddd3] bg-[#fffaf4] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[#876849]">{copy.advisories}</p>
          <ul className="mt-2 space-y-1 text-sm text-text-secondary">
            {data?.weather.advisories.slice(0, 3).map((advisory) => (
              <li key={`${advisory.event}-${advisory.expires || "na"}`}>
                <span className="font-semibold text-text-primary">{advisory.event}</span> · {advisory.severity}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-[#dbe4ea] bg-[#f8fbfd] p-4">
        <h3 className="mt-0 text-xl font-accent text-text-primary">{copy.textUpdates}</h3>
        <form onSubmit={submitTextUpdates} className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm font-semibold text-text-secondary">
            {language === "es" ? "Telefono" : "Phone"}
            <input
              required
              value={textForm.phone}
              onChange={(event) => setTextForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-white px-4 py-3 text-sm text-text-primary"
            />
          </label>
          <label className="text-sm font-semibold text-text-secondary">
            {language === "es" ? "Fecha de salida" : "Sailing date"}
            <input
              type="date"
              value={textForm.sailingDate}
              onChange={(event) => setTextForm((prev) => ({ ...prev, sailingDate: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-white px-4 py-3 text-sm text-text-primary"
            />
          </label>
          <label className="text-sm font-semibold text-text-secondary">
            {language === "es" ? "Barco (opcional)" : "Ship (optional)"}
            <input
              value={textForm.shipName}
              onChange={(event) => setTextForm((prev) => ({ ...prev, shipName: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-[#d5e0e6] bg-white px-4 py-3 text-sm text-text-primary"
            />
          </label>
          <div className="md:col-span-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={textSubmitting}
              className="rounded-full bg-[#0f2f45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#123a53] disabled:opacity-60"
            >
              {textSubmitting ? copy.sending : copy.submit}
            </button>
            {textStatus === "success" && <span className="text-sm text-[#2f7f58]">{copy.success}</span>}
            {textStatus === "error" && <span className="text-sm text-[#a45135]">{copy.error}</span>}
            {error && <span className="text-sm text-[#a45135]">{error}</span>}
          </div>
        </form>
      </div>
    </section>
  );
}
