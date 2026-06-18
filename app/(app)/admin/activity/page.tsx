import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { format, isToday, isYesterday, formatDistanceToNow, parseISO } from "date-fns";

export const dynamic = "force-dynamic";

interface LogEntry {
  id: number;
  user_name: string;
  action_type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function actionIcon(type: string) {
  switch (type) {
    case "login":          return { icon: "→", bg: "#dcfce7", color: "#16a34a" };
    case "action_created": return { icon: "+", bg: "#dbeafe", color: "#2563eb" };
    case "action_updated": return { icon: "✎", bg: "#fef9c3", color: "#ca8a04" };
    case "action_deleted": return { icon: "✕", bg: "#fee2e2", color: "#dc2626" };
    default:               return { icon: "·", bg: "#f3f4f6", color: "#6b7280" };
  }
}

function relativeTime(ts: string) {
  const date = parseISO(ts);
  if (isToday(date)) return formatDistanceToNow(date, { addSuffix: true });
  if (isYesterday(date)) return "yesterday";
  return format(date, "MMM d");
}

function groupByMonth(logs: LogEntry[]) {
  const groups: Record<string, LogEntry[]> = {};
  for (const log of logs) {
    const key = format(parseISO(log.created_at), "MMMM yyyy");
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  }
  return groups;
}

export default async function ActivityPage() {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Admin check
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/board");

  // Fetch logs
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const grouped = groupByMonth((logs ?? []) as LogEntry[]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-sm text-gray-500 mt-0.5">System activity and audit trail · Admin only</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No activity logged yet. Logs will appear as the team uses the app.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 160px 180px", padding: "10px 16px", background: "#f7f8fa", borderBottom: "2px solid #e2e5ea" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>WHEN</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>ACTIVITY</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>WHO</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>DATE, TIME</span>
          </div>

          {/* Groups */}
          {Object.entries(grouped).map(([month, entries]) => (
            <div key={month}>
              {/* Month header */}
              <div style={{ padding: "8px 16px", background: "#f0f2f5", borderTop: "1px solid #e2e5ea", borderBottom: "1px solid #e2e5ea", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>↑ {month}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>· {entries.length} entries</span>
              </div>

              {/* Rows */}
              {entries.map((log, i) => {
                const { icon, bg, color } = actionIcon(log.action_type);
                return (
                  <div key={log.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "140px 1fr 160px 180px",
                      padding: "12px 16px",
                      borderBottom: i < entries.length - 1 ? "1px solid #f3f4f6" : "none",
                      alignItems: "center",
                    }}
                  >
                    {/* When */}
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{relativeTime(log.created_at)}</span>

                    {/* Activity */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 28, height: 28, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {icon}
                      </span>
                      <span style={{ fontSize: 13, color: "#111827" }}>{log.description}</span>
                    </div>

                    {/* Who */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 9999,
                        background: log.action_type === "login" ? "#dcfce7" : "#f3f4f6",
                        color: log.action_type === "login" ? "#15803d" : "#374151"
                      }}>
                        {log.user_name}
                      </span>
                    </div>

                    {/* Date, Time */}
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>
                      {format(parseISO(log.created_at), "do MMM, h:mm a")}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
