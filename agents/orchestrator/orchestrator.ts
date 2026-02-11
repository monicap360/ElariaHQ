import { createClient } from "@supabase/supabase-js";
import { runExplanationQualityAgent } from "../explanation-quality/agent";
import { runTopicalOwnershipAgent } from "../topical-ownership/agent";
import { runUserIntentAgent } from "../user-intent/agent";
import { runAiReadabilityAgent } from "../ai-readability/agent";
import { runTransportationTransfersAgent } from "../transportation-transfers/agent";
import { runExperienceStudioAgent } from "../experience-studio/agent";
import { notifyAgentUpdate } from "../notify";

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
    await notifyAgentUpdate("TopicalOwnershipAgent", "Run complete.");
  }

  if (agents.has("ExplanationQualityAgent")) {
    await runExplanationQualityAgent();
    await notifyAgentUpdate("ExplanationQualityAgent", "Run complete.");
  }

  if (agents.has("UserIntentAgent")) {
    await runUserIntentAgent();
    await notifyAgentUpdate("UserIntentAgent", "Run complete.");
  }

  if (agents.has("AIReadabilityAgent")) {
    await runAiReadabilityAgent();
    await notifyAgentUpdate("AIReadabilityAgent", "Run complete.");
  }

  if (agents.has("TransportationTransfersAgent")) {
    await runTransportationTransfersAgent();
    await notifyAgentUpdate("TransportationTransfersAgent", "Run complete.");
  }

  if (agents.has("ExperienceStudioAgent")) {
    await runExperienceStudioAgent();
    await notifyAgentUpdate("ExperienceStudioAgent", "Run complete.");
  }
}
