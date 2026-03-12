import { requireAdmin, jsonOk, jsonError } from "@/lib/api-utils";
import { HourLogService } from "@/lib/services/hour-log.service";
import { createHourLogSchema } from "@/lib/validations/hour-log";
import type { HourLogStatus } from "@prisma/client";

/**
 * GET /api/v1/horas
 * Lists hour logs. Optionally filter by ?volunteerId=...&estado=pendiente|validado|rechazado.
 * Requires: admin role.
 */
export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const volunteerId = searchParams.get("volunteerId") ?? undefined;
  const estado = searchParams.get("estado") as HourLogStatus | null;

  try {
    const logs = await HourLogService.findAll({
      volunteerId,
      ...(estado && { estado }),
    });
    return jsonOk(logs);
  } catch (e) {
    return jsonError((e as Error).message, 500);
  }
}

/**
 * POST /api/v1/horas
 * Creates a new hour log entry.
 * Requires: admin role.
 */
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createHourLogSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(", ");
      return jsonError(messages, 422);
    }

    const log = await HourLogService.create(parsed.data);
    return jsonOk(log, 201);
  } catch (e) {
    const message = (e as Error).message;
    if (message.includes("no está inscrito")) return jsonError(message, 409);
    return jsonError(message, 500);
  }
}
