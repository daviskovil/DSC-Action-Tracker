import Image from "next/image";
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
      {/* Header with logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="DataSkate"
            width={120}
            height={30}
            className="object-contain"
            priority
          />
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">DSC Dashboard</h1>
            <p className="text-sm text-gray-500">Sales Support Center — live overview</p>
          </div>
        </div>
        <AddActionButton ownerNames={ownerNames} />
      </div>

      <DashboardStats actions={(actions ?? []) as Action[]} />
    </div>
  );
}
