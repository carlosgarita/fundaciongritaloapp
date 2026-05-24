import { prisma } from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import bcrypt from "bcryptjs";
import { Prisma, type VolunteerStatus } from "@prisma/client";

export interface CreateVolunteerInput {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  cedula?: string;
  telefono?: string;
  habilidades?: string[];
  avatarUrl?: string;
}

export interface UpdateVolunteerInput {
  nombre?: string;
  apellido?: string;
  cedula?: string;
  telefono?: string;
  estado?: VolunteerStatus;
  habilidades?: string[];
}

const VOLUNTEER_SELECT = {
  id: true,
  email: true,
  nombre: true,
  apellido: true,
  cedula: true,
  telefono: true,
  role: true,
  estado: true,
  habilidades: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

const ACTIVITY_CARD_SELECT = {
  id: true,
  nombre: true,
  tipo: true,
  fechaInicio: true,
  fechaCierre: true,
  estado: true,
} as const;

export class VolunteerService {
  static async findAdminDetail(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, role: "voluntario", ...notDeleted },
      select: {
        ...VOLUNTEER_SELECT,
        enrollments: {
          where: {
            activity: notDeleted,
          },
          select: {
            id: true,
            estado: true,
            createdAt: true,
            activity: { select: ACTIVITY_CARD_SELECT },
          },
          orderBy: { createdAt: "desc" },
        },
        userBadges: {
          orderBy: { earnedAt: "desc" },
          include: {
            badge: true,
          },
        },
      },
    });

    if (!user) return null;

    const hoursAgg = await prisma.hourLog.aggregate({
      where: {
        volunteerId: id,
        estado: "validado",
        ...notDeleted,
      },
      _sum: { horas: true },
    });

    const horasAcumuladas = hoursAgg._sum.horas
      ? Number(hoursAgg._sum.horas)
      : 0;

    return { ...user, horasAcumuladas };
  }

  static async findAll(filters?: { estado?: VolunteerStatus }) {
    return prisma.user.findMany({
      where: {
        role: "voluntario",
        ...notDeleted,
        ...(filters?.estado && { estado: filters.estado }),
      },
      select: VOLUNTEER_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, ...notDeleted },
      select: VOLUNTEER_SELECT,
    });
  }

  static async create(input: CreateVolunteerInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new Error("Ya existe un usuario con ese correo electrónico");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const avatarTrim = input.avatarUrl?.trim();

    return prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        nombre: input.nombre,
        apellido: input.apellido,
        cedula: input.cedula,
        telefono: input.telefono ?? "",
        role: "voluntario",
        estado: "pendiente",
        habilidades: input.habilidades ?? [],
        ...(avatarTrim ? { avatarUrl: avatarTrim } : {}),
      },
      select: VOLUNTEER_SELECT,
    });
  }

  static async update(id: string, input: UpdateVolunteerInput) {
    const user = await prisma.user.findFirst({ where: { id, ...notDeleted } });
    if (!user) throw new Error("Voluntario no encontrado");

    return prisma.user.update({
      where: { id },
      data: input,
      select: VOLUNTEER_SELECT,
    });
  }

  static async delete(id: string) {
    const user = await prisma.user.findFirst({ where: { id, ...notDeleted } });
    if (!user) throw new Error("Voluntario no encontrado");
    if (user.role === "admin") throw new Error("No se puede eliminar un administrador");

    await prisma.$executeRaw(
      Prisma.sql`UPDATE "User" SET "deletedAt" = ${new Date()} WHERE id = ${id}`,
    );
  }
}
