"use client";

import { useState } from "react";
import { isAfter, parseISO, startOfToday, format } from "date-fns";
import { BUCKET_BADGE, STATUS_COLORS, PRIORITY_COLORS } from "@/lib/constants";
import type { Action } from "@/lib/types";

type SortKey = keyof Action;

interface Props {
  actions: Action[];
  onRowClick: (action: Action) => void;
}

export default function ActionTable({ actions, onRowClick }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("due_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...actions].sort((a, b) => {
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    const cmp = String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const today = startOfToday();

  const cols: { key: SortKey; label: string }[] = [
    { key: "month", label: "Month" },
    { key: "title", label: "Action" },
    { key: "bucket", label: "Bucket" },
    { key: "owners", label: "Owner(s)" },
    { key: "due_date", label: "Due Date" },
    { key: "status", label: "Status" },
    { key: "percent_complete", label: "% Done" },
    { key: "priority", label: "Priority" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {cols.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:text-gray-900 whitespace-nowrap select-none"
                >
                  {col.label}{" "}
                  {sortKey === col.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((action) => {
              const isOverdue =
                action.due_date &&
                action.status !== "Done" &&
                isAfter(today, parseISO(action.due_date));
              return (
                <tr
                  key={action.id}
                  onClick={() => onRowClick(action)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                    isOverdue ? "border-l-4 border-l-red-400" : ""
                  }`}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600">{action.month}</td>
                  <td className="px-3 py-2 max-w-xs">
                    <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-900"}>
                      {action.title}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${BUCKET_BADGE[action.bucket] ?? ""}`}>
                      {action.bucket.replace(/^Bucket 0(\d) - /, "B$1 ")}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                    {action.owners.join(", ")}
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap ${isOverdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                    {action.due_date ? format(parseISO(action.due_date), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[action.status] ?? ""}`}>
                      {action.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 text-center">
                    {action.percent_complete}%
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${PRIORITY_COLORS[action.priority] ?? ""}`}>
                      {action.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-500 max-w-xs truncate">
                    {action.notes ?? "—"}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                  No actions match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
