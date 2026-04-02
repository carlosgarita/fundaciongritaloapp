import { prisma } from "@/lib/prisma";

export class BadgeService {
  static async findAll() {
    return prisma.badge.findMany({
      orderBy: { nombre: "asc" },
    });
  }

  static async listForUser(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });
  }

  /** Asignación manual (admin); ignora criterios automáticos. */
  static async assignToUser(userId: string, badgeId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, role: "voluntario", deletedAt: null },
      select: { id: true },
    });
    if (!user) throw new Error("Voluntario no encontrado");

    const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) throw new Error("Insignia no encontrada");

    return prisma.userBadge.upsert({
      where: {
        userId_badgeId: { userId, badgeId },
      },
      create: { userId, badgeId },
      update: {},
    });
  }
}
