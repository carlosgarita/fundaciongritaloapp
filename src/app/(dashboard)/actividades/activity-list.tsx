"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  MapPin,
  Users,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createActivityAction,
  updateActivityAction,
  deleteActivityAction,
} from "@/lib/actions/activity";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Activity {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  fechaInicio: string;
  fechaCierre: string;
  cuposTotales: number;
  cuposDisponibles: number;
  estado: string;
  ubicacion: string;
  createdBy: { id: string; nombre: string; apellido: string } | null;
  _count: { enrollments: number };
}

interface ActivityListProps {
  activities: Activity[];
}

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */

const TIPO_LABELS: Record<string, string> = {
  social: "Social",
  comunitario: "Comunitario",
  educacion: "Educación",
  ambiente: "Ambiente",
  salud: "Salud",
  comunicacion: "Comunicación",
  logistica: "Logística",
  otro: "Otro",
};

const TIPO_OPTIONS = Object.entries(TIPO_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ESTADO_LABELS: Record<string, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const ESTADO_OPTIONS = Object.entries(ESTADO_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ESTADO_COLORS: Record<string, string> = {
  borrador: "bg-surface-hover text-text-secondary",
  publicada: "bg-success-surface text-accent-green",
  finalizada: "bg-primary-50 text-primary-700",
  cancelada: "bg-error-surface text-accent-red",
};

const FILTER_TABS = [{ value: "", label: "Todas" }, ...ESTADO_OPTIONS];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

/* ------------------------------------------------------------------ */
/*  Form schema (client-side — server actions do strict validation)    */
/* ------------------------------------------------------------------ */

const activityFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string(),
  tipo: z.string().min(1, "El tipo es requerido"),
  fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
  fechaCierre: z.string().min(1, "La fecha de cierre es requerida"),
  cuposTotales: z.string().min(1, "Los cupos son requeridos"),
  ubicacion: z.string(),
  estado: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activityFormSchema>;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ActivityList({ activities }: ActivityListProps) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
  });

  useEffect(() => {
    if (formMode !== "closed" && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formMode]);

  /* ---- Filtered list ---- */

  const filtered = activities.filter((a) => {
    if (filter && a.estado !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.nombre.toLowerCase().includes(q) ||
        a.ubicacion.toLowerCase().includes(q) ||
        (TIPO_LABELS[a.tipo] ?? a.tipo).toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* ---- Form helpers ---- */

  function openCreate() {
    setEditingId(null);
    setError("");
    reset({
      nombre: "",
      descripcion: "",
      tipo: "otro",
      fechaInicio: "",
      fechaCierre: "",
      cuposTotales: "",
      ubicacion: "",
    });
    setFormMode("create");
  }

  function openEdit(activity: Activity) {
    setEditingId(activity.id);
    setError("");
    reset({
      nombre: activity.nombre,
      descripcion: activity.descripcion,
      tipo: activity.tipo,
      fechaInicio: toDatetimeLocal(activity.fechaInicio),
      fechaCierre: toDatetimeLocal(activity.fechaCierre),
      cuposTotales: String(activity.cuposTotales),
      ubicacion: activity.ubicacion,
      estado: activity.estado,
    });
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode("closed");
    setEditingId(null);
    setError("");
  }

  /* ---- Submit handler ---- */

  const onSubmit = async (data: ActivityFormData) => {
    setError("");
    setLoading(true);

    const cupos = parseInt(data.cuposTotales, 10);
    if (isNaN(cupos) || cupos < 1) {
      setError("Los cupos deben ser un número mayor a 0.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion || undefined,
        tipo: data.tipo as
          | "social"
          | "comunitario"
          | "educacion"
          | "ambiente"
          | "salud"
          | "comunicacion"
          | "logistica"
          | "otro",
        fechaInicio: new Date(data.fechaInicio).toISOString(),
        fechaCierre: new Date(data.fechaCierre).toISOString(),
        cuposTotales: cupos,
        ubicacion: data.ubicacion || undefined,
      };

      const result =
        formMode === "edit" && editingId
          ? await updateActivityAction(editingId, {
              ...payload,
              estado: data.estado as
                | "borrador"
                | "publicada"
                | "finalizada"
                | "cancelada"
                | undefined,
            })
          : await createActivityAction(payload);

      if (result.success) {
        closeForm();
        router.refresh();
      } else {
        setError(result.error ?? "Error desconocido");
      }
    } catch {
      setError("Error al guardar la actividad.");
    } finally {
      setLoading(false);
    }
  };

  /* ---- Delete handler ---- */

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const result = await deleteActivityAction(id);
      if (result.success) {
        setConfirmDeleteId(null);
        router.refresh();
      } else {
        setError(result.error ?? "Error al eliminar");
      }
    } catch {
      setError("Error al eliminar la actividad.");
    } finally {
      setLoading(false);
    }
  };

  /* ---- Render ---- */

  return (
    <div className="space-y-6">
      {/* ---- Inline form (create / edit) ---- */}
      {formMode !== "closed" && (
        <Card ref={formRef}>
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 className="text-lg font-bold text-text-primary">
              {formMode === "edit" ? "Editar Actividad" : "Nueva Actividad"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Cerrar formulario"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Nombre de la actividad"
                  error={errors.nombre?.message}
                  {...register("nombre")}
                />
                <Select
                  label="Tipo"
                  options={TIPO_OPTIONS}
                  error={errors.tipo?.message}
                  {...register("tipo")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Descripción (opcional)"
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                  {...register("descripcion")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Fecha de inicio"
                  type="datetime-local"
                  error={errors.fechaInicio?.message}
                  {...register("fechaInicio")}
                />
                <Input
                  label="Fecha de cierre"
                  type="datetime-local"
                  error={errors.fechaCierre?.message}
                  {...register("fechaCierre")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cupos totales"
                  type="number"
                  min={1}
                  placeholder="Ej: 20"
                  error={errors.cuposTotales?.message}
                  {...register("cuposTotales")}
                />
                <Input
                  label="Ubicación"
                  placeholder="Lugar (opcional)"
                  {...register("ubicacion")}
                />
              </div>

              {formMode === "edit" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Estado"
                    options={ESTADO_OPTIONS}
                    error={errors.estado?.message}
                    {...register("estado")}
                  />
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-error-surface border border-error-border rounded-lg">
                  <AlertCircle className="h-5 w-5 text-accent-red shrink-0 mt-0.5" />
                  <p className="text-sm text-accent-red">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button type="submit" loading={loading}>
                  {formMode === "edit"
                    ? "Guardar Cambios"
                    : "Crear Actividad"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ---- Toolbar: filters + search + create button ---- */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filter === tab.value
                  ? "bg-primary-500 text-white"
                  : "bg-surface-hover text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors w-48"
            />
          </div>
          <Button
            onClick={openCreate}
            icon={<Plus className="h-4 w-4" />}
            disabled={formMode !== "closed"}
          >
            Nueva Actividad
          </Button>
        </div>
      </div>

      {/* ---- Activity table ---- */}
      {filtered.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-secondary">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">
                  Tipo
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden sm:table-cell">
                  Fecha Inicio
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">
                  Cupos
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Estado
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">
                      {activity.nombre}
                    </p>
                    {activity.ubicacion && (
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {activity.ubicacion}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {TIPO_LABELS[activity.tipo] ?? activity.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap hidden sm:table-cell">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(activity.fechaInicio)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="flex items-center gap-1 text-text-secondary">
                      <Users className="h-3.5 w-3.5" />
                      {activity.cuposDisponibles}/{activity.cuposTotales}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        ESTADO_COLORS[activity.estado] ?? ""
                      }`}
                    >
                      {ESTADO_LABELS[activity.estado] ?? activity.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {confirmDeleteId === activity.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-text-secondary mr-1">
                          ¿Eliminar?
                        </span>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={loading}
                          onClick={() => handleDelete(activity.id)}
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(activity)}
                          aria-label={`Editar ${activity.nombre}`}
                          disabled={formMode !== "closed"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(activity.id)}
                          aria-label={`Eliminar ${activity.nombre}`}
                          className="text-accent-red hover:text-red-600 hover:bg-error-surface"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">
              {search || filter
                ? "No se encontraron actividades con estos filtros."
                : "No hay actividades registradas. Crea la primera."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Global error for delete actions */}
      {error && formMode === "closed" && (
        <div className="flex items-start gap-2 p-3 bg-error-surface border border-error-border rounded-lg">
          <AlertCircle className="h-5 w-5 text-accent-red shrink-0 mt-0.5" />
          <p className="text-sm text-accent-red">{error}</p>
        </div>
      )}
    </div>
  );
}
