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

/**
 * Analyze a knowledge topic and determine missing subtopics.
 */
export async function runTopicalOwnershipAgent() {
  console.log("🧠 Topical Ownership Agent starting...");

  // 1. Fetch all knowledge topics that are missing or incomplete
  const { data: topics, error } = await supabase
    .from("knowledge_topics")
    .select("*")
    .in("status", ["missing", "needs_update"])
    .order("priority", { ascending: true });

  if (error) {
    console.error("Error fetching topics:", error);
    return;
  }

  if (!topics || topics.length === 0) {
    console.log("✅ No missing topics found");
    return;
  }

  // 2. For each topic, determine expected coverage
  for (const topic of topics) {
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

    // 3. Create tasks for each missing subtopic
    for (const subtopic of expectedSubtopics) {
      await supabase.from("agent_tasks").insert({
        agent_name: "ExplanationQualityAgent",
        task_type: "outline_subtopic",
        reference_id: topic.id,
        notes: `Subtopic required: ${subtopic}`,
      });
    }

    // 4. Mark topic as "draft" once tasks are assigned
    await supabase
      .from("knowledge_topics")
      .update({ status: "draft" })
      .eq("id", topic.id);

    console.log(`📌 Topic mapped: ${topic.topic}`);
  }

  console.log("🧠 Topical Ownership Agent complete");
}
