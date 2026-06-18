import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminUsersClient from "@/components/admin/AdminUsersClient";
import type { UserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  return <AdminUsersClient users={(users ?? []) as UserProfile[]} />;
}
