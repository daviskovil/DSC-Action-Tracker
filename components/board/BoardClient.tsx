"use client";

import { useState, useCallback } from "react";
import { STATUSES, BUCKETS, PRIORITIES } from "@/lib/constants";
import type { Action } from "@/lib/types";
import KanbanBoard from "./KanbanBoard";
import ActionTable from "./ActionTable";
import AddActionButton from "@/components/actions/AddActionButton";
import ActionModal from "@/components/actions/ActionModal";

type View = "kanban" | "table";

interface Props {
  initialActions: Action[];
  ownerNames: string[];
}

export default function BoardClient({ initialActions, ownerNames }: Props) {
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [view, setView] = useState<View>("kanban");
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  // Filters
  const [filterBucket, setFilterBucket] = useState<string>("All");
  const [filterOwner, setFilterOwner] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterMonth, setFilterMonth] = useState<string>("All");

  const months = [...new Set(actions.map((a) => a.month))].sort();

  const filtered = actions.filter((a) => {
    if (filterBucket !== "All" && a.bucket !== filterBucket) return false;
    if (filterOwner !== "All" && !a.owners.includes(filterOwner)) return false;
    if (filterStatus !== "All" && a.status !== filterStatus) return false;
    if (filterPriority !== "All" && a.priority !== filterPriority) return false;
    if (filterMonth !== "All" && a.month !== filterMonth) return false;
    return true;
  });

  const handleActionUpdated = useCallback((updated: Action) => {
    setActions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedAction(null);
  }, []);

  const handleActionCreated = useCallback((created: Action) => {
    setActions((prev) => [...prev, created]);
  }, []);

  const handleActionDeleted = useCallback((id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    setSelectedAction(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Action Board</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["kanban", "table"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
                  view === v
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <AddActionButton ownerNames={ownerNames} onCreated={handleActionCreated} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterSelect
          value={filterBucket}
          onChange={setFilterBucket}
          options={["All", ...BUCKETS]}
          label="Bucket"
        />
        <FilterSelect
          value={filterOwner}
          onChange={setFilterOwner}
          options={["All", ...ownerNames]}
          label="Owner"
        />
        <FilterSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={["All", ...STATUSES]}
          label="Status"
        />
        <FilterSelect
          value={filterPriority}
          onChange={setFilterPriority}
          options={["All", ...PRIORITIES]}
          label="Priority"
        />
        <FilterSelect
          value={filterMonth}
          onChange={setFilterMonth}
          options={["All", ...months]}
          label="Month"
        />
      </div>

      {/* Bucket quick-filter (table view only, per SRS FR-8) */}
      {view === "table" && (
        <div className="flex gap-2">
          {["All", ...BUCKETS].map((b) => (
            <button
              key={b}
              onClick={() => setFilterBucket(b)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterBucket === b
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {b === "All" ? "All Buckets" : b.replace("Bucket 0", "B")}
            </button>
          ))}
        </div>
      )}

      {/* Board */}
      {view === "kanban" ? (
        <KanbanBoard
          actions={filtered}
          onCardClick={setSelectedAction}
          onStatusChange={handleActionUpdated}
        />
      ) : (
        <ActionTable
          actions={filtered}
          onRowClick={setSelectedAction}
        />
      )}

      {/* Edit modal */}
      {selectedAction && (
        <ActionModal
          action={selectedAction}
          ownerNames={ownerNames}
          onSaved={handleActionUpdated}
          onDeleted={handleActionDeleted}
          onClose={() => setSelectedAction(null)}
        />
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  label: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o === "All" ? `All ${label}s` : o}
        </option>
      ))}
    </select>
  );
}
