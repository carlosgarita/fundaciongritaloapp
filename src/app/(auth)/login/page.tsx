"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { LogoWithText } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setGeneralError("Credenciales incorrectas. Intente de nuevo.");
        return;
      }

      router.push("/panel");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setGeneralError("Error de conexión. Intente más tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
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
              label="Email"
              type="email"
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
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">
                <AlertCircle className="h-5 w-5 text-accent-red shrink-0 mt-0.5" />
                <p className="text-sm text-accent-red">{generalError}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 text-base rounded-xl mt-2"
              size="lg"
            >
              Ingresar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/recuperar"
              className="text-sm text-primary-500 hover:text-primary-600 hover:underline transition-colors"
            >
              ¿Olvidó su contraseña?
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-text-muted">¿No tienes una cuenta?</p>
            <p className="text-sm font-medium text-text-primary mt-1">
              Contacta a tu coordinador regional
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
