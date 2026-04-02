"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateHourLogAction } from "@/lib/actions/hour-log";

export type PendingHourLogRow = {
  id: string;
  fecha: string;
  horas: number;
  notas: string;
  volunteer: { nombre: string; apellido: string };
  activity: { nombre: string };
};

export function PendingHourLogsTable({ logs }: { logs: PendingHourLogRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function act(id: string, estado: "validado" | "rechazado") {
    startTransition(async () => {
      await validateHourLogAction(id, estado);
      router.refresh();
    });
  }

  if (logs.length === 0) {
    return (
      <p className="text-text-secondary text-center py-10">
        No hay registros de horas pendientes de validación.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-secondary border-b border-border text-left">
            <th className="p-3 font-semibold text-text-primary">Voluntario</th>
            <th className="p-3 font-semibold text-text-primary">Actividad</th>
            <th className="p-3 font-semibold text-text-primary">Fecha</th>
            <th className="p-3 font-semibold text-text-primary">Horas</th>
            <th className="p-3 font-semibold text-text-primary">Notas</th>
            <th className="p-3 font-semibold text-text-primary w-[200px]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border last:border-0 hover:bg-surface-secondary/50"
            >
              <td className="p-3 text-text-primary">
                {row.volunteer.nombre} {row.volunteer.apellido}
              </td>
              <td className="p-3 text-text-secondary">{row.activity.nombre}</td>
              <td className="p-3 text-text-secondary">{row.fecha}</td>
              <td className="p-3 font-medium text-text-primary">{row.horas}</td>
              <td className="p-3 text-text-secondary max-w-[220px] truncate">
                {row.notas || "—"}
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    className="bg-accent-green/15 text-accent-green hover:bg-accent-green/25 border border-accent-green/30"
                    onClick={() => act(row.id, "validado")}
                  >
                    <Check className="h-4 w-4 mr-1" aria-hidden />
                    Validar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    className="bg-accent-red/10 text-accent-red hover:bg-accent-red/20 border border-accent-red/25"
                    onClick={() => act(row.id, "rechazado")}
                  >
                    <X className="h-4 w-4 mr-1" aria-hidden />
                    Rechazar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
