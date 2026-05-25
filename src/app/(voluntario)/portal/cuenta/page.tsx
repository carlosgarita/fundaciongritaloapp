import { KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChangePasswordForm } from "./change-password-form";

export default function PortalCuentaPage() {
  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <KeyRound className="h-7 w-7 text-primary-500 shrink-0" aria-hidden />
          Mi cuenta
        </h1>
        <p className="text-text-secondary mt-1">
          Cambia tu contraseña cuando lo necesites, por ejemplo si la
          administradora te asignó una temporal.
        </p>
      </div>

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
