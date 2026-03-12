import { z } from "zod";

export const createVolunteerSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  cedula: z.string().optional(),
  telefono: z.string().optional(),
  habilidades: z.array(z.string()).optional(),
});

export const updateVolunteerSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellido: z.string().min(1).optional(),
  cedula: z.string().optional(),
  telefono: z.string().optional(),
  estado: z.enum(["activo", "inactivo", "pendiente"]).optional(),
  habilidades: z.array(z.string()).optional(),
});

export type CreateVolunteerData = z.infer<typeof createVolunteerSchema>;
export type UpdateVolunteerData = z.infer<typeof updateVolunteerSchema>;
