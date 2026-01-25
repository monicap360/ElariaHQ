import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AgentTask = {
  id: string;
  agent_name: string;
  task_type: string;
  reference_id: string;
  notes: string | null;
  created_at?: string;
};

type OutlineSection = {
  heading: string;
  bullets: string[];
};

function normalizeBullet(value: string) {
  return value.replace(/^Subtopic required:\s*/i, "").trim();
}

export function buildOutlineFromTasks(tasks: AgentTask[]): OutlineSection[] {
  const bullets = tasks
    .map((task) => task.notes || "")
    .map(normalizeBullet)
    .filter(Boolean);

  if (bullets.length === 0) {
    return [
      {
        heading: "Overview",
        bullets: ["Add subtopics to generate a detailed outline."],
      },
    ];
  }

  return [
    {
      heading: "Planning your Galveston cruise",
      bullets,
    },
  ];
}

export async function runExplanationQualityAgent() {
  console.log("🧭 Explanation Quality Agent starting...");

  const { data: tasks, error } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("agent_name", "ExplanationQualityAgent")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching agent tasks:", error);
    return null;
  }

  const outline = buildOutlineFromTasks((tasks || []) as AgentTask[]);

  console.log("🧭 Explanation Quality Agent complete");
  return outline;
}
