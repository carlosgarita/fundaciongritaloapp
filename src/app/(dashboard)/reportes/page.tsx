import {
  ReportService,
  pickGranularity,
  type ReportFilters,
} from "@/lib/services/report.service";
import { ReportsDashboard } from "./reports-dashboard";
import { ReportsFilters } from "./reports-filters";

interface ReportesPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    year?: string;
    activity?: string;
    volunteer?: string;
  }>;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const FIVE_YEARS_MS = 5 * 366 * DAY_MS;

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseDateParam(s: string | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (Number.isNaN(date.getTime())) return null;
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1) return null;
  return date;
}

function dateToIso(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default async function ReportesPage({ searchParams }: ReportesPageProps) {
  const sp = (await searchParams) ?? {};

  let activities: Awaited<
    ReturnType<typeof ReportService.listActivitiesForFilter>
  > = [];
  let volunteers: Awaited<
    ReturnType<typeof ReportService.listVolunteersForFilter>
  > = [];

  try {
    [activities, volunteers] = await Promise.all([
      ReportService.listActivitiesForFilter(),
      ReportService.listVolunteersForFilter(),
    ]);
  } catch {
    activities = [];
    volunteers = [];
  }

  const fromParam = parseDateParam(pickFirst(sp.from));
  const toParam = parseDateParam(pickFirst(sp.to));
  const legacyYear = Number.parseInt(pickFirst(sp.year) ?? "", 10);

  let from: Date;
  let to: Date;

  if (fromParam && toParam) {
    from = fromParam <= toParam ? fromParam : toParam;
    to = fromParam <= toParam ? toParam : fromParam;
  } else if (Number.isFinite(legacyYear) && legacyYear >= 1900 && legacyYear <= 9999) {
    from = new Date(Date.UTC(legacyYear, 0, 1));
    to = new Date(Date.UTC(legacyYear, 11, 31));
  } else {
    const now = new Date();
    const y = now.getUTCFullYear();
    from = new Date(Date.UTC(y, 0, 1));
    to = new Date(Date.UTC(y, 11, 31));
  }

  if (to.getTime() - from.getTime() > FIVE_YEARS_MS) {
    from = new Date(to.getTime() - FIVE_YEARS_MS);
  }

  const activityParam = pickFirst(sp.activity);
  const activityId =
    activityParam && activities.some((a) => a.id === activityParam)
      ? activityParam
      : undefined;

  const volunteerParam = pickFirst(sp.volunteer);
  const volunteerId =
    volunteerParam && volunteers.some((v) => v.id === volunteerParam)
      ? volunteerParam
      : undefined;

  const filters: ReportFilters = { from, to, activityId, volunteerId };
  const granularity = pickGranularity(from, to);

  let hoursByPeriod: Awaited<
    ReturnType<typeof ReportService.getValidatedHoursByPeriod>
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
      hoursByPeriod,
      activitiesByType,
      volunteersByStatus,
      topVolunteers,
      kpis,
      exportRows,
    ] = await Promise.all([
      ReportService.getValidatedHoursByPeriod(filters, granularity),
      ReportService.getActivitiesByType(filters),
      ReportService.getVolunteersByStatus(filters),
      ReportService.getTopVolunteersByValidatedHours(filters),
      ReportService.getSummaryKpis(filters),
      ReportService.getHoursExportRows(filters),
    ]);
  } catch {
    // BD no disponible: el cliente muestra vacíos
  }

  const activeActivity = activityId
    ? activities.find((a) => a.id === activityId) ?? null
    : null;
  const activeVolunteer = volunteerId
    ? volunteers.find((v) => v.id === volunteerId) ?? null
    : null;

  const fromIso = dateToIso(from);
  const toIso = dateToIso(to);

  return (
    <div className="space-y-6 animate-fade-in">
      <ReportsFilters
        activities={activities}
        volunteers={volunteers}
        active={{ fromIso, toIso, activityId, volunteerId }}
      />
      <ReportsDashboard
        hoursByPeriod={hoursByPeriod}
        activitiesByType={activitiesByType}
        volunteersByStatus={volunteersByStatus}
        topVolunteers={topVolunteers}
        kpis={kpis}
        exportRows={exportRows}
        fromIso={fromIso}
        toIso={toIso}
        granularity={granularity}
        activeActivityName={activeActivity?.nombre ?? null}
        activeVolunteerName={
          activeVolunteer
            ? `${activeVolunteer.nombre} ${activeVolunteer.apellido}`.trim()
            : null
        }
      />
    </div>
  );
}
