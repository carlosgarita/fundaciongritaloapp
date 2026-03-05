"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { LogoWithText } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { recoverySchema, type RecoveryFormData } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";

export default function RecoveryPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RecoveryFormData>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: RecoveryFormData) {
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        { redirectTo: `${window.location.origin}/auth/callback?next=/configuracion` }
      );

      if (resetError) {
        setError("No se pudo enviar el correo. Intente más tarde.");
        return;
      }

      setSent(true);
    } catch {
      setError("Error de conexión. Intente más tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-surface rounded-2xl shadow-lg p-8 sm:p-10">
          <div className="mb-8">
            <LogoWithText size={64} />
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-success-surface rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-accent-green" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                Correo enviado
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Hemos enviado un enlace de recuperación a{" "}
                <strong className="text-text-primary">{getValues("email")}</strong>.
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 hover:underline mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-text-primary text-center mb-2">
                Recuperar Contraseña
              </h2>
              <p className="text-sm text-text-secondary text-center mb-8">
                Ingresa tu correo electrónico y te enviaremos un enlace para
                restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  icon={<Mail className="h-5 w-5" />}
                  error={errors.email?.message}
                  autoComplete="email"
                  {...register("email")}
                />

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-error-surface border border-error-border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-accent-red shrink-0 mt-0.5" />
                    <p className="text-sm text-accent-red">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full h-12 text-base rounded-xl"
                  size="lg"
                >
                  Enviar Enlace de Recuperación
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}
