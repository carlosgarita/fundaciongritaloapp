"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { HourLogService } from "@/lib/services/hour-log.service";
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
    await HourLogService.updateStatus(hourLogId, {
      estado: parsed.data.estado,
      validatedById: session.user.id,
    });
    revalidatePath("/horas");
    revalidatePath("/panel");
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
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}
