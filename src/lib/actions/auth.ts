"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function loginAction(email: string, password: string) {
  try {
    const result = await signIn("credentials", {
      email,
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
    throw error;
  }

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { role: true },
  });
  if (!user) {
    return { success: false as const, error: "No se pudo completar el acceso." };
  }
  redirect(user.role === "admin" ? "/panel" : "/portal");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
