"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/panel",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Credenciales incorrectas. Intente de nuevo." };
    }
    // NEXT_REDIRECT throws an error that must be re-thrown
    throw error;
  }
  return { success: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
