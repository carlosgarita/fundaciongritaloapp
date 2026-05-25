import { z } from "zod";

export const createVolunteerSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Correo inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    nombre: z.string().min(1, "El nombre es requerido"),
    apellido: z.string().min(1, "El apellido es requerido"),
    cedula: z.string().optional(),
    telefono: z.string().optional(),
    habilidades: z.array(z.string()).optional(),
    avatarUrl: z.string().max(2048).optional(),
  })
  .superRefine((data, ctx) => {
    const raw = data.avatarUrl?.trim();
    if (!raw) return;
    try {
      const u = new URL(raw);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        ctx.addIssue({
          code: "custom",
          message: "La URL debe comenzar con http:// o https://",
          path: ["avatarUrl"],
        });
      }
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "URL de imagen inválida",
        path: ["avatarUrl"],
      });
    }
  });

export const updateVolunteerSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellido: z.string().min(1).optional(),
  cedula: z.string().optional(),
  telefono: z.string().optional(),
  estado: z.enum(["activo", "inactivo", "pendiente"]).optional(),
  habilidades: z.array(z.string()).optional(),
  /** Solo administración: texto en claro; omitir o cadena vacía para no cambiar la contraseña */
  password: z
    .union([
      z.literal(""),
      z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    ])
    .optional(),
});

export type CreateVolunteerData = z.infer<typeof createVolunteerSchema>;
export type UpdateVolunteerData = z.infer<typeof updateVolunteerSchema>;
