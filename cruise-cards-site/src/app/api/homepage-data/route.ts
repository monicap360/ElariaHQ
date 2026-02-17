import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type DeskItem = {
  id: string;
  title: string;
  summary: string | null;
  created_at: string | null;
  source?: string | null;
  kind: "draft" | "signal";
};

function makeExcerpt(text: string | null, max = 160) {
  if (!text) return null;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}...`;
}

function splitPorts(value: string | null | undefined) {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 2 && part.length < 32);
}

type ShipCountRow = {
  ship_id: string;
  ship_name: string;
  cruise_line: string | null;
  home_port: string | null;
  future_sailing_count: number | null;
  next_sailing_date: string | null;
  last_sailing_date: string | null;
};

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ deskItems: [], ships: [], ports: [] });
  }

  const supabase = createAdminClient();

  const deskItems: DeskItem[] = [];

  const draftsRes = await supabase
    .from("content_drafts")
    .select("id,draft_title,draft_body,created_at,site_target,status,authority_role")
    .eq("site_target", "cruisesfromgalveston")
    .eq("status", "approved")
    .in("authority_role", ["explainer", "guide", "context", "comparison", "pr"])
    .order("created_at", { ascending: false })
    .limit(3);

  if (draftsRes.data && draftsRes.data.length) {
    draftsRes.data.forEach((row) => {
      deskItems.push({
        id: row.id,
        title: row.draft_title || "Untitled update",
        summary: makeExcerpt(row.draft_body),
        created_at: row.created_at,
        kind: "draft",
      });
    });
  }

  const shipsRes = await supabase
    .from("ship_future_sailing_counts")
    .select("ship_id, ship_name, cruise_line, home_port, future_sailing_count, next_sailing_date, last_sailing_date")
    .order("future_sailing_count", { ascending: false })
    .order("next_sailing_date", { ascending: true })
    .limit(8);

  let ships = (shipsRes.data || []) as ShipCountRow[];

  if (shipsRes.error || ships.length === 0) {
    // Fallback: build counts directly from sailings+ships to avoid empty UIs
    // when views/migrations haven't been applied or home_port isn't standardized.
    const today = new Date().toISOString().slice(0, 10);
    type SailingJoinRow = {
      id: string;
      depart_date: string | null;
      departure_port?: string | null;
      ship:
        | { id: string; name: string; cruise_line: string | null; home_port: string | null }
        | { id: string; name: string; cruise_line: string | null; home_port: string | null }[]
        | null;
    };

    const sailingsForShipsRes = await supabase
      .from("sailings")
      .select("id, depart_date, departure_port, ship:ships(id,name,cruise_line,home_port)")
      .eq("is_active", true)
      .gte("depart_date", today)
      .order("depart_date", { ascending: true })
      .limit(1200);

    const rows = (sailingsForShipsRes.data ?? []) as SailingJoinRow[];
    const byShip = new Map<string, ShipCountRow>();

    rows.forEach((row) => {
      const shipRow = Array.isArray(row.ship) ? row.ship[0] : row.ship;
      if (!shipRow?.id || !shipRow.name) return;

      const homePort = shipRow.home_port || "";
      const departurePort = String((row as { departure_port?: string | null }).departure_port || "");
      const isGalveston =
        homePort.toLowerCase().includes("galveston") || departurePort.toLowerCase().includes("galveston");
      if (!isGalveston) return;

      const existing = byShip.get(shipRow.id);
      const departDate = row.depart_date ?? null;
      if (!existing) {
        byShip.set(shipRow.id, {
          ship_id: shipRow.id,
          ship_name: shipRow.name,
          cruise_line: shipRow.cruise_line ?? null,
          home_port: shipRow.home_port ?? null,
          future_sailing_count: 1,
          next_sailing_date: departDate,
          last_sailing_date: departDate,
        });
        return;
      }

      existing.future_sailing_count = (existing.future_sailing_count ?? 0) + 1;
      if (departDate) {
        if (!existing.next_sailing_date || departDate < existing.next_sailing_date) {
          existing.next_sailing_date = departDate;
        }
        if (!existing.last_sailing_date || departDate > existing.last_sailing_date) {
          existing.last_sailing_date = departDate;
        }
      }
    });

    ships = Array.from(byShip.values())
      .sort((a, b) => {
        const countA = a.future_sailing_count ?? 0;
        const countB = b.future_sailing_count ?? 0;
        if (countA !== countB) return countB - countA;
        return (a.next_sailing_date || "").localeCompare(b.next_sailing_date || "");
      })
      .slice(0, 8);
  }

  const portsCount = new Map<string, number>();
  const sailingsRes = await supabase
    .from("sailings")
    .select("ports,itinerary")
    .eq("is_active", true)
    .eq("departure_port", "Galveston")
    .order("depart_date", { ascending: true })
    .limit(200);

  if (sailingsRes.data) {
    sailingsRes.data.forEach((row) => {
      const ports = [
        ...splitPorts(typeof row.ports === "string" ? row.ports : null),
        ...splitPorts(row.itinerary ?? null),
      ];
      ports.forEach((port) => {
        portsCount.set(port, (portsCount.get(port) || 0) + 1);
      });
    });
  }

  const ports = Array.from(portsCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name]) => name);

  return NextResponse.json({
    deskItems,
    ships,
    ports,
  });
}
