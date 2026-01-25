import { runExplanationQualityAgent } from "../explanation-quality/agent";
import { runTopicalOwnershipAgent } from "../topical-ownership/agent";

export async function orchestrate(goal: string) {
  console.log("🎯 New Goal:", goal);

  await runTopicalOwnershipAgent();
  await runExplanationQualityAgent();
}
