import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { VolunteerStatus } from "@prisma/client";

export interface CreateVolunteerInput {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  cedula?: string;
  telefono?: string;
  habilidades?: string[];
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

export class VolunteerService {
  static async findAll(filters?: { estado?: VolunteerStatus }) {
    return prisma.user.findMany({
      where: {
        role: "voluntario",
        ...(filters?.estado && { estado: filters.estado }),
      },
      select: VOLUNTEER_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
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
      },
      select: VOLUNTEER_SELECT,
    });
  }

  static async update(id: string, input: UpdateVolunteerInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("Voluntario no encontrado");

    return prisma.user.update({
      where: { id },
      data: input,
      select: VOLUNTEER_SELECT,
    });
  }

  static async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("Voluntario no encontrado");
    if (user.role === "admin") throw new Error("No se puede eliminar un administrador");

    await prisma.user.delete({ where: { id } });
  }
}
