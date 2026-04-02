import { prisma } from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { ACTIVITY_TYPE_LABELS, VOLUNTEER_STATUS_LABELS } from "@/lib/types";
import type { VolunteerStatus } from "@prisma/client";

const MONTHS_SPAN = 6;

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("es-CR", {
    month: "short",
    year: "numeric",
  });
}

export class ReportService {
  /**
   * Horas validadas agrupadas por mes (últimos N meses incluyendo el actual).
   */
  static async getValidatedHoursByMonth(months = MONTHS_SPAN) {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth() - (months - 1), 1);

    const logs = await prisma.hourLog.findMany({
      where: {
        estado: "validado",
        ...notDeleted,
        volunteer: notDeleted,
        activity: notDeleted,
        fecha: { gte: start },
      },
      select: { fecha: true, horas: true },
    });

    const sums = new Map<string, number>();
    for (const log of logs) {
      const key = monthKey(new Date(log.fecha));
      const h = Number(log.horas);
      sums.set(key, (sums.get(key) ?? 0) + h);
    }

    const keys: string[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(end.getFullYear(), end.getMonth() - (months - 1 - i), 1);
      keys.push(monthKey(d));
    }

    return keys.map((key) => ({
      key,
      label: monthLabel(key),
      horas: Math.round((sums.get(key) ?? 0) * 10) / 10,
    }));
  }

  /**
   * Cantidad de actividades por tipo (no eliminadas).
   */
  static async getActivitiesByType() {
    const rows = await prisma.activity.groupBy({
      by: ["tipo"],
      where: { ...notDeleted },
      _count: { _all: true },
    });

    return rows
      .map((r) => ({
        tipo: r.tipo,
        label: ACTIVITY_TYPE_LABELS[r.tipo] ?? r.tipo,
        count: r._count._all,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Voluntarios por estado.
   */
  static async getVolunteersByStatus() {
    const rows = await prisma.user.groupBy({
      by: ["estado"],
      where: { role: "voluntario", ...notDeleted },
      _count: { _all: true },
    });

    return rows
      .map((r) => ({
        estado: r.estado as VolunteerStatus,
        label: VOLUNTEER_STATUS_LABELS[r.estado] ?? r.estado,
        count: r._count._all,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Top voluntarios por horas validadas (acumulado).
   */
  static async getTopVolunteersByValidatedHours(limit = 8) {
    const grouped = await prisma.hourLog.groupBy({
      by: ["volunteerId"],
      where: {
        estado: "validado",
        ...notDeleted,
        volunteer: notDeleted,
        activity: notDeleted,
      },
      _sum: { horas: true },
      orderBy: { _sum: { horas: "desc" } },
      take: limit,
    });

    const ids = grouped.map((g) => g.volunteerId);
    if (ids.length === 0) return [];

    const users = await prisma.user.findMany({
      where: { id: { in: ids }, ...notDeleted },
      select: { id: true, nombre: true, apellido: true, email: true },
    });
    const byId = new Map(users.map((u) => [u.id, u]));

    return grouped.map((g) => {
      const u = byId.get(g.volunteerId);
      return {
        id: g.volunteerId,
        nombre: u?.nombre ?? "",
        apellido: u?.apellido ?? "",
        email: u?.email ?? "",
        horas: Math.round(Number(g._sum.horas ?? 0) * 10) / 10,
      };
    });
  }

  /**
   * Totales para KPIs del informe.
   */
  static async getSummaryKpis() {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    const [totalHorasValidadasAnio, actividadesPublicadas, registrosPendientes] =
      await Promise.all([
        prisma.hourLog
          .aggregate({
            _sum: { horas: true },
            where: {
              estado: "validado",
              ...notDeleted,
              volunteer: notDeleted,
              activity: notDeleted,
              fecha: { gte: yearStart },
            },
          })
          .then((r) => Math.round(Number(r._sum.horas ?? 0) * 10) / 10),
        prisma.activity.count({
          where: { estado: "publicada", ...notDeleted },
        }),
        prisma.hourLog.count({
          where: {
            estado: "pendiente",
            ...notDeleted,
            volunteer: notDeleted,
            activity: notDeleted,
          },
        }),
      ]);

    return {
      totalHorasValidadasAnio,
      actividadesPublicadas,
      registrosPendientesValidacion: registrosPendientes,
    };
  }

  /**
   * Filas para exportación (detalle de horas validadas y pendientes recientes).
   */
  static async getHoursExportRows(limit = 500) {
    const rows = await prisma.hourLog.findMany({
      where: {
        ...notDeleted,
        volunteer: notDeleted,
        activity: notDeleted,
      },
      select: {
        fecha: true,
        horas: true,
        estado: true,
        notas: true,
        volunteer: {
          select: { nombre: true, apellido: true, email: true },
        },
        activity: { select: { nombre: true } },
      },
      orderBy: { fecha: "desc" },
      take: limit,
    });

    return rows.map((r) => ({
      fecha: r.fecha.toISOString().slice(0, 10),
      voluntario: `${r.volunteer.nombre} ${r.volunteer.apellido}`.trim(),
      email: r.volunteer.email,
      actividad: r.activity.nombre,
      horas: Number(r.horas),
      estado: r.estado,
      notas: r.notas,
    }));
  }
}
