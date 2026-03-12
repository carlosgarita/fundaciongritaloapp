import { requireAdmin, jsonOk, jsonError } from "@/lib/api-utils";
import { VolunteerService } from "@/lib/services/volunteer.service";
import { createVolunteerSchema } from "@/lib/validations/volunteer";
import type { VolunteerStatus } from "@prisma/client";

/**
 * GET /api/v1/voluntarios
 * Lists all volunteers. Optionally filter by ?estado=activo|inactivo|pendiente.
 * Requires: admin role.
 */
export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado") as VolunteerStatus | null;

  try {
    const volunteers = await VolunteerService.findAll(
      estado ? { estado } : undefined,
    );
    return jsonOk(volunteers);
  } catch (e) {
    return jsonError((e as Error).message, 500);
  }
}

/**
 * POST /api/v1/voluntarios
 * Creates a new volunteer.
 * Requires: admin role.
 */
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createVolunteerSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(", ");
      return jsonError(messages, 422);
    }

    const volunteer = await VolunteerService.create(parsed.data);
    return jsonOk(volunteer, 201);
  } catch (e) {
    const message = (e as Error).message;
    if (message.includes("Ya existe")) return jsonError(message, 409);
    return jsonError(message, 500);
  }
}
