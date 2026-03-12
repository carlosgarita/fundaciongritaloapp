import { requireAdmin, getSessionOrFail, jsonOk, jsonError } from "@/lib/api-utils";
import { ActivityService } from "@/lib/services/activity.service";
import { updateActivitySchema } from "@/lib/validations/activity";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/actividades/:id
 * Returns a single activity with its enrollments.
 * Requires: authenticated user.
 */
export async function GET(_request: Request, { params }: Params) {
  const { error } = await getSessionOrFail();
  if (error) return error;

  const { id } = await params;

  try {
    const activity = await ActivityService.findById(id);
    if (!activity) return jsonError("Actividad no encontrada", 404);
    return jsonOk(activity);
  } catch (e) {
    return jsonError((e as Error).message, 500);
  }
}

/**
 * PUT /api/v1/actividades/:id
 * Updates an activity.
 * Requires: admin role.
 */
export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateActivitySchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(", ");
      return jsonError(messages, 422);
    }

    const activity = await ActivityService.update(id, parsed.data);
    return jsonOk(activity);
  } catch (e) {
    const message = (e as Error).message;
    if (message.includes("no encontrada")) return jsonError(message, 404);
    return jsonError(message, 500);
  }
}

/**
 * DELETE /api/v1/actividades/:id
 * Deletes an activity.
 * Requires: admin role.
 */
export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    await ActivityService.delete(id);
    return jsonOk({ deleted: true });
  } catch (e) {
    const message = (e as Error).message;
    if (message.includes("no encontrada")) return jsonError(message, 404);
    return jsonError(message, 500);
  }
}
