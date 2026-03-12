import type { NextAuthConfig } from "next-auth";

/**
 * Auth.js config that is safe for Edge Runtime (no Prisma imports).
 * Used by the middleware for route protection.
 */
export const authConfig = {
  session: { strategy: "jwt" },
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
        nextUrl.pathname.startsWith("/recuperar");

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/panel", nextUrl));
        return true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
