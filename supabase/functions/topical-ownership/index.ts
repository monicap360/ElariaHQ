import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const KNOWLEDGE_MAP: Record<string, string[]> = {
  galveston: [
    "Is Galveston the right cruise port?",
    "Driving vs flying to Galveston",
    "Best cruise length by distance",
    "Parking and arrival logistics",
    "Required documents",
    "Deposits and payment timing",
  ],
  state: [
    "Why Galveston works for this state",
    "Driving vs flying from this state",
    "Recommended cruise lengths",
    "Cost considerations",
  ],
  city: [
    "Exact drive routes and time",
    "Overnight stop guidance",
    "Parking strategy",
    "Family and group travel notes",
  ],
  spanish: [
    "Spanish explanation of full journey",
    "Document clarity",
    "Payment explanation",
  ],
  operations: [
    "Pricing consistency",
    "Listings accuracy",
    "Event alignment",
  ],
};

export default async function handler() {
  const { data: topics } = await supabase
    .from("knowledge_topics")
    .select("*")
    .in("status", ["missing", "needs_update"])
    .order("priority", { ascending: true });

  if (!topics || topics.length === 0) {
    return new Response(JSON.stringify({ message: "No missing topics" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  for (const topic of topics) {
    const subtopics = KNOWLEDGE_MAP[topic.scope] || [];

    for (const sub of subtopics) {
      await supabase.from("agent_tasks").insert({
        agent_name: "ExplanationQualityAgent",
        task_type: "outline",
        reference_id: topic.id,
        notes: sub,
      });
    }

    await supabase
      .from("knowledge_topics")
      .update({ status: "draft" })
      .eq("id", topic.id);
  }

  return new Response(JSON.stringify({ processed: topics.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
