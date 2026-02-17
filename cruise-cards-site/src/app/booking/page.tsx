"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type CruiseLine = { id: string; name: string };
type Ship = {
  id: string;
  name: string;
  cruise_line_id: string;
  home_port: string | null;
  is_active: boolean | null;
};
type Sailing = {
  id: string;
  ship_id: string;
  depart_date?: string | null;
  sail_date?: string | null;
  return_date: string;
  is_active: boolean | null;
  duration?: number | null;
  nights?: number | null;
};
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
  const pendingPrefillShipIdRef = useRef<string | null>(null);
  const pendingPrefillSailingIdRef = useRef<string | null>(null);
  const prefillRequestedRef = useRef(false);
  const [prefillSailingId, setPrefillSailingId] = useState<string | null>(null);
  const [prefillSource, setPrefillSource] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [prefillNotice, setPrefillNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sailingId = params.get("sailingId");
    const source = params.get("source");
    setPrefillSailingId(sailingId);
    setPrefillSource(source);
  }, []);

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

  // Prefill from integration links like /booking?sailingId=...&source=live-board.
  useEffect(() => {
    if (!prefillSailingId || prefillRequestedRef.current) return;
    prefillRequestedRef.current = true;

    (async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const res = await supabase
        .from("sailings")
        .select("id, ship:ships(id, name, cruise_line_id)")
        .eq("id", prefillSailingId)
        .maybeSingle();

      if (res.error || !res.data) {
        console.error("booking prefill sailing query error", res.error);
        return;
      }

      const row = res.data as {
        id: string;
        ship:
          | {
              id: string;
              name: string;
              cruise_line_id: string;
            }
          | {
              id: string;
              name: string;
              cruise_line_id: string;
            }[]
          | null;
      };

      const shipRow = Array.isArray(row.ship) ? row.ship[0] : row.ship;
      if (!shipRow?.id || !shipRow?.cruise_line_id) return;

      pendingPrefillShipIdRef.current = shipRow.id;
      pendingPrefillSailingIdRef.current = row.id;
      setCruiseLineId(shipRow.cruise_line_id);
      setPrefillNotice(
        `Pre-selected sailing loaded from ${prefillSource || "site flow"} (${shipRow.name}).`,
      );
    })();
  }, [prefillSailingId, prefillSource]);

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

  // When ships list resolves, apply pending ship prefill.
  useEffect(() => {
    const pendingShipId = pendingPrefillShipIdRef.current;
    if (!pendingShipId || ships.length === 0) return;
    if (!ships.some((ship) => ship.id === pendingShipId)) return;
    setShipId(pendingShipId);
    pendingPrefillShipIdRef.current = null;
  }, [ships]);

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

      const primary = await supabase
        .from("sailings")
        .select("id,ship_id,depart_date,return_date,is_active,nights,ports_summary,itinerary_label")
        .eq("ship_id", shipId)
        .eq("is_active", true)
        .order("depart_date", { ascending: true });

      if (!primary.error) {
        setSailings(primary.data || []);
        setSailingId("");
        return;
      }

      // Fallback for schemas using sail_date/duration.
      const msg = (primary.error as { message?: string }).message || "";
      if (!msg.toLowerCase().includes("depart_date")) {
        console.error("sailings error", primary.error);
        setSailings([]);
        setSailingId("");
        return;
      }

      const legacy = await supabase
        .from("sailings")
        .select("id,ship_id,sail_date,return_date,is_active,duration,itinerary_label,ports_summary")
        .eq("ship_id", shipId)
        .eq("is_active", true)
        .order("sail_date", { ascending: true });

      if (legacy.error) console.error("sailings legacy error", legacy.error);
      setSailings(legacy.data || []);
      setSailingId("");
    })();
  }, [shipId]);

  // When sailings list resolves, apply pending sailing prefill.
  useEffect(() => {
    const pendingSailingId = pendingPrefillSailingIdRef.current;
    if (!pendingSailingId || sailings.length === 0) return;
    if (!sailings.some((sailing) => sailing.id === pendingSailingId)) return;
    setSailingId(pendingSailingId);
    pendingPrefillSailingIdRef.current = null;
  }, [sailings]);

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
      <main className="min-h-screen bg-background-base text-text-secondary">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-12">
          <section className="cfg-card px-8 py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">
              Galveston booking tools
            </p>
            <h1 className="mt-4 text-3xl font-semibold font-accent text-text-primary">Multi-room booking</h1>
            <p className="mt-2 text-sm text-text-secondary">Loading live data…</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background-base text-text-secondary">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-background-panel px-8 py-10 shadow-sm">
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(251,247,241,0.95),rgba(238,245,248,0.9))]" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">
              Galveston booking tools
            </p>
            <h1 className="mt-4 text-3xl font-semibold font-accent text-text-primary md:text-4xl">
              Multi-room booking console
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-text-secondary">
              Select your sailing, enter room details, and submit your request in a clear, step-by-step flow.
            </p>
            {prefillNotice ? <div className="mt-4 cfg-badge">{prefillNotice}</div> : null}
          </div>
        </section>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold font-accent text-text-primary">Galveston Multi-Room Booking</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Live Galveston data: Cruise line {"→"} Ship {"→"} Sailing {"→"} Rooms
          </p>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="cfg-card px-6 py-6">
            <label className="cfg-label">
              Agent (approved)
              <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="cfg-input">
                <option value="">Select agent...</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.tier ? `(${a.tier})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <p className="cfg-helper">
              Only agents with status = <b>approved</b> are shown.
            </p>
          </div>

          <div className="cfg-card px-6 py-6">
            <label className="cfg-label">
              Customer ID (optional override)
              <input
                value={customerIdOverride}
                onChange={(e) => setCustomerIdOverride(e.target.value)}
                placeholder="Paste customer UUID (or leave blank to use auth.uid())"
                className="cfg-input"
              />
            </label>
            <p className="cfg-helper">If blank, the form uses the logged-in Supabase user id.</p>
          </div>
        </section>

        <section className="mt-6 cfg-card px-6 py-6">
          <div className="grid gap-4 md:grid-cols-4">
            <label className="cfg-label">
              Cruise line
              <select value={cruiseLineId} onChange={(e) => setCruiseLineId(e.target.value)} className="cfg-input">
                <option value="">Select...</option>
                {cruiseLines.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="cfg-label">
              Ship (Galveston)
              <select
                value={shipId}
                onChange={(e) => setShipId(e.target.value)}
                disabled={!ships.length}
                className="cfg-input"
              >
                <option value="">{ships.length ? "Select..." : "Select cruise line first"}</option>
                {ships.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="cfg-label md:col-span-2">
              Sailing date
              <select
                value={sailingId}
                onChange={(e) => setSailingId(e.target.value)}
                disabled={!sailings.length}
                className="cfg-input"
              >
                <option value="">{sailings.length ? "Select..." : "Select ship first"}</option>
                {sailings.map((sa) => (
                  <option key={sa.id} value={sa.id}>
                    {(sa.depart_date || sa.sail_date || "TBD")} {"→"} {sa.return_date}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-semibold font-accent text-text-primary">Rooms</h3>
          <button type="button" onClick={addRoom} className="cfg-button-secondary">
            + Add room
          </button>
        </div>

        <section className="mt-4 grid gap-4">
          {rooms.map((room, idx) => (
            <div key={idx} className="rounded-3xl border border-border bg-background-panel px-6 py-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="cfg-badge">Room {idx + 1}</span>
                  <div className="text-lg font-semibold text-text-primary">Guest details</div>
                </div>
                {rooms.length > 1 ? (
                  <button type="button" onClick={() => removeRoom(idx)} className="cfg-button-danger">
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-4 cfg-note">
                Legal names are required. Names must appear exactly as shown on non-expired legal travel documents (a
                non-expired ID and a birth certificate or a non-expired passport). If names do not match, name change
                fees may apply.
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold text-text-primary">Cabin & pricing</div>
                <div className="mt-3 grid gap-4 md:grid-cols-6">
                  <label className="cfg-label md:col-span-2">
                    Cabin type
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
                      className="cfg-input"
                    >
                      {cabinTypes.map((ct) => (
                        <option key={ct.code} value={ct.code}>
                          {ct.display_name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="cfg-label">
                    Guests
                    <select
                      value={room.guest_count}
                      onChange={(e) => {
                        const nextCount = Number(e.target.value);
                        updateRoom(idx, {
                          guest_count: nextCount,
                          guests: normalizeGuests(nextCount, room.guests),
                        });
                      }}
                      className="cfg-input"
                    >
                      {Array.from({ length: maxGuestsForCabin(room.cabin_type) }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <p className="cfg-helper">
                      {maxGuestsForCabin(room.cabin_type) === 5
                        ? "Oceanview rooms allow up to 5 guests."
                        : "All other cabin types allow up to 4 guests."}
                    </p>
                  </label>

                  <label className="cfg-label">
                    Dining
                    <select
                      value={room.dining_time}
                      onChange={(e) => updateRoom(idx, { dining_time: e.target.value as Room["dining_time"] })}
                      className="cfg-input"
                    >
                      <option value="any">Any</option>
                      <option value="5:30pm">5:30pm</option>
                      <option value="7:00pm">7:00pm</option>
                      <option value="8:30pm">8:30pm</option>
                    </select>
                  </label>

                  <label className="cfg-label">
                    Insurance
                    <select
                      value={room.insurance ? "yes" : "no"}
                      onChange={(e) => updateRoom(idx, { insurance: e.target.value === "yes" })}
                      className="cfg-input"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>

                  <label className="cfg-label">
                    Gratuities
                    <select
                      value={room.gratuities ? "yes" : "no"}
                      onChange={(e) => updateRoom(idx, { gratuities: e.target.value === "yes" })}
                      className="cfg-input"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>

                  <label className="cfg-label">
                    Price
                    <input
                      inputMode="decimal"
                      value={room.price}
                      onChange={(e) => updateRoom(idx, { price: Number(e.target.value) })}
                      placeholder="0.00"
                      className="cfg-input"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold text-text-primary">Room contact</div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <label className="cfg-label">
                    Email
                    <input
                      type="email"
                      value={room.contact_email}
                      onChange={(e) => updateRoom(idx, { contact_email: e.target.value })}
                      placeholder="guest@email.com"
                      className="cfg-input"
                    />
                  </label>
                  <label className="cfg-label">
                    Phone
                    <input
                      type="tel"
                      value={room.contact_phone}
                      onChange={(e) => updateRoom(idx, { contact_phone: e.target.value })}
                      placeholder="(###) ###-####"
                      className="cfg-input"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold text-text-primary">Guest details (legal name + DOB)</div>
                <div className="mt-3 grid gap-3">
                  {room.guests.map((guest, guestIdx) => (
                    <div key={guestIdx} className="cfg-card-soft px-5 py-5">
                      <div className="text-sm font-semibold text-text-primary">Guest {guestIdx + 1}</div>
                      <div className="mt-3 grid gap-4 md:grid-cols-4">
                        <label className="cfg-label">
                          First name
                          <input
                            value={guest.first_name}
                            onChange={(e) => {
                              const next = room.guests.slice();
                              next[guestIdx] = { ...guest, first_name: e.target.value };
                              updateRoom(idx, { guests: next });
                            }}
                            placeholder="Legal first name"
                            className="cfg-input"
                          />
                        </label>
                        <label className="cfg-label">
                          Last name
                          <input
                            value={guest.last_name}
                            onChange={(e) => {
                              const next = room.guests.slice();
                              next[guestIdx] = { ...guest, last_name: e.target.value };
                              updateRoom(idx, { guests: next });
                            }}
                            placeholder="Legal last name"
                            className="cfg-input"
                          />
                        </label>
                        <label className="cfg-label">
                          Date of birth
                          <input
                            type="date"
                            value={guest.date_of_birth}
                            onChange={(e) => {
                              const next = room.guests.slice();
                              next[guestIdx] = { ...guest, date_of_birth: e.target.value };
                              updateRoom(idx, { guests: next });
                            }}
                            className="cfg-input"
                          />
                        </label>
                        <label className="cfg-label">
                          VIFP / Membership #
                          <input
                            value={guest.membership_number}
                            onChange={(e) => {
                              const next = room.guests.slice();
                              next[guestIdx] = { ...guest, membership_number: e.target.value };
                              updateRoom(idx, { guests: next });
                            }}
                            placeholder="Optional"
                            className="cfg-input"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background-panel px-6 py-5">
          <div className="text-base font-semibold text-text-primary">Total: {money(total)}</div>
          <button type="button" onClick={submit} disabled={submitting} className="cfg-button-primary">
            {submitting ? "Creating booking..." : "Create booking"}
          </button>
        </section>

        <p className="mt-4 text-xs text-text-muted">
          If Cruise Lines / Ships don&apos;t load, it&apos;s usually RLS on cruise_lines/ships/sailings. If you want,
          I&apos;ll give you the exact RLS policies for &quot;public read of Galveston fleet only&quot;.
        </p>
      </div>
    </main>
  );
}
