import type { NextAuthConfig } from "next-auth";

/**
 * Tiempo (en segundos) que un JWT/cookie permanece válido sin actividad.
 * Si el usuario no hace ningún request en este tiempo, queda desautenticado.
 */
export const SESSION_IDLE_SECONDS = 20 * 60; // 20 minutos

/**
 * Tiempo máximo absoluto (en milisegundos) de vida de la sesión desde el login.
 * Aunque el usuario esté activo, será deslogueado después de este lapso.
 */
export const SESSION_ABSOLUTE_MS = 8 * 60 * 60 * 1000; // 8 horas

/**
 * Auth.js config that is safe for Edge Runtime (no Prisma imports).
 * Used by the middleware for route protection.
 */
export const authConfig = {
  session: {
    strategy: "jwt",
    // Caduca el cookie/JWT tras 20 minutos sin actividad (rolling).
    maxAge: SESSION_IDLE_SECONDS,
    // Rota el token en cada request autenticado para que la ventana
    // de inactividad se reinicie con cada interacción del usuario.
    updateAge: 0,
  },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/recuperar") ||
        nextUrl.pathname.startsWith("/restablecer-contrasena");

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/post-login", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
