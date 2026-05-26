"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VolunteerHourForm } from "@/components/volunteer-hour-form";

interface Props {
  activities: { id: string; nombre: string }[];
  disabled?: boolean;
}

export function VolunteerHoursPanel({ activities, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const noActivities = activities.length === 0;
  const canOpen = !disabled && !noActivities;

  useEffect(() => {
    if (!open || !formRef.current) return;
    const mq = window.matchMedia("(min-width: 640px)");
    if (!mq.matches) return;
    formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => {
      document.body.style.overflow = mq.matches ? "hidden" : "";
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleClose() {
    setOpen(false);
  }

  if (open) {
    return (
      <>
        <button
          type="button"
          onClick={handleClose}
          className="fixed inset-0 z-[60] bg-black/45 sm:hidden cursor-pointer"
          aria-label="Cerrar formulario"
        />
        <div className="fixed inset-0 z-[61] flex flex-col min-h-0 sm:static sm:z-auto sm:inset-auto sm:min-h-0">
          <Card
            ref={formRef}
            className="flex flex-col flex-1 min-h-0 overflow-hidden max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:rounded-none max-sm:border-0 max-sm:shadow-xl sm:max-h-none sm:h-auto"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] shrink-0 sm:border-0 sm:px-6 sm:pt-6">
              <h2 className="min-w-0 pr-2 text-lg font-bold text-text-primary">
                Nuevo registro
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary cursor-pointer touch-manipulation sm:h-8 sm:w-8"
                aria-label="Cerrar formulario"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardContent className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
              <VolunteerHourForm
                activities={activities}
                disabled={disabled}
                onSuccess={handleClose}
                onCancel={handleClose}
              />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      {noActivities && !disabled ? (
        <p className="text-xs text-text-muted sm:mr-2">
          Inscríbete en una actividad publicada para poder registrar horas.
        </p>
      ) : null}
      <Button
        type="button"
        onClick={() => setOpen(true)}
        icon={<Plus className="h-4 w-4" />}
        disabled={!canOpen}
      >
        Nuevo Registro
      </Button>
    </div>
  );
}
