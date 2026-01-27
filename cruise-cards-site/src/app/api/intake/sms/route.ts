import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ParsedTopic = {
  topic: string;
  scope: string;
  priority: number;
};

function parseTopicInstruction(text: string): ParsedTopic | null {
  const lower = text.toLowerCase();
  if (!lower.startsWith("topic:")) return null;

  const parts = text.split("|").map((part) => part.trim());
  const topicPart = parts[0]?.replace(/^topic:/i, "").trim();
  if (!topicPart) return null;

  let scope = "city";
  let priority = 3;

  for (const part of parts.slice(1)) {
    if (part.toLowerCase().startsWith("scope:")) {
      scope = part.split(":")[1]?.trim() || scope;
    }
    if (part.toLowerCase().startsWith("priority:")) {
      const value = Number(part.split(":")[1]?.trim());
      if (Number.isFinite(value)) priority = value;
    }
  }

  return { topic: topicPart, scope, priority };
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  const params = new URLSearchParams(bodyText);
  const from = params.get("From") || "";
  const body = params.get("Body") || "";

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const supabase = createAdminClient();

  const topicInstruction = parseTopicInstruction(body);

  await supabase.from("agent_inbox").insert({
    channel: "sms",
    from_contact: from,
    body,
    agent_name: topicInstruction ? "TopicalOwnershipAgent" : null,
    task_type: topicInstruction ? "map_topic" : null,
  });

  if (topicInstruction) {
    const { data: existingTopic } = await supabase
      .from("knowledge_topics")
      .select("id")
      .eq("topic", topicInstruction.topic)
      .maybeSingle();

    let topicId = existingTopic?.id;

    if (!topicId) {
      const { data: created } = await supabase
        .from("knowledge_topics")
        .insert({
          topic: topicInstruction.topic,
          scope: topicInstruction.scope,
          priority: topicInstruction.priority,
          status: "missing",
        })
        .select("id")
        .maybeSingle();
      topicId = created?.id;
    }

    if (topicId) {
      await supabase.from("agent_tasks").insert({
        agent_name: "TopicalOwnershipAgent",
        task_type: "map_topic",
        reference_id: topicId,
        status: "pending",
        source_signal: "sms",
        target_site: "cruisesfromgalveston.net",
      });
    }
  }

  return NextResponse.json({ ok: true });
}
