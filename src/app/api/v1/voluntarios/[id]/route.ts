import { requireAdmin, jsonOk, jsonError } from "@/lib/api-utils";
import { VolunteerService } from "@/lib/services/volunteer.service";
import { updateVolunteerSchema } from "@/lib/validations/volunteer";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/voluntarios/:id
 * Returns a single volunteer by ID.
 * Requires: admin role.
 */
export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const volunteer = await VolunteerService.findById(id);
    if (!volunteer) return jsonError("Voluntario no encontrado", 404);
    return jsonOk(volunteer);
  } catch (e) {
    return jsonError((e as Error).message, 500);
  }
}

/**
 * PUT /api/v1/voluntarios/:id
 * Updates a volunteer.
 * Requires: admin role.
 */
export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateVolunteerSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(", ");
      return jsonError(messages, 422);
    }

    const volunteer = await VolunteerService.update(id, parsed.data);
    return jsonOk(volunteer);
  } catch (e) {
    const message = (e as Error).message;
    if (message.includes("no encontrado")) return jsonError(message, 404);
    return jsonError(message, 500);
  }
}

/**
 * DELETE /api/v1/voluntarios/:id
 * Deletes a volunteer.
 * Requires: admin role.
 */
export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    await VolunteerService.delete(id);
    return jsonOk({ deleted: true });
  } catch (e) {
    const message = (e as Error).message;
    if (message.includes("no encontrado")) return jsonError(message, 404);
    if (message.includes("administrador")) return jsonError(message, 403);
    return jsonError(message, 500);
  }
}
