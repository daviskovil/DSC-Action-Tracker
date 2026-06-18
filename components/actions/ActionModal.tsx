"use client";

import { useState, useEffect, useRef } from "react";
import { BUCKETS, STATUSES, PRIORITIES, MONTHS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/logActivity";
import type { Action } from "@/lib/types";

// ── Mini formatting toolbar ──────────────────────────────────────────────────
function FormatToolbar({ textareaRef, value, onChange }: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string | null) => void;
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
    if (value.substring(lineStart).startsWith(prefix)) {
      const newVal = value.substring(0, lineStart) + value.substring(lineStart + prefix.length);
      onChange(newVal || null);
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(Math.max(0, start - prefix.length), Math.max(0, start - prefix.length)); });
    } else {
      const newVal = value.substring(0, lineStart) + prefix + value.substring(lineStart);
      onChange(newVal);
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + prefix.length, start + prefix.length); });
    }
  }

  const btn = "inline-flex items-center justify-center px-2 py-1 rounded border border-gray-200 bg-white text-xs text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors";

  return (
    <div className="flex flex-wrap gap-1.5 mb-1.5">
      <button type="button" className={btn} title="Bullet" onClick={() => prefixLine("• ")}>• Bullet</button>
      <button type="button" className={btn} title="Numbered" onClick={() => prefixLine("1. ")}>1. Number</button>
      <button type="button" className={`${btn} font-bold`} title="Bold" onClick={() => wrapSelection("**", "**")}>B</button>
      <button type="button" className={`${btn} italic`} title="Italic" onClick={() => wrapSelection("_", "_")}>I</button>
      <button type="button" className={btn} title="Divider" onClick={() => {
        const el = textareaRef.current;
        if (!el) return;
        const pos = el.selectionStart;
        const newVal = value.substring(0, pos) + "\n---\n" + value.substring(pos);
        onChange(newVal);
        requestAnimationFrame(() => { el.focus(); el.setSelectionRange(pos + 5, pos + 5); });
      }}>── Line</button>
    </div>
  );
}

interface Props {
  action?: Action | null;
  ownerNames: string[];
  onSaved: (action: Action) => void;
  onDeleted?: (id: string) => void;
  onClose: () => void;
}

const BLANK: Omit<Action, "id" | "created_at" | "updated_at" | "created_by"> = {
  month: "June",
  title: "",
  bucket: BUCKETS[0],
  owners: [],
  secondary_owners: [],
  due_date: null,
  status: "Pending",
  percent_complete: 0,
  priority: "Medium",
  notes: null,
};

export default function ActionModal({ action, ownerNames, onSaved, onDeleted, onClose }: Props) {
  const isNew = !action;
  const [form, setForm] = useState(action ? { ...action } : { ...BLANK });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // No click-outside or Escape to close — form data should never be lost accidentally.
  // Use the × button or Cancel to dismiss.

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleOwner(name: string) {
    setForm((f) => ({
      ...f,
      owners: f.owners.includes(name)
        ? f.owners.filter((o) => o !== name)
        : [...f.owners, name],
    }));
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("Action title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      month: form.month,
      title: form.title.trim(),
      bucket: form.bucket,
      owners: form.owners,
      due_date: form.due_date || null,
      status: form.status,
      percent_complete: form.percent_complete,
      priority: form.priority,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      const { data, error: err } = await supabase
        .from("actions")
        .insert({ ...payload, status: "Not Started", percent_complete: 0 })
        .select()
        .single();
      if (err || !data) {
        setError(err?.message ?? "Failed to create action.");
      } else {
        await logActivity("action_created", `Created action: "${form.title.trim()}"`, { action_id: (data as Action).id });
        onSaved(data as Action);
      }
    } else {
      const { data, error: err } = await supabase
        .from("actions")
        .update(payload)
        .eq("id", action!.id)
        .select()
        .single();
      if (err || !data) {
        setError(err?.message ?? "Failed to save action.");
      } else {
        await logActivity("action_updated", `Updated action: "${form.title.trim()}"`, { action_id: action!.id });
        onSaved(data as Action);
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!action) return;
    setSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase.from("actions").delete().eq("id", action.id);
    if (err) {
      setError(err.message);
      setSaving(false);
    } else {
      await logActivity("action_deleted", `Deleted action: "${action.title}"`, { action_id: action.id });
      onDeleted?.(action.id);
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end"
    >
      <div className="bg-white h-full w-full max-w-lg shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-gray-900">{isNew ? "New Action" : "Edit Action"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 py-5 space-y-4">
          <Field label="Title *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
              placeholder="Describe the action…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Month">
              <select value={form.month} onChange={(e) => set("month", e.target.value)} className={inputCls}>
                {MONTHS.map((m) => <option key={m}>{m}</option>)}
                <option value={form.month}>{form.month}</option>
              </select>
            </Field>
            <Field label="Due Date">
              <input
                type="date"
                value={form.due_date ?? ""}
                onChange={(e) => set("due_date", e.target.value || null)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Workstream">
            <select value={form.bucket} onChange={(e) => set("bucket", e.target.value)} className={inputCls}>
              {BUCKETS.map((b) => <option key={b} value={b}>{b.replace(/^Bucket \d+ - /, "")}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className={inputCls}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <Field label="% Complete">
            <input
              type="number"
              min={0}
              max={100}
              value={form.percent_complete}
              onChange={(e) => set("percent_complete", Number(e.target.value))}
              className={inputCls}
            />
          </Field>

          <Field label="Owner(s)">
            <div className="flex flex-wrap gap-2">
              {ownerNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleOwner(name)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    form.owners.includes(name)
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Notes">
            <FormatToolbar
              textareaRef={notesRef}
              value={form.notes ?? ""}
              onChange={(v) => set("notes", v)}
            />
            <textarea
              ref={notesRef}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value || null)}
              className={`${inputCls} resize-none h-24 font-mono text-xs`}
              placeholder={"• Key context\n• Dependencies\n• Definition of done"}
            />
          </Field>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white sticky bottom-0">
          <div>
            {!isNew && onDeleted && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600">Confirm delete?</span>
                  <button onClick={handleDelete} disabled={saving} className="text-xs text-red-600 font-semibold hover:underline">Yes</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500 hover:underline">No</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              )
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving…" : isNew ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white";
