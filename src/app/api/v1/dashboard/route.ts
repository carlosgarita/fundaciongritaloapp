import { requireAdmin, jsonOk, jsonError } from "@/lib/api-utils";
import { DashboardService } from "@/lib/services/dashboard.service";

/**
 * GET /api/v1/dashboard
 * Returns dashboard statistics and upcoming activities.
 * Requires: admin role.
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [stats, activities] = await Promise.all([
      DashboardService.getStats(),
      DashboardService.getUpcomingActivities(),
    ]);

    return jsonOk({ stats, activities });
  } catch (e) {
    return jsonError((e as Error).message, 500);
  }
}
