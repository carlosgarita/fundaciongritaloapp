"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createBadgeAction } from "@/lib/actions/badge";
import {
  BADGE_CRITERIA_OPTIONS,
  createBadgeSchema,
  type CreateBadgeFormData,
} from "@/lib/validations/badge";

interface CreateBadgeFormProps {
  /** Si se indica, se muestra botón Cancelar y se usa al cerrar el panel inline. */
  onCancel?: () => void;
  /** Tras crear con éxito (después de `router.refresh`). */
  onCreated?: () => void;
  /** Texto del botón principal (por defecto "Crear insignia"). */
  submitLabel?: string;
}

export function CreateBadgeForm({
  onCancel,
  onCreated,
  submitLabel = "Crear insignia",
}: CreateBadgeFormProps = {}) {
  const router = useRouter();
  const descriptionId = useId();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CreateBadgeFormData>({
    resolver: zodResolver(createBadgeSchema) as Resolver<CreateBadgeFormData>,
    defaultValues: {
      nombre: "",
      descripcion: "",
      icono: "🏆",
      criterio: "especial",
      valorCriterio: 0,
    },
  });

  const criterio = watch("criterio");

  const onSubmit = async (data: CreateBadgeFormData) => {
    setServerError("");
    const result = await createBadgeAction({
      nombre: data.nombre,
      descripcion: data.descripcion ?? "",
      icono: data.icono ?? "",
      criterio: data.criterio,
      valorCriterio: data.valorCriterio,
    });
    if (result.success) {
      reset({
        nombre: "",
        descripcion: "",
        icono: "🏆",
        criterio: "especial",
        valorCriterio: 0,
      });
      router.refresh();
      onCreated?.();
    } else {
      setServerError(result.error);
    }
  };

  return (
    <form className="space-y-4 max-w-3xl" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Nombre"
        placeholder="Ej. Impacto social"
        error={errors.nombre?.message}
        {...register("nombre")}
      />
      <p className="text-xs text-text-muted">
        El nombre debe ser único en el catálogo (los espacios al inicio o al
        final se ignoran).
      </p>

      <div className="w-full">
        <label
          htmlFor={descriptionId}
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          Descripción
        </label>
        <textarea
          id={descriptionId}
          rows={3}
          placeholder="Qué reconoce esta insignia y cuándo aplica..."
          aria-invalid={errors.descripcion ? true : undefined}
          className="w-full rounded-xl border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted transition-colors shadow-sm resize-y min-h-[5rem]
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 border-border aria-invalid:border-accent-red aria-invalid:focus:ring-accent-red/20"
          {...register("descripcion")}
        />
        {errors.descripcion?.message ? (
          <p className="mt-1.5 text-sm text-accent-red" role="alert">
            {errors.descripcion.message}
          </p>
        ) : null}
      </div>

      <Input
        label="Icono (emoji sugerido)"
        placeholder="🏆"
        error={errors.icono?.message}
        {...register("icono")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Criterio base"
          options={BADGE_CRITERIA_OPTIONS}
          {...register("criterio")}
        />
        <Input
          label="Valor de referencia"
          type="number"
          min={0}
          step={1}
          error={errors.valorCriterio?.message}
          {...register("valorCriterio")}
        />
      </div>

      <p className="text-xs text-text-muted -mt-1">
        {criterio === "especial"
          ? "Para insignias sólo por asignación manual, suele bastar el valor 0."
          : criterio === "horas"
            ? "Ej. 50 = referencia hasta alcanzar 50 horas validadas (automático en el futuro)."
            : criterio === "actividades"
              ? "Ej. 5 = tras participar en 5 actividades distintas (referencia para reglas)."
              : "Ej. 6 = tras 6 meses de trayectoria (referencia para reglas)."}
      </p>

      {serverError ? (
        <div className="flex items-center gap-2 text-sm text-accent-red">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3 pt-1">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
