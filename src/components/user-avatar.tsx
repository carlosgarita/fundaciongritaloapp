"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function initialsFromProfile(
  nombre: string,
  apellido: string,
  email: string,
): string {
  const a = (nombre?.[0] || "").trim();
  const b = (apellido?.[0] || "").trim();
  const pair = `${a}${b}`.trim();
  if (pair.length > 0) return pair.toUpperCase().slice(0, 2);
  return (email?.[0] || "?").toUpperCase();
}

export interface UserAvatarProps {
  nombre: string;
  apellido: string;
  email: string;
  avatarUrl?: string | null;
  /** Contenedor del círculo (ej. h-8 w-8 o h-9 w-9) */
  className?: string;
  /** Clases del círculo de iniciales cuando no hay foto */
  initialsClassName?: string;
}

/**
 * Muestra la foto si la URL es http(s) y la imagen carga; si no, iniciales.
 * Usa `<img>` para no depender de `remotePatterns` de `next/image`.
 */
export function UserAvatar({
  nombre,
  apellido,
  email,
  avatarUrl,
  className = "h-8 w-8",
  initialsClassName,
}: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [avatarUrl]);

  const onImgError = useCallback(() => {
    setImgFailed(true);
  }, []);

  const trimmed = avatarUrl?.trim() ?? "";
  const canTry =
    trimmed.length > 0 &&
    (trimmed.startsWith("http://") || trimmed.startsWith("https://")) &&
    !imgFailed;

  const initials = initialsFromProfile(nombre, apellido, email);

  const displayName = `${nombre || ""} ${apellido || ""}`.trim() || email;

  return (
    <div className={cn("shrink-0 overflow-hidden rounded-full", className)}>
      {canTry ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={trimmed}
          alt={displayName}
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
