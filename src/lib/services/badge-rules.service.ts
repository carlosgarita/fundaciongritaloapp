import { prisma } from "@/lib/prisma";
import type { BadgeCriteria } from "@prisma/client";
import { notDeleted } from "@/lib/soft-delete";
import { VolunteerMetricsService } from "@/lib/services/volunteer-metrics.service";

/**
 * Otorga automáticamente insignias por criterio (`horas`, `actividades`, `antiguedad`)
 * cuando el voluntario iguala o supera `valorCriterio`.
 * Las insignias `especial` y umbrales 0 (o menores) quedan solo para asignación manual.
 *
 * Las insignias concedidas ya no se revocan automáticas si métricas bajan
 * (p. ej. corrección futura del catálogo o reglas nuevas — fuera del alcance).
 */
export class BadgeRulesService {
  static async evaluateAutomaticBadgesForVolunteer(
    volunteerId: string,
  ): Promise<number> {
    const exists = await prisma.user.findFirst({
      where: { id: volunteerId, role: "voluntario", ...notDeleted },
      select: { id: true },
    });
    if (!exists) return 0;

    const metrics =
      await VolunteerMetricsService.computeForVolunteer(volunteerId);

    const badges = await prisma.badge.findMany({
      where: {
        criterio: { in: ["horas", "actividades", "antiguedad"] },
      },
    });

    let assigned = 0;

    for (const badge of badges) {
      if (badge.valorCriterio <= 0) continue;

      let eligible = false;
      switch (badge.criterio as BadgeCriteria) {
        case "horas":
          eligible = metrics.horasValidadas >= badge.valorCriterio;
          break;
        case "actividades":
          eligible = metrics.cantidadActividades >= badge.valorCriterio;
          break;
        case "antiguedad":
          eligible = metrics.diasEnPlataforma >= badge.valorCriterio;
          break;
        default:
          eligible = false;
      }
      if (!eligible) continue;

      const ub = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: { userId: volunteerId, badgeId: badge.id },
        },
        select: { id: true },
      });
      if (ub) continue;

      await prisma.userBadge.create({
        data: { userId: volunteerId, badgeId: badge.id },
      });
      assigned += 1;
    }

    return assigned;
  }
}
