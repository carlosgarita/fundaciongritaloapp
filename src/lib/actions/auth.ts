"use server";

import { signIn, signOut } from "@/auth";
import type { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";

const CONNECTION_ERROR_MSG =
  "Error de conexión con el servidor. Por favor intente de nuevo en unos segundos.";

export async function loginAction(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const result = await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
    });
    if (result?.error) {
      return {
        success: false as const,
        error: "Credenciales incorrectas. Intente de nuevo.",
      };
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: "Credenciales incorrectas. Intente de nuevo.",
      };
    }
    console.error("[LOGIN_ERROR]", error);
    return { success: false as const, error: CONNECTION_ERROR_MSG };
  }

  try {
    const user = await withDbRetry(() =>
      prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          deletedAt: null,
        } as Prisma.UserWhereInput,
        select: { role: true },
      }),
    );
    if (!user) {
      return {
        success: false as const,
        error: "No se pudo completar el acceso.",
      };
    }
    redirect(user.role === "admin" ? "/panel" : "/portal");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("[LOGIN_POST_ERROR]", error);
    return { success: false as const, error: CONNECTION_ERROR_MSG };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
