export type AssistantLanguage = "en" | "es";
export type RouteFocus =
  | "any"
  | "bahamas"
  | "eastern_caribbean"
  | "western_caribbean"
  | "panama_canal"
  | "jamaica";

export type TerminalGuide = {
  key: "terminal_25" | "terminal_28" | "terminal_10";
  nameEn: string;
  nameEs: string;
  primaryLinesEn: string;
  primaryLinesEs: string;
  arrivalNoteEn: string;
  arrivalNoteEs: string;
  parkingPlanEn: string;
  parkingPlanEs: string;
};

type FeaturedCruiseIntel = {
  key: "perfect_day_cococay" | "celebration_key" | "disney_magic_galveston";
  titleEn: string;
  titleEs: string;
  summaryEn: string;
  summaryEs: string;
  planningPointsEn: string[];
  planningPointsEs: string[];
  keywords: string[];
};

type RouteProfile = {
  key: RouteFocus;
  labelEn: string;
  labelEs: string;
  overviewEn: string;
  overviewEs: string;
  keywords: string[];
  typicalNights: string;
  commonPortsEn: string[];
  commonPortsEs: string[];
  regulationsEn: string[];
  regulationsEs: string[];
};

export const TERMINAL_GUIDES: TerminalGuide[] = [
  {
    key: "terminal_25",
    nameEn: "Terminal 25",
    nameEs: "Terminal 25",
    primaryLinesEn: "Most Royal Caribbean departures",
    primaryLinesEs: "La mayoria de salidas de Royal Caribbean",
    arrivalNoteEn: "Arrive inside your check-in window. Morning buffers fill quickly on weekend sailings.",
    arrivalNoteEs: "Llega dentro de tu ventana de check-in. Los buffers de manana se llenan rapido en fines de semana.",
    parkingPlanEn: "Use terminal garage first; overflow lots require extra transfer buffer.",
    parkingPlanEs: "Usa primero el garaje del terminal; lotes alternos requieren mas tiempo de traslado.",
  },
  {
    key: "terminal_28",
    nameEn: "Terminal 28",
    nameEs: "Terminal 28",
    primaryLinesEn: "Core Carnival departures from Galveston",
    primaryLinesEs: "Salidas principales de Carnival desde Galveston",
    arrivalNoteEn: "Traffic peaks from early morning through pre-lunch embarkation windows.",
    arrivalNoteEs: "El trafico sube desde temprano hasta las ventanas antes del mediodia.",
    parkingPlanEn: "Terminal parking and pre-booked private lots are the most predictable choices.",
    parkingPlanEs: "Estacionamiento del terminal y lotes privados reservados son las opciones mas predecibles.",
  },
  {
    key: "terminal_10",
    nameEn: "Terminal 10",
    nameEs: "Terminal 10",
    primaryLinesEn: "Seasonal departures including Disney Magic and mixed-line sailings",
    primaryLinesEs: "Salidas de temporada incluyendo Disney Magic y lineas mixtas",
    arrivalNoteEn: "Double-check assignment in final sailing documents; terminal usage can rotate.",
    arrivalNoteEs: "Confirma asignacion en documentos finales; el uso del terminal puede cambiar.",
    parkingPlanEn: "Reserve lot or transfer support in advance for smoother arrival.",
    parkingPlanEs: "Reserva lote o apoyo de traslado con anticipacion para llegada mas fluida.",
  },
];

export const ROUTE_PROFILES: Record<RouteFocus, RouteProfile> = {
  any: {
    key: "any",
    labelEn: "Galveston multi-route planning",
    labelEs: "Planificacion multiruta desde Galveston",
    overviewEn:
      "Compare Bahamas, Eastern Caribbean, Western Caribbean, Panama Canal, and Jamaica options from one Galveston-focused playbook.",
    overviewEs:
      "Compara Bahamas, Caribe Oriental, Caribe Occidental, Canal de Panama y Jamaica desde una sola guia enfocada en Galveston.",
    keywords: ["caribbean", "bahamas", "panama", "jamaica", "galveston"],
    typicalNights: "4-10+ nights depending on route",
    commonPortsEn: ["Cozumel", "Costa Maya", "Nassau", "Perfect Day at CocoCay", "Celebration Key"],
    commonPortsEs: ["Cozumel", "Costa Maya", "Nassau", "Perfect Day at CocoCay", "Celebration Key"],
    regulationsEn: [
      "Closed-loop U.S. cruises may allow birth certificate + government ID for eligible U.S. citizens.",
      "A valid passport is strongly recommended for all routes and emergency flexibility.",
      "Visa and residency requirements depend on citizenship; verify with official government sources.",
    ],
    regulationsEs: [
      "Cruceros cerrados en EE.UU. pueden permitir acta de nacimiento + ID para ciudadanos elegibles.",
      "Se recomienda pasaporte vigente para todas las rutas y flexibilidad en emergencias.",
      "Requisitos de visa/residencia dependen de ciudadania; confirma con fuentes oficiales.",
    ],
  },
  bahamas: {
    key: "bahamas",
    labelEn: "Bahamas route planning",
    labelEs: "Planificacion de ruta Bahamas",
    overviewEn:
      "Bahamas sailings are strong for first-time cruisers wanting manageable port days and simpler island logistics.",
    overviewEs:
      "Las rutas a Bahamas son ideales para primerizos que buscan dias de puerto manejables y logistica simple.",
    keywords: [
      "bahamas",
      "nassau",
      "bimini",
      "coco cay",
      "cococay",
      "perfect day",
      "celebration key",
      "half moon cay",
    ],
    typicalNights: "4-7 nights",
    commonPortsEn: ["Nassau", "Bimini", "Perfect Day at CocoCay", "Celebration Key", "Half Moon Cay"],
    commonPortsEs: ["Nassau", "Bimini", "Perfect Day at CocoCay", "Celebration Key", "Half Moon Cay"],
    regulationsEn: [
      "Nassau and private island stops still require valid cruise identity documentation.",
      "Re-entry documents must remain accessible in your carry-on on port days.",
      "Excursions should account for all-aboard cutoffs and terminal return time.",
    ],
    regulationsEs: [
      "Nassau e islas privadas requieren documentos de identidad validos para crucero.",
      "Documentos de reingreso deben ir en equipaje de mano en dias de puerto.",
      "Excursiones deben considerar hora limite de regreso al barco.",
    ],
  },
  eastern_caribbean: {
    key: "eastern_caribbean",
    labelEn: "Eastern Caribbean route planning",
    labelEs: "Planificacion Caribe Oriental",
    overviewEn:
      "Eastern Caribbean itineraries prioritize longer sea days with high-value destination stops and varied excursion complexity.",
    overviewEs:
      "El Caribe Oriental combina mas dias de mar con puertos de alto valor y excursiones de distinta complejidad.",
    keywords: ["eastern", "st thomas", "st. thomas", "san juan", "nassau", "eastern caribbean"],
    typicalNights: "7-10 nights",
    commonPortsEn: ["San Juan", "St. Thomas", "Nassau", "Puerto Plata"],
    commonPortsEs: ["San Juan", "St. Thomas", "Nassau", "Puerto Plata"],
    regulationsEn: [
      "Longer routes increase document and medication planning importance.",
      "Check excursion mobility requirements early for hilly ports.",
      "Always verify local return-to-ship deadlines against ship time, not local assumptions.",
    ],
    regulationsEs: [
      "Rutas largas aumentan la importancia de documentos y medicinas.",
      "Confirma requisitos de movilidad para excursiones con anticipacion.",
      "Verifica regreso al barco con horario del barco, no suposiciones locales.",
    ],
  },
  western_caribbean: {
    key: "western_caribbean",
    labelEn: "Western Caribbean route planning",
    labelEs: "Planificacion Caribe Occidental",
    overviewEn:
      "Western Caribbean sailings from Galveston are the core regional pattern, often balancing value, family fit, and port variety.",
    overviewEs:
      "El Caribe Occidental es la ruta principal desde Galveston, equilibrando valor, familia y variedad de puertos.",
    keywords: ["western", "cozumel", "costa maya", "roatan", "belize", "western caribbean"],
    typicalNights: "5-8 nights",
    commonPortsEn: ["Cozumel", "Costa Maya", "Roatan", "Belize City"],
    commonPortsEs: ["Cozumel", "Costa Maya", "Roatan", "Belize City"],
    regulationsEn: [
      "Popular Western ports can have tight return windows; plan independent excursions conservatively.",
      "Port transportation queues vary by ship volume and local operations.",
      "Carry photocopy or secure digital backup of travel documents on each port day.",
    ],
    regulationsEs: [
      "Puertos populares del Caribe Occidental pueden tener ventanas de regreso ajustadas.",
      "Filas de transporte en puerto varian por volumen de barco y operacion local.",
      "Lleva copia fisica o digital segura de documentos en dias de puerto.",
    ],
  },
  panama_canal: {
    key: "panama_canal",
    labelEn: "Panama Canal route planning",
    labelEs: "Planificacion Canal de Panama",
    overviewEn:
      "Panama Canal sailings are longer, logistics-heavy itineraries where preparation depth and embarkation precision matter most.",
    overviewEs:
      "Las rutas al Canal de Panama son itinerarios largos con alta demanda de planificacion y precision en embarque.",
    keywords: ["panama", "canal", "colon", "cartagena", "panama canal"],
    typicalNights: "10-14 nights",
    commonPortsEn: ["Colon", "Cartagena", "Limon", "Canal transit zones"],
    commonPortsEs: ["Colon", "Cartagena", "Limon", "Zonas de transito del canal"],
    regulationsEn: [
      "Long-haul itineraries demand stronger medication, insurance, and document planning.",
      "Some port days may include stricter security processing depending on itinerary.",
      "Passport validity and emergency travel flexibility are strongly recommended.",
    ],
    regulationsEs: [
      "Itinerarios largos requieren plan robusto de medicinas, seguro y documentos.",
      "Algunos puertos pueden tener procesos de seguridad mas estrictos.",
      "Se recomienda fuertemente pasaporte vigente y flexibilidad de viaje.",
    ],
  },
  jamaica: {
    key: "jamaica",
    labelEn: "Jamaica route planning",
    labelEs: "Planificacion de ruta Jamaica",
    overviewEn:
      "Jamaica-inclusive routes are best planned with excursion timing discipline and clear terminal return logistics.",
    overviewEs:
      "Las rutas con Jamaica requieren disciplina de horarios de excursion y logistica clara de regreso al terminal.",
    keywords: ["jamaica", "falmouth", "ocho rios", "montego bay"],
    typicalNights: "6-8 nights",
    commonPortsEn: ["Falmouth", "Ocho Rios", "Montego Bay"],
    commonPortsEs: ["Falmouth", "Ocho Rios", "Montego Bay"],
    regulationsEn: [
      "Excursion timing in Jamaica should include larger buffer due to return traffic variability.",
      "Carry ship card and government ID at all times while ashore.",
      "Follow cruise line local security guidance for approved transportation corridors.",
    ],
    regulationsEs: [
      "En Jamaica, plan excursiones con buffer amplio por variabilidad de trafico de regreso.",
      "Lleva tarjeta del barco e identificacion oficial todo el tiempo en tierra.",
      "Sigue guias de seguridad de la linea sobre corredores de transporte aprobados.",
    ],
  },
};

const FEATURED_CRUISE_INTEL: FeaturedCruiseIntel[] = [
  {
    key: "perfect_day_cococay",
    titleEn: "Perfect Day at CocoCay",
    titleEs: "Perfect Day at CocoCay",
    summaryEn:
      "Royal Caribbean private-island stop frequently paired with Bahamas-focused sailings that Galveston travelers compare for family activity density.",
    summaryEs:
      "Escala de isla privada de Royal Caribbean, comun en rutas a Bahamas que viajeros de Galveston comparan por actividades familiares.",
    planningPointsEn: [
      "Plan port-day return timing using ship time, not phone auto-time.",
      "Book high-demand island activities early when sailing volume is high.",
      "Carry ship card and photo ID in a waterproof holder for island transitions.",
    ],
    planningPointsEs: [
      "Planea el regreso usando horario del barco, no hora automatica del telefono.",
      "Reserva actividades de alta demanda con anticipacion en sailings con mucho volumen.",
      "Lleva tarjeta del barco e identificacion en funda resistente al agua.",
    ],
    keywords: ["perfect day", "cococay", "coco cay", "royal", "bahamas"],
  },
  {
    key: "celebration_key",
    titleEn: "Celebration Key",
    titleEs: "Celebration Key",
    summaryEn:
      "Carnival private-destination expansion that many Galveston guests ask about when comparing newer Bahamas route options and family shore-day style.",
    summaryEs:
      "Expansion de destino privado de Carnival que muchos viajeros de Galveston consultan al comparar nuevas opciones de Bahamas.",
    planningPointsEn: [
      "Treat this as a high-interest destination and review onboard planning windows early.",
      "Confirm excursion and beach zone details in the cruise line app before embarkation.",
      "Pair this stop with realistic terminal and parking timing on embarkation day.",
    ],
    planningPointsEs: [
      "Consideralo destino de alta demanda y revisa ventanas de planificacion con anticipacion.",
      "Confirma detalles de excursiones y zonas de playa en la app de la linea antes de embarcar.",
      "Combina esta escala con tiempos realistas de terminal y estacionamiento en embarque.",
    ],
    keywords: ["celebration key", "carnival", "bahamas", "private island"],
  },
  {
    key: "disney_magic_galveston",
    titleEn: "Disney Magic cruises from Galveston",
    titleEs: "Cruceros Disney Magic desde Galveston",
    summaryEn:
      "Disney Magic is a high-demand family-focused ship pattern that appears seasonally from Galveston and benefits from early logistics planning.",
    summaryEs:
      "Disney Magic tiene alta demanda familiar y aparece por temporadas desde Galveston, por lo que conviene planificar logistica temprano.",
    planningPointsEn: [
      "Seasonal deployment means best-fit sail dates can fill earlier than expected.",
      "Use terminal assignment checks and parking reservations earlier for peak family sailings.",
      "Build embarkation-day buffer for luggage flow and document checks with children.",
    ],
    planningPointsEs: [
      "Al ser temporada, las fechas ideales pueden llenarse antes de lo esperado.",
      "Haz confirmacion de terminal y reserva de estacionamiento mas temprano en salidas familiares.",
      "Agrega tiempo extra en embarque para equipaje y verificacion de documentos con ninos.",
    ],
    keywords: ["disney magic", "disney", "galveston", "family cruise"],
  },
];

export function normalizeRouteFocus(value?: string | null): RouteFocus {
  const input = (value || "").toLowerCase().trim();
  if (!input) return "any";
  if (input === "bahamas") return "bahamas";
  if (input === "eastern_caribbean" || input === "eastern-caribbean" || input === "eastern") return "eastern_caribbean";
  if (input === "western_caribbean" || input === "western-caribbean" || input === "western") return "western_caribbean";
  if (input === "panama_canal" || input === "panama-canal" || input === "panama") return "panama_canal";
  if (input === "jamaica") return "jamaica";
  return "any";
}

export function inferRouteFocusFromQuestion(question: string): RouteFocus {
  const q = question.toLowerCase();
  if (ROUTE_PROFILES.panama_canal.keywords.some((keyword) => q.includes(keyword))) return "panama_canal";
  if (ROUTE_PROFILES.jamaica.keywords.some((keyword) => q.includes(keyword))) return "jamaica";
  if (ROUTE_PROFILES.bahamas.keywords.some((keyword) => q.includes(keyword))) return "bahamas";
  if (ROUTE_PROFILES.eastern_caribbean.keywords.some((keyword) => q.includes(keyword))) return "eastern_caribbean";
  if (ROUTE_PROFILES.western_caribbean.keywords.some((keyword) => q.includes(keyword))) return "western_caribbean";
  return "any";
}

export function lineToTerminalGuide(cruiseLine?: string | null): TerminalGuide {
  const line = (cruiseLine || "").toLowerCase();
  if (line.includes("royal")) return TERMINAL_GUIDES[0];
  if (line.includes("carnival")) return TERMINAL_GUIDES[1];
  if (line.includes("disney")) return TERMINAL_GUIDES[2];
  return TERMINAL_GUIDES[2];
}

export function routeProfileByFocus(focus: RouteFocus): RouteProfile {
  return ROUTE_PROFILES[focus] || ROUTE_PROFILES.any;
}

export function routeMatchScore(focus: RouteFocus, text: string) {
  if (focus === "any") return 0.65;
  const lower = text.toLowerCase();
  const profile = routeProfileByFocus(focus);
  const hits = profile.keywords.filter((keyword) => lower.includes(keyword.toLowerCase())).length;
  if (hits >= 2) return 1;
  if (hits === 1) return 0.8;
  return 0.3;
}

export function localizedRouteBrief(profile: RouteProfile, language: AssistantLanguage) {
  return {
    key: profile.key,
    title: language === "es" ? profile.labelEs : profile.labelEn,
    overview: language === "es" ? profile.overviewEs : profile.overviewEn,
    typicalNights: profile.typicalNights,
    commonPorts: language === "es" ? profile.commonPortsEs : profile.commonPortsEn,
    regulations: language === "es" ? profile.regulationsEs : profile.regulationsEn,
  };
}

export function featuredCruiseIntelForQuestion(question: string, language: AssistantLanguage) {
  const lower = question.toLowerCase();
  const scored = FEATURED_CRUISE_INTEL.map((item) => {
    const hits = item.keywords.filter((keyword) => lower.includes(keyword)).length;
    return { item, hits };
  });

  const anyMatch = scored.some((entry) => entry.hits > 0);
  const ordered = anyMatch
    ? scored.sort((a, b) => b.hits - a.hits).map((entry) => entry.item)
    : FEATURED_CRUISE_INTEL;

  return ordered.map((item) => ({
    key: item.key,
    title: language === "es" ? item.titleEs : item.titleEn,
    summary: language === "es" ? item.summaryEs : item.summaryEn,
    planningPoints: language === "es" ? item.planningPointsEs : item.planningPointsEn,
  }));
}
