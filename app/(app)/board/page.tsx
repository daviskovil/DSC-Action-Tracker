import { createClient } from "@/lib/supabase/server";
import BoardClient from "@/components/board/BoardClient";
import type { Action } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: actions }, { data: users }, { data: profile }] = await Promise.all([
    supabase.from("actions").select("*").order("due_date", { ascending: true }),
    supabase.from("users").select("name").eq("active", true),
    user ? supabase.from("users").select("role").eq("id", user.id).single() : Promise.resolve({ data: null }),
  ]);

  const ownerNames = (users ?? []).map((u) => u.name);
  const role = profile?.role ?? "member";

  return (
    <BoardClient
      initialActions={(actions ?? []) as Action[]}
      ownerNames={ownerNames}
      role={role}
    />
  );
}
