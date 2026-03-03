import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, CalendarDays, Clock } from "lucide-react";

async function getDashboardData() {
  const supabase = await createClient();

  const [statsResult, activitiesResult] = await Promise.all([
    supabase.from("dashboard_stats").select("*").single(),
    supabase
      .from("activities")
      .select("*")
      .eq("estado", "publicada")
      .order("fecha_inicio", { ascending: true })
      .limit(5),
  ]);

  return {
    stats: statsResult.data,
    activities: activitiesResult.data ?? [],
  };
}

export default async function DashboardPage() {
  let stats = {
    voluntarios_activos: 0,
    proximas_actividades: 0,
    horas_mes_actual: 0,
  };
  let activities: Array<Record<string, unknown>> = [];

  try {
    const data = await getDashboardData();
    if (data.stats) stats = data.stats;
    activities = data.activities;
  } catch {
    // DB queries failed — show empty dashboard
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Resumen de Impacto
          </h1>
          <p className="text-text-secondary mt-1">
            Gestión estratégica de la Fundación Grítalo
          </p>
        </div>
        <p className="text-xs text-text-muted uppercase tracking-wide">
          Última sincronización: Hoy,{" "}
          {new Date().toLocaleTimeString("es", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Voluntarios Activos
              </p>
              <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary">
              {stats.voluntarios_activos}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Próximas Actividades
              </p>
              <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary">
              {stats.proximas_actividades}
            </p>
            <p className="text-sm text-text-muted mt-1">Programadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Horas del Mes
              </p>
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent-orange" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary">
              {stats.horas_mes_actual}
            </p>
            <p className="text-sm text-text-muted mt-1">Meta mensual: 500h</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Actividades de la Semana
        </h2>
        {activities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => {
              const date = new Date(activity.fecha_inicio as string);
              const day = date.getDate();
              const weekday = date
                .toLocaleDateString("es", { weekday: "short" })
                .toUpperCase();
              const timeStart = date.toLocaleTimeString("es", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
              const endDate = new Date(activity.fecha_cierre as string);
              const timeEnd = endDate.toLocaleTimeString("es", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <Card
                  key={activity.id as string}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded">
                          {weekday}
                        </span>
                        <span className="text-2xl font-bold text-text-primary">
                          {day}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full capitalize">
                        {activity.tipo as string}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-2">
                      {activity.nombre as string}
                    </h3>
                    {activity.ubicacion ? (
                      <p className="text-sm text-text-secondary mb-1">
                        📍 {activity.ubicacion as string}
                      </p>
                    ) : null}
                    <p className="text-sm text-text-secondary">
                      🕐 {timeStart} - {timeEnd}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarDays className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">
                No hay actividades programadas esta semana.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
