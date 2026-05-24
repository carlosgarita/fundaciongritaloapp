import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeService } from "@/lib/services/badge.service";
import type { BadgeCriteria } from "@prisma/client";
import { Award, Sparkles } from "lucide-react";

function criterioLabel(c: BadgeCriteria): string {
  switch (c) {
    case "horas":
      return "Horas de voluntariado";
    case "actividades":
      return "Participación en actividades";
    case "antiguedad":
      return "Trayectoria";
    case "especial":
      return "Reconocimiento especial";
    default:
      return "Insignia";
  }
}

function criterioDetalle(c: BadgeCriteria, valor: number): string | null {
  if (c === "horas" && valor > 0) {
    return `Referencia: ${valor} horas validadas`;
  }
  if (c === "actividades" && valor > 0) {
    return `Referencia: ${valor} actividades`;
  }
  if (c === "antiguedad" && valor > 0) {
    return `Referencia: ${valor} días desde el alta`;
  }
  return null;
}

export default async function PortalInsigniasPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  let userBadges: Awaited<ReturnType<typeof BadgeService.listForUser>> = [];

  try {
    userBadges = await BadgeService.listForUser(userId);
  } catch {
    userBadges = [];
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-primary-50/40 px-6 py-8 sm:px-10 sm:py-10 shadow-sm">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-200/30 blur-2xl" aria-hidden />
        <div className="absolute -bottom-10 left-1/3 h-24 w-24 rounded-full bg-primary-200/20 blur-2xl" aria-hidden />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800">
              <Sparkles className="h-4 w-4" aria-hidden />
              Tu reconocimiento
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Insignias y logros
            </h1>
            <p className="text-text-secondary leading-relaxed">
              Cada insignia cuenta una parte de tu compromiso con la fundación.
              Compártelas con orgullo: son el reflejo del tiempo, la dedicación y
              el impacto que generas en la comunidad.
            </p>
          </div>
          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-white/80 px-5 py-4 border border-amber-100 shadow-sm">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600 tabular-nums">
                {userBadges.length}
              </p>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mt-0.5">
                Conseguidas
              </p>
            </div>
          </div>
        </div>
      </div>

      {userBadges.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-surface-secondary/30">
          <CardContent className="py-16 px-6 text-center max-w-lg mx-auto">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Award className="h-8 w-8" aria-hidden />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">
              Aún no tienes insignias
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Sigue participando en actividades, registrando tus horas y dando lo
              mejor de ti. El equipo puede reconocerte con insignias especiales
              cuando alcances metas o destaques en el voluntariado.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
          {userBadges.map((ub) => {
            const b = ub.badge;
            const earned = new Date(ub.earnedAt);
            const detalle = criterioDetalle(b.criterio, b.valorCriterio);

            return (
              <li key={ub.id}>
                <article
                  className="group h-full rounded-2xl border border-border bg-surface p-1 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-200/90 hover:-translate-y-0.5"
                  aria-labelledby={`badge-title-${ub.id}`}
                >
                  <div className="flex h-full flex-col rounded-xl bg-gradient-to-b from-amber-50/50 to-surface px-5 pt-6 pb-5">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-inner border border-amber-100"
                        aria-hidden
                      >
                        {b.icono || "🏆"}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/90 mb-1">
                          {criterioLabel(b.criterio)}
                        </p>
                        <h2
                          id={`badge-title-${ub.id}`}
                          className="text-lg font-bold text-text-primary leading-snug"
                        >
                          {b.nombre}
                        </h2>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-text-secondary leading-relaxed flex-1">
                      {b.descripcion}
                    </p>

                    <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-amber-100/80 pt-4">
                      <div>
                        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                          Obtenida el
                        </p>
                        <p className="text-sm font-semibold text-text-primary">
                          {earned.toLocaleDateString("es", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {detalle ? (
                        <p className="text-xs text-text-muted max-w-[12rem] text-right">
                          {detalle}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
