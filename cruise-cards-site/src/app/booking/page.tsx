"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CruiseLine = { id: string; name: string };
type Ship = {
  id: string;
  name: string;
  cruise_line_id: string;
  home_port: string | null;
  is_active: boolean | null;
};
type Sailing = { id: string; ship_id: string; sail_date: string; return_date: string; is_active: boolean | null };
type CabinType = { code: string; display_name: string };

type Agent = { id: string; name: string; status: string; tier: string | null };

type Room = {
  cabin_type: string;
  guest_count: number;
  dining_time: "5:30pm" | "7:00pm" | "8:30pm" | "any";
  insurance: boolean;
  gratuities: boolean;
  price: number;
};

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
}

export default function BookingPage() {
  const agencyId = process.env.NEXT_PUBLIC_AGENCY_ID || "529faa6c-8c38-49ac-828c-4944e4f8e8eb";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Master data
  const [agents, setAgents] = useState<Agent[]>([]);
  const [cruiseLines, setCruiseLines] = useState<CruiseLine[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [cabinTypes, setCabinTypes] = useState<CabinType[]>([]);

  // Selections
  const [agentId, setAgentId] = useState<string>("");
  const [cruiseLineId, setCruiseLineId] = useState<string>("");
  const [shipId, setShipId] = useState<string>("");
  const [sailingId, setSailingId] = useState<string>("");

  // Customer: simplest operational default = auth.uid()
  const [customerIdOverride, setCustomerIdOverride] = useState<string>("");

  // Rooms
  const [rooms, setRooms] = useState<Room[]>([
    { cabin_type: "BALCONY", guest_count: 2, dining_time: "any", insurance: false, gratuities: false, price: 0 },
  ]);

  const total = useMemo(() => rooms.reduce((sum, r) => sum + (Number(r.price) || 0), 0), [rooms]);

  // Load initial data
  useEffect(() => {
    (async () => {
      setLoading(true);

      // Agents: approved only (your "best of the best" list lives here)
      const agentsRes = await supabase
        .from("agents")
        .select("id,name,status,tier")
        .eq("agency_id", agencyId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      // Cruise lines (RLS enabled in your schema: you must allow read, or call via server)
      const clRes = await supabase.from("cruise_lines").select("id,name").order("name", { ascending: true });

      // Cabin types
      const cabinRes = await supabase.from("cabin_types").select("code,display_name").order("display_name", {
        ascending: true,
      });

      if (agentsRes.error) console.error("agentsRes.error", agentsRes.error);
      if (clRes.error) console.error("clRes.error", clRes.error);
      if (cabinRes.error) console.error("cabinRes.error", cabinRes.error);

      setAgents(agentsRes.data || []);
      setCruiseLines(clRes.data || []);
      setCabinTypes(cabinRes.data || []);

      // Default agent to first approved (if any)
      if ((agentsRes.data || []).length && !agentId) setAgentId((agentsRes.data || [])[0].id);

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId]);

  // When cruise line changes, load Galveston ships
  useEffect(() => {
    if (!cruiseLineId) {
      setShips([]);
      setShipId("");
      setSailings([]);
      setSailingId("");
      return;
    }

    (async () => {
      const res = await supabase
        .from("ships")
        .select("id,name,cruise_line_id,home_port,is_active")
        .eq("cruise_line_id", cruiseLineId)
        .eq("is_active", true)
        .ilike("home_port", "%Galveston%")
        .order("name", { ascending: true });

      if (res.error) console.error("ships error", res.error);
      setShips(res.data || []);
      setShipId("");
      setSailings([]);
      setSailingId("");
    })();
  }, [cruiseLineId]);

  // When ship changes, load sailings
  useEffect(() => {
    if (!shipId) {
      setSailings([]);
      setSailingId("");
      return;
    }

    (async () => {
      const res = await supabase
        .from("sailings")
        .select("id,ship_id,sail_date,return_date,is_active")
        .eq("ship_id", shipId)
        .eq("is_active", true)
        .order("sail_date", { ascending: true });

      if (res.error) console.error("sailings error", res.error);
      setSailings(res.data || []);
      setSailingId("");
    })();
  }, [shipId]);

  function updateRoom(idx: number, patch: Partial<Room>) {
    setRooms((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function addRoom() {
    setRooms((prev) => [
      ...prev,
      { cabin_type: "BALCONY", guest_count: 2, dining_time: "any", insurance: false, gratuities: false, price: 0 },
    ]);
  }

  function removeRoom(idx: number) {
    setRooms((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit() {
    if (!agencyId) return alert("Missing NEXT_PUBLIC_AGENCY_ID.");
    if (!agentId) return alert("Select an agent.");
    if (!sailingId) return alert("Select a sailing date.");
    if (!rooms.length) return alert("Add at least one room.");
    if (rooms.some((r) => !r.cabin_type || !r.guest_count || !(Number(r.price) >= 0))) {
      return alert("Please complete all room fields (cabin type, guest count, price).");
    }

    setSubmitting(true);

    // Customer id: default to logged-in user
    const { data: authData } = await supabase.auth.getUser();
    const customerId = customerIdOverride?.trim() || authData?.user?.id;

    if (!customerId) {
      setSubmitting(false);
      return alert("No customer_id found. Sign in, or paste a customer UUID in the Customer ID field.");
    }

    const payloadRooms = rooms.map((r) => ({
      cabin_type: r.cabin_type,
      guest_count: Number(r.guest_count),
      dining_time: r.dining_time,
      insurance: !!r.insurance,
      gratuities: !!r.gratuities,
      price: Number(r.price),
    }));

    const { data, error } = await supabase.rpc("create_booking_with_rooms", {
      p_agency_id: agencyId,
      p_agent_id: agentId,
      p_customer_id: customerId,
      p_sailing_id: sailingId,
      p_rooms: payloadRooms,
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      return alert(`Booking failed: ${error.message}`);
    }

    const bookingId = data as string;
    alert(`Booking created: ${bookingId}`);
    // Optional: redirect to a confirmation page
    // window.location.href = `/booking/success?booking_id=${bookingId}`;
  }

  if (loading) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Multi-Room Booking</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Galveston Multi-Room Booking</h1>
      <p style={{ opacity: 0.8, marginBottom: 18 }}>
        Real Supabase data - Cruise line {"->"} Ship (Galveston) {"->"} Sailing {"->"} Rooms
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Agent (approved)</label>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
          >
            <option value="">Select agent...</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} {a.tier ? `(${a.tier})` : ""}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
            Only agents with status = <b>approved</b> are shown.
          </div>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Customer ID (optional override)</label>
          <input
            value={customerIdOverride}
            onChange={(e) => setCustomerIdOverride(e.target.value)}
            placeholder="Paste customer UUID (or leave blank to use auth.uid())"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
          />
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
            If blank, the form uses the logged-in Supabase user id.
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Cruise Line</label>
            <select
              value={cruiseLineId}
              onChange={(e) => setCruiseLineId(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
            >
              <option value="">Select...</option>
              {cruiseLines.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Ship (Galveston)</label>
            <select
              value={shipId}
              onChange={(e) => setShipId(e.target.value)}
              disabled={!ships.length}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
            >
              <option value="">{ships.length ? "Select..." : "Select cruise line first"}</option>
              {ships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Sailing Date</label>
            <select
              value={sailingId}
              onChange={(e) => setSailingId(e.target.value)}
              disabled={!sailings.length}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
            >
              <option value="">{sailings.length ? "Select..." : "Select ship first"}</option>
              {sailings.map((sa) => (
                <option key={sa.id} value={sa.id}>
                  {sa.sail_date} {"->"} {sa.return_date}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Rooms</h2>
        <button
          type="button"
          onClick={addRoom}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Add Room
        </button>
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        {rooms.map((room, idx) => (
          <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 800 }}>Room {idx + 1}</div>
              {rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRoom(idx)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ef4444",
                    background: "white",
                    color: "#b91c1c",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Cabin Type</label>
                <select
                  value={room.cabin_type}
                  onChange={(e) => updateRoom(idx, { cabin_type: e.target.value })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                >
                  {cabinTypes.map((ct) => (
                    <option key={ct.code} value={ct.code}>
                      {ct.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Guests</label>
                <select
                  value={room.guest_count}
                  onChange={(e) => updateRoom(idx, { guest_count: Number(e.target.value) })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Dining</label>
                <select
                  value={room.dining_time}
                  onChange={(e) => updateRoom(idx, { dining_time: e.target.value as Room["dining_time"] })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                >
                  <option value="any">Any</option>
                  <option value="5:30pm">5:30pm</option>
                  <option value="7:00pm">7:00pm</option>
                  <option value="8:30pm">8:30pm</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Insurance</label>
                <select
                  value={room.insurance ? "yes" : "no"}
                  onChange={(e) => updateRoom(idx, { insurance: e.target.value === "yes" })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Gratuities</label>
                <select
                  value={room.gratuities ? "yes" : "no"}
                  onChange={(e) => updateRoom(idx, { gratuities: e.target.value === "yes" })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Price</label>
                <input
                  inputMode="decimal"
                  value={room.price}
                  onChange={(e) => updateRoom(idx, { price: Number(e.target.value) })}
                  placeholder="0.00"
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 900 }}>Total: {money(total)}</div>

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #111827",
            background: submitting ? "#9ca3af" : "#111827",
            color: "white",
            fontWeight: 900,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Creating booking..." : "Create Booking"}
        </button>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.8 }}>
        If Cruise Lines / Ships don&apos;t load, it&apos;s usually **RLS on cruise_lines/ships/sailings**. If you
        want, I&apos;ll give you the exact RLS policies for &quot;public read of Galveston fleet only&quot;.
      </div>
    </div>
  );
}
