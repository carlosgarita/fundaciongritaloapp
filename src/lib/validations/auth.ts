import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Correo inválido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const recoverySchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Correo inválido"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RecoveryFormData = z.infer<typeof recoverySchema>;
