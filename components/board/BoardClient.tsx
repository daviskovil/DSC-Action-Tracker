"use client";

import { useState, useCallback } from "react";
import { BUCKETS } from "@/lib/constants";
import type { Action } from "@/lib/types";
import ActionTable from "./ActionTable";
import AddActionButton from "@/components/actions/AddActionButton";
import ActionModal from "@/components/actions/ActionModal";

interface Props {
  initialActions: Action[];
  ownerNames: string[];
}

function shortBucket(b: string) {
  return b.replace(/^Bucket \d+ - /, "");
}

export default function BoardClient({ initialActions, ownerNames }: Props) {
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [filterBucket, setFilterBucket] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = actions.filter(a => {
    if (filterBucket !== "All" && a.bucket !== filterBucket) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleActionUpdated = useCallback((updated: Action) => {
    setActions(prev => prev.map(a => a.id === updated.id ? updated : a));
    setSelectedAction(null);
  }, []);

  const handleActionCreated = useCallback((created: Action) => {
    setActions(prev => [...prev, created]);
  }, []);

  const handleActionDeleted = useCallback((id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
    setSelectedAction(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Action Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {actions.length} actions</p>
        </div>
        <AddActionButton ownerNames={ownerNames} onCreated={handleActionCreated} />
      </div>

      {/* Search + bucket quick-filter */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search actions…"
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <div className="h-4 w-px bg-gray-200" />

        {/* Workstream pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", ...BUCKETS].map(b => (
            <button key={b} onClick={() => setFilterBucket(b)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                filterBucket === b
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {b === "All" ? "All Workstreams" : shortBucket(b)}
            </button>
          ))}
        </div>

        <p className="ml-auto text-xs text-gray-400 hidden md:block">
          Use the <svg className="w-3 h-3 inline-block mx-0.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V17a1 1 0 01-.553.894l-4-2A1 1 0 018 15v-4.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg> icon on each column to filter
        </p>
      </div>

      <ActionTable
        actions={filtered}
        allActions={actions}
        onRowClick={setSelectedAction}
        onActionUpdated={handleActionUpdated}
      />

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
