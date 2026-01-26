import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

type AgentTask = {
  id: string;
  reference_id: string | null;
  ready_for_content: boolean | null;
  target_site: string | null;
  source_signal: string | null;
  parent_asset_id: string | null;
  notes?: string | null;
  outline_hash?: string | null;
};

type KnowledgeTopic = {
  id: string;
  topic: string;
};

function normalizeSiteTarget(value: string | null | undefined) {
  if (!value) return "cruisesfromgalveston";
  const normalized = value.toLowerCase();
  if (normalized.includes("texascruiseport")) return "texascruiseport";
  if (normalized.includes("houstoncruisetips")) return "houstoncruisetips";
  if (normalized.includes("houstoncruiseshuttle")) return "houstoncruiseshuttle";
  if (normalized.includes("pier10parking")) return "pier10parking";
  if (normalized.includes("pier25parking")) return "pier25parking";
  if (normalized.includes("cruisesfromgalveston")) return "cruisesfromgalveston";
  return "cruisesfromgalveston";
}

async function fetchEligibleTasks() {
  const { data, error } = await supabase
    .from("agent_tasks")
    .select("id,reference_id,ready_for_content,target_site,source_signal,parent_asset_id,notes,outline_hash")
    .eq("ready_for_content", true);

  if (error) {
    throw error;
  }

  return (data || []) as AgentTask[];
}

async function hashOutline(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const body = await request.json().catch(() => ({}));
  const dryRun = Boolean(body?.dry_run);

  const tasks = await fetchEligibleTasks();

  if (!tasks.length) {
    return new Response(JSON.stringify({ eligible: 0, created: 0, task_ids: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const existing = await supabase
    .from("content_drafts")
    .select("task_id")
    .in(
      "task_id",
      tasks.map((task) => task.id)
    );

  const existingTaskIds = new Set((existing.data || []).map((row) => row.task_id));
  const eligible = tasks.filter((task) => !existingTaskIds.has(task.id));

  if (dryRun) {
    return new Response(
      JSON.stringify({ eligible: eligible.length, created: 0, task_ids: eligible.map((task) => task.id) }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  for (const task of eligible) {
    if (!task.outline_hash && task.notes) {
      task.outline_hash = await hashOutline(task.notes);
    }
  }

  const referenceIds = Array.from(new Set(eligible.map((task) => task.reference_id).filter(Boolean))) as string[];
  let topics: KnowledgeTopic[] = [];

  if (referenceIds.length) {
    const { data } = await supabase.from("knowledge_topics").select("id,topic").in("id", referenceIds);
    topics = (data || []) as KnowledgeTopic[];
  }

  const topicMap = new Map(topics.map((topic) => [topic.id, topic]));

  const drafts = eligible.map((task) => {
    const topic = task.reference_id ? topicMap.get(task.reference_id) : null;
    const outlineText = task.notes || "";
    return {
      task_id: task.id,
      site_target: normalizeSiteTarget(task.target_site),
      draft_type: "page",
      format: "markdown",
      draft_title: topic?.topic ?? "Untitled draft",
      draft_body: "",
      authority_role: "explainer",
      status: "drafted",
      routing: task.parent_asset_id,
      source_ref: task.source_signal,
      created_by: "publisher_agent",
      outline_text: outlineText,
      outline_hash: task.outline_hash,
    };
  });

  const { error } = await supabase.from("content_drafts").insert(drafts);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ eligible: eligible.length, created: drafts.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
