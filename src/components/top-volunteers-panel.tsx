"use client";

import { useEffect, useRef, useState } from "react";
import { X, Clock, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import type {
  RankingEntry,
  VolunteerRankings,
} from "@/lib/services/ranking.service";

type Tab = "horas" | "actividades";

interface TopVolunteersInlinePanelProps {
  rankings: VolunteerRankings;
  /** Si se provee, se resalta la fila de este voluntario. */
  highlightVolunteerId?: string;
  onClose: () => void;
  /**
   * Si es `true`, hace scroll suave al panel cuando se monta.
   * Útil cuando el panel se renderiza al final de la página.
   */
  scrollIntoViewOnMount?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers de presentación                                            */
/* ------------------------------------------------------------------ */

function rankBadgeClass(rank: number): string {
  if (rank === 1) return "bg-amber-400/90 text-amber-950 border-amber-400";
  if (rank === 2) return "bg-zinc-300 text-zinc-800 border-zinc-300";
  if (rank === 3) return "bg-amber-700/80 text-white border-amber-700";
  return "bg-surface-hover text-text-secondary border-border";
}

function rankIcon(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function formatHours(value: number): string {
  if (Number.isInteger(value)) return `${value} h`;
  return `${value.toFixed(1)} h`;
}

/* ------------------------------------------------------------------ */
/*  Lista                                                              */
/* ------------------------------------------------------------------ */

interface RankingListProps {
  entries: RankingEntry[];
  highlightVolunteerId?: string;
  formatTotal: (n: number) => string;
  emptyMessage: string;
}

function RankingList({
  entries,
  highlightVolunteerId,
  formatTotal,
  emptyMessage,
}: RankingListProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-secondary px-4 py-8 text-center text-sm text-text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-xl border border-border bg-surface">
      {entries.map((entry) => {
        const isMe = entry.volunteerId === highlightVolunteerId;
        return (
          <li
            key={entry.volunteerId}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 sm:gap-3 sm:px-4",
              isMe && "bg-primary-50",
            )}
          >
            <span
              className={cn(
                "inline-flex h-7 min-w-[1.75rem] shrink-0 items-center justify-center rounded-full border px-1.5 text-xs font-bold",
                rankBadgeClass(entry.rank),
              )}
              aria-label={`Posición ${entry.rank}`}
            >
              {rankIcon(entry.rank)}
            </span>

            <UserAvatar
              nombre={entry.nombre}
              apellido={entry.apellido}
              email={entry.email}
              avatarUrl={entry.avatarUrl}
              className="h-8 w-8"
              initialsClassName="bg-primary-50 text-primary-600"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {(entry.nombre || "").trim()} {(entry.apellido || "").trim()}
                {isMe ? (
                  <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
                    Tú
                  </span>
                ) : null}
              </p>
              <p className="truncate text-xs text-text-muted">{entry.email}</p>
            </div>

            <span className="shrink-0 text-sm font-semibold text-text-primary tabular-nums">
              {formatTotal(entry.total)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel inline                                                       */
/* ------------------------------------------------------------------ */

/**
 * Panel inline (estilo `<Card>`) con el ranking de top 10 voluntarios.
 *
 * Se renderiza como un bloque más del flujo de la página (no es un modal),
 * para que abrir/cerrar simplemente expanda/colapse un espacio en la página
 * — replicando el patrón del formulario "Nuevo Voluntario".
 */
export function TopVolunteersInlinePanel({
  rankings,
  highlightVolunteerId,
  onClose,
  scrollIntoViewOnMount = false,
  className,
}: TopVolunteersInlinePanelProps) {
  const [tab, setTab] = useState<Tab>("horas");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollIntoViewOnMount) return;
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollIntoViewOnMount]);

  const tabs: { id: Tab; label: string; icon: typeof Clock }[] = [
    { id: "horas", label: "Horas (mes)", icon: Clock },
    { id: "actividades", label: "Actividades (año)", icon: CalendarDays },
  ];

  return (
    <Card ref={cardRef} className={cn("animate-fade-in", className)}>
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <span aria-hidden>🏆</span>
          Top 10 voluntarios
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          aria-label="Cerrar Top 10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <CardContent className="space-y-3">
        <div
          role="tablist"
          aria-label="Categorías de ranking"
          className="flex gap-2 overflow-x-auto"
        >
          {tabs.map((t) => {
            const active = t.id === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
                  active
                    ? "bg-primary-500 text-white"
                    : "bg-surface-hover text-text-secondary hover:text-text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "horas" ? (
          <>
            <p className="text-xs text-text-muted">
              Período:{" "}
              <span className="font-medium text-text-secondary">
                {rankings.horasMes.periodoLabel}
              </span>
              . Sólo se contabilizan registros de horas{" "}
              <span className="font-medium">validadas</span>.
            </p>
            <RankingList
              entries={rankings.horasMes.entries}
              highlightVolunteerId={highlightVolunteerId}
              formatTotal={formatHours}
              emptyMessage="Aún no hay horas validadas registradas este mes."
            />
          </>
        ) : (
          <>
            <p className="text-xs text-text-muted">
              Período:{" "}
              <span className="font-medium text-text-secondary">
                {rankings.actividadesAnio.periodoLabel}
              </span>
              . Se cuentan las actividades distintas en las que el voluntario
              está inscrito (no canceladas).
            </p>
            <RankingList
              entries={rankings.actividadesAnio.entries}
              highlightVolunteerId={highlightVolunteerId}
              formatTotal={(n) =>
                `${n} ${n === 1 ? "actividad" : "actividades"}`
              }
              emptyMessage="Aún no hay inscripciones a actividades este año."
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
