import { z } from "zod";

const BADGE_CRITERIA = [
  "horas",
  "actividades",
  "antiguedad",
  "especial",
] as const;

/** Opciones para los `<Select>` del panel (crear/editar insignia). */
export const BADGE_CRITERIA_OPTIONS = [
  { value: "especial", label: "Especial · reconocimiento manual" },
  { value: "horas", label: "Horas de voluntariado (umbral)" },
  { value: "actividades", label: "Actividades participadas (umbral)" },
  { value: "antiguedad", label: "Antigüedad en la plataforma (umbral en días)" },
] satisfies { value: (typeof BADGE_CRITERIA)[number]; label: string }[];

export const badgeIdSchema = z.string().min(1, "Identificador de insignia inválido");

export const createBadgeSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(200, "El nombre es demasiado largo"),
  descripcion: z.string().max(2000).optional(),
  icono: z.string().max(32).optional(),
  criterio: z.enum(BADGE_CRITERIA),
  valorCriterio: z.preprocess(
    (raw) => {
      if (raw === "" || raw === undefined || raw === null) return 0;
      const n =
        typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
      return Number.isNaN(n) ? 0 : n;
    },
    z.number().int().min(0, "El valor debe ser 0 o mayor"),
  ),
});

export const assignSchema = z.object({
  userId: z.string().min(1, "El voluntario es requerido"),
  badgeId: z.string().min(1, "La insignia es requerida"),
});

export type CreateBadgeFormData = z.infer<typeof createBadgeSchema>;

/** Fila del catálogo en el panel (props serializable al cliente). */
export type BadgeCatalogRow = {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  criterio: string;
  valorCriterio: number;
};
