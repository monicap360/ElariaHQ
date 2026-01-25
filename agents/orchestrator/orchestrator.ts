import { createClient } from "@supabase/supabase-js";
import { runExplanationQualityAgent } from "../explanation-quality/agent";
import { runTopicalOwnershipAgent } from "../topical-ownership/agent";
import { runUserIntentAgent } from "../user-intent/agent";
import { runAiReadabilityAgent } from "../ai-readability/agent";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function orchestrate(goal: string) {
  console.log("🎯 Orchestrator goal:", goal);

  const { data: tasks, error } = await supabase
    .from("agent_tasks")
    .select("agent_name")
    .eq("status", "pending");

  if (error) {
    console.error("Error fetching pending tasks:", error);
    return;
  }

  const agents = new Set((tasks || []).map((task) => task.agent_name).filter(Boolean));

  if (agents.has("TopicalOwnershipAgent")) {
    await runTopicalOwnershipAgent();
  }

  if (agents.has("ExplanationQualityAgent")) {
    await runExplanationQualityAgent();
  }

  if (agents.has("UserIntentAgent")) {
    await runUserIntentAgent();
  }

  if (agents.has("AIReadabilityAgent")) {
    await runAiReadabilityAgent();
  }
}
