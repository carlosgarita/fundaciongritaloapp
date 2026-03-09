import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/login");

  const profile = {
    nombre: session.user.nombre ?? "",
    apellido: session.user.apellido ?? "",
    email: session.user.email ?? "",
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar profile={profile} />
      <main id="main-content" className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
