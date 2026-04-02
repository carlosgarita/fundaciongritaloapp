import { auth } from "@/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, CalendarDays, Award } from "lucide-react";
import { HourLogService } from "@/lib/services/hour-log.service";
import { BadgeService } from "@/lib/services/badge.service";
import Link from "next/link";

export default async function PortalHomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  let pendientes = 0;
  let horasValidadasMes = 0;
  let insignias = 0;

  try {
    const [logs, badges] = await Promise.all([
      HourLogService.findAll({ volunteerId: userId }),
      BadgeService.listForUser(userId),
    ]);

    pendientes = logs.filter((l) => l.estado === "pendiente").length;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    horasValidadasMes = logs
      .filter(
        (l) =>
          l.estado === "validado" &&
          new Date(l.fecha) >= start &&
          new Date(l.fecha) <= end,
      )
      .reduce((acc, l) => acc + Number(l.horas), 0);

    insignias = badges.length;
  } catch {
    // empty
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Hola, {session?.user?.nombre || "voluntario"}
        </h1>
        <p className="text-text-secondary mt-1">
          Aquí puedes ver tus actividades, registrar horas y seguir tu impacto.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Horas validadas (mes)
              </p>
              <Clock className="h-5 w-5 text-primary-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary">
              {horasValidadasMes}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Registros pendientes
              </p>
              <CalendarDays className="h-5 w-5 text-primary-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary">{pendientes}</p>
            <p className="text-sm text-text-muted mt-1">
              Esperando validación del equipo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Insignias
              </p>
              <Award className="h-5 w-5 text-primary-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary">{insignias}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/portal/actividades"
          className="inline-flex items-center justify-center rounded-lg bg-primary-500 text-white px-4 py-2.5 text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          Ver actividades
        </Link>
        <Link
          href="/portal/horas"
          className="inline-flex items-center justify-center rounded-lg border border-border text-text-primary px-4 py-2.5 text-sm font-medium hover:bg-surface-hover transition-colors"
        >
          Registrar horas
        </Link>
      </div>
    </div>
  );
}
