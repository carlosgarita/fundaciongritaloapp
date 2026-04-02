import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { HourLogService } from "@/lib/services/hour-log.service";
import {
  PendingHourLogsTable,
  type PendingHourLogRow,
} from "@/components/pending-hour-logs-table";

export default async function HorasValidacionPage() {
  let rows: PendingHourLogRow[] = [];
  try {
    const logs = await HourLogService.findAll({ estado: "pendiente" });
    rows = logs.map((log) => ({
      id: log.id,
      fecha: new Date(log.fecha).toLocaleDateString("es", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      horas: Number(log.horas),
      notas: log.notas,
      volunteer: log.volunteer,
      activity: log.activity,
    }));
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Clock className="h-7 w-7 text-primary-500" aria-hidden />
          Validación de horas
        </h1>
        <p className="text-text-secondary mt-1">
          Aprueba o rechaza los registros enviados por los voluntarios.
        </p>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-text-secondary">
            Pendientes ({rows.length})
          </p>
        </CardHeader>
        <CardContent>
          <PendingHourLogsTable logs={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
