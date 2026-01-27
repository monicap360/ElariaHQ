"use client";

import { useEffect, useState } from "react";

type DecisionWeights = {
  price: number;
  cabin: number;
  preference: number;
  demand: number;
  risk: number;
};

type DecisionOverride = {
  sailing_id: string;
  disabled: boolean | null;
  force_review: boolean | null;
  note: string | null;
};

type DecisionLog = {
  id: string;
  input_hash: string;
  top_sailing_id: string | null;
  score_spread: number | null;
  confidence: number | null;
  created_at: string;
};

const DEFAULT_WEIGHTS: DecisionWeights = {
  price: 0.25,
  cabin: 0.2,
  preference: 0.2,
  demand: 0.15,
  risk: 0.2,
};

export default function DecisionEngineAdminPage() {
  const [weights, setWeights] = useState<DecisionWeights>(DEFAULT_WEIGHTS);
  const [overrides, setOverrides] = useState<DecisionOverride[]>([]);
  const [logs, setLogs] = useState<DecisionLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    sailing_id: "",
    disabled: false,
    force_review: false,
    note: "",
  });

  useEffect(() => {
    (async () => {
      const [weightsRes, overridesRes, logsRes] = await Promise.all([
        fetch("/api/decision-engine/weights"),
        fetch("/api/decision-engine/overrides"),
        fetch("/api/decision-engine/logs"),
      ]);
      if (weightsRes.ok) {
        const data = (await weightsRes.json()) as { weights: DecisionWeights };
        setWeights(data.weights);
      }
      if (overridesRes.ok) {
        const data = (await overridesRes.json()) as { overrides: DecisionOverride[] };
        setOverrides(data.overrides || []);
      }
      if (logsRes.ok) {
        const data = (await logsRes.json()) as { logs: DecisionLog[] };
        setLogs(data.logs || []);
      }
    })();
  }, []);

  async function saveWeights() {
    setSaving(true);
    await fetch("/api/decision-engine/weights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(weights),
    });
    setSaving(false);
  }

  async function saveOverride() {
    if (!overrideForm.sailing_id.trim()) return;
    setSaving(true);
    await fetch("/api/decision-engine/overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(overrideForm),
    });
    const overridesRes = await fetch("/api/decision-engine/overrides");
    if (overridesRes.ok) {
      const data = (await overridesRes.json()) as { overrides: DecisionOverride[] };
      setOverrides(data.overrides || []);
    }
    setSaving(false);
  }

  return (
    <main className="dashboard-theme">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Decision Engine Control Layer</h1>
        <p className="mt-2 text-sm dashboard-muted">
          Update weights, add overrides, and review decision logs.
        </p>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="dashboard-panel p-6">
            <h2 className="text-lg font-semibold">Weights</h2>
            <div className="mt-4 grid gap-4">
              {(["price", "cabin", "preference", "demand", "risk"] as const).map((key) => (
                <label key={key} className="text-sm dashboard-muted">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <input
                    type="number"
                    step="0.01"
                    value={weights[key]}
                    onChange={(event) =>
                      setWeights((prev) => ({
                        ...prev,
                        [key]: Number(event.target.value),
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-transparent bg-background-card px-3 py-2 text-text-primary"
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={saveWeights}
                className="rounded-lg border border-primary-blue/50 px-4 py-2 text-sm font-semibold text-primary-blue"
                disabled={saving}
              >
                Save weights
              </button>
            </div>
          </div>

          <div className="dashboard-panel p-6">
            <h2 className="text-lg font-semibold">Override a sailing</h2>
            <div className="mt-4 grid gap-4">
              <label className="text-sm dashboard-muted">
                Sailing ID
                <input
                  value={overrideForm.sailing_id}
                  onChange={(event) => setOverrideForm((prev) => ({ ...prev, sailing_id: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-transparent bg-background-card px-3 py-2 text-text-primary"
                />
              </label>
              <label className="flex items-center gap-2 text-sm dashboard-muted">
                <input
                  type="checkbox"
                  checked={overrideForm.disabled}
                  onChange={(event) => setOverrideForm((prev) => ({ ...prev, disabled: event.target.checked }))}
                />
                Disable this sailing
              </label>
              <label className="flex items-center gap-2 text-sm dashboard-muted">
                <input
                  type="checkbox"
                  checked={overrideForm.force_review}
                  onChange={(event) => setOverrideForm((prev) => ({ ...prev, force_review: event.target.checked }))}
                />
                Force human review
              </label>
              <label className="text-sm dashboard-muted">
                Note
                <input
                  value={overrideForm.note}
                  onChange={(event) => setOverrideForm((prev) => ({ ...prev, note: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-transparent bg-background-card px-3 py-2 text-text-primary"
                />
              </label>
              <button
                type="button"
                onClick={saveOverride}
                className="rounded-lg border border-primary-blue/50 px-4 py-2 text-sm font-semibold text-primary-blue"
                disabled={saving}
              >
                Save override
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 dashboard-panel p-6">
          <h2 className="text-lg font-semibold">Active overrides</h2>
          <div className="mt-4 grid gap-3 text-sm text-text-secondary">
            {overrides.length === 0 && <p>No overrides yet.</p>}
            {overrides.map((row) => (
              <div key={row.sailing_id} className="rounded-lg border border-white/10 p-3">
                <div className="font-semibold text-text-primary">{row.sailing_id}</div>
                <div className="text-xs text-text-muted">
                  Disabled: {row.disabled ? "Yes" : "No"} · Force review: {row.force_review ? "Yes" : "No"}
                </div>
                {row.note && <div className="mt-2 text-xs text-text-secondary">{row.note}</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 dashboard-panel p-6">
          <h2 className="text-lg font-semibold">Decision logs</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="dashboard-table text-sm">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Input hash</th>
                  <th>Top sailing</th>
                  <th>Score spread</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.input_hash}</td>
                    <td>{log.top_sailing_id ?? "-"}</td>
                    <td>{log.score_spread?.toFixed(3) ?? "-"}</td>
                    <td>{log.confidence?.toFixed(3) ?? "-"}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="dashboard-muted">
                      No decision logs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
