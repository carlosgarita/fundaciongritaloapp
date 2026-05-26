"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { volunteerCreateHourLogSchema } from "@/lib/validations/hour-log";
import { z } from "zod";
import { submitHourLogVolunteerAction } from "@/lib/actions/hour-log";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const formSchema = volunteerCreateHourLogSchema;
type FormData = z.infer<typeof formSchema>;

export function VolunteerHourForm({
  activities,
  disabled,
  onSuccess,
  onCancel,
}: {
  activities: { id: string; nombre: string }[];
  disabled?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [generalError, setGeneralError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityId: activities[0]?.id ?? "",
      fecha: new Date().toISOString().slice(0, 10),
      horas: 1,
      notas: "",
    },
  });

  function onSubmit(data: FormData) {
    setGeneralError("");
    startTransition(async () => {
      const r = await submitHourLogVolunteerAction({
        ...data,
        horas: Number(data.horas),
      });
      if (!r.success) {
        setGeneralError(r.error);
        return;
      }
      reset({
        activityId: data.activityId,
        fecha: new Date().toISOString().slice(0, 10),
        horas: 1,
        notas: "",
      });
      router.refresh();
      onSuccess?.();
    });
  }

  if (activities.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Inscríbete en una actividad publicada para poder registrar horas.
        </p>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cerrar
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-lg"
      noValidate
    >
      <div>
        <label
          htmlFor="activityId"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Actividad
        </label>
        <select
          id="activityId"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={disabled || pending}
          {...register("activityId")}
        >
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
        {errors.activityId ? (
          <p className="text-xs text-accent-red mt-1">{errors.activityId.message}</p>
        ) : null}
      </div>

      <Input
        label="Fecha del trabajo"
        type="date"
        error={errors.fecha?.message}
        disabled={disabled || pending}
        {...register("fecha")}
      />

      <Input
        label="Horas"
        type="number"
        step="0.5"
        min={0.5}
        max={24}
        error={errors.horas?.message}
        disabled={disabled || pending}
        {...register("horas", { valueAsNumber: true })}
      />

      <Input
        label="Notas (opcional)"
        placeholder="Breve descripción de lo realizado"
        error={errors.notas?.message}
        disabled={disabled || pending}
        {...register("notas")}
      />

      {generalError ? (
        <div className="flex items-start gap-2 p-3 bg-error-surface border border-error-border rounded-lg">
          <AlertCircle className="h-5 w-5 text-accent-red shrink-0 mt-0.5" />
          <p className="text-sm text-accent-red">{generalError}</p>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" loading={pending} disabled={disabled}>
          Enviar registro
        </Button>
      </div>
    </form>
  );
}
