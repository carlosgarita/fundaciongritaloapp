"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";

/**
 * Tiempo (ms) tras el cual una sesión inactiva se cierra automáticamente.
 * Se mantiene alineado con `SESSION_IDLE_SECONDS` del lado del servidor.
 */
const IDLE_MS = 20 * 60 * 1000; // 20 minutos

/**
 * Llave compartida entre pestañas para sincronizar la última actividad
 * del usuario. Si se actualiza desde otra pestaña, todas extienden el timer.
 */
const ACTIVITY_KEY = "fg-last-activity";

/**
 * Eventos del DOM que cuentan como "actividad" del usuario.
 */
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

/**
 * No reescribir `localStorage` en cada `mousemove`: sólo si transcurrió
 * al menos esta cantidad de ms desde la última escritura.
 */
const LOCALSTORAGE_THROTTLE_MS = 5_000;

/**
 * Cierra automáticamente la sesión del usuario tras `IDLE_MS` de inactividad.
 *
 * - Escucha eventos de teclado/mouse/scroll para reiniciar el timer.
 * - Sincroniza la última actividad entre pestañas (storage events).
 * - Al expirar, llama a `logoutAction` (server action) que limpia la cookie
 *   y redirige a `/login`.
 *
 * Debe montarse sólo dentro de layouts autenticados.
 */
export function IdleLogout() {
  const router = useRouter();
  const lastActivityRef = useRef<number>(Date.now());
  const lastWriteRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loggingOutRef = useRef<boolean>(false);

  useEffect(() => {
    const scheduleCheck = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const remaining = IDLE_MS - (Date.now() - lastActivityRef.current);
      timerRef.current = setTimeout(check, Math.max(remaining, 1000));
    };

    const check = async () => {
      if (loggingOutRef.current) return;
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= IDLE_MS) {
        loggingOutRef.current = true;
        try {
          await logoutAction();
        } catch {
          router.replace("/login");
        }
        return;
      }
      scheduleCheck();
    };

    const updateActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;

      if (now - lastWriteRef.current >= LOCALSTORAGE_THROTTLE_MS) {
        lastWriteRef.current = now;
        try {
          window.localStorage.setItem(ACTIVITY_KEY, String(now));
        } catch {
          /* ignore */
        }
        scheduleCheck();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== ACTIVITY_KEY || !event.newValue) return;
      const ts = Number(event.newValue);
      if (Number.isFinite(ts) && ts > lastActivityRef.current) {
        lastActivityRef.current = ts;
        scheduleCheck();
      }
    };

    updateActivity();
    scheduleCheck();

    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, updateActivity, { passive: true });
    }
    window.addEventListener("storage", onStorage);

    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, updateActivity);
      }
      window.removeEventListener("storage", onStorage);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router]);

  return null;
}
