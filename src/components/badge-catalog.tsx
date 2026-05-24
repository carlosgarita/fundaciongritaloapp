"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { deleteBadgeAction } from "@/lib/actions/badge";
import { BADGE_CRITERIA_OPTIONS } from "@/lib/validations/badge";
import type { BadgeCatalogRow } from "@/lib/validations/badge";
import { EditBadgeForm } from "@/components/edit-badge-form";

function criterionSummary(criterio: string, valorCriterio: number): string {
  const label =
    BADGE_CRITERIA_OPTIONS.find((o) => o.value === criterio)?.label ?? criterio;
  const short =
    label.length > 48 ? `${label.slice(0, 45)}…` : label.replace(/ · .*$/, "");
  return valorCriterio > 0 ? `${short} · ref. ${valorCriterio}` : short;
}

export function BadgeCatalog({ badges }: { badges: BadgeCatalogRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<BadgeCatalogRow | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleted = async (id: string) => {
    setDeleteError("");
    setPending(true);
    try {
      const r = await deleteBadgeAction(id);
      if (!r.success) setDeleteError(r.error);
      else {
        setConfirmDeleteId(null);
        setEditing(null);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {deleteError ? (
        <p className="text-sm text-accent-red mb-3" role="alert">
          {deleteError}
        </p>
      ) : null}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Editar — ${editing.nombre}` : "Editar insignia"}
        className="sm:max-w-lg"
      >
        {editing ? (
          <EditBadgeForm
            badge={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        ) : null}
      </Modal>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {badges.map((b) => (
          <li
            key={b.id}
            className="rounded-lg border border-border p-4 flex gap-3 items-start justify-between"
          >
            <div className="flex gap-3 min-w-0 flex-1">
              <span className="text-2xl shrink-0" aria-hidden>
                {b.icono}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-text-primary">{b.nombre}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {criterionSummary(b.criterio, b.valorCriterio)}
                </p>
                <p className="text-sm text-text-secondary mt-1 line-clamp-3">
                  {b.descripcion || "Sin descripción."}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2 ml-2">
              {confirmDeleteId === b.id ? (
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <span className="text-xs text-text-secondary whitespace-nowrap">
                    ¿Eliminar?
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={pending}
                    onClick={() => handleDeleted(b.id)}
                  >
                    Sí
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    No
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setConfirmDeleteId(null);
                      setEditing(b);
                    }}
                    aria-label={`Editar ${b.nombre}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteError("");
                      setConfirmDeleteId(b.id);
                    }}
                    aria-label={`Eliminar ${b.nombre}`}
                    className="text-accent-red hover:text-red-600 hover:bg-error-surface"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
