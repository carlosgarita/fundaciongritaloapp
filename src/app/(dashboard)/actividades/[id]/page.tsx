import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { ActivityService } from "@/lib/services/activity.service";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityImage } from "@/components/activity-image";

const TIPO_LABELS: Record<string, string> = {
  social: "Social",
  comunitario: "Comunitario",
  educacion: "Educación",
  ambiente: "Ambiente",
  salud: "Salud",
  comunicacion: "Comunicación",
  logistica: "Logística",
  otro: "Otro",
};

const ACTIVITY_ESTADO_LABELS: Record<string, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const ESTADO_COLORS: Record<string, string> = {
  borrador: "bg-surface-hover text-text-secondary",
  publicada: "bg-success-surface text-accent-green",
  finalizada: "bg-primary-50 text-primary-700",
  cancelada: "bg-error-surface text-accent-red",
};

const VOLUNTARIO_ESTADO_LABELS: Record<string, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  pendiente: "Pendiente",
};

const ENROLLMENT_LABELS: Record<string, string> = {
  inscrito: "Inscrito",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

function formatDate(iso: Date | string) {
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActividadAdminDetailPage({ params }: PageProps) {
  const { id } = await params;

  const actividad = await ActivityService.findAdminDetail(id);
  if (!actividad) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/actividades"
          className="mb-3 inline-flex h-8 items-center gap-2 rounded-lg px-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a actividades
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-4 min-w-0">
            <ActivityImage
              nombre={actividad.nombre}
              imagenUrl={actividad.imagenUrl}
              className="h-20 w-20"
              initialsClassName="bg-primary-100 text-primary-700 text-base"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-text-primary break-words">
                {actividad.nombre}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                  {TIPO_LABELS[actividad.tipo] ?? actividad.tipo}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${ESTADO_COLORS[actividad.estado] ?? ""}`}
                >
                  {ACTIVITY_ESTADO_LABELS[actividad.estado] ?? actividad.estado}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {actividad.descripcion.trim() ? (
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Descripción
              </h2>
              <p className="mt-2 text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                {actividad.descripcion}
              </p>
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-secondary p-4">
              <CalendarDays className="h-9 w-9 shrink-0 text-primary-500" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Vigencia
                </p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {formatDate(actividad.fechaInicio)} →{" "}
                  {formatDate(actividad.fechaCierre)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-secondary p-4">
              <Users className="h-9 w-9 shrink-0 text-primary-500" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Cupos
                </p>
                <p className="mt-1 text-lg font-bold text-text-primary">
                  {actividad.cuposDisponibles} disponibles ·{" "}
                  {actividad.cuposTotales} totales
                </p>
              </div>
            </div>
          </div>

          {actividad.ubicacion.trim() ? (
            <div className="flex items-start gap-2 text-sm text-text-secondary">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{actividad.ubicacion}</span>
            </div>
          ) : null}

          <div className="rounded-xl border border-border bg-surface-secondary p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-3">
              Registro de horas en esta actividad
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Clock className="h-8 w-8 shrink-0 text-primary-500" />
                <div>
                  <p className="text-xs text-text-muted">Horas validadas</p>
                  <p className="text-xl font-bold text-text-primary">
                    {actividad.horasValidadas.toLocaleString("es-CR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                  </p>
                </div>
              </div>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>
                  Registros pendientes de validar:{" "}
                  <span className="font-medium text-text-primary">
                    {actividad.registrosPendientes}
                  </span>
                </li>
                <li>
                  Validados ({actividad.registrosValidadosCount} registros) ·
                  rechazados:{" "}
                  <span className="font-medium text-text-primary">
                    {actividad.registrosRechazadosCount}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-sm border-t border-border pt-4">
            <p className="text-text-muted">
              Creador:{" "}
              {actividad.createdBy ? (
                <>
                  <span className="text-text-primary font-medium">
                    {actividad.createdBy.nombre} {actividad.createdBy.apellido}
                  </span>
                  <span className="text-text-secondary">
                    {" "}
                    ({actividad.createdBy.email})
                  </span>
                </>
              ) : (
                <span className="text-text-secondary">Sin asignar</span>
              )}
            </p>
            <p className="mt-2 text-xs text-text-muted">
              Alta en sistema: {formatDate(actividad.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-bold text-text-primary flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-500 shrink-0" />
          Voluntarios inscritos ({actividad.enrollments.length})
        </h2>
        {actividad.enrollments.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-text-secondary">
              Aún no hay voluntarios inscritos en esta actividad.
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Voluntario
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden sm:table-cell">
                    Contacto
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">
                    Cuenta
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-text-secondary">
                    Inscripción
                  </th>
                </tr>
              </thead>
              <tbody>
                {actividad.enrollments.map((en) => (
                  <tr
                    key={en.id}
                    className="border-b border-border last:border-0 hover:bg-surface-hover/50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <Link
                          href={`/voluntarios/${en.volunteer.id}`}
                          className="font-medium text-text-primary hover:text-primary-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
                        >
                          {en.volunteer.nombre} {en.volunteer.apellido}
                        </Link>
                        {en.volunteer.cedula ? (
                          <p className="text-xs text-text-muted mt-0.5">
                            Cédula: {en.volunteer.cedula}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">
                      {en.volunteer.email}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-text-secondary">
                        {VOLUNTARIO_ESTADO_LABELS[en.volunteer.estado] ??
                          en.volunteer.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex rounded-full bg-surface-secondary px-2 py-1 text-xs font-medium text-text-primary">
                        {ENROLLMENT_LABELS[en.estado] ?? en.estado}
                      </span>
                      <p className="mt-1 text-xs text-text-muted">
                        desde {formatDate(en.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
