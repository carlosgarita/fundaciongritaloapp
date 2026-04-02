"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EnrollmentService } from "@/lib/services/enrollment.service";
import {
  enrollVolunteerSchema,
  unenrollSchema,
} from "@/lib/validations/enrollment";
import type { EnrollmentStatus } from "@prisma/client";

const selfEnrollSchema = z.object({
  activityId: z.string().min(1, "Actividad requerida"),
});

export async function enrollVolunteerAction(
  activityId: string,
  volunteerId: string,
  estado?: EnrollmentStatus,
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false as const, error: "No autorizado" };
  }

  const parsed = enrollVolunteerSchema.safeParse({
    activityId,
    volunteerId,
    estado,
  });
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await EnrollmentService.enroll(
      parsed.data.activityId,
      parsed.data.volunteerId,
      (parsed.data.estado as EnrollmentStatus) ?? "inscrito",
    );
    revalidatePath("/actividades");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}

export async function enrollSelfAction(activityId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "voluntario") {
    return { success: false as const, error: "No autorizado" };
  }
  if (session.user.estado !== "activo") {
    return {
      success: false as const,
      error: "Tu cuenta debe estar activa para inscribirte.",
    };
  }

  const parsed = selfEnrollSchema.safeParse({ activityId });
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await EnrollmentService.enroll(parsed.data.activityId, session.user.id);
    revalidatePath("/portal");
    revalidatePath("/portal/actividades");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}

export async function unenrollVolunteerAction(enrollmentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false as const, error: "No autorizado" };
  }

  const parsed = unenrollSchema.safeParse({ enrollmentId });
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await EnrollmentService.unenroll(parsed.data.enrollmentId);
    revalidatePath("/actividades");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}
