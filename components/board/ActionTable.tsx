"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { parseISO, startOfToday, format } from "date-fns";
import { BUCKET_BADGE, PRIORITY_COLORS, STATUSES, BUCKETS, PRIORITIES } from "@/lib/constants";

// Inline styles — guaranteed to work regardless of Tailwind purging
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  Done:       { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
  InProgress: { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
  Pending:    { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
  Dependency: { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" },
};
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/logActivity";
import type { Action } from "@/lib/types";

type SortKey = keyof Action;

interface Props {
  actions: Action[];
  allActions: Action[];
  role: string;
  onRowClick: (action: Action) => void;
  onActionUpdated: (action: Action) => void;
  onActionDeleted: (id: string) => void;
}

const MONTH_ORDER = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const ALL_OWNERS = ["Davis","Vivek","Kailash","Sahdev","Raghuram"];

function shortBucket(b: string) {
  return b.replace(/^Bucket \d+ - /, "");
}

// ── Formatting toolbar ───────────────────────────────────────────────────────
function FormatToolbar({ textareaRef, value, onChange }: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
}) {
  function wrapSelection(before: string, after: string, placeholder = "text") {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = value.substring(start, end) || placeholder;
    const newVal = value.substring(0, start) + before + sel + after + value.substring(end);
    onChange(newVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  }

  function prefixLine(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    // toggle: if already has prefix, remove it
    if (value.substring(lineStart).startsWith(prefix)) {
      const newVal = value.substring(0, lineStart) + value.substring(lineStart + prefix.length);
      onChange(newVal);
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start - prefix.length, start - prefix.length); });
    } else {
      const newVal = value.substring(0, lineStart) + prefix + value.substring(lineStart);
      onChange(newVal);
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + prefix.length, start + prefix.length); });
    }
  }

  const btnStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "3px 7px", borderRadius: 5, border: "1px solid #e5e7eb",
    background: "white", cursor: "pointer", fontSize: 12, color: "#374151",
    lineHeight: 1, fontFamily: "inherit", transition: "background 0.1s",
  };

  return (
    <div style={{ display: "flex", gap: 3, marginBottom: 5, flexWrap: "wrap" }}>
      <button type="button" style={btnStyle} title="Bullet point" onClick={() => prefixLine("• ")}>
        • Bullet
      </button>
      <button type="button" style={btnStyle} title="Numbered list" onClick={() => prefixLine("1. ")}>
        1. Number
      </button>
      <button type="button" style={{ ...btnStyle, fontWeight: 700 }} title="Bold" onClick={() => wrapSelection("**", "**")}>
        B
      </button>
      <button type="button" style={{ ...btnStyle, fontStyle: "italic" }} title="Italic" onClick={() => wrapSelection("_", "_")}>
        I
      </button>
      <button type="button" style={btnStyle} title="Divider line" onClick={() => {
        const el = textareaRef.current;
        if (!el) return;
        const pos = el.selectionStart;
        const newVal = value.substring(0, pos) + "\n---\n" + value.substring(pos);
        onChange(newVal);
        requestAnimationFrame(() => { el.focus(); el.setSelectionRange(pos + 5, pos + 5); });
      }}>
        ── Line
      </button>
    </div>
  );
}

// ── Title popup component ────────────────────────────────────────────────────
function TitlePopup({ action, onSave, onClose }: {
  action: Action;
  onSave: (title: string, notes: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(action.title);
  const [notes, setNotes] = useState(action.notes ?? "");
  const ref = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onSave(title, notes);
      }
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler); };
  }, [title, notes, onSave, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) { onSave(title, notes); } }}>
      <div ref={ref} className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-[520px] max-w-[95vw]"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Edit Action</p>
          <button onClick={() => { onSave(title, notes); onClose(); }}
            title="Save & close"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7.586a1 1 0 01.707.293l4.414 4.414A1 1 0 0120 8.414V19a2 2 0 01-2 2z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4a1 1 0 001 1h4"/>
            </svg>
          </button>
        </div>

        <label className="block text-xs text-gray-500 font-medium mb-1">Title</label>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
          className="w-full text-sm font-medium border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 mb-3"
        />

        <label className="block text-xs text-gray-500 font-medium mb-1">
          Description / Notes
        </label>
        <FormatToolbar textareaRef={textareaRef} value={notes} onChange={setNotes} />
        <textarea
          ref={textareaRef}
          rows={6}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={"• Key context or background\n• Dependencies or blockers\n• Definition of done"}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none font-mono text-xs leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1.5">Shift+Enter for new line · Esc to discard</p>
      </div>
    </div>
  );
}

// ── Notes popup component ────────────────────────────────────────────────────
function NotesPopup({ action, onSave, onClose }: {
  action: Action;
  onSave: (notes: string) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(action.notes ?? "");
  const ref = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onSave(notes);
      }
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler); };
  }, [notes, onSave, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) { onSave(notes); } }}>
      <div ref={ref} className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-[520px] max-w-[95vw]"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[300px]">{action.title}</p>
          </div>
          <button onClick={() => { onSave(notes); onClose(); }}
            title="Save & close"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7.586a1 1 0 01.707.293l4.414 4.414A1 1 0 0120 8.414V19a2 2 0 01-2 2z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4a1 1 0 001 1h4"/>
            </svg>
          </button>
        </div>
        <FormatToolbar textareaRef={textareaRef} value={notes} onChange={setNotes} />
        <textarea
          ref={textareaRef}
          autoFocus
          rows={8}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={"• Key context or background\n• Dependencies or blockers\n• Definition of done\n• Links or references"}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-y font-mono text-xs leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1.5">Shift+Enter for new line · Esc to discard</p>
      </div>
    </div>
  );
}

// ── Delete confirmation dialog ───────────────────────────────────────────────
function DeleteConfirmDialog({ count, onConfirm, onCancel }: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[420px] max-w-[95vw]">
        {/* Warning icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Delete {count === 1 ? "action" : `${count} actions`}?</h3>
            <p className="text-sm text-gray-500 mt-0.5">This cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          Are you sure you want to permanently delete{" "}
          <strong>{count === 1 ? "this action" : `these ${count} actions`}</strong>?
          All associated data will be removed and cannot be recovered.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Column filter dropdown ────────────────────────────────────────────────────
type ColFilter = {
  key: SortKey;
  label: string;
  filterable?: boolean;
  filterValues?: (actions: Action[]) => string[];
};

const COLS: ColFilter[] = [
  { key: "month",            label: "Month",    filterable: true,  filterValues: a => [...new Set(a.map(x => x.month))].sort((x,y) => MONTH_ORDER.indexOf(x) - MONTH_ORDER.indexOf(y)) },
  { key: "title",            label: "Action",   filterable: false },
  { key: "bucket",           label: "Workstream", filterable: true,  filterValues: () => BUCKETS.map(b => b) },
  { key: "owners",           label: "Primary Owner", filterable: true, filterValues: () => ALL_OWNERS },
  { key: "secondary_owners", label: "Secondary Owner", filterable: true, filterValues: () => ALL_OWNERS },
  { key: "due_date",         label: "Due Date", filterable: false },
  { key: "status",           label: "Status",   filterable: true,  filterValues: () => [...STATUSES] },
  { key: "percent_complete", label: "%",        filterable: false },
  { key: "priority",         label: "Priority", filterable: true,  filterValues: () => [...PRIORITIES] },
  { key: "notes",            label: "Status Notes", filterable: false },
];

function FilterDropdown({ col, allActions, selected, onChange, onClose }: {
  col: ColFilter;
  allActions: Action[];
  selected: string[];
  onChange: (vals: string[]) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const options = col.filterValues?.(allActions) ?? [];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  function toggle(val: string) {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  }

  const displayVal = (val: string, key: SortKey) => {
    if (key === "bucket") return shortBucket(val);
    return val;
  };

  return (
    <div ref={ref} className="absolute left-0 top-full mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-[180px]"
      onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{col.label}</p>
        {selected.length > 0 && (
          <button onClick={() => onChange([])} className="text-xs text-brand-600 hover:underline font-medium">Clear</button>
        )}
      </div>
      <div className="space-y-0.5 max-h-52 overflow-y-auto">
        {options.map(val => (
          <label key={val} className="flex items-center gap-2.5 py-1 px-1 cursor-pointer hover:bg-gray-50 rounded">
            <input type="checkbox" checked={selected.includes(val)} onChange={() => toggle(val)}
              className="accent-brand-600 cursor-pointer w-3.5 h-3.5 rounded" />
            <span className="text-sm text-gray-700">{displayVal(val, col.key)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ActionTable({ actions, allActions, role, onRowClick, onActionUpdated, onActionDeleted }: Props) {
  const isAdmin = role === "admin";
  const [sortKey, setSortKey] = useState<SortKey>("due_date");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const [editingCell, setEditingCell] = useState<{id: string; field: string} | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [ownersPopover, setOwnersPopover] = useState<string | null>(null);
  const [titlePopover, setTitlePopover] = useState<string | null>(null);
  const [notesPopover, setNotesPopover] = useState<string | null>(null);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [openFilterCol, setOpenFilterCol] = useState<string | null>(null);
  const [colFilters, setColFilters] = useState<Record<string, string[]>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ownersPopoverRef = useRef<HTMLDivElement>(null);
  const today = startOfToday();
  const supabase = createClient();

  // Dynamic total cols count
  const totalCols = COLS.length + 2 + (isAdmin ? 1 : 0); // COLS + # + Task + optional checkbox

  // Close owners popover on outside click
  useEffect(() => {
    if (!ownersPopover) return;
    function handler(e: MouseEvent) {
      if (ownersPopoverRef.current && !ownersPopoverRef.current.contains(e.target as Node)) {
        setOwnersPopover(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ownersPopover]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function toggleMonth(month: string) {
    setCollapsedMonths(prev => {
      const next = new Set(prev);
      next.has(month) ? next.delete(month) : next.add(month);
      return next;
    });
  }

  function startEdit(action: Action, field: string) {
    if (field === "title") { setTitlePopover(action.id); return; }
    const val = (action as unknown as Record<string, unknown>)[field];
    setEditingCell({ id: action.id, field });
    setEditValue(val == null ? "" : String(val));
  }

  async function saveField(action: Action, field: string, value: string | number | null) {
    setEditingCell(null);
    const current = (action as unknown as Record<string, unknown>)[field];
    if (value === current || (value === "" && current == null)) return;
    const { data } = await supabase
      .from("actions")
      .update({ [field]: value === "" ? null : value, updated_at: new Date().toISOString() })
      .eq("id", action.id)
      .select()
      .single();
    if (data) {
      onActionUpdated(data as Action);
      logActivity("action_updated", `Updated "${action.title}" — ${field} changed to "${value}"`, { action_id: action.id, field });
    }
  }

  const saveNotes = useCallback((action: Action) => async (notes: string) => {
    setNotesPopover(null);
    if (notes === (action.notes ?? "")) return;
    const { data } = await supabase.from("actions")
      .update({ notes: notes || null, updated_at: new Date().toISOString() })
      .eq("id", action.id).select().single();
    if (data) onActionUpdated(data as Action);
  }, [supabase, onActionUpdated]);

  const saveTitleAndNotes = useCallback((action: Action) => async (title: string, notes: string) => {
    setTitlePopover(null);
    const updates: Record<string, string | null> = { updated_at: new Date().toISOString() };
    if (title !== action.title) updates.title = title;
    if (notes !== (action.notes ?? "")) updates.notes = notes || null;
    if (Object.keys(updates).length <= 1) return;
    const { data } = await supabase.from("actions").update(updates).eq("id", action.id).select().single();
    if (data) onActionUpdated(data as Action);
  }, [supabase, onActionUpdated]);

  async function saveOwners(action: Action, owners: string[]) {
    const { data } = await supabase
      .from("actions")
      .update({ owners, updated_at: new Date().toISOString() })
      .eq("id", action.id)
      .select()
      .single();
    if (data) onActionUpdated(data as Action);
  }

  // ── Row selection ─────────────────────────────────────────────────────────
  function toggleRowSelect(id: string) {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAllVisible(rows: Action[]) {
    const allIds = rows.map(r => r.id);
    const allSelected = allIds.every(id => selectedRows.has(id));
    if (allSelected) {
      setSelectedRows(prev => { const next = new Set(prev); allIds.forEach(id => next.delete(id)); return next; });
    } else {
      setSelectedRows(prev => { const next = new Set(prev); allIds.forEach(id => next.add(id)); return next; });
    }
  }

  // ── Delete selected ───────────────────────────────────────────────────────
  async function handleDeleteSelected() {
    if (!selectedRows.size) return;
    setDeleting(true);
    const ids = [...selectedRows];
    const { error } = await supabase.from("actions").delete().in("id", ids);
    if (!error) {
      for (const id of ids) {
        const a = allActions.find(x => x.id === id);
        if (a) logActivity("action_deleted", `Deleted action: "${a.title}"`, { action_id: id });
        onActionDeleted(id);
      }
      setSelectedRows(new Set());
    }
    setShowDeleteConfirm(false);
    setDeleting(false);
  }

  // Apply column-level filters
  const filtered = actions.filter(action => {
    for (const [field, vals] of Object.entries(colFilters)) {
      if (!vals.length) continue;
      if (field === "owners") {
        if (!vals.some(v => action.owners.includes(v))) return false;
      } else {
        const av = String((action as unknown as Record<string, unknown>)[field] ?? "");
        if (!vals.includes(av)) return false;
      }
    }
    return true;
  });

  // Group & sort
  const grouped = filtered.reduce<Record<string, Action[]>>((acc, a) => {
    (acc[a.month] ??= []).push(a);
    return acc;
  }, {});

  const sortedMonths = Object.keys(grouped).sort((a, b) => {
    const ai = MONTH_ORDER.indexOf(a);
    const bi = MONTH_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  function sortRows(list: Action[]) {
    return [...list].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] ?? "";
      const bv = (b as unknown as Record<string, unknown>)[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  const isEditing = (id: string, field: string) =>
    editingCell?.id === id && editingCell?.field === field;

  const activeFilterCount = Object.values(colFilters).filter(v => v.length > 0).length;

  // All visible rows for select-all
  const allVisibleRows = sortedMonths.flatMap(m => sortRows(grouped[m]));

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm" style={{ overflow: "hidden" }}>
        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 flex-wrap bg-brand-50/40">
            <span className="text-xs text-gray-500 font-medium">Filtered by:</span>
            {Object.entries(colFilters).map(([field, vals]) => vals.length > 0 && (
              <span key={field} className="flex items-center gap-1 text-xs bg-white border border-brand-200 text-brand-700 rounded-full px-2.5 py-0.5 font-medium">
                {COLS.find(c => c.key === field)?.label}: {vals.map(v => field === "bucket" ? shortBucket(v) : v).join(", ")}
                <button onClick={() => setColFilters(f => ({ ...f, [field]: [] }))} className="ml-0.5 text-brand-400 hover:text-brand-700">×</button>
              </span>
            ))}
            <button onClick={() => setColFilters({})} className="text-xs text-gray-400 hover:text-gray-700 ml-1">Clear all</button>
          </div>
        )}

        {/* Admin delete toolbar — shown when rows are selected */}
        {isAdmin && selectedRows.size > 0 && (
          <div className="px-4 py-2.5 border-b border-red-100 bg-red-50 flex items-center gap-3">
            <span className="text-sm font-medium text-red-700">{selectedRows.size} row{selectedRows.size > 1 ? "s" : ""} selected</span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Delete selected
            </button>
            <button onClick={() => setSelectedRows(new Set())} className="text-xs text-red-500 hover:text-red-700">
              Clear selection
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "13px" }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ background: "#f7f8fa", borderBottom: "2px solid #e2e5ea" }}>
                {/* Checkbox column — admin only */}
                {isAdmin && (
                  <th style={{ width: 36, borderRight: "1px solid #e2e5ea", padding: "10px 8px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      title="Select all visible"
                      checked={allVisibleRows.length > 0 && allVisibleRows.every(r => selectedRows.has(r.id))}
                      onChange={() => selectAllVisible(allVisibleRows)}
                      className="accent-red-500 cursor-pointer w-3.5 h-3.5"
                    />
                  </th>
                )}
                <th style={{ width: 40, borderRight: "1px solid #e2e5ea", padding: "10px 8px", color: "#9ca3af", fontWeight: 600, fontSize: 11, textAlign: "center" }}>#</th>
                {COLS.map(col => {
                  const activeFilter = (colFilters[col.key as string] ?? []).length > 0;
                  const isOpenFilter = openFilterCol === col.key;
                  return (
                    <th key={col.key} style={{ borderRight: "1px solid #e2e5ea", position: "relative", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 4 }}>
                        <button
                          onClick={() => handleSort(col.key)}
                          style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", background: "none", border: "none", padding: 0, flex: 1 }}
                        >
                          {col.label}
                          {sortKey === col.key
                            ? <span style={{ color: "#E30613", marginLeft: 2 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
                            : <span style={{ color: "#d1d5db", marginLeft: 2 }}>↕</span>}
                        </button>
                        {col.filterable && (
                          <button
                            onClick={e => { e.stopPropagation(); setOpenFilterCol(isOpenFilter ? null : col.key as string); }}
                            title={`Filter by ${col.label}`}
                            style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, border: "none", cursor: "pointer", background: activeFilter ? "#fee2e2" : "transparent", color: activeFilter ? "#E30613" : "#9ca3af" }}
                          >
                            <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V17a1 1 0 01-.553.894l-4-2A1 1 0 018 15v-4.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {isOpenFilter && col.filterable && (
                        <FilterDropdown
                          col={col}
                          allActions={allActions}
                          selected={colFilters[col.key as string] ?? []}
                          onChange={vals => setColFilters(f => ({ ...f, [col.key as string]: vals }))}
                          onClose={() => setOpenFilterCol(null)}
                        />
                      )}
                    </th>
                  );
                })}
                <th style={{ width: 48, borderLeft: "1px solid #e2e5ea", padding: "10px 8px", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>Task</th>
              </tr>
            </thead>

            <tbody>
              {sortedMonths.map(month => {
                const rows = sortRows(grouped[month]);
                const collapsed = collapsedMonths.has(month);
                const doneCount = rows.filter(a => a.status === "Done").length;
                const pct = rows.length ? Math.round((doneCount / rows.length) * 100) : 0;

                return (
                  <React.Fragment key={month}>
                    {/* Month group header */}
                    <tr style={{ background: "#f0f2f5", borderTop: "2px solid #e2e5ea", borderBottom: "1px solid #e2e5ea", cursor: "pointer", userSelect: "none" }}
                      onClick={() => toggleMonth(month)}>
                      <td colSpan={totalCols} style={{ padding: "8px 16px" }}>
                        <div className="flex items-center gap-3">
                          <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{month}</span>
                          <span style={{ fontSize: 11, color: "#6b7280", background: "white", border: "1px solid #e2e5ea", borderRadius: 9999, padding: "1px 8px" }}>{rows.length} actions</span>
                          <div className="flex items-center gap-2">
                            <div style={{ width: 80, height: 5, background: "#e5e7eb", borderRadius: 9999, overflow: "hidden" }}>
                              <div style={{ height: "100%", background: "#E30613", borderRadius: 9999, width: `${pct}%`, transition: "width 0.3s" }} />
                            </div>
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>{pct}% done</span>
                          </div>
                          {!collapsed && <span style={{ marginLeft: "auto", fontSize: 11, color: "#d1d5db" }}>click to collapse</span>}
                        </div>
                      </td>
                    </tr>

                    {/* Data rows */}
                    {!collapsed && rows.map((action, idx) => {
                      const TD: React.CSSProperties = { borderBottom: "1px solid #e2e5ea", borderRight: "1px solid #e2e5ea", padding: "9px 12px", verticalAlign: "middle" };
                      const TDc: React.CSSProperties = { ...TD, textAlign: "center" };
                      const isSelected = selectedRows.has(action.id);

                      return (
                        <tr key={action.id}
                          style={{ background: isSelected ? "#fef2f2" : "white" }}
                          onMouseEnter={e => { if (!isSelected) (e.currentTarget.style.background = "#f5f7fa"); }}
                          onMouseLeave={e => { if (!isSelected) (e.currentTarget.style.background = "white"); }}
                        >
                          {/* Checkbox — admin only */}
                          {isAdmin && (
                            <td style={{ ...TDc, width: 36 }} onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRowSelect(action.id)}
                                className="accent-red-500 cursor-pointer w-3.5 h-3.5"
                              />
                            </td>
                          )}

                          {/* # */}
                          <td style={{ ...TDc, width: 40, color: "#c4c9d4", fontSize: 11, fontFamily: "monospace" }}>{idx + 1}</td>

                          {/* Month */}
                          <td style={TD} onClick={() => startEdit(action, "month")}>
                            {isEditing(action.id, "month") ? (
                              <select autoFocus value={editValue}
                                onChange={e => { setEditValue(e.target.value); saveField(action, "month", e.target.value); }}
                                className="text-xs border border-brand-400 rounded px-1.5 py-1 focus:outline-none bg-white">
                                {MONTH_ORDER.slice(5).map(m => <option key={m}>{m}</option>)}
                              </select>
                            ) : (
                              <span style={{ fontSize: 12, color: "#6b7280", cursor: "pointer", whiteSpace: "nowrap" }}>{action.month}</span>
                            )}
                          </td>

                          {/* Title */}
                          <td style={{ ...TD, minWidth: 220, position: "relative" }} onClick={() => !titlePopover && setTitlePopover(action.id)}>
                            <div className="cursor-pointer group/title">
                              <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", lineHeight: 1.4 }}>{action.title}</p>
                              {action.notes && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }} className="line-clamp-1">{action.notes}</p>}
                              <span className="hidden group-hover/title:inline-flex items-center gap-1 mt-0.5" style={{ fontSize: 11, color: "#E30613" }}>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                Edit
                              </span>
                            </div>
                            {titlePopover === action.id && (
                              <TitlePopup action={action} onSave={saveTitleAndNotes(action)} onClose={() => setTitlePopover(null)} />
                            )}
                          </td>

                          {/* Workstream */}
                          <td style={{ ...TD, whiteSpace: "nowrap" }} onClick={() => startEdit(action, "bucket")}>
                            {isEditing(action.id, "bucket") ? (
                              <select autoFocus value={editValue}
                                onChange={e => { setEditValue(e.target.value); saveField(action, "bucket", e.target.value); }}
                                className="text-xs border border-brand-400 rounded px-1.5 py-1 focus:outline-none bg-white">
                                {BUCKETS.map(b => <option key={b} value={b}>{shortBucket(b)}</option>)}
                              </select>
                            ) : (
                              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium cursor-pointer hover:opacity-80 ${BUCKET_BADGE[action.bucket] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                                {shortBucket(action.bucket)}
                              </span>
                            )}
                          </td>

                          {/* Primary Owner — multi-select */}
                          <td style={{ ...TD, position: "relative", whiteSpace: "nowrap" }}
                            onClick={e => { e.stopPropagation(); setOwnersPopover(ownersPopover === action.id ? null : action.id); }}>
                            <div style={{ cursor: "pointer", display: "flex", flexWrap: "wrap", gap: 3 }}>
                              {action.owners.length > 0
                                ? action.owners.map(o => (
                                    <span key={o} style={{ fontSize: 12, background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: 9999, fontWeight: 500 }}>{o}</span>
                                  ))
                                : <span style={{ fontSize: 12, color: "#d1d5db", fontStyle: "italic" }}>Assign…</span>
                              }
                            </div>
                            {ownersPopover === action.id && (
                              <div ref={ownersPopoverRef} className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[180px]"
                                onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Primary Owner(s)</p>
                                  <button onClick={() => setOwnersPopover(null)} className="text-gray-400 hover:text-gray-700">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                  </button>
                                </div>
                                {[...ALL_OWNERS, "RevOps Lead", "Content Manager"].map(owner => (
                                  <label key={owner} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                                    <input type="checkbox"
                                      checked={action.owners.includes(owner)}
                                      onChange={() => {
                                        const next = action.owners.includes(owner)
                                          ? action.owners.filter(o => o !== owner)
                                          : [...action.owners, owner];
                                        saveOwners(action, next);
                                      }}
                                      className="accent-brand-600 cursor-pointer w-3.5 h-3.5" />
                                    <span className="text-sm text-gray-700">{owner}</span>
                                  </label>
                                ))}
                                {action.owners.length > 0 && (
                                  <button onClick={() => { saveOwners(action, []); setOwnersPopover(null); }}
                                    className="w-full mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400 hover:text-red-500 text-left">
                                    Clear all
                                  </button>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Secondary Owner — multi-select */}
                          <td style={{ ...TD, position: "relative", whiteSpace: "nowrap" }}
                            onClick={e => { e.stopPropagation(); setOwnersPopover(ownersPopover === `sec-${action.id}` ? null : `sec-${action.id}`); }}>
                            <div style={{ cursor: "pointer", display: "flex", flexWrap: "wrap", gap: 3 }}>
                              {(action.secondary_owners ?? []).length > 0
                                ? (action.secondary_owners ?? []).map(o => (
                                    <span key={o} style={{ fontSize: 12, background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 9999, fontWeight: 500 }}>{o}</span>
                                  ))
                                : <span style={{ fontSize: 12, color: "#d1d5db", fontStyle: "italic" }}>Add…</span>
                              }
                            </div>
                            {ownersPopover === `sec-${action.id}` && (
                              <div ref={ownersPopoverRef} className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[180px]"
                                onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Secondary Owner(s)</p>
                                  <button onClick={() => setOwnersPopover(null)} className="text-gray-400 hover:text-gray-700">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                  </button>
                                </div>
                                {[...ALL_OWNERS, "RevOps Lead", "Content Manager"].map(owner => (
                                  <label key={owner} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                                    <input type="checkbox"
                                      checked={(action.secondary_owners ?? []).includes(owner)}
                                      onChange={() => {
                                        const cur = action.secondary_owners ?? [];
                                        const next = cur.includes(owner) ? cur.filter(o => o !== owner) : [...cur, owner];
                                        supabase.from("actions").update({ secondary_owners: next, updated_at: new Date().toISOString() }).eq("id", action.id).select().single()
                                          .then(({ data }) => { if (data) onActionUpdated(data as Action); });
                                      }}
                                      className="accent-blue-600 cursor-pointer w-3.5 h-3.5" />
                                    <span className="text-sm text-gray-700">{owner}</span>
                                  </label>
                                ))}
                                {(action.secondary_owners ?? []).length > 0 && (
                                  <button onClick={() => {
                                    supabase.from("actions").update({ secondary_owners: [], updated_at: new Date().toISOString() }).eq("id", action.id).select().single()
                                      .then(({ data }) => { if (data) onActionUpdated(data as Action); });
                                    setOwnersPopover(null);
                                  }} className="w-full mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400 hover:text-red-500 text-left">
                                    Clear all
                                  </button>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Due date */}
                          <td style={{ ...TD, whiteSpace: "nowrap" }} onClick={() => startEdit(action, "due_date")}>
                            {isEditing(action.id, "due_date") ? (
                              <input autoFocus type="date" value={editValue} onChange={e => setEditValue(e.target.value)}
                                onBlur={e => saveField(action, "due_date", e.target.value || null)}
                                className="text-xs border border-brand-400 rounded px-1.5 py-1 focus:outline-none bg-white" />
                            ) : (
                              <span style={{ fontSize: 12, color: "#374151", cursor: "pointer" }}>
                                {action.due_date ? format(parseISO(action.due_date), "MMM d, yyyy") : <span style={{ color: "#d1d5db", fontStyle: "italic" }}>Set date…</span>}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td style={{ ...TD, whiteSpace: "nowrap" }} onClick={() => startEdit(action, "status")}>
                            {isEditing(action.id, "status") ? (
                              <select autoFocus value={editValue}
                                onChange={e => { setEditValue(e.target.value); saveField(action, "status", e.target.value); }}
                                className="text-xs border border-brand-400 rounded px-1.5 py-1 focus:outline-none bg-white">
                                <option value="">— Select —</option>
                                {STATUSES.map(s => <option key={s}>{s}</option>)}
                              </select>
                            ) : (
                              <span
                                style={{
                                  ...(STATUS_STYLE[action.status] ?? { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }),
                                  fontSize: 12, padding: "3px 10px", borderRadius: 9999, fontWeight: 600,
                                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
                                }}
                              >
                                {action.status || "— Select —"}
                                <svg style={{ width: 10, height: 10, opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                              </span>
                            )}
                          </td>

                          {/* % complete */}
                          <td style={{ ...TDc, width: 70 }} onClick={() => startEdit(action, "percent_complete")}>
                            {isEditing(action.id, "percent_complete") ? (
                              <input autoFocus type="number" min={0} max={100} value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={e => saveField(action, "percent_complete", Number(e.target.value))}
                                onKeyDown={e => { if (e.key === "Enter") saveField(action, "percent_complete", Number((e.target as HTMLInputElement).value)); }}
                                className="w-14 text-xs border border-brand-400 rounded px-1.5 py-1 focus:outline-none bg-white text-center" />
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{action.percent_complete}%</span>
                                <div style={{ width: 40, height: 5, background: "#e5e7eb", borderRadius: 9999, overflow: "hidden" }}>
                                  <div style={{ height: "100%", borderRadius: 9999, background: action.percent_complete === 100 ? "#22c55e" : "#E30613", width: `${action.percent_complete}%` }} />
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Priority */}
                          <td style={{ ...TD, whiteSpace: "nowrap" }} onClick={() => startEdit(action, "priority")}>
                            {isEditing(action.id, "priority") ? (
                              <select autoFocus value={editValue}
                                onChange={e => { setEditValue(e.target.value); saveField(action, "priority", e.target.value); }}
                                className="text-xs border border-brand-400 rounded px-1.5 py-1 focus:outline-none bg-white">
                                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                              </select>
                            ) : (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 ${PRIORITY_COLORS[action.priority] ?? ""}`}>
                                {action.priority}
                              </span>
                            )}
                          </td>

                          {/* Notes */}
                          <td style={{ ...TD, position: "relative" }} onClick={() => !notesPopover && setNotesPopover(action.id)}>
                            <div className="cursor-pointer group/notes" style={{ minWidth: 120 }}>
                              {action.notes ? (
                                <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }} className="line-clamp-2">{action.notes}</p>
                              ) : (
                                <span style={{ fontSize: 12, color: "#d1d5db", fontStyle: "italic" }}>Add note…</span>
                              )}
                              <span className="hidden group-hover/notes:inline-flex items-center gap-1 mt-0.5" style={{ fontSize: 11, color: "#E30613" }}>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                Edit
                              </span>
                            </div>
                            {notesPopover === action.id && (
                              <NotesPopup action={action} onSave={saveNotes(action)} onClose={() => setNotesPopover(null)} />
                            )}
                          </td>

                          {/* Task */}
                          <td style={{ ...TDc, width: 48, borderRight: "none" }}>
                            <button onClick={() => onRowClick(action)} title="Open full task"
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                              style={{ color: "#9ca3af" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#E30613"; (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={totalCols} className="px-4 py-12 text-center">
                    <p className="text-gray-400 text-sm">No actions match these filters.</p>
                    {activeFilterCount > 0 && (
                      <button onClick={() => setColFilters({})} className="mt-2 text-xs text-brand-600 hover:underline">Clear all filters</button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {filtered.length}{filtered.length !== actions.length ? ` of ${actions.length}` : ""} action{filtered.length !== 1 ? "s" : ""} · click any cell to edit · click outside to save
            {isAdmin && <span className="ml-2 text-gray-300">· ☑ checkbox to select for delete</span>}
          </p>
          <p className="text-xs text-gray-300">↗ opens full task details</p>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <DeleteConfirmDialog
          count={selectedRows.size}
          onConfirm={handleDeleteSelected}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
