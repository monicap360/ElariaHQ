import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { formatDurationLabel } from "@/lib/formatDuration";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type DurationSeoRow = {
  duration_slug: string;
  seo_title: string;
  seo_h1: string;
};

type ShipSeoRow = {
  ship_id: string;
  ship_slug: string;
  seo_title: string;
  seo_h1: string;
  cruise_line: string | null;
};

type ShipDurationSeoRow = {
  ship_id: string;
  ship_slug: string;
  duration_slug: string;
  seo_title: string;
  seo_h1: string;
};

type CruiseLineSeoRow = {
  cruise_line_slug: string;
  cruise_line_name: string;
  seo_title: string;
  seo_h1: string;
  seo_description: string;
};

type CruiseLineShipRow = {
  cruise_line_slug: string;
  ship_slug: string;
  ship_name: string;
  cruise_line: string;
};

type CruiseLineDurationRow = {
  cruise_line_slug: string;
  cruise_line_name: string;
  duration_slug: string;
  seo_title: string;
  seo_h1: string;
};

type DestinationSeoRow = {
  destination_slug: string;
  destination_name: string;
  seo_title: string;
  seo_h1: string;
  seo_description: string;
};

type DestinationDurationRow = {
  destination_slug: string;
  duration_slug: string;
  seo_title: string;
  seo_h1: string;
};

type ShipDestinationDurationRow = {
  ship_id: string;
  ship_name: string;
  ship_slug: string;
  destination_slug: string;
  destination_name: string;
  duration_slug: string;
  seo_title: string;
  seo_h1: string;
  seo_description: string;
};

type ShipGroupDurationRow = {
  ship_id: string;
  ship_name: string;
  ship_slug: string;
  group_slug: string;
  group_name: string;
  duration_days: number;
  duration_slug: string;
  seo_title: string;
  seo_h1: string;
  seo_description: string;
};

type JamaicaHubRow = {
  hub_slug: string;
  seo_title: string;
  seo_h1: string;
  seo_description: string;
  jamaica_ports: string[] | null;
  docking_by_port: Record<string, string[]>;
};

type JamaicaDurationRow = {
  duration_days: number;
  duration_slug: string;
  seo_title: string;
  seo_h1: string;
  seo_description: string;
  sailing_count: number;
};

type JamaicaLineDurationRow = {
  cruise_line: string;
  cruise_line_slug: string;
  duration_days: number;
  duration_slug: string;
  seo_title: string;
  seo_h1: string;
  seo_description: string;
  sailing_count: number;
};

type PrivateIslandHubRow = {
  hub_slug: string;
  seo_title: string;
  seo_h1: string;
  seo_description: string;
  private_islands: Array<{
    destination_name: string;
    destination_slug: string;
    operator: string | null;
    notes: string | null;
  }>;
};

type PrivateIslandLineRow = {
  destination_name: string;
  destination_slug: string;
  cruise_line: string;
  cruise_line_slug: string;
  seo_title: string;
  seo_h1: string;
  seo_description: string;
};

type PrivateIslandExperienceRow = {
  destination_name: string;
  destination_slug: string;
  experience_slug: string;
  experience_name: string;
  operator: string | null;
  seo_title: string;
  seo_h1: string;
  seo_description: string | null;
};

type DestinationFaqRow = {
  destination_slug: string;
  destination_name: string;
  question_1: string | null;
  answer_1: string | null;
  question_2: string | null;
  answer_2: string | null;
  question_3: string | null;
  answer_3: string | null;
  question_4: string | null;
  answer_4: string | null;
};

type ServerClient = NonNullable<ReturnType<typeof createServerClient>>;
type SupabaseClientType = ServerClient["client"];

type FutureSailingRow = {
  sailing_id: string;
  sail_date: string | null;
  return_date: string | null;
  duration: number | null;
  itinerary_code: string | null;
  ship_name: string | null;
  cruise_line: string | null;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatDate(value: string | null) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function parseDurationSlug(slug: string) {
  const match = slug.match(/^(\d+)-day$/);
  if (!match) return null;
  const nights = Number(match[1]);
  if (!Number.isFinite(nights)) return null;
  if (nights >= 8) {
    return { min: 8, label: "8+ Day" };
  }
  return { exact: nights, label: `${nights} Day` };
}

function parseExactDurationSlug(slug: string) {
  const match = slug.match(/^(\d+)-day$/);
  if (!match) return null;
  const days = Number(match[1]);
  if (!Number.isFinite(days)) return null;
  return days;
}

async function loadDurationPage(client: SupabaseClientType, slug: string) {
  const duration = parseDurationSlug(slug);
  if (!duration) return null;

  const { data } = await client
    .from("duration_seo_pages")
    .select("duration_slug, seo_title, seo_h1")
    .eq("duration_slug", slug)
    .maybeSingle();

  if (!data) return null;

  let query = client
    .from("future_sailings_list")
    .select("sailing_id, sail_date, return_date, duration, itinerary_code, ship_name, cruise_line")
    .order("sail_date", { ascending: true });

  if ("exact" in duration && typeof duration.exact === "number") {
    query = query.eq("duration", duration.exact);
  } else if ("min" in duration) {
    query = query.gte("duration", duration.min);
  }

  const sailingsResult = await query;
  const sailings = (sailingsResult.data ?? []) as FutureSailingRow[];

  return {
    seo: data as DurationSeoRow,
    sailings,
    subtitle: `${duration.label} cruises departing from Galveston, Texas.`,
  };
}

async function loadShipPage(client: SupabaseClientType, slug: string) {
  const { data } = await client
    .from("ship_seo_pages")
    .select("ship_id, ship_slug, seo_title, seo_h1, cruise_line")
    .eq("ship_slug", slug)
    .maybeSingle();

  if (!data) return null;
  const shipRow = data as ShipSeoRow;

  const sailingsResult = await client
    .from("ship_future_sailings")
    .select("sailing_id, sail_date, return_date, duration, itinerary_code, ship_name, cruise_line")
    .eq("ship_id", shipRow.ship_id)
    .order("sail_date", { ascending: true });

  const sailings = (sailingsResult.data ?? []) as FutureSailingRow[];

  return {
    seo: shipRow,
    sailings,
    subtitle: "Upcoming sailings for this ship from Galveston.",
  };
}

async function loadCruiseLinePage(client: SupabaseClientType, slug: string) {
  const { data } = await client
    .from("cruise_line_seo_pages")
    .select("cruise_line_slug, cruise_line_name, seo_title, seo_h1, seo_description")
    .eq("cruise_line_slug", slug)
    .maybeSingle();

  if (!data) return null;

  const lineRow = data as CruiseLineSeoRow;
  const lineName = lineRow.cruise_line_name || lineRow.seo_title.replace(" Cruises from Galveston", "").trim();

  const sailingsResult = await client
    .from("future_sailings_list")
    .select("sailing_id, sail_date, return_date, duration, itinerary_code, ship_name, cruise_line")
    .order("sail_date", { ascending: true });

  const sailings = ((sailingsResult.data ?? []) as FutureSailingRow[]).filter(
    (row) => slugify(row.cruise_line ?? "") === slug || (lineName && row.cruise_line === lineName),
  );

  const shipsResult = await client
    .from("cruise_line_ship_pages")
    .select("cruise_line_slug, ship_slug, ship_name, cruise_line")
    .eq("cruise_line_slug", slug)
    .order("ship_name", { ascending: true });

  const ships = (shipsResult.data ?? []) as CruiseLineShipRow[];

  const durationsResult = await client
    .from("cruise_line_duration_seo_pages")
    .select("cruise_line_slug, cruise_line_name, duration_slug, seo_title, seo_h1")
    .eq("cruise_line_slug", slug)
    .order("duration_slug", { ascending: true });

  const durations = (durationsResult.data ?? []) as CruiseLineDurationRow[];

  return {
    seo: lineRow,
    sailings,
    subtitle: `${lineName} departures from Galveston.`,
    ships,
    durations,
  };
}

async function loadShipDurationPage(
  client: SupabaseClientType,
  shipSlug: string,
  durationSlug: string,
) {
  const duration = parseDurationSlug(durationSlug);
  if (!duration) return null;

  const { data } = await client
    .from("ship_duration_seo_pages")
    .select("ship_id, ship_slug, duration_slug, seo_title, seo_h1")
    .eq("ship_slug", shipSlug)
    .eq("duration_slug", durationSlug)
    .maybeSingle();

  if (!data) return null;
  const shipDurationRow = data as ShipDurationSeoRow;

  let query = client
    .from("ship_future_sailings")
    .select("sailing_id, sail_date, return_date, duration, itinerary_code, ship_name, cruise_line")
    .eq("ship_id", shipDurationRow.ship_id)
    .order("sail_date", { ascending: true });

  if ("exact" in duration && typeof duration.exact === "number") {
    query = query.eq("duration", duration.exact);
  } else if ("min" in duration) {
    query = query.gte("duration", duration.min);
  }

  const sailingsResult = await query;
  const sailings = (sailingsResult.data ?? []) as FutureSailingRow[];

  return {
    seo: shipDurationRow,
    sailings,
    subtitle: "High-intent sailings for this ship and duration.",
  };
}

async function loadCruiseLineShipPage(client: SupabaseClientType, lineSlug: string, shipSlug: string) {
  const { data } = await client
    .from("cruise_line_ship_pages")
    .select("cruise_line_slug, ship_slug, ship_name, cruise_line")
    .eq("cruise_line_slug", lineSlug)
    .eq("ship_slug", shipSlug)
    .maybeSingle();

  if (!data) return null;
  const row = data as CruiseLineShipRow;

  const sailingsResult = await client
    .from("ship_future_sailings")
    .select("sailing_id, sail_date, return_date, duration, itinerary_code, ship_name, cruise_line")
    .eq("ship_name", row.ship_name)
    .order("sail_date", { ascending: true });

  const sailings = (sailingsResult.data ?? []) as FutureSailingRow[];

  return {
    seo: {
      seo_title: `${row.ship_name} Cruises from Galveston`,
      seo_h1: `${row.ship_name} cruises departing from Galveston, Texas`,
    },
    sailings,
    subtitle: `${row.ship_name} sailings from Galveston under ${row.cruise_line}.`,
  };
}

async function loadCruiseLineDurationPage(
  client: SupabaseClientType,
  lineSlug: string,
  durationSlug: string,
) {
  const duration = parseDurationSlug(durationSlug);
  if (!duration) return null;

  const { data } = await client
    .from("cruise_line_duration_seo_pages")
    .select("cruise_line_slug, cruise_line_name, duration_slug, seo_title, seo_h1")
    .eq("cruise_line_slug", lineSlug)
    .eq("duration_slug", durationSlug)
    .maybeSingle();

  if (!data) return null;
  const row = data as CruiseLineDurationRow;

  let query = client
    .from("future_sailings_list")
    .select("sailing_id, sail_date, return_date, duration, itinerary_code, ship_name, cruise_line")
    .order("sail_date", { ascending: true });

  if ("exact" in duration && typeof duration.exact === "number") {
    query = query.eq("duration", duration.exact);
  } else if ("min" in duration) {
    query = query.gte("duration", duration.min);
  }

  const sailingsResult = await query;
  const sailings = ((sailingsResult.data ?? []) as FutureSailingRow[]).filter(
    (rowItem) => slugify(rowItem.cruise_line ?? "") === lineSlug,
  );

  return {
    seo: row,
    sailings,
    subtitle: `${row.cruise_line_name} ${durationSlug.replace("-", " ")} cruises from Galveston.`,
  };
}

async function loadDestinationPage(client: SupabaseClientType, slug: string) {
  const portResult = await client
    .from("port_destination_seo_pages")
    .select("destination_slug, destination_name, seo_title, seo_h1, seo_description")
    .eq("destination_slug", slug)
    .maybeSingle();

  if (portResult.error || !portResult.data) {
    return null;
  }

  const row = portResult.data as DestinationSeoRow;

  const faqResult = await client
    .from("destination_faqs")
    .select(
      "destination_slug, destination_name, question_1, answer_1, question_2, answer_2, question_3, answer_3, question_4, answer_4",
    )
    .eq("destination_slug", slug)
    .maybeSingle();
  const faq = faqResult.data ? (faqResult.data as DestinationFaqRow) : null;

  const aliasesResult = await client
    .from("destination_aliases")
    .select("alias")
    .eq("canonical_name", row.destination_name);
  const aliases = (aliasesResult.data ?? []).map((item) => (item as { alias: string }).alias);
  const tokens = Array.from(new Set([row.destination_name.toLowerCase(), ...aliases]));
  const orFilters = tokens
    .map((token) => `ports_summary.ilike.%${token}%`)
    .join(",");

  let sailingsQuery = client
    .from("sailings")
    .select("id, sail_date, return_date, duration, itinerary_code, ship:ships(name, cruise_line)")
    .eq("departure_port", "Galveston")
    .gte("sail_date", new Date().toISOString().slice(0, 10))
    .order("sail_date", { ascending: true });

  if (orFilters) {
    sailingsQuery = sailingsQuery.or(orFilters);
  }

  const sailingsResult = await sailingsQuery;

  const sailings = (sailingsResult.data ?? []).map((item) => {
    const record = item as {
      id: string;
      sail_date: string | null;
      return_date: string | null;
      duration: number | null;
      itinerary_code: string | null;
      ship: { name: string | null; cruise_line: string | null } | null;
    };
    return {
      sailing_id: record.id,
      sail_date: record.sail_date,
      return_date: record.return_date,
      duration: record.duration,
      itinerary_code: record.itinerary_code,
      ship_name: record.ship?.name ?? null,
      cruise_line: record.ship?.cruise_line ?? null,
    } satisfies FutureSailingRow;
  });

  return {
    seo: row,
    sailings,
    subtitle: row.seo_description,
    source: "port",
    faq,
  };
}

async function loadDestinationDurationPage(
  client: SupabaseClientType,
  destinationSlug: string,
  durationSlug: string,
) {
  const duration = parseDurationSlug(durationSlug);
  if (!duration) return null;

  const { data } = await client
    .from("destination_duration_seo_pages")
    .select("destination_slug, duration_slug, seo_title, seo_h1")
    .eq("destination_slug", destinationSlug)
    .eq("duration_slug", durationSlug)
    .maybeSingle();

  if (!data) return null;
  const row = data as DestinationDurationRow;

  const destinationNameResult = await client
    .from("port_destination_seo_pages")
    .select("destination_name")
    .eq("destination_slug", destinationSlug)
    .maybeSingle();
  const destinationName =
    !destinationNameResult.error && destinationNameResult.data
      ? (destinationNameResult.data as { destination_name: string }).destination_name
      : destinationSlug.replace(/-/g, " ");

  const aliasesResult = await client
    .from("destination_aliases")
    .select("alias")
    .eq("canonical_name", destinationName);
  const aliases = (aliasesResult.data ?? []).map((item) => (item as { alias: string }).alias);
  const tokens = Array.from(new Set([destinationName.toLowerCase(), ...aliases]));
  const orFilters = tokens
    .map((token) => `ports_summary.ilike.%${token}%`)
    .join(",");

  let query = client
    .from("sailings")
    .select("id, sail_date, return_date, duration, itinerary_code, ship:ships(name, cruise_line)")
    .eq("departure_port", "Galveston")
    .gte("sail_date", new Date().toISOString().slice(0, 10))
    .order("sail_date", { ascending: true });

  if ("exact" in duration && typeof duration.exact === "number") {
    query = query.eq("duration", duration.exact);
  } else if ("min" in duration) {
    query = query.gte("duration", duration.min);
  }

  const sailingsResult = orFilters ? await query.or(orFilters) : await query;
  const sailings = (sailingsResult.data ?? []).map((item) => {
    const record = item as {
      id: string;
      sail_date: string | null;
      return_date: string | null;
      duration: number | null;
      itinerary_code: string | null;
      ship: { name: string | null; cruise_line: string | null } | null;
    };
    return {
      sailing_id: record.id,
      sail_date: record.sail_date,
      return_date: record.return_date,
      duration: record.duration,
      itinerary_code: record.itinerary_code,
      ship_name: record.ship?.name ?? null,
      cruise_line: record.ship?.cruise_line ?? null,
    } satisfies FutureSailingRow;
  });

  return {
    seo: row,
    sailings,
    subtitle: `${destinationName} ${durationSlug.replace("-", " ")} cruises from Galveston.`,
  };
}

async function loadShipDestinationDurationPage(
  client: SupabaseClientType,
  shipSlug: string,
  destinationSlug: string,
  durationSlug: string,
) {
  const { data } = await client
    .from("ship_destination_duration_seo_pages")
    .select(
      "ship_id, ship_name, ship_slug, destination_slug, destination_name, duration_slug, seo_title, seo_h1, seo_description",
    )
    .eq("ship_slug", shipSlug)
    .eq("destination_slug", destinationSlug)
    .eq("duration_slug", durationSlug)
    .maybeSingle();

  if (!data) return null;
  const row = data as ShipDestinationDurationRow;

  const aliasesResult = await client
    .from("destination_aliases")
    .select("alias")
    .eq("canonical_name", row.destination_name);
  const aliases = (aliasesResult.data ?? []).map((item) => (item as { alias: string }).alias);
  const tokens = Array.from(new Set([row.destination_name.toLowerCase(), ...aliases]));
  const orFilters = tokens
    .map((token) => `ports_summary.ilike.%${token}%`)
    .join(",");

  const duration = parseDurationSlug(durationSlug);
  let sailingsQuery = client
    .from("sailings")
    .select("id, sail_date, return_date, duration, itinerary_code, ship:ships(name, cruise_line)")
    .eq("departure_port", "Galveston")
    .gte("sail_date", new Date().toISOString().slice(0, 10))
    .order("sail_date", { ascending: true });

  if (duration && "exact" in duration && typeof duration.exact === "number") {
    sailingsQuery = sailingsQuery.eq("duration", duration.exact);
  } else if (duration && "min" in duration) {
    sailingsQuery = sailingsQuery.gte("duration", duration.min);
  }

  sailingsQuery = sailingsQuery.or(orFilters);
  const sailingsResult = await sailingsQuery;

  const sailings = (sailingsResult.data ?? [])
    .map((item) => {
      const record = item as {
        id: string;
        sail_date: string | null;
        return_date: string | null;
        duration: number | null;
        itinerary_code: string | null;
        ship: { name: string | null; cruise_line: string | null } | null;
      };
      return {
        sailing_id: record.id,
        sail_date: record.sail_date,
        return_date: record.return_date,
        duration: record.duration,
        itinerary_code: record.itinerary_code,
        ship_name: record.ship?.name ?? null,
        cruise_line: record.ship?.cruise_line ?? null,
      } satisfies FutureSailingRow;
    })
    .filter((item) => slugify(item.ship_name ?? "") === shipSlug);

  return {
    seo: row,
    sailings,
    subtitle: row.seo_description,
  };
}

async function loadShipGroupDurationPage(
  client: SupabaseClientType,
  shipSlug: string,
  groupSlug: string,
  durationSlug: string,
) {
  const { data } = await client
    .from("ship_group_duration_seo_pages")
    .select(
      "ship_id, ship_name, ship_slug, group_slug, group_name, duration_days, duration_slug, seo_title, seo_h1, seo_description",
    )
    .eq("ship_slug", shipSlug)
    .eq("group_slug", groupSlug)
    .eq("duration_slug", durationSlug)
    .maybeSingle();

  if (!data) return null;
  const row = data as ShipGroupDurationRow;

  const durationDays = parseExactDurationSlug(durationSlug);
  if (!durationDays) return null;

  const groupMembersResult = await client
    .from("destination_group_members")
    .select("destination_name")
    .eq("group_slug", groupSlug);
  const destinations = (groupMembersResult.data ?? []).map(
    (item) => (item as { destination_name: string }).destination_name,
  );

  const aliasesResult = await client
    .from("destination_aliases")
    .select("alias, canonical_name")
    .in("canonical_name", destinations);
  const aliases = (aliasesResult.data ?? []).map((item) => item as { alias: string; canonical_name: string });

  const tokens = Array.from(
    new Set([
      ...destinations.map((name) => name.toLowerCase()),
      ...aliases.map((alias) => alias.alias),
    ]),
  );
  const orFilters = tokens.map((token) => `ports_summary.ilike.%${token}%`).join(",");

  let sailingsQuery = client
    .from("sailings")
    .select("id, sail_date, return_date, duration, itinerary_code, ship:ships(name, cruise_line)")
    .eq("ship_id", row.ship_id)
    .eq("departure_port", "Galveston")
    .gte("sail_date", new Date().toISOString().slice(0, 10))
    .eq("duration", durationDays)
    .order("sail_date", { ascending: true });

  if (orFilters) {
    sailingsQuery = sailingsQuery.or(orFilters);
  }

  const sailingsResult = await sailingsQuery;
  const sailings = (sailingsResult.data ?? []).map((item) => {
    const record = item as {
      id: string;
      sail_date: string | null;
      return_date: string | null;
      duration: number | null;
      itinerary_code: string | null;
      ship: { name: string | null; cruise_line: string | null } | null;
    };
    return {
      sailing_id: record.id,
      sail_date: record.sail_date,
      return_date: record.return_date,
      duration: record.duration,
      itinerary_code: record.itinerary_code,
      ship_name: record.ship?.name ?? null,
      cruise_line: record.ship?.cruise_line ?? null,
    } satisfies FutureSailingRow;
  });

  return {
    seo: row,
    sailings,
    subtitle: row.seo_description,
  };
}

async function loadJamaicaHubPage(client: SupabaseClientType) {
  const { data } = await client
    .from("jamaica_hub_seo_page")
    .select("hub_slug, seo_title, seo_h1, seo_description, jamaica_ports, docking_by_port")
    .maybeSingle();

  if (!data) return null;
  const row = data as JamaicaHubRow;

  const ports = row.jamaica_ports ?? [];
  const tokens = ports.map((port) => port.toLowerCase());
  const orFilters = tokens.map((token) => `ports_summary.ilike.%${token}%`).join(",");

  let sailingsQuery = client
    .from("sailings")
    .select("id, sail_date, return_date, duration, itinerary_code, ship:ships(name, cruise_line)")
    .eq("departure_port", "Galveston")
    .gte("sail_date", new Date().toISOString().slice(0, 10))
    .order("sail_date", { ascending: true });

  if (orFilters) {
    sailingsQuery = sailingsQuery.or(orFilters);
  }

  const sailingsResult = await sailingsQuery;
  const sailings = (sailingsResult.data ?? []).map((item) => {
    const record = item as {
      id: string;
      sail_date: string | null;
      return_date: string | null;
      duration: number | null;
      itinerary_code: string | null;
      ship: { name: string | null; cruise_line: string | null } | null;
    };
    return {
      sailing_id: record.id,
      sail_date: record.sail_date,
      return_date: record.return_date,
      duration: record.duration,
      itinerary_code: record.itinerary_code,
      ship_name: record.ship?.name ?? null,
      cruise_line: record.ship?.cruise_line ?? null,
    } satisfies FutureSailingRow;
  });

  return { seo: row, ports, sailings };
}

async function loadJamaicaLinePage(client: SupabaseClientType, lineSlug: string) {
  const lineResult = await client
    .from("cruise_line_seo_pages")
    .select("cruise_line_slug, cruise_line_name")
    .eq("cruise_line_slug", lineSlug)
    .maybeSingle();

  if (!lineResult.data) return null;
  const lineName = (lineResult.data as { cruise_line_name: string }).cruise_line_name;

  const hub = await loadJamaicaHubPage(client);
  if (!hub) return null;

  const tokens = hub.ports.map((port) => port.toLowerCase());
  const orFilters = tokens.map((token) => `ports_summary.ilike.%${token}%`).join(",");

  let sailingsQuery = client
    .from("sailings")
    .select("id, sail_date, return_date, duration, itinerary_code, ship:ships(name, cruise_line)")
    .eq("departure_port", "Galveston")
    .gte("sail_date", new Date().toISOString().slice(0, 10))
    .order("sail_date", { ascending: true });

  if (orFilters) {
    sailingsQuery = sailingsQuery.or(orFilters);
  }

  const sailingsResult = await sailingsQuery;
  const sailings = (sailingsResult.data ?? [])
    .map((item) => {
      const record = item as {
        id: string;
        sail_date: string | null;
        return_date: string | null;
        duration: number | null;
        itinerary_code: string | null;
        ship: { name: string | null; cruise_line: string | null } | null;
      };
      return {
        sailing_id: record.id,
        sail_date: record.sail_date,
        return_date: record.return_date,
        duration: record.duration,
        itinerary_code: record.itinerary_code,
        ship_name: record.ship?.name ?? null,
        cruise_line: record.ship?.cruise_line ?? null,
      } satisfies FutureSailingRow;
    })
    .filter((item) => item.cruise_line === lineName);

  return {
    seo: {
      seo_title: `${lineName} Jamaica Cruises from Galveston`,
      seo_h1: `${lineName} Jamaica cruises departing from Galveston`,
      seo_description: `Browse ${lineName} cruises from Galveston to Jamaica, including Falmouth, Montego Bay, and Ocho Rios.`,
    },
    sailings,
  };
}

async function loadJamaicaDurationPage(client: SupabaseClientType, durationSlug: string) {
  const durationDays = parseExactDurationSlug(durationSlug);
  if (!durationDays) return null;

  const { data } = await client
    .from("jamaica_duration_seo_pages")
    .select("duration_days, duration_slug, seo_title, seo_h1, seo_description, sailing_count")
    .eq("duration_slug", durationSlug)
    .maybeSingle();

  if (!data) return null;
  const row = data as JamaicaDurationRow;

  const hub = await loadJamaicaHubPage(client);
  if (!hub) return null;

  const tokens = hub.ports.map((port) => port.toLowerCase());
  const orFilters = tokens.map((token) => `ports_summary.ilike.%${token}%`).join(",");

  let sailingsQuery = client
    .from("sailings")
    .select("id, sail_date, return_date, duration, itinerary_code, ship:ships(name, cruise_line)")
    .eq("departure_port", "Galveston")
    .gte("sail_date", new Date().toISOString().slice(0, 10))
    .eq("duration", durationDays)
    .order("sail_date", { ascending: true });

  if (orFilters) {
    sailingsQuery = sailingsQuery.or(orFilters);
  }

  const sailingsResult = await sailingsQuery;
  const sailings = (sailingsResult.data ?? []).map((item) => {
    const record = item as {
      id: string;
      sail_date: string | null;
      return_date: string | null;
      duration: number | null;
      itinerary_code: string | null;
      ship: { name: string | null; cruise_line: string | null } | null;
    };
    return {
      sailing_id: record.id,
      sail_date: record.sail_date,
      return_date: record.return_date,
      duration: record.duration,
      itinerary_code: record.itinerary_code,
      ship_name: record.ship?.name ?? null,
      cruise_line: record.ship?.cruise_line ?? null,
    } satisfies FutureSailingRow;
  });

  return { seo: row, sailings };
}

async function loadJamaicaLineDurationPage(
  client: SupabaseClientType,
  lineSlug: string,
  durationSlug: string,
) {
  const { data } = await client
    .from("jamaica_cruise_line_duration_seo_pages")
    .select(
      "cruise_line, cruise_line_slug, duration_days, duration_slug, seo_title, seo_h1, seo_description, sailing_count",
    )
    .eq("cruise_line_slug", lineSlug)
    .eq("duration_slug", durationSlug)
    .maybeSingle();

  if (!data) return null;
  const row = data as JamaicaLineDurationRow;

  const hub = await loadJamaicaHubPage(client);
  if (!hub) return null;

  const tokens = hub.ports.map((port) => port.toLowerCase());
  const orFilters = tokens.map((token) => `ports_summary.ilike.%${token}%`).join(",");

  let sailingsQuery = client
    .from("sailings")
    .select("id, sail_date, return_date, duration, itinerary_code, ship:ships(name, cruise_line)")
    .eq("departure_port", "Galveston")
    .gte("sail_date", new Date().toISOString().slice(0, 10))
    .eq("duration", row.duration_days)
    .order("sail_date", { ascending: true });

  if (orFilters) {
    sailingsQuery = sailingsQuery.or(orFilters);
  }

  const sailingsResult = await sailingsQuery;
  const sailings = (sailingsResult.data ?? [])
    .map((item) => {
      const record = item as {
        id: string;
        sail_date: string | null;
        return_date: string | null;
        duration: number | null;
        itinerary_code: string | null;
        ship: { name: string | null; cruise_line: string | null } | null;
      };
      return {
        sailing_id: record.id,
        sail_date: record.sail_date,
        return_date: record.return_date,
        duration: record.duration,
        itinerary_code: record.itinerary_code,
        ship_name: record.ship?.name ?? null,
        cruise_line: record.ship?.cruise_line ?? null,
      } satisfies FutureSailingRow;
    })
    .filter((item) => item.cruise_line === row.cruise_line);

  return { seo: row, sailings };
}

async function loadPrivateIslandsHubPage(client: SupabaseClientType) {
  const { data } = await client
    .from("private_islands_hub_seo_page")
    .select("hub_slug, seo_title, seo_h1, seo_description, private_islands")
    .maybeSingle();

  if (!data) return null;
  return data as PrivateIslandHubRow;
}

async function loadPrivateIslandLinePage(
  client: SupabaseClientType,
  islandSlug: string,
  lineSlug: string,
) {
  const { data } = await client
    .from("private_island_cruise_line_seo_pages")
    .select(
      "destination_name, destination_slug, cruise_line, cruise_line_slug, seo_title, seo_h1, seo_description",
    )
    .eq("destination_slug", islandSlug)
    .eq("cruise_line_slug", lineSlug)
    .maybeSingle();

  if (!data) return null;
  const row = data as PrivateIslandLineRow;

  const sailingsQuery = client
    .from("sailings")
    .select("id, sail_date, return_date, duration, itinerary_code, ship:ships(name, cruise_line)")
    .eq("departure_port", "Galveston")
    .gte("sail_date", new Date().toISOString().slice(0, 10))
    .ilike("ports_summary", `%${row.destination_name}%`)
    .order("sail_date", { ascending: true });

  const sailingsResult = await sailingsQuery;
  const sailings = (sailingsResult.data ?? [])
    .map((item) => {
      const record = item as {
        id: string;
        sail_date: string | null;
        return_date: string | null;
        duration: number | null;
        itinerary_code: string | null;
        ship: { name: string | null; cruise_line: string | null } | null;
      };
      return {
        sailing_id: record.id,
        sail_date: record.sail_date,
        return_date: record.return_date,
        duration: record.duration,
        itinerary_code: record.itinerary_code,
        ship_name: record.ship?.name ?? null,
        cruise_line: record.ship?.cruise_line ?? null,
      } satisfies FutureSailingRow;
    })
    .filter((item) => item.cruise_line === row.cruise_line);

  return { seo: row, sailings };
}

async function loadPrivateIslandExperiencePage(
  client: SupabaseClientType,
  islandSlug: string,
  experienceSlug: string,
) {
  const { data } = await client
    .from("private_island_experience_seo_pages")
    .select(
      "destination_name, destination_slug, experience_slug, experience_name, operator, seo_title, seo_h1, seo_description",
    )
    .eq("destination_slug", islandSlug)
    .eq("experience_slug", experienceSlug)
    .maybeSingle();

  if (!data) return null;
  return data as PrivateIslandExperienceRow;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const server = createServerClient();
  if (!server) return { title: "Cruises from Galveston" };
  if (slug.length === 1) {
    const [one] = slug;
    if (one === "private-islands") {
      const hub = await loadPrivateIslandsHubPage(server.client);
      if (hub) return { title: hub.seo_title, description: hub.seo_description };
    }
    if (one === "jamaica") {
      const hub = await loadJamaicaHubPage(server.client);
      if (hub) return { title: hub.seo.seo_title, description: hub.seo.seo_description };
    }
    const durationPage = await loadDurationPage(server.client, one);
    if (durationPage) return { title: durationPage.seo.seo_title, description: durationPage.seo.seo_h1 };
    const shipPage = await loadShipPage(server.client, one);
    if (shipPage) return { title: shipPage.seo.seo_title, description: shipPage.seo.seo_h1 };
    const linePage = await loadCruiseLinePage(server.client, one);
    if (linePage) return { title: linePage.seo.seo_title, description: linePage.seo.seo_description };
    const destinationPage = await loadDestinationPage(server.client, one);
    if (destinationPage) return { title: destinationPage.seo.seo_title, description: destinationPage.seo.seo_description };
  }

  if (slug.length === 2) {
    const [shipSlug, durationSlug] = slug;
    const privateIslandLine = await loadPrivateIslandLinePage(server.client, shipSlug, durationSlug);
    if (privateIslandLine) {
      return {
        title: privateIslandLine.seo.seo_title,
        description: privateIslandLine.seo.seo_description,
      };
    }
    if (shipSlug === "jamaica") {
      const durationPage = await loadJamaicaDurationPage(server.client, durationSlug);
      if (durationPage) return { title: durationPage.seo.seo_title, description: durationPage.seo.seo_description };
      const linePage = await loadJamaicaLinePage(server.client, durationSlug);
      if (linePage) return { title: linePage.seo.seo_title, description: linePage.seo.seo_description };
    }
    const shipDuration = await loadShipDurationPage(server.client, shipSlug, durationSlug);
    if (shipDuration) return { title: shipDuration.seo.seo_title, description: shipDuration.seo.seo_h1 };
    const lineShip = await loadCruiseLineShipPage(server.client, shipSlug, durationSlug);
    if (lineShip) return { title: lineShip.seo.seo_title, description: lineShip.seo.seo_h1 };
    const lineDuration = await loadCruiseLineDurationPage(server.client, shipSlug, durationSlug);
    if (lineDuration) return { title: lineDuration.seo.seo_title, description: lineDuration.seo.seo_h1 };
    const destinationDuration = await loadDestinationDurationPage(server.client, shipSlug, durationSlug);
    if (destinationDuration) return { title: destinationDuration.seo.seo_title, description: destinationDuration.seo.seo_h1 };
  }

  if (slug.length === 3) {
    const [shipSlug, destinationSlug, durationSlug] = slug;
    if (destinationSlug === "experiences") {
      const experiencePage = await loadPrivateIslandExperiencePage(server.client, shipSlug, durationSlug);
      if (experiencePage) {
        return {
          title: experiencePage.seo_title,
          description: experiencePage.seo_description ?? experiencePage.seo_h1,
        };
      }
    }
    if (shipSlug === "jamaica") {
      const lineDuration = await loadJamaicaLineDurationPage(server.client, destinationSlug, durationSlug);
      if (lineDuration) {
        return {
          title: lineDuration.seo.seo_title,
          description: lineDuration.seo.seo_description,
        };
      }
    }
    const shipGroupDuration = await loadShipGroupDurationPage(server.client, shipSlug, destinationSlug, durationSlug);
    if (shipGroupDuration) {
      return {
        title: shipGroupDuration.seo.seo_title,
        description: shipGroupDuration.seo.seo_description,
      };
    }
    const shipDestinationDuration = await loadShipDestinationDurationPage(
      server.client,
      shipSlug,
      destinationSlug,
      durationSlug,
    );
    if (shipDestinationDuration) {
      return {
        title: shipDestinationDuration.seo.seo_title,
        description: shipDestinationDuration.seo.seo_description,
      };
    }
  }

  return { title: "Cruises from Galveston" };
}

export default async function CruisesFromGalvestonSeoPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugParam } = await params;
  const server = createServerClient();
  if (!server) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Cruises from Galveston</h1>
        <p className="mt-4 text-gray-600">Cruise data is unavailable right now. Please check back shortly.</p>
      </main>
    );
  }

  const slug = slugParam ?? [];
  if (slug.length === 1) {
    const [one] = slug;
    if (one === "private-islands") {
      const hub = await loadPrivateIslandsHubPage(server.client);
      if (hub) {
        if (!hub.private_islands?.length) notFound();
        return (
          <main className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="text-3xl font-semibold">{hub.seo_h1}</h1>
            <p className="mt-3 text-gray-600">{hub.seo_description}</p>
            <p className="mt-3 text-sm text-slate-600">
              Good to know: private island days are organized by the cruise line, with straightforward pier access and a
              full-day return to the ship. If this is your first private island visit, expect a relaxed beach-forward
              stop with optional experiences you can add onboard.
            </p>
            <section className="mt-8 grid gap-4 md:grid-cols-2">
              {hub.private_islands.map((island) => (
                <div key={island.destination_slug} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-lg font-semibold text-slate-800">{island.destination_name}</div>
                  {island.operator && (
                    <div className="mt-1 text-sm text-slate-600">{island.operator} private island</div>
                  )}
                  {island.notes && <p className="mt-2 text-sm text-slate-600">{island.notes}</p>}
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                    <Link
                      href={`/cruises-from-galveston/${island.destination_slug}`}
                      className="text-primary-blue"
                    >
                      Destination page
                    </Link>
                    {island.operator ? (
                      <Link
                        href={`/cruises-from-galveston/${slugify(island.operator)}`}
                        className="text-slate-700"
                      >
                        {island.operator} sailings
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </section>
            <GuestHelpCallout message="Already booked and have questions about private island logistics? We are happy to help." />
          </main>
        );
      }
    }
    if (one === "jamaica") {
      const hub = await loadJamaicaHubPage(server.client);
      if (hub) {
        if (!hub.sailings.length) notFound();
        return (
          <main className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="text-3xl font-semibold">{hub.seo.seo_h1}</h1>
            <p className="mt-3 text-gray-600">{hub.seo.seo_description}</p>
            <SailingsTable sailings={hub.sailings} />
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Jamaica ports from Galveston</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {hub.ports.map((port) => (
                  <Link
                    key={port}
                    href={`/cruises-from-galveston/${slugify(port)}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    {port}
                  </Link>
                ))}
              </div>
            </section>
            <section className="mt-6">
              <h2 className="text-lg font-semibold">Cruise lines docking in Jamaica</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                {hub.ports.map((port) => {
                  const lines = hub.seo.docking_by_port?.[port] ?? [];
                  if (!lines.length) return null;
                  return (
                    <div key={port}>
                      <strong>{port}:</strong> {lines.join(", ")}
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="mt-6">
              <h2 className="text-lg font-semibold">Jamaica cruises by line</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {["carnival", "royal-caribbean", "norwegian"].map((line) => (
                  <Link
                    key={line}
                    href={`/cruises-from-galveston/jamaica/${line}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    {line.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Link>
                ))}
              </div>
            </section>
            <GuestHelpCallout message="Already booked and have questions about Jamaica ports or getting around on shore? We are happy to help." />
          </main>
        );
      }
    }
    const durationPage = await loadDurationPage(server.client, one);
    if (durationPage) {
      if (!durationPage.sailings.length) notFound();
      return (
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-semibold">{durationPage.seo.seo_h1}</h1>
          <p className="mt-3 text-gray-600">{durationPage.subtitle}</p>
          <SailingsTable sailings={durationPage.sailings} />
        </main>
      );
    }

    const shipPage = await loadShipPage(server.client, one);
    if (shipPage) {
      if (!shipPage.sailings.length) notFound();
      return (
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-semibold">{shipPage.seo.seo_h1}</h1>
          <p className="mt-3 text-gray-600">{shipPage.subtitle}</p>
          <SailingsTable sailings={shipPage.sailings} />
        </main>
      );
    }

    const linePage = await loadCruiseLinePage(server.client, one);
    if (linePage) {
      if (!linePage.sailings.length) notFound();
      return (
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-semibold">{linePage.seo.seo_h1}</h1>
          <p className="mt-3 text-gray-600">{linePage.subtitle}</p>
          <SailingsTable sailings={linePage.sailings} />
          {linePage.ships?.length ? (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Ships in this cruise line</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {linePage.ships.map((ship) => (
                  <Link
                    key={ship.ship_slug}
                    href={`/cruises-from-galveston/${one}/${ship.ship_slug}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    {ship.ship_name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          {linePage.durations?.length ? (
            <section className="mt-6">
              <h2 className="text-lg font-semibold">Popular durations</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {linePage.durations.map((duration) => (
                  <Link
                    key={duration.duration_slug}
                    href={`/cruises-from-galveston/${one}/${duration.duration_slug}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    {duration.duration_slug}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      );
    }

    const destinationPage = await loadDestinationPage(server.client, one);
    if (destinationPage) {
      if (!destinationPage.sailings.length) notFound();
      return (
        <main className="mx-auto max-w-6xl px-6 py-10">
          {destinationPage.faq ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: [
                    destinationPage.faq.question_1 && destinationPage.faq.answer_1
                      ? {
                          "@type": "Question",
                          name: destinationPage.faq.question_1,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: destinationPage.faq.answer_1,
                          },
                        }
                      : null,
                    destinationPage.faq.question_2 && destinationPage.faq.answer_2
                      ? {
                          "@type": "Question",
                          name: destinationPage.faq.question_2,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: destinationPage.faq.answer_2,
                          },
                        }
                      : null,
                    destinationPage.faq.question_3 && destinationPage.faq.answer_3
                      ? {
                          "@type": "Question",
                          name: destinationPage.faq.question_3,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: destinationPage.faq.answer_3,
                          },
                        }
                      : null,
                    destinationPage.faq.question_4 && destinationPage.faq.answer_4
                      ? {
                          "@type": "Question",
                          name: destinationPage.faq.question_4,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: destinationPage.faq.answer_4,
                          },
                        }
                      : null,
                  ].filter(Boolean),
                }),
              }}
            />
          ) : null}
          <h1 className="text-3xl font-semibold">{destinationPage.seo.seo_h1}</h1>
          <p className="mt-3 text-gray-600">{destinationPage.subtitle}</p>
          <SailingsTable sailings={destinationPage.sailings} />
          <GuestHelpCallout message="Already booked and have questions about this destination? We are happy to help." />
        </main>
      );
    }
  }

  if (slug.length === 2) {
    const [shipSlug, durationSlug] = slug;
    const privateIslandLine = await loadPrivateIslandLinePage(server.client, shipSlug, durationSlug);
    if (privateIslandLine) {
      if (!privateIslandLine.sailings.length) notFound();
      return (
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-semibold">{privateIslandLine.seo.seo_h1}</h1>
          <p className="mt-3 text-gray-600">{privateIslandLine.seo.seo_description}</p>
          <SailingsTable sailings={privateIslandLine.sailings} />
          <GuestHelpCallout message="Already booked and have questions about this private island day? We are happy to help." />
        </main>
      );
    }
    if (shipSlug === "jamaica") {
      const durationPage = await loadJamaicaDurationPage(server.client, durationSlug);
      if (durationPage) {
        if (!durationPage.sailings.length) notFound();
        return (
          <main className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="text-3xl font-semibold">{durationPage.seo.seo_h1}</h1>
            <p className="mt-3 text-gray-600">{durationPage.seo.seo_description}</p>
            <SailingsTable sailings={durationPage.sailings} />
          </main>
        );
      }
      const linePage = await loadJamaicaLinePage(server.client, durationSlug);
      if (linePage) {
        if (!linePage.sailings.length) notFound();
        return (
          <main className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="text-3xl font-semibold">{linePage.seo.seo_h1}</h1>
            <p className="mt-3 text-gray-600">{linePage.seo.seo_description}</p>
            <SailingsTable sailings={linePage.sailings} />
          </main>
        );
      }
    }
    const shipDuration = await loadShipDurationPage(server.client, shipSlug, durationSlug);
    if (shipDuration) {
      if (!shipDuration.sailings.length) notFound();
      return (
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-semibold">{shipDuration.seo.seo_h1}</h1>
          <p className="mt-3 text-gray-600">{shipDuration.subtitle}</p>
          <SailingsTable sailings={shipDuration.sailings} />
        </main>
      );
    }
    const lineShip = await loadCruiseLineShipPage(server.client, shipSlug, durationSlug);
    if (lineShip) {
      if (!lineShip.sailings.length) notFound();
      return (
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-semibold">{lineShip.seo.seo_h1}</h1>
          <p className="mt-3 text-gray-600">{lineShip.subtitle}</p>
          <SailingsTable sailings={lineShip.sailings} />
        </main>
      );
    }
    const lineDuration = await loadCruiseLineDurationPage(server.client, shipSlug, durationSlug);
    if (lineDuration) {
      if (!lineDuration.sailings.length) notFound();
      return (
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-semibold">{lineDuration.seo.seo_h1}</h1>
          <p className="mt-3 text-gray-600">{lineDuration.subtitle}</p>
          <SailingsTable sailings={lineDuration.sailings} />
        </main>
      );
    }
    const destinationDuration = await loadDestinationDurationPage(server.client, shipSlug, durationSlug);
    if (destinationDuration) {
      if (!destinationDuration.sailings.length) notFound();
      return (
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-semibold">{destinationDuration.seo.seo_h1}</h1>
          <p className="mt-3 text-gray-600">{destinationDuration.subtitle}</p>
          <SailingsTable sailings={destinationDuration.sailings} />
        </main>
      );
    }
  }

  if (slug.length === 3) {
    const [shipSlug, destinationSlug, durationSlug] = slug;
    if (destinationSlug === "experiences") {
      const experiencePage = await loadPrivateIslandExperiencePage(server.client, shipSlug, durationSlug);
      if (experiencePage) {
        return (
          <main className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="text-3xl font-semibold">{experiencePage.seo_h1}</h1>
            {experiencePage.seo_description ? (
              <p className="mt-3 text-gray-600">{experiencePage.seo_description}</p>
            ) : null}
            <p className="mt-3 text-sm text-slate-600">
              What you can expect: experiences are managed by the cruise line and may include age limits, waiver
              requirements, or reservation windows. Details are confirmed onboard so you can plan with confidence.
            </p>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm uppercase tracking-wide text-slate-500">Private island experience</div>
              <div className="mt-2 text-lg font-semibold text-slate-800">{experiencePage.experience_name}</div>
              {experiencePage.operator ? (
                <div className="mt-2 text-sm text-slate-600">{experiencePage.operator} exclusive</div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                <Link
                  href={`/cruises-from-galveston/${experiencePage.destination_slug}`}
                  className="text-primary-blue"
                >
                  Destination page
                </Link>
                {experiencePage.operator ? (
                  <Link
                    href={`/cruises-from-galveston/${slugify(experiencePage.operator)}`}
                    className="text-slate-700"
                  >
                    {experiencePage.operator} sailings
                  </Link>
                ) : null}
              </div>
            </div>
            <GuestHelpCallout message="Already booked and wondering about availability, timing, or what to bring? We are happy to help." />
          </main>
        );
      }
    }
    if (shipSlug === "jamaica") {
      const lineDuration = await loadJamaicaLineDurationPage(server.client, destinationSlug, durationSlug);
      if (lineDuration) {
        if (!lineDuration.sailings.length) notFound();
        return (
          <main className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="text-3xl font-semibold">{lineDuration.seo.seo_h1}</h1>
            <p className="mt-3 text-gray-600">{lineDuration.seo.seo_description}</p>
            <SailingsTable sailings={lineDuration.sailings} />
          </main>
        );
      }
    }
    const shipGroupDuration = await loadShipGroupDurationPage(server.client, shipSlug, destinationSlug, durationSlug);
    if (shipGroupDuration) {
      if (!shipGroupDuration.sailings.length) notFound();
      return (
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-semibold">{shipGroupDuration.seo.seo_h1}</h1>
          <p className="mt-3 text-gray-600">{shipGroupDuration.subtitle}</p>
          <SailingsTable sailings={shipGroupDuration.sailings} />
        </main>
      );
    }
    const shipDestinationDuration = await loadShipDestinationDurationPage(
      server.client,
      shipSlug,
      destinationSlug,
      durationSlug,
    );
    if (shipDestinationDuration) {
      if (!shipDestinationDuration.sailings.length) notFound();
      return (
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-semibold">{shipDestinationDuration.seo.seo_h1}</h1>
          <p className="mt-3 text-gray-600">{shipDestinationDuration.subtitle}</p>
          <SailingsTable sailings={shipDestinationDuration.sailings} />
        </main>
      );
    }
  }

  notFound();
}

function GuestHelpCallout({ message }: { message: string }) {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Already booked? We&apos;re still here to help.</h2>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      <Link href="/cruises-from-galveston/guest-help" className="mt-3 inline-flex text-sm font-semibold text-primary-blue">
        Visit the Guest Help Desk
      </Link>
    </section>
  );
}

function SailingsTable({ sailings }: { sailings: FutureSailingRow[] }) {
  return (
    <section className="mt-8">
      {!sailings.length && <p className="text-gray-500">No upcoming sailings are available at this time.</p>}
      {!!sailings.length && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Ship</th>
                <th className="px-4 py-3">Departure</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Itinerary</th>
                <th className="px-4 py-3">Return</th>
              </tr>
            </thead>
            <tbody>
              {sailings.map((sailing) => (
                <tr key={sailing.sailing_id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{sailing.ship_name ?? "Cruise Ship"}</td>
                  <td className="px-4 py-3">{formatDate(sailing.sail_date)}</td>
                  <td className="px-4 py-3">{formatDurationLabel(sailing.cruise_line, sailing.duration)}</td>
                  <td className="px-4 py-3">{sailing.itinerary_code || "TBA"}</td>
                  <td className="px-4 py-3">{formatDate(sailing.return_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
