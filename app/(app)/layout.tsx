import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopNav
        userName={profile?.name ?? user.email ?? ""}
        role={profile?.role ?? "member"}
      />
      <main className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
