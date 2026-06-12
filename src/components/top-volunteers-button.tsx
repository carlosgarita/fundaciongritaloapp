"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopVolunteersInlinePanel } from "@/components/top-volunteers-panel";
import { cn } from "@/lib/utils";
import type { VolunteerRankings } from "@/lib/services/ranking.service";

interface TopVolunteersButtonProps {
  rankings: VolunteerRankings;
  /** Si se provee, se resalta la fila de este voluntario en el ranking. */
  highlightVolunteerId?: string;
  /** Clases extra para el contenedor (la sección que envuelve botón + panel). */
  className?: string;
  /** Clases extra para el botón. */
  buttonClassName?: string;
}

/**
 * Botón "Top 10 🏆" + panel inline desplegable.
 *
 * No abre ningún modal: cuando se hace click en el botón, el panel se renderiza
 * justo debajo dentro del flujo de la página (estilo "disclosure"), igual que
 * el formulario "Nuevo Voluntario" — abriendo un espacio en la página.
 */
export function TopVolunteersButton({
  rankings,
  highlightVolunteerId,
  className,
  buttonClassName,
}: TopVolunteersButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen((v) => !v)}
          icon={<Trophy className="h-4 w-4" />}
          aria-expanded={open}
          aria-controls="top-volunteers-inline-panel"
          className={cn("whitespace-nowrap", buttonClassName)}
        >
          Top 10 🏆
        </Button>
      </div>

      {open ? (
        <div id="top-volunteers-inline-panel">
          <TopVolunteersInlinePanel
            rankings={rankings}
            highlightVolunteerId={highlightVolunteerId}
            onClose={() => setOpen(false)}
            scrollIntoViewOnMount
          />
        </div>
      ) : null}
    </div>
  );
}
