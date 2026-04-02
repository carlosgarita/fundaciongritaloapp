import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Award } from "lucide-react";
import { VolunteerService } from "@/lib/services/volunteer.service";
import { BadgeService } from "@/lib/services/badge.service";
import { prisma } from "@/lib/prisma";
import { AssignBadgeForm } from "@/components/assign-badge-form";

export default async function BadgesAdminPage() {
  let volunteers: Awaited<ReturnType<typeof VolunteerService.findAll>> = [];
  let badges: Awaited<ReturnType<typeof BadgeService.findAll>> = [];
  let assignments: {
    id: string;
    earnedAt: Date;
    user: { nombre: string; apellido: string; email: string };
    badge: { nombre: string; icono: string };
  }[] = [];

  try {
    const [v, b] = await Promise.all([
      VolunteerService.findAll(),
      BadgeService.findAll(),
    ]);
    volunteers = v;
    badges = b;

    assignments = await prisma.userBadge.findMany({
      include: {
        user: {
          select: { nombre: true, apellido: true, email: true },
        },
        badge: { select: { nombre: true, icono: true } },
      },
      orderBy: { earnedAt: "desc" },
      take: 50,
    });
  } catch {
    volunteers = [];
    badges = [];
    assignments = [];
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Award className="h-7 w-7 text-primary-500" aria-hidden />
          Insignias
        </h1>
        <p className="text-text-secondary mt-1">
          Asignación manual a voluntarios. Las reglas automáticas se pueden
          añadir más adelante.
        </p>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-text-secondary">
            Asignar insignia
          </p>
        </CardHeader>
        <CardContent>
          <AssignBadgeForm
            volunteers={volunteers.map((u) => ({
              id: u.id,
              nombre: u.nombre,
              apellido: u.apellido,
              email: u.email,
            }))}
            badges={badges.map((b) => ({
              id: b.id,
              nombre: b.nombre,
              icono: b.icono,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-text-secondary">
            Catálogo ({badges.length})
          </p>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-text-secondary text-sm">
              No hay insignias. Añade registros en la tabla{" "}
              <code className="text-xs bg-surface-secondary px-1 rounded">
                Badge
              </code>{" "}
              o ejecuta el seed del proyecto.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((b) => (
                <li
                  key={b.id}
                  className="rounded-lg border border-border p-4 flex gap-3"
                >
                  <span className="text-2xl" aria-hidden>
                    {b.icono}
                  </span>
                  <div>
                    <p className="font-medium text-text-primary">{b.nombre}</p>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {b.descripcion}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-text-secondary">
            Últimas asignaciones
          </p>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-text-secondary text-sm">
              Aún no hay insignias asignadas.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-secondary border-b border-border text-left">
                    <th className="p-3 font-semibold text-text-primary">
                      Voluntario
                    </th>
                    <th className="p-3 font-semibold text-text-primary">
                      Insignia
                    </th>
                    <th className="p-3 font-semibold text-text-primary">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="p-3 text-text-primary">
                        {a.user.nombre} {a.user.apellido}
                      </td>
                      <td className="p-3">
                        {a.badge.icono} {a.badge.nombre}
                      </td>
                      <td className="p-3 text-text-secondary">
                        {new Date(a.earnedAt).toLocaleDateString("es")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
