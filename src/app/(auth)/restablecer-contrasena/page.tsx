import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

function ResetFallback() {
  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center bg-surface-secondary p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface shadow-lg p-10 text-center text-text-secondary text-sm">
        Cargando…
      </div>
    </main>
  );
}

export default function RestablecerContrasenaPage() {
  return (
    <Suspense fallback={<ResetFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
