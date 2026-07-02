"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
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
  Lock,
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
import { UserAvatar } from "@/components/user-avatar";
import { TopVolunteersInlinePanel } from "@/components/top-volunteers-panel";
import type { VolunteerRankings } from "@/lib/services/ranking.service";
import { Trophy } from "lucide-react";

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
  sede: string;
  role: string;
  estado: string;
  habilidades: string[];
  avatarUrl: string | null;
  createdAt: string;
}

interface VolunteerListProps {
  volunteers: Volunteer[];
  rankings: VolunteerRankings;
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

const createFormSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Correo inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    nombre: z.string().min(1, "El nombre es requerido"),
    apellido: z.string().min(1, "El apellido es requerido"),
    cedula: z.string(),
    telefono: z.string(),
    sede: z.string(),
    habilidades: z.string(),
    avatarUrl: z.string().max(2048).optional(),
  })
  .superRefine((data, ctx) => {
    const raw = data.avatarUrl?.trim();
    if (!raw) return;
    try {
      const u = new URL(raw);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        ctx.addIssue({
          code: "custom",
          message: "La URL debe comenzar con http:// o https://",
          path: ["avatarUrl"],
        });
      }
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "URL de imagen inválida",
        path: ["avatarUrl"],
      });
    }
  });

const editFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  cedula: z.string(),
  telefono: z.string(),
  sede: z.string(),
  estado: z.string(),
  habilidades: z.string(),
  password: z
    .string()
    .refine((v) => v === "" || v.length >= 6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
});

type CreateFormData = z.infer<typeof createFormSchema>;
type EditFormData = z.infer<typeof editFormSchema>;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function VolunteerList({ volunteers, rankings }: VolunteerListProps) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [showTop, setShowTop] = useState(false);
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
    setShowTop(false);
    createForm.reset({
      email: "",
      password: "",
      nombre: "",
      apellido: "",
      cedula: "",
      telefono: "",
      sede: "",
      habilidades: "",
      avatarUrl: "",
    });
    setFormMode("create");
  }

  function openEdit(volunteer: Volunteer) {
    setEditingId(volunteer.id);
    setError("");
    setShowTop(false);
    editForm.reset({
      nombre: volunteer.nombre,
      apellido: volunteer.apellido,
      cedula: volunteer.cedula ?? "",
      telefono: volunteer.telefono,
      sede: volunteer.sede ?? "",
      estado: volunteer.estado,
      habilidades: volunteer.habilidades.join(", "),
      password: "",
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
        sede: data.sede || undefined,
        habilidades: parseHabilidades(data.habilidades),
        avatarUrl: data.avatarUrl?.trim() || undefined,
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
        sede: data.sede || undefined,
        estado: data.estado as "activo" | "inactivo" | "pendiente" | undefined,
        habilidades: parseHabilidades(data.habilidades),
        password: data.password.trim() || undefined,
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
      {/* ---- Panel inline: Top 10 voluntarios ---- */}
      {showTop && (
        <TopVolunteersInlinePanel
          rankings={rankings}
          onClose={() => setShowTop(false)}
          scrollIntoViewOnMount
        />
      )}

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
              noValidate
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
                  type="text"
                  inputMode="email"
                  autoComplete="email"
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
                label="Sede"
                placeholder="Ej: San José, Guanacaste… (opcional)"
                error={createForm.formState.errors.sede?.message}
                {...createForm.register("sede")}
              />

              <Input
                label="Habilidades"
                placeholder="Ej: diseño gráfico, primeros auxilios, conducción (separadas por coma)"
                error={createForm.formState.errors.habilidades?.message}
                {...createForm.register("habilidades")}
              />

              <div>
                <Input
                  label="URL de la imagen (CDN / Enlace Directo .jpg .png)"
                  type="text"
                  placeholder="https://…"
                  error={createForm.formState.errors.avatarUrl?.message}
                  {...createForm.register("avatarUrl")}
                />
                <p className="mt-1.5 text-xs text-text-muted">
                  Sugerencia: Suba la imagen a Postimages.org y pegue aquí el
                  &apos;Enlace directo&apos; terminado en formato de imagen.
                </p>
              </div>

              {errorBanner}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button type="submit" formNoValidate loading={loading}>
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
              noValidate
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

              <Input
                label="Sede"
                placeholder="Ej: San José, Guanacaste… (opcional)"
                {...editForm.register("sede")}
              />

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

              <div>
                <Input
                  label="Nueva contraseña (opcional)"
                  type="password"
                  placeholder="Dejar en blanco para no cambiarla"
                  icon={<Lock className="h-5 w-5" />}
                  autoComplete="new-password"
                  error={editForm.formState.errors.password?.message}
                  {...editForm.register("password")}
                />
                <p className="mt-1.5 text-xs text-text-muted">
                  Se usa para que el administrador restablezca la contraseña
                  cuando un voluntario la olvida. Comunícala por un canal seguro.
                </p>
              </div>

              {errorBanner}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button type="submit" formNoValidate loading={loading}>
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ---- Toolbar ---- */}
      <div className="space-y-3">
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

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full pl-9 pr-3 rounded-lg border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (showTop) {
                setShowTop(false);
              } else {
                setFormMode("closed");
                setShowTop(true);
              }
            }}
            icon={<Trophy className="h-4 w-4" />}
            aria-expanded={showTop}
            className="whitespace-nowrap"
          >
            <span className="hidden sm:inline">Top 10</span> 🏆
          </Button>
          <Button
            onClick={openCreate}
            icon={<Plus className="h-4 w-4" />}
            disabled={formMode !== "closed"}
            className="whitespace-nowrap"
          >
            <span className="hidden sm:inline">Nuevo</span> Voluntario
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
                      <UserAvatar
                        nombre={vol.nombre}
                        apellido={vol.apellido}
                        email={vol.email}
                        avatarUrl={vol.avatarUrl}
                        className="h-8 w-8 shrink-0"
                        initialsClassName="bg-primary-50 text-primary-600"
                      />
                      <div>
                        <Link
                          href={`/voluntarios/${vol.id}`}
                          className="font-medium text-text-primary hover:text-primary-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm inline-block text-left"
                        >
                          {vol.nombre} {vol.apellido}
                        </Link>
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
