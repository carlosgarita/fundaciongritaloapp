import { z } from "zod";

export const createHourLogSchema = z.object({
  volunteerId: z.string().min(1, "El ID del voluntario es requerido"),
  activityId: z.string().min(1, "El ID de la actividad es requerido"),
  fecha: z.string().min(1, "La fecha es requerida"),
  horas: z.number().min(0.5, "Mínimo 0.5 horas").max(24, "Máximo 24 horas"),
  notas: z.string().optional(),
});

export const updateHourLogStatusSchema = z.object({
  estado: z.enum(["validado", "rechazado"]),
});

export const volunteerCreateHourLogSchema = createHourLogSchema.omit({
  volunteerId: true,
});

export type CreateHourLogData = z.infer<typeof createHourLogSchema>;
export type UpdateHourLogStatusData = z.infer<typeof updateHourLogStatusSchema>;
