"use server";

import {
  recoverySchema,
  resetPasswordFormSchema,
} from "@/lib/validations/auth";
import {
  requestPasswordResetFlow,
  resetPasswordWithToken,
} from "@/lib/password-reset";

export async function requestPasswordResetAction(email: string) {
  const parsed = recoverySchema.safeParse({ email });
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    await requestPasswordResetFlow(parsed.data.email);
    return { success: true as const };
  } catch {
    return {
      success: false as const,
      error: "No se pudo procesar la solicitud. Intente más tarde.",
    };
  }
}

export async function resetPasswordAction(input: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const parsed = resetPasswordFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const result = await resetPasswordWithToken(
    parsed.data.token,
    parsed.data.password,
  );

  if (!result.ok) {
    return { success: false as const, error: result.error };
  }

  return { success: true as const };
}
