"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ActivityService } from "@/lib/services/activity.service";
import {
  createActivitySchema,
  updateActivitySchema,
} from "@/lib/validations/activity";
import type {
  CreateActivityData,
  UpdateActivityData,
} from "@/lib/validations/activity";

export async function createActivityAction(data: CreateActivityData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false as const, error: "No autorizado" };
  }

  const parsed = createActivitySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await ActivityService.create({
      ...parsed.data,
      createdById: session.user.id,
    });
    revalidatePath("/actividades");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}

export async function updateActivityAction(
  id: string,
  data: UpdateActivityData,
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false as const, error: "No autorizado" };
  }

  const parsed = updateActivitySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await ActivityService.update(id, parsed.data);
    revalidatePath("/actividades");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}

export async function deleteActivityAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false as const, error: "No autorizado" };
  }

  try {
    await ActivityService.delete(id);
    revalidatePath("/actividades");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}
