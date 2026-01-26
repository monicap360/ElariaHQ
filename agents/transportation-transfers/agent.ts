import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_AREAS = new Set(["seawall", "61st", "harborside", "airport"]);
const REQUIRED_VEHICLE_TYPE = "sedan_4pax";
const EARLIEST_PICKUP_TIME = "07:30";

type AgentTask = {
  id: string;
  reference_id: string | null;
  task_type: string | null;
  notes: string | null;
};

type TransferRequest = {
  id: string;
  pickup_location_id: string | null;
  dropoff_location_id: string | null;
  pickup_time: string;
  passengers: number | null;
  luggage_count: number | null;
  vehicle_type: string | null;
  route_type: string | null;
  ship_name: string | null;
  status: string | null;
  notes: string | null;
};

type TransferLocation = {
  id: string;
  name: string;
  area: string | null;
  active: boolean | null;
};

type TransferRule = {
  vehicle_type: string;
  max_passengers: number;
  max_luggage: number;
};

function appendNote(existing: string | null, addition: string) {
  if (!existing) return addition;
  return `${existing}\n${addition}`;
}

function toLocalTime(value: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date(value));
}

export async function runTransportationTransfersAgent() {
  console.log("🚐 Transportation & Transfers Agent starting");

  const { data: tasks, error } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("agent_name", "TransportationTransfersAgent")
    .eq("status", "pending")
    .eq("task_type", "transfer_booking")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching TransportationTransfersAgent tasks:", error);
    return;
  }

  if (!tasks || tasks.length === 0) {
    console.log("No pending TransportationTransfersAgent tasks.");
    return;
  }

  const { data: rules } = await supabase
    .from("transfer_rules")
    .select("vehicle_type,max_passengers,max_luggage");

  const ruleMap = new Map((rules || []).map((rule: TransferRule) => [rule.vehicle_type, rule]));

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

      const { data: request } = await supabase
        .from("transfer_requests")
        .select("*")
        .eq("id", task.reference_id)
        .maybeSingle();

      if (!request) {
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: "Missing transfer_request" })
          .eq("id", task.id);
        continue;
      }

      const transfer = request as TransferRequest;
      const pickupLocalTime = toLocalTime(transfer.pickup_time);

      if (pickupLocalTime < EARLIEST_PICKUP_TIME) {
        const note = `Pickup time ${pickupLocalTime} is before ${EARLIEST_PICKUP_TIME} (Galveston time).`;
        await supabase
          .from("transfer_requests")
          .update({ notes: appendNote(transfer.notes, note) })
          .eq("id", transfer.id);
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: note })
          .eq("id", task.id);
        continue;
      }

      const vehicleType = transfer.vehicle_type || REQUIRED_VEHICLE_TYPE;
      const rule = ruleMap.get(vehicleType);

      if (vehicleType !== REQUIRED_VEHICLE_TYPE || !rule) {
        const note = `Unsupported vehicle_type: ${vehicleType}`;
        await supabase
          .from("transfer_requests")
          .update({ notes: appendNote(transfer.notes, note) })
          .eq("id", transfer.id);
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: note })
          .eq("id", task.id);
        continue;
      }

      const passengerCount = transfer.passengers ?? 0;
      const luggageCount = transfer.luggage_count ?? 0;

      if (passengerCount < 1 || passengerCount > rule.max_passengers) {
        const note = `Passenger count out of range: ${passengerCount}`;
        await supabase
          .from("transfer_requests")
          .update({ notes: appendNote(transfer.notes, note) })
          .eq("id", transfer.id);
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: note })
          .eq("id", task.id);
        continue;
      }

      if (luggageCount < 0 || luggageCount > rule.max_luggage) {
        const note = `Luggage count out of range: ${luggageCount}`;
        await supabase
          .from("transfer_requests")
          .update({ notes: appendNote(transfer.notes, note) })
          .eq("id", transfer.id);
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: note })
          .eq("id", task.id);
        continue;
      }

      const { data: pickup } = await supabase
        .from("transfer_locations")
        .select("id,name,area,active")
        .eq("id", transfer.pickup_location_id)
        .maybeSingle();

      const { data: dropoff } = await supabase
        .from("transfer_locations")
        .select("id,name,area,active")
        .eq("id", transfer.dropoff_location_id)
        .maybeSingle();

      const pickupLoc = pickup as TransferLocation | null;
      const dropoffLoc = dropoff as TransferLocation | null;

      if (!pickupLoc || !dropoffLoc) {
        const note = "Missing pickup or dropoff location";
        await supabase
          .from("transfer_requests")
          .update({ notes: appendNote(transfer.notes, note) })
          .eq("id", transfer.id);
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: note })
          .eq("id", task.id);
        continue;
      }

      if (!transfer.route_type) {
        const note = "Missing route_type (airport_to_ship, hotel_to_ship, ship_to_airport, ship_to_hotel)";
        await supabase
          .from("transfer_requests")
          .update({ notes: appendNote(transfer.notes, note) })
          .eq("id", transfer.id);
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: note })
          .eq("id", task.id);
        continue;
      }

      if (!transfer.ship_name) {
        const note = "Missing ship_name for route labeling";
        await supabase
          .from("transfer_requests")
          .update({ notes: appendNote(transfer.notes, note) })
          .eq("id", transfer.id);
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: note })
          .eq("id", task.id);
        continue;
      }

      if (!pickupLoc.active || !dropoffLoc.active) {
        const note = "Pickup or dropoff location is inactive";
        await supabase
          .from("transfer_requests")
          .update({ notes: appendNote(transfer.notes, note) })
          .eq("id", transfer.id);
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: note })
          .eq("id", task.id);
        continue;
      }

      if (!ALLOWED_AREAS.has(pickupLoc.area || "") || !ALLOWED_AREAS.has(dropoffLoc.area || "")) {
        const note = `Location outside allowed zones: ${pickupLoc.area} -> ${dropoffLoc.area}`;
        await supabase
          .from("transfer_requests")
          .update({ notes: appendNote(transfer.notes, note) })
          .eq("id", transfer.id);
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: note })
          .eq("id", task.id);
        continue;
      }

      const pickupArea = pickupLoc.area || "";
      const dropoffArea = dropoffLoc.area || "";
      const isAirportPickup = pickupArea === "airport";
      const isAirportDropoff = dropoffArea === "airport";

      const routeType = transfer.route_type;
      const invalidRoute =
        (routeType === "airport_to_ship" && !isAirportPickup) ||
        (routeType === "hotel_to_ship" && isAirportPickup) ||
        (routeType === "ship_to_airport" && !isAirportDropoff) ||
        (routeType === "ship_to_hotel" && isAirportDropoff);

      if (invalidRoute) {
        const note = `Route type mismatch: ${routeType} for ${pickupArea} -> ${dropoffArea}`;
        await supabase
          .from("transfer_requests")
          .update({ notes: appendNote(transfer.notes, note) })
          .eq("id", transfer.id);
        await supabase
          .from("agent_tasks")
          .update({ status: "blocked", notes: note })
          .eq("id", task.id);
        continue;
      }

      const confirmationNote = `Confirmed sedan transfer for ${passengerCount} pax, ${luggageCount} bags.`;

      await supabase
        .from("transfer_requests")
        .update({
          status: "confirmed",
          vehicle_type: REQUIRED_VEHICLE_TYPE,
          notes: appendNote(transfer.notes, confirmationNote),
        })
        .eq("id", transfer.id);

      await supabase
        .from("agent_tasks")
        .update({
          status: "done",
          completed_at: new Date().toISOString(),
          notes: appendNote(task.notes, confirmationNote),
        })
        .eq("id", task.id);

      console.log(`✅ TransportationTransfersAgent confirmed request ${transfer.id}`);
    } catch (err) {
      console.error("Error processing TransportationTransfersAgent task", task.id, err);
      await supabase
        .from("agent_tasks")
        .update({
          status: "blocked",
          notes: `${task.notes || ""}\n\nError: ${String(err)}`,
        })
        .eq("id", task.id);
    }
  }

  console.log("✅ Transportation & Transfers Agent complete");
}
