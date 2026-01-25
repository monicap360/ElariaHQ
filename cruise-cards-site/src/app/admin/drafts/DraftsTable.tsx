"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DraftRow = {
  id: string;
  topic: string;
  scope: string;
  targetSite: string;
  sourceSignal: string;
  priority: number | null;
  createdAt: string;
  notes: string;
  parentHub: string;
};

type Props = {
  drafts: DraftRow[];
};

export default function DraftsTable({ drafts }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(drafts[0]?.id ?? null);
  const router = useRouter();

  const selected = useMemo(
    () => drafts.find((draft) => draft.id === selectedId) ?? null,
    [drafts, selectedId]
  );

  const counts = useMemo(() => {
    const base = {
      total: drafts.length,
      "texascruiseport.com": 0,
      "houstoncruisetips.com": 0,
      "houstoncruiseshuttle.com": 0,
      "cruisesfromgalveston.net": 0,
    };
    drafts.forEach((draft) => {
      if (draft.targetSite in base) {
        base[draft.targetSite as keyof typeof base] += 1;
      }
    });
    return base;
  }, [drafts]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div>
          <h1 className="text-3xl font-semibold">Drafts Awaiting Approval</h1>
          <p className="text-gray-600">
            Drafts are created by agents and held here until approved. No content publishes without review.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-slate-300 px-3 py-1">Total drafts: {counts.total}</span>
          <span className="rounded-full border border-slate-300 px-3 py-1">
            texascruiseport.com: {counts["texascruiseport.com"]}
          </span>
          <span className="rounded-full border border-slate-300 px-3 py-1">
            houstoncruisetips.com: {counts["houstoncruisetips.com"]}
          </span>
          <span className="rounded-full border border-slate-300 px-3 py-1">
            houstoncruiseshuttle.com: {counts["houstoncruiseshuttle.com"]}
          </span>
          <span className="rounded-full border border-slate-300 px-3 py-1">
            cruisesfromgalveston.net: {counts["cruisesfromgalveston.net"]}
          </span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Target Site</th>
                  <th className="py-3 px-4">Trigger</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((draft) => (
                  <tr key={draft.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{draft.topic}</td>
                    <td className="px-4 py-3">{draft.scope}</td>
                    <td className="px-4 py-3">{draft.targetSite}</td>
                    <td className="px-4 py-3">{draft.sourceSignal}</td>
                    <td className="px-4 py-3">{draft.priority ?? "—"}</td>
                    <td className="px-4 py-3">{draft.createdAt}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                        onClick={() => setSelectedId(draft.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {!drafts.length && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                      No drafts are ready for approval yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          {!selected && <p className="text-sm text-gray-500">Select a draft to see details.</p>}

          {selected && (
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-semibold">Metadata</h2>
                <dl className="mt-3 space-y-2 text-sm text-slate-700">
                  <div>
                    <dt className="font-semibold">Topic</dt>
                    <dd>{selected.topic}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Scope</dt>
                    <dd>{selected.scope}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Parent Hub</dt>
                    <dd>{selected.parentHub}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Target Site</dt>
                    <dd>{selected.targetSite}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Source Signal</dt>
                    <dd>{selected.sourceSignal}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Support</dt>
                    <dd>Supports booking via cruisesfromgalveston.net</dd>
                  </div>
                </dl>
              </section>

              <section>
                <h2 className="text-lg font-semibold">Approved Outline</h2>
                <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
{selected.notes || "Outline not available yet."}
                </pre>
              </section>

              <section>
                <h2 className="text-lg font-semibold">Draft Content</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Publisher output will appear here once generated and approved.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Actions</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                    onClick={async () => {
                      await fetch("/api/admin/drafts/action", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: selected.id, action: "approve" }),
                      });
                      router.refresh();
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className="rounded border border-slate-300 px-3 py-2 text-xs font-semibold"
                    onClick={async () => {
                      const note = window.prompt("Revision request notes") || "";
                      await fetch("/api/admin/drafts/action", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: selected.id, action: "revision", note }),
                      });
                      router.refresh();
                    }}
                  >
                    Request Revision
                  </button>
                  <button
                    className="rounded border border-slate-300 px-3 py-2 text-xs font-semibold"
                    onClick={async () => {
                      const note = window.prompt("Hold notes") || "";
                      await fetch("/api/admin/drafts/action", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: selected.id, action: "hold", note }),
                      });
                      router.refresh();
                    }}
                  >
                    Hold
                  </button>
                  <button
                    className="rounded border border-red-300 px-3 py-2 text-xs font-semibold text-red-600"
                    onClick={async () => {
                      const note = window.prompt("Rejection reason") || "";
                      await fetch("/api/admin/drafts/action", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: selected.id, action: "reject", note }),
                      });
                      router.refresh();
                    }}
                  >
                    Reject
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Actions will be wired to publishing workflows once approvals are finalized.
                </p>
              </section>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
