import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AgentTask = {
  id: string;
  task_type: string | null;
  notes: string | null;
  target_site?: string | null;
  source_signal?: string | null;
  parent_asset_id?: string | null;
  reference_id?: string | null;
};

type AuthorityRole = "explainer" | "guide" | "context" | "comparison" | "pr";

type BlueprintKey =
  | "video-mini-doc-ships-arriving"
  | "hybrid-land-sea-experience"
  | "ai-custom-itinerary"
  | "private-island-expansion"
  | "sustainable-cruise-tracking";

type Blueprint = {
  key: BlueprintKey;
  draftType: string;
  authorityRole: AuthorityRole;
  title: string;
  buildBody: (notes: string) => string;
};

const ALL_BLUEPRINT_KEYS: BlueprintKey[] = [
  "video-mini-doc-ships-arriving",
  "hybrid-land-sea-experience",
  "ai-custom-itinerary",
  "private-island-expansion",
  "sustainable-cruise-tracking",
];

const TASK_BLUEPRINT_MAP: Record<string, BlueprintKey[]> = {
  experience_media_portfolio: ALL_BLUEPRINT_KEYS,
  video_mini_doc: ["video-mini-doc-ships-arriving"],
  hybrid_land_sea_experience: ["hybrid-land-sea-experience"],
  ai_custom_itinerary: ["ai-custom-itinerary"],
  private_island_access_expansion: ["private-island-expansion"],
  sustainable_cruise_tracking: ["sustainable-cruise-tracking"],
  carbon_offset_options: ["sustainable-cruise-tracking"],
};

function normalizeSiteTarget(value: string | null | undefined) {
  if (!value) return "cruisesfromgalveston";
  const normalized = value.toLowerCase();
  if (normalized.includes("texascruiseport")) return "texascruiseport";
  if (normalized.includes("houstoncruisetips")) return "houstoncruisetips";
  if (normalized.includes("houstoncruiseshuttle")) return "houstoncruiseshuttle";
  if (normalized.includes("cruisesfromgalveston")) return "cruisesfromgalveston";
  return "cruisesfromgalveston";
}

function appendNotes(existing: string | null, addition: string) {
  if (!existing) return addition;
  return `${existing}\n\n${addition}`;
}

function normalizeForSignature(value: string | null | undefined) {
  if (!value) return "";
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildContentSignature(task: AgentTask, siteTarget: string, blueprint: Blueprint) {
  const signaturePayload = JSON.stringify({
    agent: "ExperienceStudioAgent",
    siteTarget,
    draftType: blueprint.draftType,
    blueprintKey: blueprint.key,
    referenceId: task.reference_id ?? null,
    parentAssetId: task.parent_asset_id ?? null,
    normalizedNotes: normalizeForSignature(task.notes).slice(0, 600),
  });
  return createHash("sha256").update(signaturePayload).digest("hex");
}

function buildSourceRef(sourceSignal: string | null | undefined, signature: string) {
  const base = (sourceSignal || "manual").trim() || "manual";
  return `${base}|experience_sig:${signature}`;
}

function inferBlueprintKeys(taskType: string | null, notes: string | null): BlueprintKey[] {
  const normalizedTaskType = (taskType || "").toLowerCase().trim();
  if (normalizedTaskType && TASK_BLUEPRINT_MAP[normalizedTaskType]) {
    return TASK_BLUEPRINT_MAP[normalizedTaskType];
  }

  const text = `${taskType || ""} ${notes || ""}`.toLowerCase();
  const inferred: BlueprintKey[] = [];

  if (text.includes("video") || text.includes("mini doc") || text.includes("ships arriving")) {
    inferred.push("video-mini-doc-ships-arriving");
  }
  if (text.includes("hybrid") || text.includes("land sea")) {
    inferred.push("hybrid-land-sea-experience");
  }
  if (text.includes("custom itinerary") || text.includes("ai itinerary")) {
    inferred.push("ai-custom-itinerary");
  }
  if (text.includes("private island")) {
    inferred.push("private-island-expansion");
  }
  if (text.includes("sustain") || text.includes("carbon") || text.includes("offset")) {
    inferred.push("sustainable-cruise-tracking");
  }

  if (!inferred.length) {
    return ALL_BLUEPRINT_KEYS;
  }

  return Array.from(new Set(inferred));
}

function buildLocalizationAnchor(notes: string) {
  return [
    "Homeport: Port of Galveston only",
    "Routes to reference when relevant: Bahamas, Eastern Caribbean, Western Caribbean, Panama Canal, Jamaica",
    "Operational anchors: terminal assignment checks, parking logistics, embarkation-day timing windows",
    notes ? `Campaign notes: ${notes}` : "Campaign notes: none provided",
  ].join("\n");
}

const BLUEPRINTS: Record<BlueprintKey, Blueprint> = {
  "video-mini-doc-ships-arriving": {
    key: "video-mini-doc-ships-arriving",
    draftType: "video_mini_doc",
    authorityRole: "context",
    title: "Video mini docs: Ships arriving in Galveston",
    buildBody: (notes) => `# Video Mini Doc Series: Ships Arriving in Galveston

## Purpose
Create short documentary-style videos that show real ship-arrival flow, terminal context, and what guests should expect before embarkation.

## Localization anchor
${buildLocalizationAnchor(notes)}

## Episode concepts
1. Dawn arrival at channel approach and harbor traffic rhythm
2. Terminal handoff workflow by cruise line and guest check-in windows
3. What arriving guests need to know: luggage, timing, parking, boarding sequence

## Shot list
- Wide skyline + ship approach
- Terminal lane activity and wayfinding signs
- Parking-to-terminal walking flow
- Embarkation timeline overlays in plain language

## Narration beats
- Explain what travelers are seeing in practical terms
- Clarify what is normal vs what signals delay
- De-escalate confusion with calm, direct guidance

## Distribution package
- 60-90 second vertical cut for social
- 3-5 minute desk explainer cut
- Companion FAQ link to Galveston planning pages
`,
  },
  "hybrid-land-sea-experience": {
    key: "hybrid-land-sea-experience",
    draftType: "hybrid_land_sea_guide",
    authorityRole: "guide",
    title: "Hybrid land + sea experiences from Galveston",
    buildBody: (notes) => `# Hybrid Land + Sea Experience Guide

## Purpose
Package pre-cruise and post-cruise land experiences with sailings so travelers can design one connected Galveston journey.

## Localization anchor
${buildLocalizationAnchor(notes)}

## Program modules
1. One-night buffer stay with terminal-ready morning plan
2. Two-night Galveston add-on with curated local experiences
3. Post-cruise decompression plan with airport transfer windows

## Planning framework
- Arrival day timing matrix (drive-in vs fly-in)
- Hotel-zone recommendations by terminal access
- Transfer and parking fallback plan for high-volume sail days

## Deliverables
- Checklist template by stay length
- Guest-facing map of stay zones and transfer options
- Advisor playbook for matching traveler profile to hybrid plan
`,
  },
  "ai-custom-itinerary": {
    key: "ai-custom-itinerary",
    draftType: "ai_custom_itinerary_blueprint",
    authorityRole: "comparison",
    title: "AI-customized cruise itinerary framework",
    buildBody: (notes) => `# AI Customized Cruise Itinerary Framework

## Purpose
Use profile-driven logic to recommend Galveston sailings, land add-ons, and practical logistics in one coordinated plan.

## Localization anchor
${buildLocalizationAnchor(notes)}

## Personalization dimensions
- Traveler type: family, couples, multi-gen, first-timers
- Preference profile: port intensity, sea days, budget range, cabin goals
- Operations profile: terminal confidence, parking preference, transport needs

## Recommendation outputs
1. Primary sailing recommendation with rationale
2. Two backup sailings with tradeoff explanations
3. Land extension options before/after sailing
4. Logistics stack: terminal plan, parking option, transfer buffer

## Guardrails
- No urgency language
- No unverified claims on visa/document requirements
- Explain confidence and known unknowns per recommendation
`,
  },
  "private-island-expansion": {
    key: "private-island-expansion",
    draftType: "private_island_access_brief",
    authorityRole: "explainer",
    title: "Private island access expansion brief",
    buildBody: (notes) => `# Private Island Access Expansion Brief

## Purpose
Track and explain how private island access is evolving for Galveston-departing travelers and what planning assumptions should change.

## Localization anchor
${buildLocalizationAnchor(notes)}

## Coverage lanes
1. Which private-island products appear in Galveston-route mixes
2. Excursion and on-island capacity planning implications
3. Family and mobility planning differences vs traditional port days

## Operations notes to include
- Boarding and return-time discipline for island stops
- Weather and schedule flexibility expectations
- Cabin and package decisions influenced by private-island focus

## Output formats
- Monthly desk explainer
- Route comparison card (traditional port-heavy vs island-heavy)
- FAQ update for first-time cruisers
`,
  },
  "sustainable-cruise-tracking": {
    key: "sustainable-cruise-tracking",
    draftType: "sustainable_tracking_and_offsets",
    authorityRole: "context",
    title: "Sustainable cruise tracking + carbon offset options",
    buildBody: (notes) => `# Sustainable Cruise Tracking and Carbon Offset Options

## Purpose
Provide practical, non-performative sustainability context for Galveston departures, including transparent carbon-offset pathways.

## Localization anchor
${buildLocalizationAnchor(notes)}

## Tracking board concept
1. Ship-level sustainability snapshot (publicly available disclosures only)
2. Voyage-level impact estimate ranges (clear methodology notes)
3. Port logistics impact reducers (transfer consolidation, parking strategy, hotel staging)

## Carbon offset lane
- Curated offset categories and screening criteria
- Guest education: what offsets do and do not solve
- Optional post-booking offset action step in itinerary flow

## Governance notes
- Keep claims source-linked and date-stamped
- Separate estimated metrics from confirmed disclosures
- Avoid moralizing language; stay practical and transparent
`,
  },
};

async function draftExistsForTask(taskId: string, siteTarget: string, draftType: string) {
  const { data, error } = await supabase
    .from("content_drafts")
    .select("id")
    .eq("task_id", taskId)
    .eq("site_target", siteTarget)
    .eq("draft_type", draftType)
    .limit(1);

  if (error) throw error;
  return Boolean(data && data.length > 0);
}

async function draftExistsBySignature(siteTarget: string, draftType: string, sourceRef: string) {
  const { data, error } = await supabase
    .from("content_drafts")
    .select("id")
    .eq("site_target", siteTarget)
    .eq("draft_type", draftType)
    .eq("created_by", "experience_studio_agent")
    .eq("source_ref", sourceRef)
    .limit(1);

  if (error) throw error;
  return Boolean(data && data.length > 0);
}

async function draftExistsByLegacyTitle(siteTarget: string, draftType: string, titlePrefix: string) {
  const { data, error } = await supabase
    .from("content_drafts")
    .select("id")
    .eq("site_target", siteTarget)
    .eq("draft_type", draftType)
    .eq("created_by", "experience_studio_agent")
    .ilike("draft_title", `${titlePrefix}%`)
    .limit(1);

  if (error) throw error;
  return Boolean(data && data.length > 0);
}

export async function runExperienceStudioAgent() {
  console.log("🎬 Experience Studio Agent starting");

  const { data: tasks, error } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("agent_name", "ExperienceStudioAgent")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching ExperienceStudioAgent tasks:", error);
    return;
  }

  if (!tasks || tasks.length === 0) {
    console.log("No pending ExperienceStudioAgent tasks.");
    return;
  }

  for (const task of tasks as AgentTask[]) {
    try {
      await supabase
        .from("agent_tasks")
        .update({ status: "in_progress" })
        .eq("id", task.id);

      const siteTarget = normalizeSiteTarget(task.target_site);
      const blueprintKeys = inferBlueprintKeys(task.task_type, task.notes);
      const createdDraftTitles: string[] = [];
      const skippedDuplicateDraftTypes: string[] = [];

      for (const blueprintKey of blueprintKeys) {
        const blueprint = BLUEPRINTS[blueprintKey];
        if (!blueprint) continue;

        const signature = buildContentSignature(task, siteTarget, blueprint);
        const sourceRef = buildSourceRef(task.source_signal, signature);
        const title = blueprint.title;

        const [existsForTask, existsForSignature, existsForLegacyTitle] = await Promise.all([
          draftExistsForTask(task.id, siteTarget, blueprint.draftType),
          draftExistsBySignature(siteTarget, blueprint.draftType, sourceRef),
          draftExistsByLegacyTitle(siteTarget, blueprint.draftType, blueprint.title),
        ]);

        if (existsForTask || existsForSignature || existsForLegacyTitle) {
          skippedDuplicateDraftTypes.push(blueprint.draftType);
          continue;
        }

        const body = blueprint.buildBody(task.notes || "");

        const { error: draftError } = await supabase.from("content_drafts").insert({
          task_id: task.id,
          site_target: siteTarget,
          draft_type: blueprint.draftType,
          format: "markdown",
          draft_title: title,
          draft_body: body,
          authority_role: blueprint.authorityRole,
          status: "drafted",
          routing: task.parent_asset_id ?? null,
          source_ref: sourceRef,
          created_by: "experience_studio_agent",
        });

        if (draftError) {
          throw draftError;
        }

        createdDraftTitles.push(title);
      }

      let completionNote = "No new drafts created (existing drafts already present).";
      if (createdDraftTitles.length) {
        completionNote = `Created drafts:\n- ${createdDraftTitles.join("\n- ")}`;
      }
      if (skippedDuplicateDraftTypes.length) {
        completionNote = `${completionNote}\n\nSkipped duplicate draft types:\n- ${Array.from(
          new Set(skippedDuplicateDraftTypes)
        ).join("\n- ")}`;
      }

      await supabase
        .from("agent_tasks")
        .update({
          status: "done",
          completed_at: new Date().toISOString(),
          notes: appendNotes(task.notes, completionNote),
        })
        .eq("id", task.id);

      console.log(`✅ ExperienceStudioAgent processed task ${task.id}`);
    } catch (runError) {
      console.error("Error processing ExperienceStudioAgent task", task.id, runError);
      await supabase
        .from("agent_tasks")
        .update({
          status: "blocked",
          notes: appendNotes(task.notes, `Error: ${String(runError)}`),
        })
        .eq("id", task.id);
    }
  }

  console.log("✅ Experience Studio Agent complete");
}

