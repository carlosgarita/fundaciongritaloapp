"use client";

import { useCallback, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  PieChart as PieChartIcon,
  Users,
} from "lucide-react";

const CHART_COLORS = [
  "#2563eb",
  "#22c55e",
  "#f97316",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#eab308",
];

export interface HoursByPeriodRow {
  key: string;
  label: string;
  horas: number;
}

export interface ActivityTypeRow {
  tipo: string;
  label: string;
  count: number;
}

export interface VolunteerStatusRow {
  estado: string;
  label: string;
  count: number;
}

export interface TopVolunteerRow {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  horas: number;
}

export interface ReportKpis {
  totalHorasValidadasAnio: number;
  actividadesPublicadas: number;
  registrosPendientesValidacion: number;
}

export interface ExportHourRow {
  fecha: string;
  voluntario: string;
  email: string;
  actividad: string;
  horas: number;
  estado: string;
  notas: string;
}

interface ReportsDashboardProps {
  hoursByPeriod: HoursByPeriodRow[];
  activitiesByType: ActivityTypeRow[];
  volunteersByStatus: VolunteerStatusRow[];
  topVolunteers: TopVolunteerRow[];
  kpis: ReportKpis;
  exportRows: ExportHourRow[];
  fromIso: string;
  toIso: string;
  granularity: "day" | "month" | "year";
  activeActivityName: string | null;
  activeVolunteerName: string | null;
}

const GRANULARITY_LABEL: Record<"day" | "month" | "year", string> = {
  day: "diaria",
  month: "mensual",
  year: "anual",
};

function formatLongDateUtc(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ReportsDashboard({
  hoursByPeriod,
  activitiesByType,
  volunteersByStatus,
  topVolunteers,
  kpis,
  exportRows,
  fromIso,
  toIso,
  granularity,
  activeActivityName,
  activeVolunteerName,
}: ReportsDashboardProps) {
  const rangeLabel = `${formatLongDateUtc(fromIso)} – ${formatLongDateUtc(toIso)}`;
  const pieTypeData = useMemo(() => {
    const total = activitiesByType.reduce((s, r) => s + r.count, 0);
    return activitiesByType.map((r) => ({
      name: r.label,
      value: r.count,
      percent: total > 0 ? r.count / total : 0,
    }));
  }, [activitiesByType]);

  const pieStatusData = useMemo(
    () =>
      volunteersByStatus.map((r) => ({
        name: r.label,
        value: r.count,
      })),
    [volunteersByStatus],
  );

  const exportExcel = useCallback(() => {
    const headers = [
      "Fecha",
      "Voluntario",
      "Email",
      "Actividad",
      "Horas",
      "Estado",
      "Notas",
    ] as const;

    const data =
      exportRows.length > 0
        ? exportRows.map((r) => ({
            Fecha: r.fecha,
            Voluntario: r.voluntario,
            Email: r.email,
            Actividad: r.actividad,
            Horas: r.horas,
            Estado: r.estado,
            Notas: r.notas,
          }))
        : [
            {
              Fecha: "",
              Voluntario: "",
              Email: "",
              Actividad: "",
              Horas: "",
              Estado: "Sin registros para el filtro actual",
              Notas: "",
            },
          ];

    const ws = XLSX.utils.json_to_sheet(data, { header: [...headers] });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Horas");
    const name = `reporte-horas-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, name);
  }, [exportRows]);

  const exportPdf = useCallback(() => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.text("Reporte de voluntariado — Fundación Grítalo", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString("es-CR")}`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [["Indicador", "Valor"]],
      body: [
        ["Período del reporte", rangeLabel],
        ["Proyecto", activeActivityName ?? "Todos los proyectos"],
        ["Voluntario", activeVolunteerName ?? "Todos los voluntarios"],
        ["Horas validadas en el período", String(kpis.totalHorasValidadasAnio)],
        ["Actividades publicadas", String(kpis.actividadesPublicadas)],
        [
          "Registros de horas pendientes de validación",
          String(kpis.registrosPendientesValidacion),
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });

    const docWithTable = doc as InstanceType<typeof jsPDF> & {
      lastAutoTable?: { finalY: number };
    };
    const yAfter = (docWithTable.lastAutoTable?.finalY ?? 60) + 10;

    autoTable(doc, {
      startY: yAfter,
      head: [["Voluntario", "Email", "Horas validadas"]],
      body: topVolunteers.map((v) => [
        `${v.nombre} ${v.apellido}`.trim(),
        v.email,
        String(v.horas),
      ]),
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`reporte-resumen-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [
    kpis,
    topVolunteers,
    rangeLabel,
    activeActivityName,
    activeVolunteerName,
  ]);

  const hasHoursData = hoursByPeriod.some((h) => h.horas > 0);
  const hasTypeData = activitiesByType.some((t) => t.count > 0);
  const totalHoursInChart = hoursByPeriod.reduce((acc, h) => acc + h.horas, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reportes</h1>
          <p className="text-text-secondary mt-1">
            Indicadores de participación y horas validadas. Exporta el detalle
            en Excel o un resumen en PDF.
          </p>
          <p className="text-xs text-text-muted mt-2">
            {rangeLabel}
            {activeActivityName ? ` · proyecto «${activeActivityName}»` : ""}
            {activeVolunteerName ? ` · voluntario «${activeVolunteerName}»` : ""}
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            icon={<FileSpreadsheet className="h-4 w-4" />}
            onClick={exportExcel}
            title={
              exportRows.length === 0
                ? "Sin registros para el filtro actual; se descargará un archivo vacío"
                : undefined
            }
          >
            Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            icon={<FileText className="h-4 w-4" />}
            onClick={exportPdf}
          >
            PDF resumen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Horas validadas (período)
              </p>
              <Clock className="h-5 w-5 text-primary-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary">
              {kpis.totalHorasValidadasAnio}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Actividades publicadas
              </p>
              <BarChart3 className="h-5 w-5 text-primary-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary">
              {kpis.actividadesPublicadas}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Horas pendientes de validar
              </p>
              <Download className="h-5 w-5 text-accent-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary">
              {kpis.registrosPendientesValidacion}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <p className="text-sm font-bold text-text-primary">
              Horas validadas por periodo
            </p>
            <p className="text-xs text-text-muted mt-1">
              Granularidad {GRANULARITY_LABEL[granularity]} · {totalHoursInChart.toFixed(1)} h totales
            </p>
          </CardHeader>
          <CardContent className="h-72 pt-2">
            {hasHoursData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursByPeriod} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-text-muted" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid var(--color-border)",
                    }}
                    formatter={(value) => [`${value} h`, "Horas"]}
                  />
                  <Bar dataKey="horas" fill="#2563eb" radius={[6, 6, 0, 0]} name="Horas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-text-muted">
                No hay horas validadas en este periodo.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary-500" />
              <p className="text-sm font-bold text-text-primary">
                Actividades por tipo
              </p>
            </div>
          </CardHeader>
          <CardContent className="h-72 pt-2">
            {hasTypeData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={85}
                    isAnimationActive={false}
                  >
                    {pieTypeData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid var(--color-border)",
                    }}
                    formatter={(value, _name, item) => {
                      const p =
                        (item?.payload as { percent?: number })?.percent ?? 0;
                      return [
                        `${value} (${(p * 100).toFixed(0)}%)`,
                        "Actividades",
                      ];
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    formatter={(value, entry) => {
                      const p =
                        (
                          entry?.payload as
                            | { percent?: number }
                            | undefined
                        )?.percent ?? 0;
                      return `${value} — ${(p * 100).toFixed(0)}%`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-text-muted">
                No hay actividades registradas.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary-500" />
              <p className="text-sm font-bold text-text-primary">
                Voluntarios por estado
              </p>
            </div>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            {volunteersByStatus.some((v) => v.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {pieStatusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-text-muted">
                No hay voluntarios.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm font-bold text-text-primary">
              Top voluntarios por horas validadas
            </p>
          </CardHeader>
          <CardContent>
            {topVolunteers.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-secondary">
                      <th className="text-left px-4 py-2 font-medium text-text-secondary">
                        Voluntario
                      </th>
                      <th className="text-right px-4 py-2 font-medium text-text-secondary">
                        Horas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topVolunteers.map((v) => (
                      <tr
                        key={v.id}
                        className="border-b border-border last:border-0 hover:bg-surface-hover/50"
                      >
                        <td className="px-4 py-2">
                          <span className="font-medium text-text-primary">
                            {v.nombre} {v.apellido}
                          </span>
                          <p className="text-xs text-text-muted truncate max-w-[200px]">
                            {v.email}
                          </p>
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {v.horas}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-text-muted py-8 text-center">
                Aún no hay horas validadas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
