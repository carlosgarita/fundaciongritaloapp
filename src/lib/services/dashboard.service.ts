import { prisma } from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";

export class DashboardService {
  static async getStats() {
    const [voluntariosActivos, proximasActividades, horasMesActual] =
      await Promise.all([
        prisma.user.count({
          where: {
            role: "voluntario",
            estado: "activo",
            ...notDeleted,
          },
        }),
        prisma.activity.count({
          where: {
            estado: "publicada",
            fechaInicio: { gte: new Date() },
            ...notDeleted,
          },
        }),
        prisma.hourLog
          .aggregate({
            _sum: { horas: true },
            where: {
              estado: "validado",
              ...notDeleted,
              volunteer: notDeleted,
              activity: notDeleted,
              fecha: {
                gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1,
                ),
              },
            },
          })
          .then((r) => Number(r._sum.horas ?? 0)),
      ]);

    return {
      voluntarios_activos: voluntariosActivos,
      proximas_actividades: proximasActividades,
      horas_mes_actual: horasMesActual,
    };
  }

  static async getUpcomingActivities(limit = 5) {
    return prisma.activity.findMany({
      where: { estado: "publicada", ...notDeleted },
      orderBy: { fechaInicio: "asc" },
      take: limit,
    });
  }
}
