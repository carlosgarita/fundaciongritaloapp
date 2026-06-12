import { z } from "zod";

const imagenUrlRefine = (
  data: { imagenUrl?: string },
  ctx: z.RefinementCtx,
) => {
  const raw = data.imagenUrl?.trim();
  if (!raw) return;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      ctx.addIssue({
        code: "custom",
        message: "La URL debe comenzar con http:// o https://",
        path: ["imagenUrl"],
      });
    }
  } catch {
    ctx.addIssue({
      code: "custom",
      message: "URL de imagen inválida",
      path: ["imagenUrl"],
    });
  }
};

export const createActivitySchema = z
  .object({
    nombre: z.string().min(1, "El nombre es requerido"),
    descripcion: z.string().optional(),
    tipo: z.enum([
      "social", "comunitario", "educacion", "ambiente",
      "salud", "comunicacion", "logistica", "otro",
    ]),
    fechaInicio: z.string().datetime({ message: "Fecha de inicio inválida" }),
    fechaCierre: z.string().datetime({ message: "Fecha de cierre inválida" }),
    cuposTotales: z.number().int().min(1, "Debe tener al menos 1 cupo"),
    ubicacion: z.string().optional(),
    imagenUrl: z.string().max(2048).optional(),
  })
  .superRefine(imagenUrlRefine);

export const updateActivitySchema = z
  .object({
    nombre: z
      .string()
      .min(1, "El nombre es requerido")
      .optional(),
    descripcion: z.string().optional(),
    tipo: z.enum([
      "social", "comunitario", "educacion", "ambiente",
      "salud", "comunicacion", "logistica", "otro",
    ]).optional(),
    fechaInicio: z
      .string()
      .datetime({ message: "Fecha de inicio inválida" })
      .optional(),
    fechaCierre: z
      .string()
      .datetime({ message: "Fecha de cierre inválida" })
      .optional(),
    cuposTotales: z
      .number()
      .int()
      .min(1, "Debe tener al menos 1 cupo")
      .optional(),
    ubicacion: z.string().optional(),
    estado: z.enum(["borrador", "publicada", "finalizada", "cancelada"]).optional(),
    imagenUrl: z.string().max(2048).optional(),
  })
  .superRefine(imagenUrlRefine);

export type CreateActivityData = z.infer<typeof createActivitySchema>;
export type UpdateActivityData = z.infer<typeof updateActivitySchema>;
