import { ReportService } from "@/lib/services/report.service";
import { ReportsDashboard } from "./reports-dashboard";

export default async function ReportesPage() {
  let hoursByMonth: Awaited<
    ReturnType<typeof ReportService.getValidatedHoursByMonth>
  > = [];
  let activitiesByType: Awaited<
    ReturnType<typeof ReportService.getActivitiesByType>
  > = [];
  let volunteersByStatus: Awaited<
    ReturnType<typeof ReportService.getVolunteersByStatus>
  > = [];
  let topVolunteers: Awaited<
    ReturnType<typeof ReportService.getTopVolunteersByValidatedHours>
  > = [];
  let kpis: Awaited<ReturnType<typeof ReportService.getSummaryKpis>> = {
    totalHorasValidadasAnio: 0,
    actividadesPublicadas: 0,
    registrosPendientesValidacion: 0,
  };
  let exportRows: Awaited<ReturnType<typeof ReportService.getHoursExportRows>> =
    [];

  try {
    [
      hoursByMonth,
      activitiesByType,
      volunteersByStatus,
      topVolunteers,
      kpis,
      exportRows,
    ] = await Promise.all([
      ReportService.getValidatedHoursByMonth(6),
      ReportService.getActivitiesByType(),
      ReportService.getVolunteersByStatus(),
      ReportService.getTopVolunteersByValidatedHours(8),
      ReportService.getSummaryKpis(),
      ReportService.getHoursExportRows(500),
    ]);
  } catch {
    // BD no disponible: el cliente muestra vacíos
  }

  return (
    <div className="animate-fade-in">
      <ReportsDashboard
        hoursByMonth={hoursByMonth}
        activitiesByType={activitiesByType}
        volunteersByStatus={volunteersByStatus}
        topVolunteers={topVolunteers}
        kpis={kpis}
        exportRows={exportRows}
      />
    </div>
  );
}
