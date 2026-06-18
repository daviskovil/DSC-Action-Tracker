"use client";

import { useState, useCallback } from "react";
import { STATUSES, BUCKETS, PRIORITIES } from "@/lib/constants";
import type { Action } from "@/lib/types";
import ActionTable from "./ActionTable";
import AddActionButton from "@/components/actions/AddActionButton";
import ActionModal from "@/components/actions/ActionModal";

interface Props {
  initialActions: Action[];
  ownerNames: string[];
}

export default function BoardClient({ initialActions, ownerNames }: Props) {
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [filterBucket, setFilterBucket] = useState("All");
  const [filterOwner, setFilterOwner] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [search, setSearch] = useState("");

  const months = [...new Set(actions.map((a) => a.month))].sort();

  const filtered = actions.filter((a) => {
    if (filterBucket !== "All" && a.bucket !== filterBucket) return false;
    if (filterOwner !== "All" && !a.owners.includes(filterOwner)) return false;
    if (filterStatus !== "All" && a.status !== filterStatus) return false;
    if (filterPriority !== "All" && a.priority !== filterPriority) return false;
    if (filterMonth !== "All" && a.month !== filterMonth) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
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

  const hasFilters = filterBucket !== "All" || filterOwner !== "All" ||
    filterStatus !== "All" || filterPriority !== "All" ||
    filterMonth !== "All" || search !== "";

  function clearFilters() {
    setFilterBucket("All"); setFilterOwner("All"); setFilterStatus("All");
    setFilterPriority("All"); setFilterMonth("All"); setSearch("");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Action Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {actions.length} actions</p>
        </div>
        <AddActionButton ownerNames={ownerNames} onCreated={handleActionCreated} />
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions…"
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <FPill label="Bucket" value={filterBucket} onChange={setFilterBucket} options={["All", ...BUCKETS]} />
        <FPill label="Owner" value={filterOwner} onChange={setFilterOwner} options={["All","Davis","Vivek","Kailash","Sahdev","Raghuram"]} />
        <FPill label="Status" value={filterStatus} onChange={setFilterStatus} options={["All", ...STATUSES]} />
        <FPill label="Priority" value={filterPriority} onChange={setFilterPriority} options={["All", ...PRIORITIES]} />
        <FPill label="Month" value={filterMonth} onChange={setFilterMonth} options={["All", ...months]} />
        {hasFilters && <button onClick={clearFilters} className="text-xs text-brand-600 hover:underline font-medium">Clear all</button>}
        <div className="ml-auto flex gap-1.5 flex-wrap">
          {["All", ...BUCKETS].map((b) => (
            <button key={b} onClick={() => setFilterBucket(b)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                filterBucket === b ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {b === "All" ? "All Buckets" : b.replace(/^Bucket 0(\d) - /, "B$1 · ")}
            </button>
          ))}
        </div>
      </div>

      <ActionTable actions={filtered} onRowClick={setSelectedAction} onActionUpdated={handleActionUpdated} />

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

function FPill({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: readonly string[];
}) {
  const active = value !== "All";
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer ${
        active ? "border-brand-400 bg-brand-50 text-brand-700 font-medium" : "border-gray-200 bg-white text-gray-600"
      }`}
    >
      <option value="All">{label}</option>
      {options.filter((o) => o !== "All").map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
