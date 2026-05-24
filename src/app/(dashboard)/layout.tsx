import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      deletedAt: true,
      role: true,
      nombre: true,
      apellido: true,
      email: true,
      avatarUrl: true,
    },
  });
  if (!me || me.deletedAt) redirect("/login");
  if (me.role !== "admin") redirect("/portal");

  const profile = {
    nombre: me.nombre ?? "",
    apellido: me.apellido ?? "",
    email: me.email ?? "",
    avatarUrl: me.avatarUrl,
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
