import { redirect } from "next/navigation";
import { getAuthUser, getCurrentUser } from "@/lib/supabase/auth-helpers";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const profile = await getCurrentUser();
  if (!profile || profile.role !== "admin") redirect("/login");

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar profile={profile} />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
