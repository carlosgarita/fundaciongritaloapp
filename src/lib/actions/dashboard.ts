"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }

  const [voluntariosActivos, proximasActividades, horasMesActual] =
    await Promise.all([
      prisma.user.count({
        where: { role: "voluntario", estado: "activo" },
      }),
      prisma.activity.count({
        where: {
          estado: "publicada",
          fechaInicio: { gte: new Date() },
        },
      }),
      prisma.hourLog
        .aggregate({
          _sum: { horas: true },
          where: {
            estado: "validado",
            fecha: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
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

export async function getUpcomingActivities() {
  const session = await auth();
  if (!session) throw new Error("No autorizado");

  return prisma.activity.findMany({
    where: { estado: "publicada" },
    orderBy: { fechaInicio: "asc" },
    take: 5,
  });
}
