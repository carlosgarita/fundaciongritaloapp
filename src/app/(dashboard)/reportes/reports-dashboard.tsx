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

export interface HoursByMonthRow {
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
  hoursByMonth: HoursByMonthRow[];
  activitiesByType: ActivityTypeRow[];
  volunteersByStatus: VolunteerStatusRow[];
  topVolunteers: TopVolunteerRow[];
  kpis: ReportKpis;
  exportRows: ExportHourRow[];
}

export function ReportsDashboard({
  hoursByMonth,
  activitiesByType,
  volunteersByStatus,
  topVolunteers,
  kpis,
  exportRows,
}: ReportsDashboardProps) {
  const pieTypeData = useMemo(
    () =>
      activitiesByType.map((r) => ({
        name: r.label,
        value: r.count,
      })),
    [activitiesByType],
  );

  const pieStatusData = useMemo(
    () =>
      volunteersByStatus.map((r) => ({
        name: r.label,
        value: r.count,
      })),
    [volunteersByStatus],
  );

  const exportExcel = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(
      exportRows.map((r) => ({
        Fecha: r.fecha,
        Voluntario: r.voluntario,
        Email: r.email,
        Actividad: r.actividad,
        Horas: r.horas,
        Estado: r.estado,
        Notas: r.notas,
      })),
    );
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
        ["Horas validadas (año en curso)", String(kpis.totalHorasValidadasAnio)],
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
  }, [kpis, topVolunteers]);

  const hasHoursData = hoursByMonth.some((h) => h.horas > 0);
  const hasTypeData = activitiesByType.some((t) => t.count > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reportes</h1>
          <p className="text-text-secondary mt-1">
            Indicadores de participación y horas validadas. Exporta el detalle
            en Excel o un resumen en PDF.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            icon={<FileSpreadsheet className="h-4 w-4" />}
            onClick={exportExcel}
            disabled={exportRows.length === 0}
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
                Horas validadas (año)
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
              Horas validadas por mes
            </p>
            <p className="text-xs text-text-muted mt-1">
              Últimos 6 meses (registros no eliminados)
            </p>
          </CardHeader>
          <CardContent className="h-72 pt-2">
            {hasHoursData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""} ${percent != null ? (percent * 100).toFixed(0) : 0}%`
                    }
                  >
                    {pieTypeData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
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
