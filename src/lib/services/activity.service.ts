import { prisma } from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import type { ActivityType, ActivityStatus } from "@prisma/client";

export interface CreateActivityInput {
  nombre: string;
  descripcion?: string;
  tipo: ActivityType;
  fechaInicio: string;
  fechaCierre: string;
  cuposTotales: number;
  ubicacion?: string;
  imagenUrl?: string;
  createdById: string;
}

export interface UpdateActivityInput {
  nombre?: string;
  descripcion?: string;
  tipo?: ActivityType;
  fechaInicio?: string;
  fechaCierre?: string;
  cuposTotales?: number;
  ubicacion?: string;
  imagenUrl?: string;
  estado?: ActivityStatus;
}

export class ActivityService {
  static async findAll(filters?: { estado?: ActivityStatus }) {
    return prisma.activity.findMany({
      where: {
        ...notDeleted,
        ...(filters?.estado ? { estado: filters.estado } : {}),
      },
      include: {
        createdBy: { select: { id: true, nombre: true, apellido: true } },
        enrollments: {
          include: {
            volunteer: {
              select: { id: true, nombre: true, apellido: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { fechaInicio: "desc" },
    });
  }

  /** Actividades en las que el voluntario está inscrito (no eliminadas). */
  static async findEnrolledForVolunteer(volunteerId: string) {
    const rows = await prisma.activityEnrollment.findMany({
      where: { volunteerId },
      include: {
        activity: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.filter((r) => r.activity.deletedAt === null);
  }

  /** Actividades publicadas con la inscripción del voluntario (si existe). */
  static async findPublishedForVolunteer(volunteerId: string) {
    return prisma.activity.findMany({
      where: {
        ...notDeleted,
        estado: "publicada",
      },
      include: {
        enrollments: {
          where: { volunteerId },
        },
      },
      orderBy: { fechaInicio: "desc" },
    });
  }

  /**
   * Detalle de una actividad para el portal del voluntario.
   * Sólo incluye la inscripción propia (no expone otras inscripciones).
   */
  static async findDetailForVolunteer(id: string, volunteerId: string) {
    return prisma.activity.findFirst({
      where: { id, ...notDeleted },
      include: {
        createdBy: { select: { id: true, nombre: true, apellido: true } },
        enrollments: { where: { volunteerId } },
        _count: { select: { enrollments: true } },
      },
    });
  }

  static async findById(id: string) {
    return prisma.activity.findFirst({
      where: { id, ...notDeleted },
      include: {
        createdBy: { select: { id: true, nombre: true, apellido: true } },
        enrollments: {
          include: {
            volunteer: { select: { id: true, nombre: true, apellido: true, email: true } },
          },
        },
      },
    });
  }

  /** Detalle administrativo con inscripciones ordenadas y agregados de horas registradas. */
  static async findAdminDetail(id: string) {
    const activity = await prisma.activity.findFirst({
      where: { id, ...notDeleted },
      include: {
        createdBy: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        enrollments: {
          include: {
            volunteer: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                cedula: true,
                estado: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!activity) return null;

    const [horasAgg, registrosPorEstado] = await Promise.all([
      prisma.hourLog.aggregate({
        where: {
          activityId: id,
          estado: "validado",
          deletedAt: null,
        },
        _sum: { horas: true },
      }),
      prisma.hourLog.groupBy({
        by: ["estado"],
        where: {
          activityId: id,
          deletedAt: null,
        },
        _count: { id: true },
      }),
    ]);

    const horasValidadas = horasAgg._sum.horas
      ? Number(horasAgg._sum.horas)
      : 0;

    const registrosPorEstadoMap = Object.fromEntries(
      registrosPorEstado.map((r) => [r.estado, r._count.id]),
    ) as Partial<Record<"pendiente" | "validado" | "rechazado", number>>;

    return {
      ...activity,
      horasValidadas,
      registrosPendientes: registrosPorEstadoMap.pendiente ?? 0,
      registrosValidadosCount: registrosPorEstadoMap.validado ?? 0,
      registrosRechazadosCount: registrosPorEstadoMap.rechazado ?? 0,
    };
  }

  static async create(input: CreateActivityInput) {
    const imagenTrim = input.imagenUrl?.trim();
    return prisma.activity.create({
      data: {
        nombre: input.nombre,
        descripcion: input.descripcion ?? "",
        tipo: input.tipo,
        fechaInicio: new Date(input.fechaInicio),
        fechaCierre: new Date(input.fechaCierre),
        cuposTotales: input.cuposTotales,
        cuposDisponibles: input.cuposTotales,
        ubicacion: input.ubicacion ?? "",
        ...(imagenTrim ? { imagenUrl: imagenTrim } : {}),
        createdById: input.createdById,
        estado: "publicada",
      },
    });
  }

  static async update(id: string, input: UpdateActivityInput) {
    const activity = await prisma.activity.findFirst({
      where: { id, ...notDeleted },
    });
    if (!activity) throw new Error("Actividad no encontrada");

    const data: Record<string, unknown> = { ...input };
    if (input.fechaInicio) data.fechaInicio = new Date(input.fechaInicio);
    if (input.fechaCierre) data.fechaCierre = new Date(input.fechaCierre);

    // imagenUrl: cadena vacía limpia el campo (null), valor con texto lo guarda.
    if (input.imagenUrl !== undefined) {
      const trim = input.imagenUrl.trim();
      data.imagenUrl = trim.length > 0 ? trim : null;
    }

    if (input.cuposTotales !== undefined) {
      const diff = input.cuposTotales - activity.cuposTotales;
      data.cuposDisponibles = Math.max(0, activity.cuposDisponibles + diff);
    }

    return prisma.activity.update({ where: { id }, data });
  }

  static async delete(id: string) {
    const activity = await prisma.activity.findFirst({
      where: { id, ...notDeleted },
    });
    if (!activity) throw new Error("Actividad no encontrada");

    await prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
