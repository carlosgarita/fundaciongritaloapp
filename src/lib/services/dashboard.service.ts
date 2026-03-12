import { prisma } from "@/lib/prisma";

export class DashboardService {
  static async getStats() {
    const [voluntariosActivos, proximasActividades, horasMesActual] =
      await Promise.all([
        prisma.user.count({
          where: { role: "voluntario", estado: "activo" },
        }),
        prisma.activity.count({
          where: { estado: "publicada", fechaInicio: { gte: new Date() } },
        }),
        prisma.hourLog
          .aggregate({
            _sum: { horas: true },
            where: {
              estado: "validado",
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
      where: { estado: "publicada" },
      orderBy: { fechaInicio: "asc" },
      take: limit,
    });
  }
}
