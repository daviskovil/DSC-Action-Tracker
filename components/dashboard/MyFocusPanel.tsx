"use client";

import { isAfter, parseISO, startOfToday, format } from "date-fns";
import { STATUS_COLORS, PRIORITY_COLORS, BUCKET_BADGE } from "@/lib/constants";
import type { Action } from "@/lib/types";
import Link from "next/link";

interface Props {
  actions: Action[];      // all team actions (for context)
  myActions: Action[];    // actions owned by the current user
  userName: string;
}

function shortBucket(b: string) {
  return b.replace(/^Bucket \d+ - /, "");
}

function greeting(name: string) {
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${greet}, ${name.split(" ")[0]} 👋`;
}

export default function MyFocusPanel({ myActions, userName }: Props) {
  const today = startOfToday();

  const myOpen     = myActions.filter(a => a.status !== "Done");
  const myOverdue  = myActions.filter(a => a.due_date && a.status !== "Done" && isAfter(today, parseISO(a.due_date)));
  const myBlocked  = myActions.filter(a => a.status === "Blocked");
  const myCritical = myActions.filter(a => a.status !== "Done" && (a.priority === "Critical" || a.priority === "High"));
  const myDone     = myActions.filter(a => a.status === "Done");

  // Priority order for display: overdue first, then critical, then in-progress, then not started
  const prioritized = [...myOpen].sort((a, b) => {
    const aOverdue = a.due_date && isAfter(today, parseISO(a.due_date)) ? 0 : 1;
    const bOverdue = b.due_date && isAfter(today, parseISO(b.due_date)) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    const priorityOrder = ["Critical","High","Medium","Low"];
    return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
  }).slice(0, 6); // show top 6

  const statCards = [
    { label: "My Open Actions",  value: myOpen.length,     color: "text-gray-900",    bg: "bg-gray-100",   icon: "📋" },
    { label: "Overdue",          value: myOverdue.length,  color: "text-gray-900", bg: "bg-gray-100", icon: "⚠️" },
    { label: "Critical / High",  value: myCritical.length, color: "text-gray-900", bg: "bg-gray-100", icon: "🔥" },
    { label: "Blocked",          value: myBlocked.length,  color: "text-gray-900", bg: "bg-gray-100", icon: "🚫" },
    { label: "Completed",        value: myDone.length,     color: "text-green-600",   bg: "bg-green-100",  icon: "✅" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5">
        <p className="text-lg font-semibold text-white">{greeting(userName)}</p>
        {myOpen.length === 0 ? (
          <p className="text-gray-300 text-sm mt-1">You have no open actions — great work! 🎉</p>
        ) : (
          <p className="text-gray-300 text-sm mt-1">
            You have <span className="text-white font-semibold">{myOpen.length} open action{myOpen.length !== 1 ? "s" : ""}</span>
            {myOverdue.length > 0 && <span className="text-gray-300 font-semibold"> · {myOverdue.length} overdue</span>}
            {myCritical.length > 0 && <span className="text-orange-400 font-semibold"> · {myCritical.length} critical or high priority</span>}
          </p>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* My stat mini-cards */}
        <div className="grid grid-cols-5 gap-3">
          {statCards.map(s => (
            <div key={s.label} className={`rounded-xl p-3 ${s.bg}`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-600 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Priority actions table */}
        {prioritized.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Your Priority Actions</h3>
              <Link href="/board" className="text-xs text-brand-600 hover:underline font-medium">
                View all on board →
              </Link>
            </div>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Workstream</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Due</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">%</th>
                  </tr>
                </thead>
                <tbody>
                  {prioritized.map((action, i) => {
                    const overdue = action.due_date && isAfter(today, parseISO(action.due_date));
                    return (
                      <tr key={action.id} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-sm leading-snug text-gray-900">
                            {action.title}
                          </p>
                          {action.notes && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{action.notes}</p>}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BUCKET_BADGE[action.bucket] ?? ""}`}>
                            {shortBucket(action.bucket)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs whitespace-nowrap text-gray-500">
                          {action.due_date ? format(parseISO(action.due_date), "MMM d") : "—"}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[action.status] ?? ""}`}>
                            {action.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[action.priority] ?? ""}`}>
                            {action.priority}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${action.percent_complete === 100 ? "bg-green-500" : "bg-brand-500"}`}
                                style={{ width: `${action.percent_complete}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{action.percent_complete}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {myOpen.length > 6 && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                Showing top 6 of {myOpen.length} open actions ·{" "}
                <Link href="/board" className="text-brand-600 hover:underline">See all on Action Board</Link>
              </p>
            )}
          </div>
        )}

        {myOpen.length === 0 && (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-500 text-sm">No open actions assigned to you right now.</p>
            <p className="text-gray-400 text-xs mt-1">Check the Action Board to pick up new work.</p>
          </div>
        )}
      </div>
    </div>
  );
}
