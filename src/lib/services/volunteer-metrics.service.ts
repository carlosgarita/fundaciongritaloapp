import { prisma } from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";

const MS_PER_DAY = 86_400_000;

export interface VolunteerActivitySummary {
  id: string;
  nombre: string;
  fechaInicio: Date;
  fechaCierre: Date;
  estadoInscripcion: string;
}

export interface VolunteerHourHistoryRow {
  id: string;
  fecha: Date;
  horas: number;
  actividadId: string;
  actividadNombre: string;
}

export interface VolunteerComputedMetrics {
  /** Suma de horas de registros con estado validado */
  horasValidadas: number;
  /** Inscripciones no canceladas a actividades distintas no eliminadas */
  cantidadActividades: number;
  diasEnPlataforma: number;
  actividades: VolunteerActivitySummary[];
  historialHorasValidadas: VolunteerHourHistoryRow[];
}

/**
 * Métricas usadas para reglas automáticas de insignias y el panel «Tu progreso».
 * - Horas: suma logs validados no borrados.
 * - Actividades: conteo distinto por inscripción no cancelada.
 * - Antigüedad: días naturales en calendario desde el alta (`User.createdAt`);
 *   el mismo día del registro cuenta como día 1.
 */
export class VolunteerMetricsService {
  static diasCalendarioEnPlataforma(createdAt: Date): number {
    const start = new Date(createdAt);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const raw = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
    return Math.max(1, raw + 1);
  }

  static async computeForVolunteer(
    volunteerId: string,
  ): Promise<VolunteerComputedMetrics> {
    const user = await prisma.user.findFirst({
      where: {
        id: volunteerId,
        role: "voluntario",
        ...notDeleted,
      },
      select: { createdAt: true },
    });

    if (!user) throw new Error("Voluntario no encontrado");

    const [hoursAgg, enrollmentsRows, validatedLogs] = await Promise.all([
      prisma.hourLog.aggregate({
        where: {
          volunteerId,
          estado: "validado",
          ...notDeleted,
        },
        _sum: { horas: true },
      }),
      prisma.activityEnrollment.findMany({
        where: {
          volunteerId,
          estado: { not: "cancelado" },
          activity: notDeleted,
        },
        select: {
          estado: true,
          activityId: true,
          activity: {
            select: {
              id: true,
              nombre: true,
              fechaInicio: true,
              fechaCierre: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.hourLog.findMany({
        where: {
          volunteerId,
          estado: "validado",
          ...notDeleted,
        },
        include: {
          activity: { select: { id: true, nombre: true } },
        },
        orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
        take: 120,
      }),
    ]);

    const horasValidadas = hoursAgg._sum.horas
      ? Number(hoursAgg._sum.horas)
      : 0;

    const byActivity = new Map<string, VolunteerActivitySummary>();
    for (const row of enrollmentsRows) {
      const a = row.activity;
      if (!byActivity.has(a.id)) {
        byActivity.set(a.id, {
          id: a.id,
          nombre: a.nombre,
          fechaInicio: a.fechaInicio,
          fechaCierre: a.fechaCierre,
          estadoInscripcion: row.estado,
        });
      }
    }

    const actividades = [...byActivity.values()].sort(
      (x, y) =>
        new Date(y.fechaInicio).getTime() - new Date(x.fechaInicio).getTime(),
    );

    const historialHorasValidadas = validatedLogs.map((l) => ({
      id: l.id,
      fecha: l.fecha,
      horas: Number(l.horas),
      actividadId: l.activityId,
      actividadNombre: l.activity.nombre,
    }));

    return {
      horasValidadas,
      cantidadActividades: actividades.length,
      diasEnPlataforma:
        VolunteerMetricsService.diasCalendarioEnPlataforma(user.createdAt),
      actividades,
      historialHorasValidadas,
    };
  }
}
