import type { PrismaClient } from "@prisma/client";
import { BadgeCriteria } from "@prisma/client";

export type CatalogBadgeInput = {
  nombre: string;
  descripcion: string;
  icono: string;
  criterio: BadgeCriteria;
  valorCriterio: number;
};

/** Catálogo de insignias asignables (manual o futuras reglas automáticas). */
export const CATALOG_BADGES: CatalogBadgeInput[] = [
  {
    nombre: "Puntualidad de oro",
    descripcion:
      "Por asistir puntualmente a todas sus actividades durante un mes.",
    icono: "🕒",
    criterio: BadgeCriteria.especial,
    valorCriterio: 0,
  },
  {
    nombre: "Primeros pasos",
    descripcion: "Por completar su primera tarea como voluntario.",
    icono: "🔥",
    criterio: BadgeCriteria.especial,
    valorCriterio: 0,
  },
  {
    nombre: "Trabajo en equipo",
    descripcion:
      "Por colaborar activamente con otros voluntarios en proyectos grupales.",
    icono: "🤝",
    criterio: BadgeCriteria.especial,
    valorCriterio: 0,
  },
  {
    nombre: "Estrella del mes",
    descripcion:
      "Por destacar en compromiso, calidad de trabajo o actitud positiva durante el mes.",
    icono: "🌟",
    criterio: BadgeCriteria.especial,
    valorCriterio: 0,
  },
  {
    nombre: "Constancia imparable · 50 h",
    descripcion:
      "Por acumular 50 horas de voluntariado validadas (nivel progresivo).",
    icono: "📈",
    criterio: BadgeCriteria.horas,
    valorCriterio: 50,
  },
  {
    nombre: "Constancia imparable · 100 h",
    descripcion:
      "Por acumular 100 horas de voluntariado validadas (nivel progresivo).",
    icono: "📈",
    criterio: BadgeCriteria.horas,
    valorCriterio: 100,
  },
  {
    nombre: "Constancia imparable · 200 h",
    descripcion:
      "Por acumular 200 horas de voluntariado validadas (nivel progresivo).",
    icono: "📈",
    criterio: BadgeCriteria.horas,
    valorCriterio: 200,
  },
  {
    nombre: "Guía mentor",
    descripcion:
      "Por capacitar o acompañar a voluntarios nuevos durante al menos 3 actividades.",
    icono: "🧭",
    criterio: BadgeCriteria.actividades,
    valorCriterio: 3,
  },
  {
    nombre: "Resolución rápida",
    descripcion:
      "Por solucionar un imprevisto o necesidad urgente con eficacia.",
    icono: "⚡",
    criterio: BadgeCriteria.especial,
    valorCriterio: 0,
  },
  {
    nombre: "Embajador visual",
    descripcion:
      "Por documentar eventos, tomar fotos o crear contenido para la comunidad.",
    icono: "📸",
    criterio: BadgeCriteria.especial,
    valorCriterio: 0,
  },
  {
    nombre: "Impacto verde",
    descripcion:
      "Por participar en actividades ambientales o ecológicas (reforestación, limpieza, etc.).",
    icono: "🌱",
    criterio: BadgeCriteria.especial,
    valorCriterio: 0,
  },
  {
    nombre: "Aprendiz estrella",
    descripcion:
      "Por completar un curso o taller interno de formación para voluntarios.",
    icono: "🎓",
    criterio: BadgeCriteria.especial,
    valorCriterio: 0,
  },
];

export async function upsertCatalogBadges(prisma: PrismaClient) {
  for (const b of CATALOG_BADGES) {
    const existing = await prisma.badge.findFirst({
      where: { nombre: b.nombre },
    });
    if (existing) {
      await prisma.badge.update({
        where: { id: existing.id },
        data: {
          descripcion: b.descripcion,
          icono: b.icono,
          criterio: b.criterio,
          valorCriterio: b.valorCriterio,
        },
      });
    } else {
      await prisma.badge.create({ data: b });
    }
  }
}
