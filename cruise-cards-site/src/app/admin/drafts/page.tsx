import DraftsTable from "./DraftsTable";
import { createClient } from "@/lib/supabase/server";

type AgentTask = {
  id: string;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
  target_site: string | null;
  source_signal: string | null;
  parent_asset_id: string | null;
};

type KnowledgeTopic = {
  id: string;
  topic: string;
  scope: string | null;
  priority: number | null;
};

export default async function DraftsPage() {
  const supabase = createClient();

  const { data: tasks } = await supabase
    .from("agent_tasks")
    .select("id,reference_id,notes,created_at,target_site,source_signal,parent_asset_id")
    .eq("ready_for_content", true)
    .order("created_at", { ascending: true });

  const referenceIds = Array.from(
    new Set((tasks || []).map((task: AgentTask) => task.reference_id).filter(Boolean))
  ) as string[];

  let topics: KnowledgeTopic[] = [];

  if (referenceIds.length) {
    const { data } = await supabase
      .from("knowledge_topics")
      .select("id,topic,scope,priority")
      .in("id", referenceIds);
    topics = (data || []) as KnowledgeTopic[];
  }

  const topicMap = new Map(topics.map((topic) => [topic.id, topic]));

  const drafts = (tasks || []).map((task: AgentTask) => {
    const topic = task.reference_id ? topicMap.get(task.reference_id) : null;
    return {
      id: task.id,
      topic: topic?.topic || "Untitled topic",
      scope: topic?.scope || "unknown",
      targetSite: task.target_site || "cruisesfromgalveston.net",
      sourceSignal: task.source_signal || "manual",
      priority: topic?.priority ?? null,
      createdAt: new Date(task.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      notes: task.notes || "",
      parentHub: task.parent_asset_id || "/cruises-from-galveston/how-to-plan",
    };
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <DraftsTable drafts={drafts} />
    </main>
  );
}
