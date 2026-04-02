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
      orderBy: { fechaInicio: "asc" },
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

  static async create(input: CreateActivityInput) {
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
        createdById: input.createdById,
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
