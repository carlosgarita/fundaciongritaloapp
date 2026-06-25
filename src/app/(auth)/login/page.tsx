"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { LogoWithText } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { loginAction } from "@/lib/actions/auth";

const SLOW_THRESHOLD_MS = 3000;

export default function LoginPage() {
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slowConnection, setSlowConnection] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSlowTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearSlowTimer, [clearSlowTimer]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormData) {
    setGeneralError("");
    setSlowConnection(false);
    setLoading(true);

    timerRef.current = setTimeout(
      () => setSlowConnection(true),
      SLOW_THRESHOLD_MS,
    );

    try {
      const result = await loginAction(data.email, data.password);

      if (result && !result.success) {
        setGeneralError(result.error ?? "Error de autenticación.");
      }
    } catch {
      // NEXT_REDIRECT is thrown on successful login redirect
    } finally {
      clearSlowTimer();
      setLoading(false);
      setSlowConnection(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-surface rounded-2xl shadow-lg p-8 sm:p-10">
          <div className="mb-8">
            <LogoWithText size={72} />
          </div>

          <h2 className="text-xl font-bold text-text-primary text-center mb-8">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Correo electrónico"
              type="text"
              inputMode="email"
              placeholder="ejemplo@correo.com"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              autoComplete="email"
              {...register("email")}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              autoComplete="current-password"
              {...register("password")}
            />

            {generalError && (
              <div className="flex items-start gap-2 p-3 bg-error-surface border border-error-border rounded-lg animate-shake">
                <AlertCircle className="h-5 w-5 text-accent-red shrink-0 mt-0.5" />
                <p className="text-sm text-accent-red">{generalError}</p>
              </div>
            )}

            <Button
              type="submit"
              formNoValidate
              loading={loading}
              className="w-full h-12 text-base rounded-xl mt-2"
              size="lg"
            >
              Ingresar
            </Button>

            {slowConnection && (
              <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in">
                <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
                <p className="text-sm text-amber-700">
                  Conectando con el servidor, por favor espere…
                </p>
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-text-secondary">
              Si no tienes cuenta u olvidaste tu contraseña por favor contacta a
              tu coordinador regional.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
