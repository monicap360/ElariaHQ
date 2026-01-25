import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AgentTask = {
  id: string;
  reference_id: string | null;
  notes: string | null;
  target_site?: string | null;
  source_signal?: string | null;
  parent_asset_id?: string | null;
};

const INTENT_CHECKLIST = [
  "Common anxieties or blockers",
  "Key decision points and tradeoffs",
  "Questions users ask before booking",
  "What would delay action?",
];

export async function runUserIntentAgent() {
  console.log("🧩 User Intent Agent starting");

  const { data: tasks, error } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("agent_name", "UserIntentAgent")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching UserIntentAgent tasks:", error);
    return;
  }

  if (!tasks || tasks.length === 0) {
    console.log("No pending UserIntentAgent tasks.");
    return;
  }

  for (const task of tasks as AgentTask[]) {
    try {
      await supabase
        .from("agent_tasks")
        .update({ status: "in_progress" })
        .eq("id", task.id);

      const checklist = INTENT_CHECKLIST.map((item, index) => `${index + 1}. ${item}`).join("\n");
      const notes = `${task.notes ? `${task.notes}\n\n` : ""}Intent review checklist:\n${checklist}`;

      await supabase
        .from("agent_tasks")
        .update({
          status: "done",
          completed_at: new Date().toISOString(),
          notes,
        })
        .eq("id", task.id);

      await supabase.from("agent_tasks").insert({
        agent_name: "AIReadabilityAgent",
        task_type: "ai_readability_check",
        reference_id: task.reference_id,
        status: "pending",
        target_site: task.target_site ?? "cruisesfromgalveston.net",
        source_signal: task.source_signal ?? "manual",
        parent_asset_id: task.parent_asset_id ?? null,
        notes: `Follow-up from UserIntentAgent task ${task.id}`,
      });

      console.log(`✅ UserIntentAgent processed task ${task.id}`);
    } catch (err) {
      console.error("Error processing UserIntentAgent task", task.id, err);
      await supabase
        .from("agent_tasks")
        .update({
          status: "blocked",
          notes: `${task.notes || ""}\n\nError: ${String(err)}`,
        })
        .eq("id", task.id);
    }
  }

  console.log("✅ User Intent Agent complete");
}
