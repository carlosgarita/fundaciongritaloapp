"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function initialsFromActivity(nombre: string): string {
  const trimmed = nombre.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  const pair = `${a}${b}`.trim();
  if (pair.length > 0) return pair.toUpperCase().slice(0, 2);
  return trimmed[0]!.toUpperCase();
}

export interface ActivityImageProps {
  nombre: string;
  imagenUrl?: string | null;
  /** Contenedor del círculo (ej. h-8 w-8 o h-9 w-9) */
  className?: string;
  /** Clases del círculo de iniciales cuando no hay foto */
  initialsClassName?: string;
}

/**
 * Muestra la imagen de la actividad si la URL es http(s) y carga; si no, iniciales.
 * Usa `<img>` para no depender de `remotePatterns` de `next/image`.
 * Replica el patrón de `UserAvatar` para que el comportamiento visual sea idéntico.
 */
export function ActivityImage({
  nombre,
  imagenUrl,
  className = "h-8 w-8",
  initialsClassName,
}: ActivityImageProps) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [imagenUrl]);

  const onImgError = useCallback(() => {
    setImgFailed(true);
  }, []);

  const trimmed = imagenUrl?.trim() ?? "";
  const canTry =
    trimmed.length > 0 &&
    (trimmed.startsWith("http://") || trimmed.startsWith("https://")) &&
    !imgFailed;

  const initials = initialsFromActivity(nombre);

  return (
    <div className={cn("shrink-0 overflow-hidden rounded-full", className)}>
      {canTry ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={trimmed}
          alt={nombre}
          className="h-full w-full object-cover object-center"
          referrerPolicy="no-referrer"
          onError={onImgError}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full text-xs font-bold",
            initialsClassName,
          )}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
