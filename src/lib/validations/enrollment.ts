import { z } from "zod";

export const enrollVolunteerSchema = z.object({
  activityId: z.string().min(1),
  volunteerId: z.string().min(1),
  estado: z.enum(["inscrito", "confirmado"]).optional(),
});

export type EnrollVolunteerData = z.infer<typeof enrollVolunteerSchema>;

export const unenrollSchema = z.object({
  enrollmentId: z.string().min(1),
});

export type UnenrollData = z.infer<typeof unenrollSchema>;
