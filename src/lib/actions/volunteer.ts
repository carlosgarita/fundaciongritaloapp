"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { VolunteerService } from "@/lib/services/volunteer.service";
import {
  createVolunteerSchema,
  updateVolunteerSchema,
} from "@/lib/validations/volunteer";
import type {
  CreateVolunteerData,
  UpdateVolunteerData,
} from "@/lib/validations/volunteer";

export async function createVolunteerAction(data: CreateVolunteerData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false as const, error: "No autorizado" };
  }

  const parsed = createVolunteerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await VolunteerService.create(parsed.data);
    revalidatePath("/voluntarios");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}

export async function updateVolunteerAction(
  id: string,
  data: UpdateVolunteerData,
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false as const, error: "No autorizado" };
  }

  const parsed = updateVolunteerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await VolunteerService.update(id, parsed.data);
    revalidatePath("/voluntarios");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}

export async function deleteVolunteerAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false as const, error: "No autorizado" };
  }

  try {
    await VolunteerService.delete(id);
    revalidatePath("/voluntarios");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}
