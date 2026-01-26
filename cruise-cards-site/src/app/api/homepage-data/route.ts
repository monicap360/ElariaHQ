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

export async function GET() {
  const supabase = createAdminClient();

  const deskItems: DeskItem[] = [];

  const draftsRes = await supabase
    .from("content_drafts")
    .select("id,draft_title,draft_body,created_at,site_target,status")
    .eq("site_target", "cruisesfromgalveston")
    .eq("status", "drafted")
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
  } else {
    const signalsRes = await supabase
      .from("news_signals")
      .select("id,headline,summary,source,detected_at")
      .order("detected_at", { ascending: false })
      .limit(3);

    if (signalsRes.data) {
      signalsRes.data.forEach((row) => {
        deskItems.push({
          id: row.id,
          title: row.headline,
          summary: makeExcerpt(row.summary),
          created_at: row.detected_at,
          source: row.source,
          kind: "signal",
        });
      });
    }
  }

  const shipsRes = await supabase
    .from("ships")
    .select("id,name,home_port,is_active")
    .eq("is_active", true)
    .ilike("home_port", "%Galveston%")
    .order("name", { ascending: true })
    .limit(8);

  const portsCount = new Map<string, number>();
  const sailingsRes = await supabase
    .from("sailings")
    .select("ports,itinerary")
    .eq("is_active", true)
    .order("sail_date", { ascending: true })
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
    ships: shipsRes.data || [],
    ports,
  });
}
