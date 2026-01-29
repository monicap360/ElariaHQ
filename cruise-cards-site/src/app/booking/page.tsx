"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

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
  contact_email: string;
  contact_phone: string;
  guests: Array<{
    first_name: string;
    last_name: string;
    date_of_birth: string;
    membership_number: string;
  }>;
};

function maxGuestsForCabin(cabinType: string) {
  if (cabinType.toLowerCase().includes("ocean")) return 5;
  return 4;
}

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
    {
      cabin_type: "BALCONY",
      guest_count: 2,
      dining_time: "any",
      insurance: false,
      gratuities: false,
      price: 0,
      contact_email: "",
      contact_phone: "",
      guests: [
        { first_name: "", last_name: "", date_of_birth: "", membership_number: "" },
        { first_name: "", last_name: "", date_of_birth: "", membership_number: "" },
      ],
    },
  ]);

  const total = useMemo(() => rooms.reduce((sum, r) => sum + (Number(r.price) || 0), 0), [rooms]);

  // Load initial data
  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

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
      const supabase = getSupabaseClient();
      if (!supabase) {
        setShips([]);
        setShipId("");
        setSailings([]);
        setSailingId("");
        return;
      }

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
      const supabase = getSupabaseClient();
      if (!supabase) {
        setSailings([]);
        setSailingId("");
        return;
      }

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

  function normalizeGuests(count: number, existing: Room["guests"]) {
    const next = existing.slice(0, count);
    while (next.length < count) {
      next.push({ first_name: "", last_name: "", date_of_birth: "", membership_number: "" });
    }
    return next;
  }

  function addRoom() {
    setRooms((prev) => [
      ...prev,
      {
        cabin_type: "BALCONY",
        guest_count: 2,
        dining_time: "any",
        insurance: false,
        gratuities: false,
        price: 0,
        contact_email: "",
        contact_phone: "",
        guests: [
          { first_name: "", last_name: "", date_of_birth: "", membership_number: "" },
          { first_name: "", last_name: "", date_of_birth: "", membership_number: "" },
        ],
      },
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
    if (rooms.some((r) => r.guest_count > maxGuestsForCabin(r.cabin_type))) {
      return alert("Guest count exceeds the allowed maximum for one or more cabin types.");
    }
    if (rooms.some((r) => !r.contact_email || !r.contact_phone)) {
      return alert("Please add a contact email and phone for each room.");
    }
    if (
      rooms.some((r) =>
        r.guests.some((g) => !g.first_name.trim() || !g.last_name.trim() || !g.date_of_birth),
      )
    ) {
      return alert("Please complete legal name and date of birth for each guest.");
    }

    setSubmitting(true);
    const supabase = getSupabaseClient();
    if (!supabase) {
      setSubmitting(false);
      return alert("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }

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
      contact_email: r.contact_email,
      contact_phone: r.contact_phone,
      guests: r.guests.map((g) => ({
        first_name: g.first_name.trim(),
        last_name: g.last_name.trim(),
        date_of_birth: g.date_of_birth,
        membership_number: g.membership_number.trim(),
      })),
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
          <div
            key={idx}
            style={{
              border: "2px solid #cbd5f5",
              borderRadius: 16,
              padding: 16,
              background: "#f8fafc",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: idx % 2 === 0 ? "#dbeafe" : "#fef3c7",
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Room {idx + 1}
                </span>
                <div style={{ fontWeight: 800, fontSize: 18 }}>Guest details</div>
              </div>
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

            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(148, 163, 184, 0.12)",
                color: "#334155",
                fontSize: 12,
              }}
            >
              Legal names are required. Names must appear exactly as shown on non-expired legal travel documents (a
              non-expired ID and a birth certificate or a non-expired passport). If names do not match, name change
              fees may apply.
            </div>

            <div style={{ fontWeight: 800, marginBottom: 8 }}>Cabin & Pricing</div>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Cabin Type</label>
                <select
                  value={room.cabin_type}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    const maxGuests = maxGuestsForCabin(nextType);
                    const nextCount = Math.min(room.guest_count, maxGuests);
                    updateRoom(idx, {
                      cabin_type: nextType,
                      guest_count: nextCount,
                      guests: normalizeGuests(nextCount, room.guests),
                    });
                  }}
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
                  onChange={(e) => {
                    const nextCount = Number(e.target.value);
                    updateRoom(idx, {
                      guest_count: nextCount,
                      guests: normalizeGuests(nextCount, room.guests),
                    });
                  }}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                >
                  {Array.from({ length: maxGuestsForCabin(room.cabin_type) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>
                  {maxGuestsForCabin(room.cabin_type) === 5
                    ? "Oceanview rooms allow up to 5 guests."
                    : "All other cabin types allow up to 4 guests."}
                </div>
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

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Room Contact</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Email</label>
                  <input
                    type="email"
                    value={room.contact_email}
                    onChange={(e) => updateRoom(idx, { contact_email: e.target.value })}
                    placeholder="guest@email.com"
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Phone</label>
                  <input
                    type="tel"
                    value={room.contact_phone}
                    onChange={(e) => updateRoom(idx, { contact_phone: e.target.value })}
                    placeholder="(###) ###-####"
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Guest Details (Legal Name + DOB)</div>
              <div style={{ display: "grid", gap: 10 }}>
                {room.guests.map((guest, guestIdx) => (
                  <div
                    key={guestIdx}
                    style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Guest {guestIdx + 1}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>First Name</label>
                        <input
                          value={guest.first_name}
                          onChange={(e) => {
                            const next = room.guests.slice();
                            next[guestIdx] = { ...guest, first_name: e.target.value };
                            updateRoom(idx, { guests: next });
                          }}
                          placeholder="Legal first name"
                          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Last Name</label>
                        <input
                          value={guest.last_name}
                          onChange={(e) => {
                            const next = room.guests.slice();
                            next[guestIdx] = { ...guest, last_name: e.target.value };
                            updateRoom(idx, { guests: next });
                          }}
                          placeholder="Legal last name"
                          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Date of Birth</label>
                        <input
                          type="date"
                          value={guest.date_of_birth}
                          onChange={(e) => {
                            const next = room.guests.slice();
                            next[guestIdx] = { ...guest, date_of_birth: e.target.value };
                            updateRoom(idx, { guests: next });
                          }}
                          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
                          VIFP / Membership #
                        </label>
                        <input
                          value={guest.membership_number}
                          onChange={(e) => {
                            const next = room.guests.slice();
                            next[guestIdx] = { ...guest, membership_number: e.target.value };
                            updateRoom(idx, { guests: next });
                          }}
                          placeholder="Optional"
                          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
