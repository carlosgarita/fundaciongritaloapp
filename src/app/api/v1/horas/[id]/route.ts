import { requireAdmin, jsonOk, jsonError } from "@/lib/api-utils";
import { HourLogService } from "@/lib/services/hour-log.service";
import { updateHourLogStatusSchema } from "@/lib/validations/hour-log";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/horas/:id
 * Returns a single hour log entry.
 * Requires: admin role.
 */
export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const log = await HourLogService.findById(id);
    if (!log) return jsonError("Registro de horas no encontrado", 404);
    return jsonOk(log);
  } catch (e) {
    return jsonError((e as Error).message, 500);
  }
}

/**
 * PUT /api/v1/horas/:id
 * Validates or rejects an hour log entry.
 * Requires: admin role.
 */
export async function PUT(request: Request, { params }: Params) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateHourLogStatusSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(", ");
      return jsonError(messages, 422);
    }

    const log = await HourLogService.updateStatus(id, {
      estado: parsed.data.estado,
      validatedById: session!.user.id,
    });
    return jsonOk(log);
  } catch (e) {
    const message = (e as Error).message;
    if (message.includes("no encontrado")) return jsonError(message, 404);
    if (message.includes("pendientes")) return jsonError(message, 409);
    return jsonError(message, 500);
  }
}
