"use client";

import { isAfter, parseISO, startOfToday } from "date-fns";
import { BUCKETS, STATUSES, BUCKET_BADGE } from "@/lib/constants";
import type { Action } from "@/lib/types";

interface Props {
  actions: Action[];
}

export default function DashboardStats({ actions }: Props) {
  const today = startOfToday();

  const overdue = actions.filter(
    (a) =>
      a.due_date &&
      a.status !== "Done" &&
      isAfter(today, parseISO(a.due_date))
  ).length;

  // Status breakdown
  const byStatus = STATUSES.map((s) => ({
    label: s,
    count: actions.filter((a) => a.status === s).length,
  }));

  // Bucket progress
  const byBucket = BUCKETS.map((b) => {
    const inBucket = actions.filter((a) => a.bucket === b);
    const done = inBucket.filter((a) => a.status === "Done").length;
    const pct = inBucket.length ? Math.round((done / inBucket.length) * 100) : 0;
    return { label: b, total: inBucket.length, done, pct };
  });

  // Month progress
  const months = [...new Set(actions.map((a) => a.month))].sort();
  const byMonth = months.map((m) => {
    const inMonth = actions.filter((a) => a.month === m);
    const done = inMonth.filter((a) => a.status === "Done").length;
    const pct = inMonth.length ? Math.round((done / inMonth.length) * 100) : 0;
    return { label: m, total: inMonth.length, done, pct };
  });

  // Owner open items
  const ownerMap: Record<string, number> = {};
  actions
    .filter((a) => a.status !== "Done")
    .forEach((a) =>
      a.owners.forEach((o) => {
        ownerMap[o] = (ownerMap[o] ?? 0) + 1;
      })
    );
  const byOwner = Object.entries(ownerMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Top row: total + status breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Actions" value={actions.length} />
        <StatCard label="Overdue" value={overdue} highlight={overdue > 0} />
        {byStatus.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.count} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bucket progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Progress by Bucket</h2>
          <div className="space-y-4">
            {byBucket.map((b) => (
              <ProgressRow key={b.label} label={b.label} pct={b.pct} sub={`${b.done}/${b.total}`} />
            ))}
          </div>
        </div>

        {/* Month progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Progress by Month</h2>
          <div className="space-y-4">
            {byMonth.map((m) => (
              <ProgressRow key={m.label} label={m.label} pct={m.pct} sub={`${m.done}/${m.total}`} />
            ))}
          </div>
        </div>

        {/* Owner open items */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Open Items by Owner</h2>
          <div className="space-y-2">
            {byOwner.length === 0 && (
              <p className="text-sm text-gray-400">All done!</p>
            )}
            {byOwner.map(([owner, count]) => (
              <div key={owner} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{owner}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "bg-red-50 border-red-200"
          : "bg-white border-gray-200"
      }`}
    >
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function ProgressRow({
  label,
  pct,
  sub,
}: {
  label: string;
  pct: number;
  sub: string;
}) {
  const shortLabel = label.replace(/^Bucket \d+ - /, "");
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{shortLabel}</span>
        <span className="text-gray-400">{sub} done · {pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
