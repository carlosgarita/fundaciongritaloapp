import { requireAdmin, getSessionOrFail, jsonOk, jsonError } from "@/lib/api-utils";
import { ActivityService } from "@/lib/services/activity.service";
import { createActivitySchema } from "@/lib/validations/activity";
import type { ActivityStatus } from "@prisma/client";

/**
 * GET /api/v1/actividades
 * Lists all activities. Optionally filter by ?estado=publicada|borrador|...
 * Requires: authenticated user.
 */
export async function GET(request: Request) {
  const { error } = await getSessionOrFail();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado") as ActivityStatus | null;

  try {
    const activities = await ActivityService.findAll(
      estado ? { estado } : undefined,
    );
    return jsonOk(activities);
  } catch (e) {
    return jsonError((e as Error).message, 500);
  }
}

/**
 * POST /api/v1/actividades
 * Creates a new activity.
 * Requires: admin role.
 */
export async function POST(request: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createActivitySchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(", ");
      return jsonError(messages, 422);
    }

    const activity = await ActivityService.create({
      ...parsed.data,
      createdById: session!.user.id,
    });
    return jsonOk(activity, 201);
  } catch (e) {
    return jsonError((e as Error).message, 500);
  }
}
