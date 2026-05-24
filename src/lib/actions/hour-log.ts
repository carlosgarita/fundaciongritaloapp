"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { HourLogService } from "@/lib/services/hour-log.service";
import { BadgeRulesService } from "@/lib/services/badge-rules.service";
import {
  volunteerCreateHourLogSchema,
  updateHourLogStatusSchema,
} from "@/lib/validations/hour-log";

export async function validateHourLogAction(
  hourLogId: string,
  estado: "validado" | "rechazado",
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false as const, error: "No autorizado" };
  }

  const parsed = updateHourLogStatusSchema.safeParse({ estado });
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const updated = await HourLogService.updateStatus(hourLogId, {
      estado: parsed.data.estado,
      validatedById: session.user.id,
    });
    if (parsed.data.estado === "validado") {
      await BadgeRulesService.evaluateAutomaticBadgesForVolunteer(
        updated.volunteerId,
      );
    }
    revalidatePath("/horas");
    revalidatePath("/panel");
    revalidatePath(`/actividades/${updated.activityId}`);
    revalidatePath("/portal");
    revalidatePath("/portal/insignias");
    revalidatePath("/portal/progreso");
    revalidatePath("/badges");
    revalidatePath("/voluntarios");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}

export async function submitHourLogVolunteerAction(
  input: Record<string, unknown>,
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "voluntario") {
    return { success: false as const, error: "No autorizado" };
  }
  if (session.user.estado !== "activo") {
    return {
      success: false as const,
      error: "Tu cuenta debe estar activa para registrar horas.",
    };
  }

  const parsed = volunteerCreateHourLogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await HourLogService.create({
      volunteerId: session.user.id,
      activityId: parsed.data.activityId,
      fecha: parsed.data.fecha,
      horas: parsed.data.horas,
      notas: parsed.data.notas,
    });
    revalidatePath("/portal");
    revalidatePath("/portal/horas");
    revalidatePath(`/actividades/${parsed.data.activityId}`);
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}
