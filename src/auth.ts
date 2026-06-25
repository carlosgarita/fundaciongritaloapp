import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { authConfig, SESSION_ABSOLUTE_MS } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();

        const user = await withDbRetry(() =>
          prisma.user.findFirst({
            where: { email, deletedAt: null } as Prisma.UserWhereInput,
          }),
        );

        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.nombre} ${user.apellido}`.trim() || user.email,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await withDbRetry(() =>
          prisma.user.findFirst({
            where: {
              id: user.id!,
              deletedAt: null,
            } as Prisma.UserWhereInput,
            select: { role: true, estado: true, nombre: true, apellido: true },
          }),
        );
        if (dbUser && user.id) {
          token.id = user.id;
          token.role = dbUser.role;
          token.estado = dbUser.estado;
          token.nombre = dbUser.nombre;
          token.apellido = dbUser.apellido;
          token.loginAt = Date.now();
        }
      }

      const loginAt = typeof token.loginAt === "number" ? token.loginAt : 0;
      if (loginAt > 0 && Date.now() - loginAt > SESSION_ABSOLUTE_MS) {
        return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.estado = token.estado as string;
        session.user.nombre = token.nombre as string;
        session.user.apellido = token.apellido as string;
      }
      return session;
    },
  },
});
