import Link from "next/link";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ActivityService } from "@/lib/services/activity.service";
import { EnrollActivityButton } from "@/components/enroll-activity-button";
import { UnenrollSelfButton } from "@/components/unenroll-self-button";
import {
  canVolunteerUnenroll,
  isActivityClosedForEnrollment,
} from "@/lib/enrollment-policy";
import { CalendarDays } from "lucide-react";

export default async function PortalActividadesPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";
  const activo = session?.user?.estado === "activo";

  let activities: Awaited<
    ReturnType<typeof ActivityService.findPublishedForVolunteer>
  > = [];

  try {
    activities = await ActivityService.findPublishedForVolunteer(userId);
  } catch {
    activities = [];
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Actividades</h1>
        <p className="text-text-secondary mt-1">
          Actividades abiertas y tu estado de inscripción.
        </p>
      </div>

      {!activo ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Tu cuenta está pendiente de activación. Cuando un administrador te
          active podrás inscribirte en actividades.
        </div>
      ) : null}

      {activities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">
              No hay actividades publicadas en este momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activities.map((act) => {
            const enrolled = act.enrollments.length > 0;
            const canUnenroll = canVolunteerUnenroll(act.fechaInicio);
            const expired = isActivityClosedForEnrollment(act.fechaCierre);
            const start = new Date(act.fechaInicio);
            const detailHref = `/portal/actividades/${act.id}`;

            return (
              <Card key={act.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <span className="rounded bg-primary-50 px-2 py-0.5 text-xs font-medium capitalize text-primary-600">
                        {act.tipo}
                      </span>
                      <h2 className="mt-2 text-lg font-semibold text-text-primary">
                        <Link
                          href={detailHref}
                          className="rounded-sm hover:text-primary-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                          {act.nombre}
                        </Link>
                      </h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        {start.toLocaleDateString("es", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        {act.ubicacion ? ` · ${act.ubicacion}` : ""}
                      </p>
                      {act.descripcion ? (
                        <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                          {act.descripcion}
                        </p>
                      ) : null}
                      <Link
                        href={detailHref}
                        className="mt-2 inline-block text-xs font-medium text-primary-600 hover:underline"
                      >
                        Ver detalles
                      </Link>
                    </div>

                    <div className="flex shrink-0 flex-col items-stretch gap-2 text-right sm:items-end sm:min-w-[180px]">
                      {enrolled ? (
                        <>
                          <span className="inline-flex items-center justify-center self-end rounded-full border border-accent-green/30 bg-accent-green/15 px-3 py-1 text-xs font-medium text-accent-green">
                            Inscrito
                          </span>
                          {expired ? (
                            <span className="max-w-[220px] self-end text-xs text-text-muted">
                              Actividad finalizada
                            </span>
                          ) : canUnenroll ? (
                            <UnenrollSelfButton
                              activityId={act.id}
                              className="self-end"
                            />
                          ) : (
                            <span className="max-w-[220px] self-end text-xs text-text-muted">
                              Desinscripción cerrada (faltan menos de 2 días)
                            </span>
                          )}
                        </>
                      ) : expired ? (
                        <span className="max-w-[220px] self-end text-xs text-text-muted">
                          Inscripciones cerradas (actividad finalizada)
                        </span>
                      ) : activo ? (
                        <EnrollActivityButton
                          activityId={act.id}
                          className="self-end"
                        />
                      ) : (
                        <span className="max-w-[220px] self-end text-xs text-text-muted">
                          Inscripción no disponible
                        </span>
                      )}
                      <span className="self-end text-xs text-text-muted">
                        Cupos: {act.cuposDisponibles} / {act.cuposTotales}
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
