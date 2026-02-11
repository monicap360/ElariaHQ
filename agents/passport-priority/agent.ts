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

const PASSPORT_BENEFITS_EN = [
  "Priority booking alerts before public inventory spikes",
  "Loyalty perks tied to repeat Galveston departures",
  "Early notification when new ships are assigned to Galveston",
  "Member-only savings windows and preferred fare watch",
  "Concierge hotline for booking and departure-day questions",
  "Port parking discount guidance and partner offers",
];

const PASSPORT_BENEFITS_ES = [
  "Alertas de reservacion prioritaria antes de picos de inventario publico",
  "Beneficios de lealtad para salidas repetidas desde Galveston",
  "Notificacion temprana cuando nuevos barcos se asignan a Galveston",
  "Ahorros para miembros y monitoreo preferente de tarifas",
  "Linea concierge para dudas de reservacion y salida",
  "Descuentos de estacionamiento en puerto y ofertas asociadas",
];

function normalizeSiteTarget(targetSite?: string | null) {
  const value = (targetSite || "").toLowerCase();
  if (value.includes("texascruiseport")) return "texascruiseport";
  if (value.includes("houstoncruisetips")) return "houstoncruisetips";
  if (value.includes("houstoncruiseshuttle")) return "houstoncruiseshuttle";
  if (value.includes("pier10parking")) return "pier10parking";
  if (value.includes("pier25parking")) return "pier25parking";
  return "cruisesfromgalveston";
}

function buildEnglishDraft(task: AgentTask) {
  const notesBlock = task.notes ? `\nCustom Brief Notes:\n${task.notes}\n` : "";
  const benefits = PASSPORT_BENEFITS_EN.map((item) => `- ${item}`).join("\n");

  return `# Cruises from Galveston Passport Priority

## Program Overview
Cruises from Galveston Passport Priority is a structured member program focused only on Galveston departures.
It helps guests plan earlier, book with confidence, and reduce departure-day stress through concierge-level support.

## Core Member Benefits
${benefits}

## Booking Alerts Framework
1. Early inventory movement alert
2. Ship-assignment alert for Galveston terminals
3. Fare-window alert for member-only savings
4. Final reminder before preferred sailing dates close

## Loyalty Perks Logic
- Priority queue for advisor callbacks
- Returning-member recognition tier
- Annual Galveston departure planning review
- First look at new-ship deployment updates

## Concierge Hotline Positioning
The concierge hotline supports:
- cabin selection questions
- SeaPay deposit planning
- parking and transportation coordination
- embarkation timing confidence checks

## Parking Discount Integration
- Present official terminal options and partner options clearly
- Show walking-distance and transfer-time tradeoffs
- Surface member parking discount notices when available

## Suggested CTA Set (Calm, Non-Pushy)
- View available sailings
- Reserve your cabin
- Speak with a cruise specialist
- Request parking and transport support

## Guardrails
- Keep hospitality tone
- Avoid urgency-heavy language
- Focus only on Galveston departures
- Clarify what is included vs optional
${notesBlock}
`;
}

function buildSpanishDraft(task: AgentTask) {
  const notesBlock = task.notes ? `\nNotas del Brief:\n${task.notes}\n` : "";
  const benefits = PASSPORT_BENEFITS_ES.map((item) => `- ${item}`).join("\n");

  return `# Passport Priority de Cruises from Galveston

## Resumen del Programa
Passport Priority es un programa de membresia estructurado para salidas de crucero solo desde Galveston.
Ayuda a planificar antes, reservar con claridad y reducir estres el dia de salida con apoyo tipo concierge.

## Beneficios Principales para Miembros
${benefits}

## Marco de Alertas de Reservacion
1. Alerta temprana de movimiento de inventario
2. Alerta de asignacion de barco en terminales de Galveston
3. Alerta de ventana de tarifa para ahorros de miembros
4. Recordatorio final antes del cierre de fechas preferidas

## Logica de Lealtad
- Prioridad en devolucion de llamadas de asesoria
- Nivel de reconocimiento para miembros recurrentes
- Revision anual de planificacion de salidas en Galveston
- Primer aviso de actualizaciones por nuevos barcos

## Posicionamiento de la Linea Concierge
La linea concierge apoya en:
- dudas de seleccion de cabina
- plan de deposito SeaPay
- coordinacion de estacionamiento y transporte
- confirmacion de tiempos de embarque

## Integracion de Descuentos de Estacionamiento
- Mostrar opciones oficiales y asociadas de forma clara
- Explicar diferencias de caminata y tiempo de traslado
- Publicar avisos de descuento para miembros cuando existan

## CTAs Sugeridos (Sin Presion)
- Ver salidas disponibles
- Reserva tu cabina
- Habla con especialista de crucero
- Solicitar apoyo de estacionamiento y transporte

## Guardrails
- Mantener tono de hospitalidad
- Evitar lenguaje de urgencia agresiva
- Enfocar solo salidas desde Galveston
- Aclarar que incluye y que es opcional
${notesBlock}
`;
}

async function upsertDraft(task: AgentTask, draftType: string, draftTitle: string, draftBody: string) {
  const siteTarget = normalizeSiteTarget(task.target_site);
  const payload = {
    task_id: task.id,
    site_target: siteTarget,
    draft_type: draftType,
    format: "markdown",
    draft_title: draftTitle,
    draft_body: draftBody,
    authority_role: "guide",
    status: "drafted",
    routing: "membership_program",
    source_ref: "passport_priority_agent",
    created_by: "PassportPriorityAgent",
  };

  const { error } = await supabase
    .from("content_drafts")
    .upsert(payload, { onConflict: "task_id,site_target,format,draft_type" });

  if (error) throw error;
}

async function queueFollowUp(task: AgentTask, agentName: string, taskType: string, notes: string) {
  await supabase.from("agent_tasks").insert({
    agent_name: agentName,
    task_type: taskType,
    reference_id: task.reference_id,
    status: "pending",
    target_site: task.target_site ?? "cruisesfromgalveston.net",
    source_signal: task.source_signal ?? "manual",
    parent_asset_id: task.parent_asset_id ?? null,
    notes,
  });
}

export async function runPassportPriorityAgent() {
  console.log("🛳️ Passport Priority Agent starting");

  const { data: tasks, error } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("agent_name", "PassportPriorityAgent")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching PassportPriorityAgent tasks:", error);
    return;
  }

  if (!tasks || tasks.length === 0) {
    console.log("No pending PassportPriorityAgent tasks.");
    return;
  }

  for (const task of tasks as AgentTask[]) {
    try {
      await supabase
        .from("agent_tasks")
        .update({ status: "in_progress" })
        .eq("id", task.id);

      const englishBody = buildEnglishDraft(task);
      const spanishBody = buildSpanishDraft(task);

      await upsertDraft(
        task,
        "passport_priority_program_en",
        "Cruises from Galveston Passport Priority Program",
        englishBody
      );

      await upsertDraft(
        task,
        "passport_priority_program_es",
        "Programa Passport Priority - Cruises from Galveston",
        spanishBody
      );

      await queueFollowUp(
        task,
        "UserIntentAgent",
        "passport_program_intent_review",
        `Review member intent and friction points for Passport Priority draft set from task ${task.id}`
      );

      await queueFollowUp(
        task,
        "AIReadabilityAgent",
        "passport_program_readability",
        `Readability review for Passport Priority draft set from task ${task.id}`
      );

      await supabase
        .from("agent_tasks")
        .update({
          status: "done",
          completed_at: new Date().toISOString(),
          notes: `${task.notes ? `${task.notes}\n\n` : ""}Created EN/ES Passport Priority drafts with booking alerts, loyalty perks, new-ship notifications, concierge hotline, member savings, and parking discounts.`,
        })
        .eq("id", task.id);

      console.log(`✅ PassportPriorityAgent processed task ${task.id}`);
    } catch (err) {
      console.error("Error processing PassportPriorityAgent task", task.id, err);
      await supabase
        .from("agent_tasks")
        .update({
          status: "blocked",
          notes: `${task.notes || ""}\n\nError: ${String(err)}`,
        })
        .eq("id", task.id);
    }
  }

  console.log("✅ Passport Priority Agent complete");
}

if ((import.meta as { main?: boolean }).main) {
  runPassportPriorityAgent().catch((err) => {
    console.error("Unhandled error in Passport Priority Agent:", err);
  });
}
