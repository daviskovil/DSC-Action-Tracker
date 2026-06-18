import { createClient } from "@/lib/supabase/server";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AddActionButton from "@/components/actions/AddActionButton";
import type { Action } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: actions } = await supabase
    .from("actions")
    .select("*")
    .order("due_date", { ascending: true });

  const { data: users } = await supabase
    .from("users")
    .select("name")
    .eq("active", true);

  const ownerNames = (users ?? []).map((u) => u.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">DSC action overview — live</p>
        </div>
        <AddActionButton ownerNames={ownerNames} />
      </div>

      <DashboardStats actions={(actions ?? []) as Action[]} />
    </div>
  );
}
