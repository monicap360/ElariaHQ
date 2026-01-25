import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GALVESTON_KNOWLEDGE_MAP = {
  journey: [
    "Port arrival timing and terminal flow",
    "Parking and shuttle options",
    "Embarkation day checklist",
    "Cabin selection guidance",
    "Dining and drink packages",
    "Family and group travel notes",
  ],
  feeder_state: [
    "Driving vs flying considerations",
    "Best cruise length for long-distance travelers",
    "Cost and time tradeoffs",
    "Hotel and pre-cruise night planning",
    "Return travel considerations",
  ],
  feeder_city: [
    "Nearest airports and routes to Galveston",
    "Drive time estimates and rest stops",
    "Best departure day for traffic",
    "Budget planning for travel day",
  ],
  spanish: [
    "Spanish-first explanation of the full journey",
    "Document clarity for mixed-status families",
    "Payment explanations in plain Spanish",
  ],
  operations: [
    "Pricing consistency across channels",
    "Listings accuracy and updates",
    "Event and promotion alignment",
  ],
};

type AgentTask = {
  id: string;
  reference_id: string | null;
  notes: string | null;
};

/**
 * Analyze knowledge topics linked to TopicalOwnershipAgent tasks.
 */
export async function runTopicalOwnershipAgent() {
  console.log("🧠 Topical Ownership Agent starting...");

  const { data: tasks, error } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("agent_name", "TopicalOwnershipAgent")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching tasks:", error);
    return;
  }

  if (!tasks || tasks.length === 0) {
    console.log("✅ No pending TopicalOwnershipAgent tasks");
    return;
  }

  for (const task of tasks as AgentTask[]) {
    try {
      await supabase
        .from("agent_tasks")
        .update({ status: "in_progress" })
        .eq("id", task.id);

      if (!task.reference_id) {
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: "Missing reference_id" })
          .eq("id", task.id);
        continue;
      }

      const { data: topic } = await supabase
        .from("knowledge_topics")
        .select("*")
        .eq("id", task.reference_id)
        .maybeSingle();

      if (!topic) {
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: "Missing knowledge_topic" })
          .eq("id", task.id);
        continue;
      }

      let expectedSubtopics: string[] = [];

      switch (topic.scope) {
        case "galveston":
          expectedSubtopics = GALVESTON_KNOWLEDGE_MAP.journey;
          break;
        case "state":
          expectedSubtopics = GALVESTON_KNOWLEDGE_MAP.feeder_state;
          break;
        case "city":
          expectedSubtopics = GALVESTON_KNOWLEDGE_MAP.feeder_city;
          break;
        case "spanish":
          expectedSubtopics = GALVESTON_KNOWLEDGE_MAP.spanish;
          break;
        case "operations":
          expectedSubtopics = GALVESTON_KNOWLEDGE_MAP.operations;
          break;
        default:
          expectedSubtopics = [];
      }

      for (const subtopic of expectedSubtopics) {
        await supabase.from("agent_tasks").insert({
          agent_name: "ExplanationQualityAgent",
          task_type: "outline_subtopic",
          reference_id: topic.id,
          status: "pending",
          notes: `Subtopic required: ${subtopic}`,
        });
      }

      await supabase
        .from("knowledge_topics")
        .update({ status: "draft" })
        .eq("id", topic.id);

      await supabase
        .from("agent_tasks")
        .update({ status: "done" })
        .eq("id", task.id);

      console.log(`📌 Topic mapped: ${topic.topic}`);
    } catch (err) {
      console.error("Error processing TopicalOwnershipAgent task", task.id, err);
      await supabase
        .from("agent_tasks")
        .update({
          status: "blocked",
          notes: `${task.notes || ""}\n\nError: ${String(err)}`,
        })
        .eq("id", task.id);
    }
  }

  console.log("🧠 Topical Ownership Agent complete");
}
