"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Credenciales incorrectas. Intente de nuevo." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
}
