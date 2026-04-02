"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BadgeService } from "@/lib/services/badge.service";

const assignSchema = z.object({
  userId: z.string().min(1),
  badgeId: z.string().min(1),
});

export async function assignBadgeAction(input: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false as const, error: "No autorizado" };
  }

  const parsed = assignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await BadgeService.assignToUser(parsed.data.userId, parsed.data.badgeId);
    revalidatePath("/badges");
    revalidatePath("/voluntarios");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: (e as Error).message };
  }
}
