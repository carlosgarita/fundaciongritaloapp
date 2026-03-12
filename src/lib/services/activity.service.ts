import { prisma } from "@/lib/prisma";
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
      where: filters?.estado ? { estado: filters.estado } : undefined,
      include: {
        createdBy: { select: { id: true, nombre: true, apellido: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { fechaInicio: "desc" },
    });
  }

  static async findById(id: string) {
    return prisma.activity.findUnique({
      where: { id },
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
    const activity = await prisma.activity.findUnique({ where: { id } });
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
    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) throw new Error("Actividad no encontrada");

    await prisma.activity.delete({ where: { id } });
  }
}
