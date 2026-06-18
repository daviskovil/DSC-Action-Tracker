import { createClient } from "@/lib/supabase/server";
import DashboardStats from "@/components/dashboard/DashboardStats";
import MyFocusPanel from "@/components/dashboard/MyFocusPanel";
import AddActionButton from "@/components/actions/AddActionButton";
import type { Action } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: actions }, { data: users }, { data: profile }] = await Promise.all([
    supabase.from("actions").select("*").order("due_date", { ascending: true }),
    supabase.from("users").select("name").eq("active", true),
    supabase.from("users").select("name, role").eq("id", user!.id).single(),
  ]);

  const ownerNames = (users ?? []).map(u => u.name);
  const allActions = (actions ?? []) as Action[];
  const userName = profile?.name ?? user?.email ?? "";

  // My actions = actions where I am an owner
  const myActions = allActions.filter(a => a.owners.includes(userName));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sales Support Center — live overview</p>
        </div>
        <AddActionButton ownerNames={ownerNames} />
      </div>

      {/* My focus — personalized section */}
      <MyFocusPanel actions={allActions} myActions={myActions} userName={userName} />

      {/* Team-wide stats */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Team Overview</h2>
        <DashboardStats actions={allActions} />
      </div>
    </div>
  );
}
