import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

export interface RankingEntry {
  rank: number;
  volunteerId: string;
  nombre: string;
  apellido: string;
  email: string;
  avatarUrl: string | null;
  total: number;
}

export interface VolunteerRankings {
  /** Top voluntarios por horas validadas en el mes calendario actual. */
  horasMes: {
    /** Etiqueta "Junio 2026" en español. */
    periodoLabel: string;
    inicio: string;
    fin: string;
    entries: RankingEntry[];
  };
  /** Top voluntarios por cantidad de actividades del año en curso. */
  actividadesAnio: {
    /** Etiqueta "2026". */
    periodoLabel: string;
    inicio: string;
    fin: string;
    entries: RankingEntry[];
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function startOfNextMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function startOfNextYear(d: Date): Date {
  return new Date(d.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
}

function formatMonthLabel(d: Date): string {
  const label = d.toLocaleDateString("es-CR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/* ------------------------------------------------------------------ */
/*  Servicio                                                           */
/* ------------------------------------------------------------------ */

/**
 * Rankings públicos de voluntarios. Excluye usuarios eliminados o no
 * voluntarios. Empates se resuelven por orden natural de la consulta.
 */
export class RankingService {
  /** Top voluntarios por horas validadas dentro del mes calendario actual. */
  static async topByValidatedHoursThisMonth(
    limit = 10,
  ): Promise<RankingEntry[]> {
    const now = new Date();
    const inicio = startOfMonth(now);
    const fin = startOfNextMonth(now);

    // Agrupar y sumar horas validadas en el rango del mes.
    // Index: HourLog @@index([estado, fecha]) hace eficiente este query.
    const groups = await prisma.hourLog.groupBy({
      by: ["volunteerId"],
      where: {
        estado: "validado",
        deletedAt: null,
        fecha: { gte: inicio, lt: fin },
      },
      _sum: { horas: true },
      orderBy: { _sum: { horas: "desc" } },
      take: limit,
    });

    if (groups.length === 0) return [];

    const userIds = groups.map((g) => g.volunteerId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: "voluntario",
        deletedAt: null,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        avatarUrl: true,
      },
    });
    const byId = new Map(users.map((u) => [u.id, u]));

    return groups
      .map((g, i) => {
        const u = byId.get(g.volunteerId);
        if (!u) return null;
        return {
          rank: i + 1,
          volunteerId: u.id,
          nombre: u.nombre,
          apellido: u.apellido,
          email: u.email,
          avatarUrl: u.avatarUrl,
          total: Number(g._sum.horas ?? 0),
        } satisfies RankingEntry;
      })
      .filter((r): r is RankingEntry => r !== null)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }

  /**
   * Top voluntarios por cantidad de actividades distintas en las que
   * participaron durante el año en curso (criterio: `Activity.fechaInicio`
   * dentro del año, inscripción no cancelada, actividad no eliminada).
   */
  static async topByActivitiesThisYear(limit = 10): Promise<RankingEntry[]> {
    const now = new Date();
    const inicio = startOfYear(now);
    const fin = startOfNextYear(now);

    const enrollments = await prisma.activityEnrollment.findMany({
      where: {
        estado: { not: "cancelado" },
        activity: {
          deletedAt: null,
          fechaInicio: { gte: inicio, lt: fin },
        },
      },
      select: { volunteerId: true, activityId: true },
    });

    if (enrollments.length === 0) return [];

    // Conteo distinto de actividades por voluntario.
    const counts = new Map<string, Set<string>>();
    for (const row of enrollments) {
      let set = counts.get(row.volunteerId);
      if (!set) {
        set = new Set<string>();
        counts.set(row.volunteerId, set);
      }
      set.add(row.activityId);
    }

    const sorted = [...counts.entries()]
      .map(([volunteerId, set]) => ({ volunteerId, count: set.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    const users = await prisma.user.findMany({
      where: {
        id: { in: sorted.map((s) => s.volunteerId) },
        role: "voluntario",
        deletedAt: null,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        avatarUrl: true,
      },
    });
    const byId = new Map(users.map((u) => [u.id, u]));

    return sorted
      .map((row) => {
        const u = byId.get(row.volunteerId);
        if (!u) return null;
        return {
          rank: 0,
          volunteerId: u.id,
          nombre: u.nombre,
          apellido: u.apellido,
          email: u.email,
          avatarUrl: u.avatarUrl,
          total: row.count,
        } as RankingEntry;
      })
      .filter((r): r is RankingEntry => r !== null)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }

  /** Carga ambos rankings en paralelo con sus etiquetas de período. */
  static async getVolunteerRankings(limit = 10): Promise<VolunteerRankings> {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = startOfNextMonth(now);
    const yearStart = startOfYear(now);
    const yearEnd = startOfNextYear(now);

    const [horasEntries, actividadesEntries] = await Promise.all([
      RankingService.topByValidatedHoursThisMonth(limit),
      RankingService.topByActivitiesThisYear(limit),
    ]);

    return {
      horasMes: {
        periodoLabel: formatMonthLabel(now),
        inicio: monthStart.toISOString(),
        fin: monthEnd.toISOString(),
        entries: horasEntries,
      },
      actividadesAnio: {
        periodoLabel: String(now.getFullYear()),
        inicio: yearStart.toISOString(),
        fin: yearEnd.toISOString(),
        entries: actividadesEntries,
      },
    };
  }
}
