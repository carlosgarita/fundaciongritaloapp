import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Info,
  MapPin,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { ActivityService } from "@/lib/services/activity.service";
import { Card, CardContent } from "@/components/ui/card";
import { EnrollActivityButton } from "@/components/enroll-activity-button";
import { UnenrollSelfButton } from "@/components/unenroll-self-button";
import {
  UNENROLL_CLOSED_MESSAGE,
  canVolunteerUnenroll,
  isActivityClosedForEnrollment,
  unenrollCutoffFor,
} from "@/lib/enrollment-policy";

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

const ENROLLMENT_LABELS: Record<string, string> = {
  inscrito: "Inscrito",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

function formatLongDate(iso: Date | string) {
  return new Date(iso).toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(iso: Date | string) {
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalActividadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const activo = session.user.estado === "activo";

  const actividad = await ActivityService.findDetailForVolunteer(id, userId);
  if (!actividad) notFound();

  const enrollment = actividad.enrollments[0] ?? null;
  const isEnrolled = enrollment !== null && enrollment.estado !== "cancelado";
  const canUnenroll = canVolunteerUnenroll(actividad.fechaInicio);
  const cutoffDate = unenrollCutoffFor(actividad.fechaInicio);
  const isPublished = actividad.estado === "publicada";
  const isCancelled = actividad.estado === "cancelada";
  const isFinished = actividad.estado === "finalizada";
  const isExpired = isActivityClosedForEnrollment(actividad.fechaCierre);
  const sinCupos = actividad.cuposDisponibles <= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link
          href="/portal/actividades"
          className="mb-3 inline-flex h-8 items-center gap-2 rounded-lg px-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a actividades
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {actividad.nombre}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-600">
                {TIPO_LABELS[actividad.tipo] ?? actividad.tipo}
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${ESTADO_COLORS[actividad.estado] ?? ""}`}
              >
                {ACTIVITY_ESTADO_LABELS[actividad.estado] ?? actividad.estado}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-5 pt-6">
          {actividad.descripcion?.trim() ? (
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Descripción
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {actividad.descripcion}
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-secondary p-4">
              <CalendarDays className="h-9 w-9 shrink-0 text-primary-500" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Fecha
                </p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {formatLongDate(actividad.fechaInicio)}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Cierra: {formatShortDate(actividad.fechaCierre)}
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
                  {actividad.cuposDisponibles} / {actividad.cuposTotales}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {actividad._count.enrollments} inscripciones
                </p>
              </div>
            </div>
          </div>

          {actividad.ubicacion?.trim() ? (
            <div className="flex items-start gap-2 text-sm text-text-secondary">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{actividad.ubicacion}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Tu inscripción
              </p>

              {isEnrolled ? (
                <div className="mt-2 space-y-2">
                  <span className="inline-flex items-center rounded-full border border-accent-green/30 bg-accent-green/15 px-3 py-1 text-xs font-medium text-accent-green">
                    {ENROLLMENT_LABELS[enrollment!.estado] ?? "Inscrito"}
                  </span>
                  <p className="text-xs text-text-muted">
                    Desde {formatShortDate(enrollment!.createdAt)}
                  </p>

                  {isCancelled ? (
                    <p className="text-xs text-accent-red">
                      Esta actividad fue cancelada.
                    </p>
                  ) : isFinished || isExpired ? (
                    <p className="text-xs text-text-muted">
                      Esta actividad ya finalizó.
                    </p>
                  ) : isPublished && canUnenroll ? (
                    <p className="text-xs text-text-secondary">
                      Puedes desinscribirte hasta el{" "}
                      <span className="font-medium text-text-primary">
                        {formatShortDate(cutoffDate)}
                      </span>{" "}
                      (2 días antes del inicio).
                    </p>
                  ) : isPublished ? (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      <Info className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{UNENROLL_CLOSED_MESSAGE}</span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-sm text-text-secondary">
                  Aún no estás inscrito en esta actividad.
                </p>
              )}
            </div>

            <div className="shrink-0">
              {!isPublished ? null : isEnrolled ? (
                isExpired || !canUnenroll ? null : (
                  <UnenrollSelfButton activityId={actividad.id} />
                )
              ) : isExpired ? (
                <span className="text-xs text-text-muted">
                  Inscripciones cerradas (actividad finalizada)
                </span>
              ) : activo ? (
                sinCupos ? (
                  <span className="text-xs text-text-muted">
                    Sin cupos disponibles
                  </span>
                ) : (
                  <EnrollActivityButton activityId={actividad.id} />
                )
              ) : (
                <span className="text-xs text-text-muted">
                  Cuenta pendiente de activación
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="flex items-center gap-2 text-xs text-text-muted">
        <Clock className="h-4 w-4" />
        Publicada el {formatShortDate(actividad.createdAt)}
      </p>
    </div>
  );
}
