"use client";

import { useState, useRef, useEffect } from "react";
import { isAfter, parseISO, startOfToday, format } from "date-fns";
import { BUCKET_BADGE, STATUS_COLORS, PRIORITY_COLORS, STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { Action } from "@/lib/types";

type SortKey = keyof Action;
type SortDir = "asc" | "desc";

interface Props {
  actions: Action[];
  onRowClick: (action: Action) => void;
  onActionUpdated: (action: Action) => void;
}

const COLS = [
  { key: "month" as SortKey,            label: "Month",     width: "w-20"   },
  { key: "title" as SortKey,            label: "Action",    width: "min-w-[240px]" },
  { key: "bucket" as SortKey,           label: "Bucket",    width: "w-36"   },
  { key: "owners" as SortKey,           label: "Owner(s)",  width: "w-32"   },
  { key: "due_date" as SortKey,         label: "Due Date",  width: "w-28"   },
  { key: "status" as SortKey,           label: "Status",    width: "w-32"   },
  { key: "percent_complete" as SortKey, label: "%",         width: "w-16"   },
  { key: "priority" as SortKey,         label: "Priority",  width: "w-24"   },
  { key: "notes" as SortKey,            label: "Notes",     width: "min-w-[180px]" },
];

export default function ActionTable({ actions, onRowClick, onActionUpdated }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("due_date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const today = startOfToday();
  const supabase = createClient();

  useEffect(() => {
    if (editingNotes && notesRef.current) notesRef.current.focus();
  }, [editingNotes]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = [...actions].sort((a, b) => {
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  async function saveNotes(action: Action) {
    const trimmed = notesValue.trim() || null;
    if (trimmed === action.notes) { setEditingNotes(null); return; }
    const { data } = await supabase
      .from("actions").update({ notes: trimmed, updated_at: new Date().toISOString() })
      .eq("id", action.id).select().single();
    if (data) onActionUpdated(data as Action);
    setEditingNotes(null);
  }

  async function saveStatus(action: Action, newStatus: string) {
    setEditingStatus(null);
    if (newStatus === action.status) return;
    const pct = newStatus === "Done" ? 100 : newStatus === "Not Started" ? 0 : action.percent_complete;
    const { data } = await supabase
      .from("actions").update({ status: newStatus, percent_complete: pct, updated_at: new Date().toISOString() })
      .eq("id", action.id).select().single();
    if (data) onActionUpdated(data as Action);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="w-10 px-3 py-3 text-left text-xs font-semibold text-gray-400 border-r border-gray-200">
                #
              </th>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`${col.width} px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors select-none border-r border-gray-200 last:border-r-0`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (
                      <span className="text-brand-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                    ) : (
                      <span className="text-gray-300">↕</span>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-16 px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Task
              </th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((action, idx) => {
              const isOverdue = action.due_date && action.status !== "Done" && isAfter(today, parseISO(action.due_date));
              const isEditingThisNotes = editingNotes === action.id;
              const isEditingThisStatus = editingStatus === action.id;
              const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50/50";

              return (
                <tr
                  key={action.id}
                  className={`${rowBg} border-b border-gray-100 hover:bg-blue-50/30 transition-colors group ${
                    isOverdue ? "border-l-[3px] border-l-red-400" : ""
                  }`}
                >
                  {/* Row number */}
                  <td className="px-3 py-2.5 text-xs text-gray-300 border-r border-gray-100 font-mono">
                    {idx + 1}
                  </td>

                  {/* Month */}
                  <td className="px-3 py-2.5 border-r border-gray-100 whitespace-nowrap">
                    <span className="text-xs font-medium text-gray-500">{action.month}</span>
                  </td>

                  {/* Action title */}
                  <td className="px-3 py-2.5 border-r border-gray-100">
                    <p className={`text-sm font-medium leading-snug ${isOverdue ? "text-red-700" : "text-gray-900"}`}>
                      {action.title}
                    </p>
                    {isOverdue && (
                      <span className="text-xs text-red-500 font-medium">⚠ Overdue</span>
                    )}
                  </td>

                  {/* Bucket */}
                  <td className="px-3 py-2.5 border-r border-gray-100 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BUCKET_BADGE[action.bucket] ?? ""}`}>
                      {action.bucket.replace(/^Bucket 0(\d) - /, "B$1 · ")}
                    </span>
                  </td>

                  {/* Owners */}
                  <td className="px-3 py-2.5 border-r border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      {action.owners.map((o) => (
                        <span key={o} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
                          {o}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className={`px-3 py-2.5 border-r border-gray-100 whitespace-nowrap text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                    {action.due_date ? format(parseISO(action.due_date), "MMM d, yyyy") : "—"}
                  </td>

                  {/* Status — inline dropdown */}
                  <td className="px-3 py-2.5 border-r border-gray-100" onClick={(e) => e.stopPropagation()}>
                    {isEditingThisStatus ? (
                      <select
                        autoFocus
                        defaultValue={action.status}
                        onBlur={(e) => saveStatus(action, e.target.value)}
                        onChange={(e) => saveStatus(action, e.target.value)}
                        className="text-xs border border-brand-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white w-full cursor-pointer"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingStatus(action.id)}
                        title="Click to change status"
                        className={`text-xs px-2.5 py-1 rounded-full font-medium w-full text-left flex items-center justify-between gap-1 hover:opacity-80 transition-opacity ${STATUS_COLORS[action.status] ?? ""}`}
                      >
                        {action.status}
                        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </td>

                  {/* % Complete */}
                  <td className="px-3 py-2.5 border-r border-gray-100 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-gray-700">{action.percent_complete}%</span>
                      <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${action.percent_complete === 100 ? "bg-green-500" : "bg-brand-500"}`}
                          style={{ width: `${action.percent_complete}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-3 py-2.5 border-r border-gray-100 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[action.priority] ?? ""}`}>
                      {action.priority}
                    </span>
                  </td>

                  {/* Notes — inline edit */}
                  <td className="px-3 py-2.5 border-r border-gray-100" onClick={(e) => e.stopPropagation()}>
                    {isEditingThisNotes ? (
                      <textarea
                        ref={notesRef}
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        onBlur={() => saveNotes(action)}
                        onKeyDown={(e) => { if (e.key === "Escape") setEditingNotes(null); if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveNotes(action); } }}
                        rows={2}
                        className="w-full text-xs border border-brand-400 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none bg-white"
                        placeholder="Add a note… (Enter to save)"
                      />
                    ) : (
                      <button
                        onClick={() => { setEditingNotes(action.id); setNotesValue(action.notes ?? ""); }}
                        className="w-full text-left text-xs text-gray-500 hover:text-gray-800 hover:bg-yellow-50 rounded px-1 py-0.5 transition-colors min-h-[24px] group-hover:underline-offset-2"
                        title="Click to edit notes"
                      >
                        {action.notes ? (
                          <span className="line-clamp-2">{action.notes}</span>
                        ) : (
                          <span className="text-gray-300 italic">Add note…</span>
                        )}
                      </button>
                    )}
                  </td>

                  {/* Task (open detail) */}
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => onRowClick(action)}
                      title="Open task details"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center">
                  <p className="text-gray-400 text-sm">No actions match these filters.</p>
                  <p className="text-gray-300 text-xs mt-1">Try clearing filters or adding a new action.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-400">{sorted.length} row{sorted.length !== 1 ? "s" : ""}</p>
        <p className="text-xs text-gray-300">Click status to change · Click notes to edit · ↗ to open task</p>
      </div>
    </div>
  );
}
