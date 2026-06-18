import { createClient } from "@/lib/supabase/client";

export type ActivityType =
  | "login"
  | "action_created"
  | "action_updated"
  | "action_deleted";

export async function logActivity(
  actionType: ActivityType,
  description: string,
  metadata?: Record<string, unknown>
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();

    await supabase.from("activity_logs").insert({
      user_id:     user.id,
      user_name:   profile?.name ?? user.email ?? "Unknown",
      action_type: actionType,
      description,
      metadata:    metadata ?? null,
    });
  } catch {
    // Never let logging break the app
  }
}
