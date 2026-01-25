import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Explanation Quality Agent
 *
 * - Finds agent_tasks assigned to ExplanationQualityAgent with status = 'pending'
 * - For each task:
 *   - Load the related knowledge_topic
 *   - Determine an outline (list of atomic points) based on topic scope and notes
 *   - Insert one or more follow-up tasks into agent_tasks for downstream agents
 *   - Update this task status to 'done' and set notes with the outline
 *
 * Intentionally does NOT write natural-language content. Only structured outlines.
 */

type AgentTask = {
  id: string;
  reference_id: string | null;
  notes: string | null;
  target_site?: string | null;
  source_signal?: string | null;
  parent_asset_id?: string | null;
};

async function fetchPendingTasks(limit = 10) {
  const { data, error } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("agent_name", "ExplanationQualityAgent")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

function simpleOutlineFromTopic(topic: { scope?: string | null }) {
  const scope = (topic.scope || "").toLowerCase();

  if (scope === "galveston") {
    return [
      "Full journey overview (pre-trip to embarkation)",
      "Documents checklist (US/international)",
      "Parking and arrival logistics",
      "Transport options to port",
      "Luggage and check-in timing",
      "Accessibility and special cases",
      "Edge cases and contingencies",
    ];
  }

  if (scope === "state") {
    return [
      "Drive vs fly decision factors",
      "Recommended departure windows",
      "Staging locations and hotels",
      "State-specific rules or considerations",
    ];
  }

  if (scope === "city") {
    return [
      "Local transit and fastest routes",
      "Suggested timing",
      "Local parking or overnight options",
    ];
  }

  if (scope === "spanish") {
    return [
      "Spanish-first flow and terminology",
      "Cross-border documentation notes",
      "FAQ translations to prioritize",
    ];
  }

  if (scope === "operations") {
    return ["Canonical pricing and sync steps", "Listings audit checklist"];
  }

  return ["Key points to cover", "Questions to resolve", "Related resources to collect"];
}

export async function runExplanationQualityAgent() {
  console.log("🧩 Explanation Quality Agent starting");

  const tasks = (await fetchPendingTasks()) as AgentTask[];

  if (!tasks.length) {
    console.log("No pending ExplanationQualityAgent tasks.");
    return;
  }

  for (const task of tasks) {
    try {
      await supabase
        .from("agent_tasks")
        .update({ status: "in_progress" })
        .eq("id", task.id);

      let topic: { scope?: string | null } | null = null;

      if (task.reference_id) {
        const { data: fetchedTopic } = await supabase
          .from("knowledge_topics")
          .select("*")
          .eq("id", task.reference_id)
          .maybeSingle();
        topic = fetchedTopic || null;
      }

      const outline = simpleOutlineFromTopic(topic || { scope: null });
      const outlineText = outline.map((item, index) => `${index + 1}. ${item}`).join("\n");

      for (const item of outline) {
        await supabase.from("agent_tasks").insert({
          agent_name: "UserIntentAgent",
          task_type: "research_subpoint",
          reference_id: task.reference_id,
          status: "pending",
          target_site: task.target_site ?? "cruisesfromgalveston.net",
          source_signal: task.source_signal ?? "manual",
          parent_asset_id: task.parent_asset_id ?? null,
          notes: `Outline item: ${item}`,
        });
      }

      await supabase
        .from("agent_tasks")
        .update({
          status: "done",
          completed_at: new Date().toISOString(),
          notes: `${task.notes ? `${task.notes}\n\n` : ""}Outline:\n${outlineText}`,
        })
        .eq("id", task.id);

      console.log(`Processed task ${task.id} -> created ${outline.length} subtasks`);
    } catch (err) {
      console.error("Error processing task", task.id, err);
      await supabase
        .from("agent_tasks")
        .update({
          status: "blocked",
          notes: `${task.notes || ""}\n\nError: ${String(err)}`,
        })
        .eq("id", task.id);
    }
  }

  console.log("✅ Explanation Quality Agent run complete");
}

if ((import.meta as { main?: boolean }).main) {
  runExplanationQualityAgent().catch((err) => {
    console.error("Unhandled error in Explanation Quality Agent:", err);
  });
}
