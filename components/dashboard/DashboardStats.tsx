"use client";

import { isAfter, parseISO, startOfToday } from "date-fns";
import { BUCKETS } from "@/lib/constants";
import type { Action } from "@/lib/types";

interface Props {
  actions: Action[];
}

export default function DashboardStats({ actions }: Props) {
  const today = startOfToday();

  const overdue = actions.filter(
    (a) => a.due_date && a.status !== "Done" && isAfter(today, parseISO(a.due_date))
  ).length;

  const done = actions.filter((a) => a.status === "Done").length;
  const inProgress = actions.filter((a) => a.status === "In Progress").length;
  const blocked = actions.filter((a) => a.status === "Blocked").length;
  const notStarted = actions.filter((a) => a.status === "Not Started").length;

  // Bucket progress
  const byBucket = BUCKETS.map((b) => {
    const inBucket = actions.filter((a) => a.bucket === b);
    const doneBucket = inBucket.filter((a) => a.status === "Done").length;
    const pct = inBucket.length ? Math.round((doneBucket / inBucket.length) * 100) : 0;
    return { label: b, total: inBucket.length, done: doneBucket, pct };
  });

  // Month progress
  const months = [...new Set(actions.map((a) => a.month))].sort();
  const byMonth = months.map((m) => {
    const inMonth = actions.filter((a) => a.month === m);
    const doneMonth = inMonth.filter((a) => a.status === "Done").length;
    const pct = inMonth.length ? Math.round((doneMonth / inMonth.length) * 100) : 0;
    return { label: m, total: inMonth.length, done: doneMonth, pct };
  });

  // Owner open items
  const ownerMap: Record<string, number> = {};
  actions
    .filter((a) => a.status !== "Done")
    .forEach((a) => a.owners.forEach((o) => { ownerMap[o] = (ownerMap[o] ?? 0) + 1; }));
  const byOwner = Object.entries(ownerMap).sort((a, b) => b[1] - a[1]);

  const statCards = [
    {
      label: "Total Actions",
      value: actions.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      iconBg: "bg-gray-100 text-gray-500",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: overdue > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400",
      highlight: overdue > 0,
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      label: "Blocked",
      value: blocked,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      iconBg: "bg-orange-100 text-orange-600",
    },
    {
      label: "Done",
      value: done,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "bg-green-100 text-green-600",
    },
    {
      label: "Not Started",
      value: notStarted,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
      iconBg: "bg-gray-100 text-gray-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`bg-white rounded-xl border p-4 ${
              s.highlight ? "border-red-200" : "border-gray-200"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.iconBg}`}>
              {s.icon}
            </div>
            <p className={`text-2xl font-bold ${s.highlight ? "text-brand-600" : "text-gray-900"}`}>
              {s.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bucket progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Progress by Bucket</h2>
          <div className="space-y-4">
            {byBucket.map((b, i) => (
              <ProgressRow
                key={b.label}
                label={b.label.replace(/^Bucket 0\d - /, "")}
                pct={b.pct}
                sub={`${b.done}/${b.total} done`}
                color={["bg-indigo-500", "bg-sky-500", "bg-emerald-500"][i]}
              />
            ))}
          </div>
        </div>

        {/* Month progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Progress by Month</h2>
          <div className="space-y-4">
            {byMonth.map((m) => (
              <ProgressRow
                key={m.label}
                label={m.label}
                pct={m.pct}
                sub={`${m.done}/${m.total} done`}
                color="bg-brand-500"
              />
            ))}
          </div>
        </div>

        {/* Owner workload */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Open Items by Owner</h2>
          {byOwner.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-gray-400">
              <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">All done!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {byOwner.map(([owner, count]) => {
                const max = byOwner[0][1];
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={owner}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{owner}</span>
                      <span className="text-gray-500">{count} open</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  pct,
  sub,
  color,
}: {
  label: string;
  pct: number;
  sub: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-400 text-xs">{sub} · {pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
