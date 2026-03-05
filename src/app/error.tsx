"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: send to error tracking service in production
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          Algo salió mal
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Ocurrió un error inesperado. Por favor, intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-primary-500 text-text-inverse rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
