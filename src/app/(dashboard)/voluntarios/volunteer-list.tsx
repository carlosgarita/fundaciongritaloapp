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
  Users,
  Mail,
  Phone,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createVolunteerAction,
  updateVolunteerAction,
  deleteVolunteerAction,
} from "@/lib/actions/volunteer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Volunteer {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  telefono: string;
  role: string;
  estado: string;
  habilidades: string[];
  avatarUrl: string | null;
  createdAt: string;
}

interface VolunteerListProps {
  volunteers: Volunteer[];
}

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */

const ESTADO_LABELS: Record<string, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  pendiente: "Pendiente",
};

const ESTADO_OPTIONS = Object.entries(ESTADO_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ESTADO_COLORS: Record<string, string> = {
  activo: "bg-success-surface text-accent-green",
  inactivo: "bg-surface-hover text-text-secondary",
  pendiente: "bg-error-surface text-accent-orange",
};

const FILTER_TABS = [{ value: "", label: "Todos" }, ...ESTADO_OPTIONS];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Form schemas                                                       */
/* ------------------------------------------------------------------ */

const createFormSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  cedula: z.string(),
  telefono: z.string(),
  habilidades: z.string(),
});

const editFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  cedula: z.string(),
  telefono: z.string(),
  estado: z.string(),
  habilidades: z.string(),
});

type CreateFormData = z.infer<typeof createFormSchema>;
type EditFormData = z.infer<typeof editFormSchema>;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function VolunteerList({ volunteers }: VolunteerListProps) {
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

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createFormSchema),
  });

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
  });

  useEffect(() => {
    if (formMode !== "closed" && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formMode]);

  /* ---- Filtered list ---- */

  const filtered = volunteers.filter((v) => {
    if (filter && v.estado !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.nombre.toLowerCase().includes(q) ||
        v.apellido.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        (v.cedula ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* ---- Form helpers ---- */

  function openCreate() {
    setEditingId(null);
    setError("");
    createForm.reset({
      email: "",
      password: "",
      nombre: "",
      apellido: "",
      cedula: "",
      telefono: "",
      habilidades: "",
    });
    setFormMode("create");
  }

  function openEdit(volunteer: Volunteer) {
    setEditingId(volunteer.id);
    setError("");
    editForm.reset({
      nombre: volunteer.nombre,
      apellido: volunteer.apellido,
      cedula: volunteer.cedula ?? "",
      telefono: volunteer.telefono,
      estado: volunteer.estado,
      habilidades: volunteer.habilidades.join(", "),
    });
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode("closed");
    setEditingId(null);
    setError("");
  }

  function parseHabilidades(raw: string): string[] {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /* ---- Submit: Create ---- */

  const onCreateSubmit = async (data: CreateFormData) => {
    setError("");
    setLoading(true);

    try {
      const result = await createVolunteerAction({
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        apellido: data.apellido,
        cedula: data.cedula || undefined,
        telefono: data.telefono || undefined,
        habilidades: parseHabilidades(data.habilidades),
      });

      if (result.success) {
        closeForm();
        router.refresh();
      } else {
        setError(result.error ?? "Error desconocido");
      }
    } catch {
      setError("Error al registrar el voluntario.");
    } finally {
      setLoading(false);
    }
  };

  /* ---- Submit: Edit ---- */

  const onEditSubmit = async (data: EditFormData) => {
    if (!editingId) return;
    setError("");
    setLoading(true);

    try {
      const result = await updateVolunteerAction(editingId, {
        nombre: data.nombre,
        apellido: data.apellido,
        cedula: data.cedula || undefined,
        telefono: data.telefono || undefined,
        estado: data.estado as "activo" | "inactivo" | "pendiente" | undefined,
        habilidades: parseHabilidades(data.habilidades),
      });

      if (result.success) {
        closeForm();
        router.refresh();
      } else {
        setError(result.error ?? "Error desconocido");
      }
    } catch {
      setError("Error al actualizar el voluntario.");
    } finally {
      setLoading(false);
    }
  };

  /* ---- Delete handler ---- */

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const result = await deleteVolunteerAction(id);
      if (result.success) {
        setConfirmDeleteId(null);
        router.refresh();
      } else {
        setError(result.error ?? "Error al eliminar");
      }
    } catch {
      setError("Error al eliminar el voluntario.");
    } finally {
      setLoading(false);
    }
  };

  /* ---- Shared error banner ---- */

  const errorBanner = error && (
    <div className="flex items-start gap-2 p-3 bg-error-surface border border-error-border rounded-lg">
      <AlertCircle className="h-5 w-5 text-accent-red shrink-0 mt-0.5" />
      <p className="text-sm text-accent-red">{error}</p>
    </div>
  );

  /* ---- Render ---- */

  return (
    <div className="space-y-6">
      {/* ---- Inline form: Create ---- */}
      {formMode === "create" && (
        <Card ref={formRef}>
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 className="text-lg font-bold text-text-primary">
              Registrar Voluntario
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
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Nombre"
                  error={createForm.formState.errors.nombre?.message}
                  {...createForm.register("nombre")}
                />
                <Input
                  label="Apellido"
                  placeholder="Apellido"
                  error={createForm.formState.errors.apellido?.message}
                  {...createForm.register("apellido")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  icon={<Mail className="h-5 w-5" />}
                  error={createForm.formState.errors.email?.message}
                  {...createForm.register("email")}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  error={createForm.formState.errors.password?.message}
                  {...createForm.register("password")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cédula"
                  placeholder="(opcional)"
                  error={createForm.formState.errors.cedula?.message}
                  {...createForm.register("cedula")}
                />
                <Input
                  label="Teléfono"
                  placeholder="(opcional)"
                  icon={<Phone className="h-5 w-5" />}
                  error={createForm.formState.errors.telefono?.message}
                  {...createForm.register("telefono")}
                />
              </div>

              <Input
                label="Habilidades"
                placeholder="Ej: diseño gráfico, primeros auxilios, conducción (separadas por coma)"
                error={createForm.formState.errors.habilidades?.message}
                {...createForm.register("habilidades")}
              />

              {errorBanner}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button type="submit" loading={loading}>
                  Registrar Voluntario
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ---- Inline form: Edit ---- */}
      {formMode === "edit" && (
        <Card ref={formRef}>
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 className="text-lg font-bold text-text-primary">
              Editar Voluntario
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
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Nombre"
                  error={editForm.formState.errors.nombre?.message}
                  {...editForm.register("nombre")}
                />
                <Input
                  label="Apellido"
                  placeholder="Apellido"
                  error={editForm.formState.errors.apellido?.message}
                  {...editForm.register("apellido")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cédula"
                  placeholder="(opcional)"
                  {...editForm.register("cedula")}
                />
                <Input
                  label="Teléfono"
                  placeholder="(opcional)"
                  icon={<Phone className="h-5 w-5" />}
                  {...editForm.register("telefono")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Estado"
                  options={ESTADO_OPTIONS}
                  {...editForm.register("estado")}
                />
                <Input
                  label="Habilidades"
                  placeholder="Separadas por coma"
                  {...editForm.register("habilidades")}
                />
              </div>

              {errorBanner}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button type="submit" loading={loading}>
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ---- Toolbar ---- */}
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
            Nuevo Voluntario
          </Button>
        </div>
      </div>

      {/* ---- Volunteer table ---- */}
      {filtered.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-secondary">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden sm:table-cell">
                  Contacto
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">
                  Cédula
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">
                  Registro
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
              {filtered.map((vol) => (
                <tr
                  key={vol.id}
                  className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 text-xs font-bold shrink-0">
                        {(vol.nombre[0] ?? "").toUpperCase()}
                        {(vol.apellido[0] ?? "").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {vol.nombre} {vol.apellido}
                        </p>
                        {vol.habilidades.length > 0 && (
                          <p className="text-xs text-text-muted truncate max-w-[200px]">
                            {vol.habilidades.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-text-secondary flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {vol.email}
                    </p>
                    {vol.telefono && (
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {vol.telefono}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                    {vol.cedula || "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap hidden md:table-cell">
                    {formatDate(vol.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        ESTADO_COLORS[vol.estado] ?? ""
                      }`}
                    >
                      {ESTADO_LABELS[vol.estado] ?? vol.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {confirmDeleteId === vol.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-text-secondary mr-1">
                          ¿Eliminar?
                        </span>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={loading}
                          onClick={() => handleDelete(vol.id)}
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
                          onClick={() => openEdit(vol)}
                          aria-label={`Editar ${vol.nombre}`}
                          disabled={formMode !== "closed"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(vol.id)}
                          aria-label={`Eliminar ${vol.nombre}`}
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
            <Users className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">
              {search || filter
                ? "No se encontraron voluntarios con estos filtros."
                : "No hay voluntarios registrados. Registra el primero."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Global error for delete actions */}
      {error && formMode === "closed" && errorBanner}
    </div>
  );
}
