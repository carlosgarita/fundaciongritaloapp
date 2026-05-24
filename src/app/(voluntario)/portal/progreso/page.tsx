import { auth } from "@/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  VolunteerMetricsService,
} from "@/lib/services/volunteer-metrics.service";
import { BadgeRulesService } from "@/lib/services/badge-rules.service";
import { CalendarDays, Clock, LineChart, ListTodo } from "lucide-react";

const ESTADO_INS: Record<string, string> = {
  inscrito: "Inscrito",
  confirmado: "Confirmado",
};

function fmtDate(iso: Date | string) {
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function PortalProgresoPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  let metrics: Awaited<
    ReturnType<typeof VolunteerMetricsService.computeForVolunteer>
  > | null = null;

  try {
    if (!userId) throw new Error("sin sesión");
    await BadgeRulesService.evaluateAutomaticBadgesForVolunteer(userId);
    metrics = await VolunteerMetricsService.computeForVolunteer(userId);
  } catch {
    metrics = null;
  }

  if (!userId || !metrics) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-text-primary">Tu progreso</h1>
        <p className="text-text-secondary text-sm">
          No se pudieron cargar las métricas. Vuelva a iniciar sesión.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <LineChart
              className="h-7 w-7 text-primary-500 shrink-0"
              aria-hidden
            />
            Tu progreso
          </h1>
          <p className="text-text-secondary mt-1 max-w-xl">
            Métricas usadas por el sistema para otorgar automáticamente insignias por
            horas, cantidad de actividades y tiempo en la plataforma desde su alta
            como voluntario.
          </p>
        </div>
        <Link
          href="/portal/horas"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline self-start sm:self-auto"
        >
          Ir a registrar horas
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Horas validadas (total)
              </p>
              <Clock className="h-5 w-5 text-primary-500 shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary tabular-nums">
              {metrics.horasValidadas.toLocaleString("es-CR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Actividades distintas
              </p>
              <CalendarDays className="h-5 w-5 text-primary-500 shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary tabular-nums">
              {metrics.cantidadActividades}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Inscripciones no canceladas (inscrito o confirmado)
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Días en la plataforma
              </p>
              <ListTodo className="h-5 w-5 text-primary-500 shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary tabular-nums">
              {metrics.diasEnPlataforma}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Contados desde su fecha de registro (primer día cuenta como 1).
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-text-primary">
            Actividades en las que participa
          </p>
          <p className="text-xs text-text-muted mt-1">
            Proyectos o actividades con inscripción activa que el sistema cuenta para
            insignias por número de participaciones.
          </p>
        </CardHeader>
        <CardContent>
          {metrics.actividades.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Todavía no hay inscripciones. Explore{" "}
              <Link
                href="/portal/actividades"
                className="text-primary-600 font-medium hover:underline"
              >
                actividades disponibles
              </Link>
              .
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-secondary border-b border-border text-left">
                    <th className="p-3 font-semibold text-text-primary">
                      Actividad
                    </th>
                    <th className="p-3 font-semibold text-text-primary hidden sm:table-cell">
                      Vigencia
                    </th>
                    <th className="p-3 font-semibold text-text-primary">
                      Inscripción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.actividades.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="p-3 text-text-primary">{a.nombre}</td>
                      <td className="p-3 text-text-secondary hidden sm:table-cell whitespace-nowrap">
                        {fmtDate(a.fechaInicio)} — {fmtDate(a.fechaCierre)}
                      </td>
                      <td className="p-3 text-text-secondary whitespace-nowrap">
                        {ESTADO_INS[a.estadoInscripcion] ?? a.estadoInscripcion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-text-primary">
            Historial de horas validadas
          </p>
          <p className="text-xs text-text-muted mt-1">
            Cada línea es un bloque ya aprobado por el equipo. Para insignias por
            horas se suman todos estos importes en el servidor.
          </p>
        </CardHeader>
        <CardContent>
          {metrics.historialHorasValidadas.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Aún no hay horas validadas. Cuando un administrador valide sus registros,
              aparecerán en esta lista y contarán hacia los umbrales.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-secondary border-b border-border text-left">
                    <th className="p-3 font-semibold text-text-primary">Fecha</th>
                    <th className="p-3 font-semibold text-text-primary">
                      Actividad
                    </th>
                    <th className="p-3 font-semibold text-text-primary text-right">
                      Horas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.historialHorasValidadas.map((h) => (
                    <tr
                      key={h.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="p-3 text-text-secondary whitespace-nowrap">
                        {fmtDate(h.fecha)}
                      </td>
                      <td className="p-3 text-text-primary">{h.actividadNombre}</td>
                      <td className="p-3 text-text-primary text-right tabular-nums">
                        {h.horas.toLocaleString("es-CR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 1,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
        Las insignias con criterio &quot;Especial&quot; siguen concediéndose sólo desde
        el administrador. El motor automático sólo revisa umbrales con valor mayor que
        0 para horas validadas total, número de actividades distintas y días naturales en
        la plataforma.
      </p>
    </div>
  );
}
