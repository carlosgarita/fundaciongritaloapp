import { auth } from "@/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ActivityService } from "@/lib/services/activity.service";
import { EnrollActivityButton } from "@/components/enroll-activity-button";
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
            const start = new Date(act.fechaInicio);
            return (
              <Card key={act.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded capitalize">
                        {act.tipo}
                      </span>
                      <h2 className="text-lg font-semibold text-text-primary mt-2">
                        {act.nombre}
                      </h2>
                      <p className="text-sm text-text-secondary mt-1">
                        {start.toLocaleDateString("es", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        {act.ubicacion ? ` · ${act.ubicacion}` : ""}
                      </p>
                      {act.descripcion ? (
                        <p className="text-sm text-text-muted mt-2 line-clamp-2">
                          {act.descripcion}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0 flex flex-col items-start gap-2">
                      {enrolled ? (
                        <span className="inline-flex items-center rounded-full bg-accent-green/15 text-accent-green text-xs font-medium px-3 py-1 border border-accent-green/30">
                          Inscrito
                        </span>
                      ) : activo ? (
                        <EnrollActivityButton activityId={act.id} />
                      ) : (
                        <span className="text-xs text-text-muted">
                          Inscripción no disponible
                        </span>
                      )}
                      <span className="text-xs text-text-muted">
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
