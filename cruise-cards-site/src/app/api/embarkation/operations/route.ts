import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ParkingStatus = "open" | "limited" | "full";
type TrafficStatus = "low" | "moderate" | "high";
type WeatherLevel = "none" | "watch" | "warning";

type ParkingIndicator = {
  pier: "pier10" | "pier25";
  status: ParkingStatus;
  occupancyPct: number;
  note: string | null;
  reportedAt: string | null;
};

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
    indicators: ParkingIndicator[];
  };
  embarkation: {
    sailingsToday: number;
    topShips: string[];
  };
};

const GALVESTON_LAT = 29.3013;
const GALVESTON_LON = -94.7977;
const TZ = "America/Chicago";

function statusToOccupancy(status: ParkingStatus) {
  if (status === "full") return 95;
  if (status === "limited") return 72;
  return 28;
}

function conditionFromWeatherCode(code: number | null | undefined) {
  if (code == null || !Number.isFinite(code)) return "Unknown";
  if (code === 0) return "Clear";
  if (code === 1 || code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "Rain";
  if (code >= 71 && code <= 77) return "Snow/Ice";
  if (code >= 95) return "Thunderstorms";
  return "Mixed conditions";
}

function chicagoDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  const year = byType.get("year") || "1970";
  const month = byType.get("month") || "01";
  const day = byType.get("day") || "01";
  const hour = Number(byType.get("hour") || "0");
  return {
    dateIso: `${year}-${month}-${day}`,
    hour: Number.isFinite(hour) ? hour : 0,
  };
}

function inferParkingStatus(pier: "pier10" | "pier25", sailingsToday: number, hour: number): ParkingStatus {
  if (pier === "pier25") {
    if (sailingsToday >= 3 && hour >= 9) return "full";
    if (sailingsToday >= 2 && hour >= 8) return "limited";
    return "open";
  }
  if (sailingsToday >= 4 && hour >= 9) return "full";
  if (sailingsToday >= 2 && hour >= 9) return "limited";
  return "open";
}

function inferTrafficStatus(sailingsToday: number, hour: number): { status: TrafficStatus; message: string } {
  const morningEmbarkWindow = hour >= 7 && hour <= 11;
  const afternoonCongestion = hour >= 15 && hour <= 18;

  if (morningEmbarkWindow && sailingsToday >= 2) {
    return {
      status: "high",
      message:
        "Heavy approach traffic expected near I-45 South and Harborside during embarkation windows. Plan extra buffer time.",
    };
  }

  if ((morningEmbarkWindow && sailingsToday >= 1) || afternoonCongestion) {
    return {
      status: "moderate",
      message: "Moderate congestion expected on primary port approach routes. Depart earlier when possible.",
    };
  }

  return {
    status: "low",
    message: "Traffic flow is currently lighter than typical embarkation windows.",
  };
}

function weatherLevelFromAlerts(severityValues: string[]): WeatherLevel {
  const normalized = severityValues.map((value) => value.toLowerCase());
  if (normalized.some((value) => value.includes("extreme") || value.includes("severe") || value.includes("warning"))) {
    return "warning";
  }
  if (normalized.some((value) => value.includes("watch") || value.includes("moderate"))) {
    return "watch";
  }
  return "none";
}

async function loadWeather() {
  const forecastUrl =
    "https://api.open-meteo.com/v1/forecast?latitude=29.3013&longitude=-94.7977&current=temperature_2m,wind_speed_10m,weather_code&hourly=precipitation_probability&forecast_days=1&timezone=America%2FChicago";
  const alertsUrl = `https://api.weather.gov/alerts/active?point=${GALVESTON_LAT},${GALVESTON_LON}`;

  const [forecastRes, alertsRes] = await Promise.allSettled([
    fetch(forecastUrl, { cache: "no-store" }),
    fetch(alertsUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "cruisesfromgalveston.net operations desk",
        Accept: "application/geo+json",
      },
    }),
  ]);

  let temperatureF: number | null = null;
  let windMph: number | null = null;
  let condition = "Unknown";
  let precipitationChance: number | null = null;
  let source = "open-meteo";

  if (forecastRes.status === "fulfilled" && forecastRes.value.ok) {
    const forecastJson = (await forecastRes.value.json()) as {
      current?: {
        temperature_2m?: number;
        wind_speed_10m?: number;
        weather_code?: number;
      };
      hourly?: {
        precipitation_probability?: number[];
      };
    };

    const tempC = forecastJson.current?.temperature_2m;
    temperatureF = Number.isFinite(tempC as number) ? Math.round(((tempC as number) * 9) / 5 + 32) : null;
    windMph = Number.isFinite(forecastJson.current?.wind_speed_10m as number)
      ? Math.round((forecastJson.current?.wind_speed_10m as number) * 0.621371)
      : null;
    condition = conditionFromWeatherCode(forecastJson.current?.weather_code);
    const precipList = forecastJson.hourly?.precipitation_probability;
    precipitationChance = Array.isArray(precipList) && precipList.length ? Math.max(...precipList.slice(0, 12)) : null;
  } else {
    source = "fallback";
  }

  let advisories: OperationsPayload["weather"]["advisories"] = [];
  let advisoryLevel: WeatherLevel = "none";

  if (alertsRes.status === "fulfilled" && alertsRes.value.ok) {
    const alertsJson = (await alertsRes.value.json()) as {
      features?: Array<{
        properties?: {
          event?: string;
          severity?: string;
          expires?: string;
        };
      }>;
    };

    advisories =
      alertsJson.features?.slice(0, 4).map((feature) => ({
        event: feature.properties?.event || "Advisory",
        severity: feature.properties?.severity || "Unknown",
        expires: feature.properties?.expires || null,
      })) || [];

    advisoryLevel = weatherLevelFromAlerts(advisories.map((item) => item.severity));
    if (source === "open-meteo") source = "open-meteo + nws alerts";
  }

  const message =
    advisoryLevel === "warning"
      ? "Weather warning level conditions detected for the Galveston area. Reconfirm embarkation timing and terminal guidance."
      : advisoryLevel === "watch"
        ? "Weather watch-level conditions are active near Galveston. Monitor updates before departure."
        : "No major weather alerts are currently active for Galveston departures.";

  return {
    condition,
    temperatureF,
    windMph,
    precipitationChance,
    advisoryLevel,
    advisories,
    message,
    source,
  };
}

async function loadTraffic(sailingsToday: number, hour: number) {
  const tomtomKey = process.env.TOMTOM_API_KEY;
  if (!tomtomKey) {
    const inferred = inferTrafficStatus(sailingsToday, hour);
    return {
      status: inferred.status,
      congestionPct: inferred.status === "high" ? 55 : inferred.status === "moderate" ? 30 : 12,
      speedMph: null,
      freeFlowMph: null,
      message: inferred.message,
      source: "embarkation schedule heuristic",
    };
  }

  try {
    const trafficUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${GALVESTON_LAT},${GALVESTON_LON}&unit=mph&key=${tomtomKey}`;
    const trafficRes = await fetch(trafficUrl, { cache: "no-store" });
    if (!trafficRes.ok) throw new Error(`TomTom status ${trafficRes.status}`);

    const trafficJson = (await trafficRes.json()) as {
      flowSegmentData?: {
        currentSpeed?: number;
        freeFlowSpeed?: number;
      };
    };

    const speed = trafficJson.flowSegmentData?.currentSpeed;
    const freeFlow = trafficJson.flowSegmentData?.freeFlowSpeed;
    if (!Number.isFinite(speed) || !Number.isFinite(freeFlow) || (freeFlow as number) <= 0) {
      throw new Error("Missing traffic speed values");
    }

    const congestionPct = Math.max(
      0,
      Math.min(100, Math.round(((freeFlow as number) - (speed as number)) / (freeFlow as number) * 100)),
    );
    const status: TrafficStatus = congestionPct >= 45 ? "high" : congestionPct >= 20 ? "moderate" : "low";
    const message =
      status === "high"
        ? "High congestion detected on approach corridors. Add at least 45-60 minutes of buffer."
        : status === "moderate"
          ? "Moderate congestion detected. Add 20-30 minutes of buffer for terminal arrival."
          : "Traffic flow is currently near free-flow conditions.";

    return {
      status,
      congestionPct,
      speedMph: Math.round(speed as number),
      freeFlowMph: Math.round(freeFlow as number),
      message,
      source: "tomtom flow segment",
    };
  } catch (error) {
    console.error("traffic feed fallback", error);
    const inferred = inferTrafficStatus(sailingsToday, hour);
    return {
      status: inferred.status,
      congestionPct: inferred.status === "high" ? 55 : inferred.status === "moderate" ? 30 : 12,
      speedMph: null,
      freeFlowMph: null,
      message: inferred.message,
      source: "embarkation schedule heuristic (fallback)",
    };
  }
}

export async function GET() {
  const { dateIso, hour } = chicagoDateParts();

  let sailingsToday = 0;
  let topShips: string[] = [];
  let parkingIndicators: ParkingIndicator[] = [];
  let parkingSource = "inferred from embarkation volume";

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();

      const { data: sailingsData } = await supabase
        .from("sailings")
        .select("id, depart_date, ship:ships(name)")
        .eq("departure_port", "Galveston")
        .eq("is_active", true)
        .eq("depart_date", dateIso)
        .order("depart_date", { ascending: true })
        .limit(20);

      const sailingsRows = (sailingsData || []) as Array<{
        id: string;
        depart_date: string | null;
        ship:
          | {
              name: string | null;
            }
          | {
              name: string | null;
            }[]
          | null;
      }>;

      sailingsToday = sailingsRows.length;
      topShips = sailingsRows
        .map((row) => (Array.isArray(row.ship) ? row.ship[0]?.name : row.ship?.name) || "")
        .filter(Boolean)
        .slice(0, 4);

      const { data: parkingEvents } = await supabase
        .from("parking_capacity_events")
        .select("pier, capacity_status, note, reported_at")
        .order("reported_at", { ascending: false })
        .limit(25);

      const events = (parkingEvents || []) as Array<{
        pier: "pier10" | "pier25" | null;
        capacity_status: ParkingStatus | null;
        note: string | null;
        reported_at: string | null;
      }>;

      const latestByPier = new Map<"pier10" | "pier25", ParkingIndicator>();
      for (const event of events) {
        if (event.pier !== "pier10" && event.pier !== "pier25") continue;
        if (!event.capacity_status) continue;
        if (latestByPier.has(event.pier)) continue;
        latestByPier.set(event.pier, {
          pier: event.pier,
          status: event.capacity_status,
          occupancyPct: statusToOccupancy(event.capacity_status),
          note: event.note,
          reportedAt: event.reported_at,
        });
      }

      if (latestByPier.size > 0) {
        parkingSource = "live parking capacity events";
      }

      parkingIndicators = (["pier10", "pier25"] as const).map((pier) => {
        const latest = latestByPier.get(pier);
        if (latest) return latest;
        const inferred = inferParkingStatus(pier, sailingsToday, hour);
        return {
          pier,
          status: inferred,
          occupancyPct: statusToOccupancy(inferred),
          note: "Inferred from current embarkation volume",
          reportedAt: null,
        };
      });
    }
  } catch (error) {
    console.error("embarkation operations supabase error", error);
  }

  if (!parkingIndicators.length) {
    parkingIndicators = (["pier10", "pier25"] as const).map((pier) => {
      const inferred = inferParkingStatus(pier, sailingsToday, hour);
      return {
        pier,
        status: inferred,
        occupancyPct: statusToOccupancy(inferred),
        note: "Inferred from embarkation volume",
        reportedAt: null,
      };
    });
  }

  const weather = await loadWeather();
  const traffic = await loadTraffic(sailingsToday, hour);

  const payload: OperationsPayload = {
    updatedAt: new Date().toISOString(),
    weather,
    traffic,
    parking: {
      source: parkingSource,
      indicators: parkingIndicators,
    },
    embarkation: {
      sailingsToday,
      topShips,
    },
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
