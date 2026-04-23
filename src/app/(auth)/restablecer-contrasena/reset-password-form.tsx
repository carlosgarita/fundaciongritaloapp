"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Lock, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { LogoWithText } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  resetPasswordClientSchema,
  type ResetPasswordClientData,
} from "@/lib/validations/auth";
import { resetPasswordAction } from "@/lib/actions/password-reset";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [pending, startTransition] = useTransition();
  const [generalError, setGeneralError] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordClientData>({
    resolver: zodResolver(resetPasswordClientSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit(data: ResetPasswordClientData) {
    setGeneralError("");
    startTransition(async () => {
      const r = await resetPasswordAction({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      if (!r.success) {
        setGeneralError(r.error);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    });
  }

  if (!token) {
    return (
      <main
        id="main-content"
        className="min-h-screen flex items-center justify-center bg-surface-secondary p-4"
      >
        <div className="w-full max-w-md animate-fade-in bg-surface rounded-2xl shadow-lg p-8 sm:p-10 text-center">
          <LogoWithText size={64} />
          <h1 className="text-xl font-bold text-text-primary mt-6 mb-2">
            Enlace no válido
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Falta el token de recuperación. Solicita un nuevo enlace desde la
            pantalla de recuperación.
          </p>
          <Link
            href="/recuperar"
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Solicitar nuevo enlace
          </Link>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main
        id="main-content"
        className="min-h-screen flex items-center justify-center bg-surface-secondary p-4"
      >
        <div className="w-full max-w-md animate-fade-in bg-surface rounded-2xl shadow-lg p-8 sm:p-10 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-success-surface rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-accent-green" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">
            Contraseña actualizada
          </h1>
          <p className="text-sm text-text-secondary">
            Ya puedes iniciar sesión con tu nueva contraseña. Te redirigimos al
            inicio de sesión…
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center bg-surface-secondary p-4"
    >
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-surface rounded-2xl shadow-lg p-8 sm:p-10">
          <div className="mb-8">
            <LogoWithText size={64} />
          </div>

          <h1 className="text-xl font-bold text-text-primary text-center mb-2">
            Nueva contraseña
          </h1>
          <p className="text-sm text-text-secondary text-center mb-8">
            Elige una contraseña segura (mínimo 6 caracteres).
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              icon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              disabled={pending}
              {...register("password")}
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              icon={<Lock className="h-5 w-5" />}
              error={errors.confirmPassword?.message}
              disabled={pending}
              {...register("confirmPassword")}
            />

            {generalError ? (
              <div className="flex items-start gap-2 p-3 bg-error-surface border border-error-border rounded-lg">
                <AlertCircle className="h-5 w-5 text-accent-red shrink-0 mt-0.5" />
                <p className="text-sm text-accent-red">{generalError}</p>
              </div>
            ) : null}

            <Button
              type="submit"
              loading={pending}
              className="w-full h-12 text-base rounded-xl"
              size="lg"
            >
              Guardar contraseña
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
