import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AssistantLanguage,
  RouteFocus,
  featuredCruiseIntelForQuestion,
  inferRouteFocusFromQuestion,
  lineToTerminalGuide,
  localizedRouteBrief,
  normalizeRouteFocus,
  routeMatchScore,
  routeProfileByFocus,
} from "@/lib/tripAssistantKnowledge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TripAssistantInput = {
  question?: string;
  destinationFocus?: string;
  language?: AssistantLanguage;
  adults?: number;
  children?: number;
  preferredNights?: number;
  budgetMax?: number;
};

type FutureSailingRow = {
  sailing_id: string;
  sail_date: string | null;
  return_date: string | null;
  duration: number | null;
  itinerary_code: string | null;
  ship_id: string | null;
  ship_name: string | null;
  cruise_line: string | null;
  home_port: string | null;
};

type PricingRow = {
  sailing_id: string;
  min_per_person: number | null;
};

type SailingDetailRow = {
  id: string;
  seapay_eligible: boolean | null;
  itinerary_label: string | null;
  ports_summary: string | null;
};

type TripRecommendation = {
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
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length) {
    const next = Number(value);
    if (Number.isFinite(next)) return next;
  }
  return null;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function endIso(monthsAhead = 18) {
  const now = new Date();
  now.setMonth(now.getMonth() + monthsAhead);
  return now.toISOString().slice(0, 10);
}

function dayDistanceScore(dateIso: string | null) {
  if (!dateIso) return 0.4;
  const depart = new Date(dateIso).getTime();
  if (!Number.isFinite(depart)) return 0.4;
  const diffDays = Math.max(0, Math.round((depart - Date.now()) / (1000 * 60 * 60 * 24)));
  if (diffDays <= 21) return 0.65;
  if (diffDays <= 60) return 0.85;
  if (diffDays <= 180) return 1;
  if (diffDays <= 300) return 0.8;
  return 0.6;
}

function buildAssistantSummary(
  language: AssistantLanguage,
  routeTitle: string,
  recommendations: TripRecommendation[],
  question: string,
) {
  if (language === "es") {
    if (!recommendations.length) {
      return `No encontramos salidas activas que coincidan exactamente con "${routeTitle}" en este momento. El asistente uso inteligencia local de Galveston y recomienda ampliar fechas o duracion para abrir mas opciones.`;
    }
    const top = recommendations[0];
    return `Plan local recomendado para ${routeTitle}: prioriza ${top.shipName} (${top.cruiseLine}) con salida ${top.departDate || "por confirmar"}, terminal ${top.terminalName} y estrategia de estacionamiento alineada al flujo de embarque. Pregunta original: "${question || "planificacion general"}".`;
  }

  if (!recommendations.length) {
    return `We did not find active sailings that exactly match "${routeTitle}" right now. The assistant used localized Galveston intelligence and recommends widening date range or duration for more options.`;
  }

  const top = recommendations[0];
  return `Localized recommendation for ${routeTitle}: start with ${top.shipName} (${top.cruiseLine}) departing ${top.departDate || "TBD"}, plan around ${top.terminalName}, and use the linked parking logistics playbook for embarkation day confidence. Original question: "${question || "general planning"}".`;
}

function buildNextActions(language: AssistantLanguage, focus: RouteFocus) {
  if (language === "es") {
    return [
      "Verifica documentos segun tu ciudadania y ruta antes de pagar deposito.",
      "Confirma terminal asignada de Galveston 14 dias antes de salida.",
      "Reserva estacionamiento y transporte con buffer de trafico para ventana de embarque.",
      `Filtra salidas de ${
        focus === "any" ? "rutas Caribe/Bahamas/Panama/Jamaica" : "tu ruta objetivo"
      } y selecciona 2-3 opciones finalistas.`,
      "Completa reservacion y activa soporte concierge para dia de embarque.",
    ];
  }

  return [
    "Validate travel documents for your citizenship and route before deposit payment.",
    "Confirm Galveston terminal assignment 14 days before sailing.",
    "Lock parking and transfer plans with traffic buffer for your check-in window.",
    `Filter ${
      focus === "any" ? "Bahamas/Eastern-Western Caribbean/Panama/Jamaica" : "your target route"
    } departures and shortlist 2-3 sailings.`,
    "Complete booking and activate concierge support for embarkation day.",
  ];
}

function scoreRecommendation(
  row: FutureSailingRow,
  routeFocus: RouteFocus,
  budgetMax: number | null,
  preferredNights: number | null,
  priceFrom: number | null,
) {
  const text = [row.itinerary_code || "", row.ship_name || "", row.cruise_line || ""].join(" ");
  const routeScore = routeMatchScore(routeFocus, text);

  const nights = parseNumber(row.duration);
  let nightsScore = 0.65;
  if (preferredNights != null && nights != null) {
    nightsScore = clamp(1 - Math.abs(preferredNights - nights) / 8, 0.2, 1);
  }

  let budgetScore = 0.6;
  if (budgetMax != null) {
    if (priceFrom == null || !Number.isFinite(priceFrom)) {
      budgetScore = 0.45;
    } else if (priceFrom <= budgetMax) {
      budgetScore = 1;
    } else {
      budgetScore = clamp(1 - (priceFrom - budgetMax) / Math.max(budgetMax, 1), 0.15, 0.85);
    }
  }

  const timingScore = dayDistanceScore(row.sail_date);
  const combined = routeScore * 0.45 + nightsScore * 0.2 + budgetScore * 0.2 + timingScore * 0.15;
  return Number(combined.toFixed(4));
}

export async function POST(request: NextRequest) {
  let input: TripAssistantInput;
  try {
    input = (await request.json()) as TripAssistantInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const language: AssistantLanguage = input.language === "es" ? "es" : "en";
  const normalizedFocus = normalizeRouteFocus(input.destinationFocus);
  const inferredFocus = inferRouteFocusFromQuestion(input.question || "");
  const routeFocus: RouteFocus = normalizedFocus === "any" ? inferredFocus : normalizedFocus;
  const routeProfile = routeProfileByFocus(routeFocus);
  const routeBrief = localizedRouteBrief(routeProfile, language);
  const featuredCruiseIntel = featuredCruiseIntelForQuestion(input.question || "", language);

  const preferredNights = parseNumber(input.preferredNights);
  const budgetMax = parseNumber(input.budgetMax);
  const adults = parseNumber(input.adults) ?? 2;
  const children = parseNumber(input.children) ?? 0;

  let recommendations: TripRecommendation[] = [];
  let dataSource = "localized-knowledge-only";

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();

      const futureRes = await supabase
        .from("future_sailings_list")
        .select(
          "sailing_id, sail_date, return_date, duration, itinerary_code, ship_id, ship_name, cruise_line, home_port",
        )
        .gte("sail_date", todayIso())
        .lte("sail_date", endIso(18))
        .order("sail_date", { ascending: true })
        .limit(300);

      const futureRows = (futureRes.data || []) as FutureSailingRow[];
      const galvestonRows = futureRows.filter((row) =>
        (row.home_port || "").toLowerCase().includes("galveston"),
      );

      if (galvestonRows.length) {
        const sailingIds = galvestonRows.map((row) => row.sailing_id);

        const [pricingRes, sailingDetailRes] = await Promise.all([
          supabase
            .from("pricing_latest")
            .select("sailing_id,min_per_person")
            .in("sailing_id", sailingIds),
          supabase
            .from("sailings")
            .select("id,seapay_eligible,itinerary_label,ports_summary")
            .in("id", sailingIds),
        ]);

        const pricingRows = (pricingRes.data || []) as PricingRow[];
        const detailsRows = (sailingDetailRes.data || []) as SailingDetailRow[];

        const pricingById = new Map(pricingRows.map((row) => [row.sailing_id, row.min_per_person]));
        const detailsById = new Map(detailsRows.map((row) => [row.id, row]));

        const scored = galvestonRows
          .map((row) => {
            const detail = detailsById.get(row.sailing_id);
            const priceFrom = parseNumber(pricingById.get(row.sailing_id) ?? null);
            const score = scoreRecommendation(row, routeFocus, budgetMax, preferredNights, priceFrom);
            const terminal = lineToTerminalGuide(row.cruise_line);
            const itinerary = detail?.itinerary_label || row.itinerary_code || "Galveston itinerary";

            return {
              sailingId: row.sailing_id,
              shipName: row.ship_name || "Galveston sailing",
              cruiseLine: row.cruise_line || "Cruise line",
              departDate: row.sail_date,
              nights: parseNumber(row.duration),
              itinerary,
              portsSummary: detail?.ports_summary || null,
              priceFrom,
              seaPayEligible: Boolean(detail?.seapay_eligible),
              terminalName: language === "es" ? terminal.nameEs : terminal.nameEn,
              terminalArrivalNote:
                language === "es" ? terminal.arrivalNoteEs : terminal.arrivalNoteEn,
              parkingLogistics:
                language === "es" ? terminal.parkingPlanEs : terminal.parkingPlanEn,
              score,
            } satisfies TripRecommendation;
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 6);

        recommendations = scored;
        dataSource = "supabase_future_sailings_list + pricing_latest + sailings";
      }
    }
  } catch (error) {
    console.error("trip-assistant data fallback", error);
  }

  const summary = buildAssistantSummary(language, routeBrief.title, recommendations, input.question || "");
  const nextActions = buildNextActions(language, routeFocus);

  const response = {
    assistant: {
      type: "localized_galveston_trip_assistant",
      language,
      focus: routeFocus,
      summary,
      generatedAt: new Date().toISOString(),
      source: dataSource,
    },
    travelerProfile: {
      adults,
      children,
      preferredNights,
      budgetMax,
    },
    routeBrief,
    terminalPlaybook: {
      terminals: recommendations.length
        ? recommendations
            .map((item) => ({
              name: item.terminalName,
              arrivalNote: item.terminalArrivalNote,
              parkingLogistics: item.parkingLogistics,
            }))
            .filter(
              (item, index, array) => array.findIndex((candidate) => candidate.name === item.name) === index,
            )
        : [
            {
              name: language === "es" ? "Terminales de Galveston" : "Galveston terminals",
              arrivalNote:
                language === "es"
                  ? "Confirma tu terminal asignada antes de salir al puerto."
                  : "Confirm your assigned terminal before driving to port.",
              parkingLogistics:
                language === "es"
                  ? "Reserva estacionamiento con anticipacion en dias de alta demanda."
                  : "Reserve parking early on high-volume embarkation days.",
            },
          ],
    },
    featuredCruiseIntel,
    recommendations,
    nextActions,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
