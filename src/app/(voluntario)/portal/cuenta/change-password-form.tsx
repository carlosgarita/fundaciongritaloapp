"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/lib/validations/auth";
import { changeOwnPasswordAction } from "@/lib/actions/account";

export function ChangePasswordForm() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordFormData) {
    setServerError("");
    setSuccess(false);
    setLoading(true);

    try {
      const result = await changeOwnPasswordAction(data);
      if (result.success) {
        setSuccess(true);
        reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setServerError(result.error ?? "No se pudo cambiar la contraseña.");
      }
    } catch {
      setServerError("Error al cambiar la contraseña. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <Input
        label="Contraseña actual"
        type="password"
        placeholder="••••••••"
        icon={<Lock className="h-5 w-5" />}
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />

      <Input
        label="Nueva contraseña"
        type="password"
        placeholder="Mínimo 6 caracteres"
        icon={<Lock className="h-5 w-5" />}
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />

      <Input
        label="Confirmar nueva contraseña"
        type="password"
        placeholder="Repite la nueva contraseña"
        icon={<Lock className="h-5 w-5" />}
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {serverError ? (
        <div className="flex items-start gap-2 p-3 bg-error-surface border border-error-border rounded-lg">
          <AlertCircle className="h-5 w-5 text-accent-red shrink-0 mt-0.5" />
          <p className="text-sm text-accent-red">{serverError}</p>
        </div>
      ) : null}

      {success ? (
        <div className="flex items-start gap-2 p-3 bg-success-surface border border-success-border rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-accent-green shrink-0 mt-0.5" />
          <p className="text-sm text-accent-green">
            Contraseña actualizada. La próxima vez que inicies sesión, usa la
            nueva contraseña.
          </p>
        </div>
      ) : null}

      <div className="flex justify-end pt-2">
        <Button type="submit" formNoValidate loading={loading}>
          Cambiar contraseña
        </Button>
      </div>
    </form>
  );
}
