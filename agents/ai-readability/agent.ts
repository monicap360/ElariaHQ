import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AgentTask = {
  id: string;
  notes: string | null;
};

const READABILITY_SUGGESTIONS = [
  "Add a short summary section at the top",
  "Ensure headings are question-based where possible",
  "Include a quick checklist near the end",
  "Add a short FAQ block for common concerns",
];

export async function runAiReadabilityAgent() {
  console.log("🧩 AI Readability Agent starting");

  const { data: tasks, error } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("agent_name", "AIReadabilityAgent")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching AIReadabilityAgent tasks:", error);
    return;
  }

  if (!tasks || tasks.length === 0) {
    console.log("No pending AIReadabilityAgent tasks.");
    return;
  }

  for (const task of tasks as AgentTask[]) {
    try {
      await supabase
        .from("agent_tasks")
        .update({ status: "in_progress" })
        .eq("id", task.id);

      const suggestions = READABILITY_SUGGESTIONS.map((item, index) => `${index + 1}. ${item}`).join("\n");
      const notes = `${task.notes ? `${task.notes}\n\n` : ""}AI readability suggestions:\n${suggestions}`;

      await supabase
        .from("agent_tasks")
        .update({
          status: "done",
          ready_for_content: true,
          completed_at: new Date().toISOString(),
          notes,
        })
        .eq("id", task.id);

      console.log(`✅ AIReadabilityAgent processed task ${task.id}`);
    } catch (err) {
      console.error("Error processing AIReadabilityAgent task", task.id, err);
      await supabase
        .from("agent_tasks")
        .update({
          status: "blocked",
          notes: `${task.notes || ""}\n\nError: ${String(err)}`,
        })
        .eq("id", task.id);
    }
  }

  console.log("✅ AI Readability Agent complete");
}
