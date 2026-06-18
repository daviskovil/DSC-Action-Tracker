import { createClient } from "@/lib/supabase/server";
import BoardClient from "@/components/board/BoardClient";
import type { Action } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
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
    <BoardClient
      initialActions={(actions ?? []) as Action[]}
      ownerNames={ownerNames}
    />
  );
}
