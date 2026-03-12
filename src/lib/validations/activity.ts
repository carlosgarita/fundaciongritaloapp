import { z } from "zod";

export const createActivitySchema = z.object({
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
});

export const updateActivitySchema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  tipo: z.enum([
    "social", "comunitario", "educacion", "ambiente",
    "salud", "comunicacion", "logistica", "otro",
  ]).optional(),
  fechaInicio: z.string().datetime().optional(),
  fechaCierre: z.string().datetime().optional(),
  cuposTotales: z.number().int().min(1).optional(),
  ubicacion: z.string().optional(),
  estado: z.enum(["borrador", "publicada", "finalizada", "cancelada"]).optional(),
});

export type CreateActivityData = z.infer<typeof createActivitySchema>;
export type UpdateActivityData = z.infer<typeof updateActivitySchema>;
