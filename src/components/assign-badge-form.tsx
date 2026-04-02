"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { assignBadgeAction } from "@/lib/actions/badge";
import { AlertCircle } from "lucide-react";

export function AssignBadgeForm({
  volunteers,
  badges,
}: {
  volunteers: { id: string; nombre: string; apellido: string; email: string }[];
  badges: { id: string; nombre: string; icono: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [userId, setUserId] = useState(volunteers[0]?.id ?? "");
  const [badgeId, setBadgeId] = useState(badges[0]?.id ?? "");
  const [error, setError] = useState("");

  if (volunteers.length === 0 || badges.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        {volunteers.length === 0
          ? "No hay voluntarios en el sistema."
          : "No hay insignias definidas. Ejecuta el seed o crea insignias en la base de datos."}
      </p>
    );
  }

  return (
    <div className="space-y-3 max-w-3xl">
    <form
      className="flex flex-col sm:flex-row gap-3 sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        startTransition(async () => {
          const r = await assignBadgeAction({ userId, badgeId });
          if (!r.success) setError(r.error);
          else router.refresh();
        });
      }}
    >
      <div className="flex-1 min-w-0">
        <label
          htmlFor="assign-volunteer"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Voluntario
        </label>
        <select
          id="assign-volunteer"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={pending}
        >
          {volunteers.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre} {v.apellido} ({v.email})
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-0">
        <label
          htmlFor="assign-badge"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Insignia
        </label>
        <select
          id="assign-badge"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
          value={badgeId}
          onChange={(e) => setBadgeId(e.target.value)}
          disabled={pending}
        >
          {badges.map((b) => (
            <option key={b.id} value={b.id}>
              {b.icono} {b.nombre}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" loading={pending} className="shrink-0">
        Asignar
      </Button>
    </form>
      {error ? (
        <div className="flex items-center gap-2 text-sm text-accent-red">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}
    </div>
  );
}
