import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        userName={profile?.name ?? user.email ?? ""}
        role={profile?.role ?? "member"}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
