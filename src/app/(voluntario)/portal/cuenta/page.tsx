import { redirect } from "next/navigation";
import {
  Building2,
  CalendarDays,
  IdCard,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react";
import { auth } from "@/auth";
import { VolunteerService } from "@/lib/services/volunteer.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { ChangePasswordForm } from "./change-password-form";

const ESTADO_LABELS: Record<string, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  pendiente: "Pendiente",
};

const ESTADO_COLORS: Record<string, string> = {
  activo: "bg-success-surface text-accent-green",
  inactivo: "bg-surface-hover text-text-secondary",
  pendiente: "bg-error-surface text-accent-orange",
};

function formatDate(iso: Date | string) {
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PortalCuentaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await VolunteerService.findById(session.user.id);
  if (!me) redirect("/login");

  const estadoLabel = ESTADO_LABELS[me.estado] ?? me.estado;
  const estadoColor = ESTADO_COLORS[me.estado] ?? "bg-surface-hover text-text-secondary";

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <UserCircle className="h-7 w-7 text-primary-500 shrink-0" aria-hidden />
          Mi cuenta
        </h1>
        <p className="text-text-secondary mt-1">
          Consulta los datos de tu perfil y cambia tu contraseña cuando lo necesites.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <UserAvatar
              nombre={me.nombre}
              apellido={me.apellido}
              email={me.email}
              avatarUrl={me.avatarUrl}
              className="h-20 w-20"
              initialsClassName="bg-primary-50 text-primary-600 text-lg"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-text-primary truncate">
                {me.nombre} {me.apellido}
              </h2>
              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${estadoColor}`}
              >
                {estadoLabel}
              </span>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Correo electrónico
                </dt>
                <dd className="text-sm text-text-primary break-words">
                  {me.email}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Teléfono
                </dt>
                <dd className="text-sm text-text-primary">
                  {me.telefono?.trim() ? me.telefono : "—"}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IdCard className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Cédula
                </dt>
                <dd className="text-sm text-text-primary">
                  {me.cedula?.trim() ? me.cedula : "—"}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Sede
                </dt>
                <dd className="text-sm text-text-primary">
                  {me.sede?.trim() ? me.sede : "—"}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Miembro desde
                </dt>
                <dd className="text-sm text-text-primary">
                  {formatDate(me.createdAt)}
                </dd>
              </div>
            </div>
          </dl>

          {me.habilidades.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Habilidades
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {me.habilidades.map((h) => (
                  <span
                    key={h}
                    className="inline-flex rounded-full bg-surface-secondary px-2.5 py-1 text-xs text-text-primary"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <p className="mt-6 text-xs text-text-muted">
            Si necesitas cambiar el correo, teléfono u otros datos personales, contacta a tu coordinador.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-text-secondary">
            Cambiar contraseña
          </p>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
