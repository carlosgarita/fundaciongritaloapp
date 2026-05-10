import { z } from "zod";

export const enrollVolunteerSchema = z.object({
  activityId: z.string().min(1, "La actividad es requerida"),
  volunteerId: z.string().min(1, "El voluntario es requerido"),
  estado: z.enum(["inscrito", "confirmado"]).optional(),
});

export type EnrollVolunteerData = z.infer<typeof enrollVolunteerSchema>;

export const unenrollSchema = z.object({
  enrollmentId: z.string().min(1, "La inscripción es requerida"),
});

export type UnenrollData = z.infer<typeof unenrollSchema>;
