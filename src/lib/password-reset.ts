import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";

const PREFIX = "pwreset:";
const EXPIRY_MS = 60 * 60 * 1000;

function getAppBaseUrl() {
  const u =
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return u.replace(/\/$/, "");
}

/**
 * Crea token y envía correo si el usuario existe y tiene contraseña local.
 * No revela si el correo existe (usar siempre el mismo mensaje en la UI).
 */
export async function requestPasswordResetFlow(email: string) {
  const normalized = email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      email: { equals: normalized, mode: "insensitive" },
      deletedAt: null,
    },
  });

  if (!user?.passwordHash) {
    return;
  }

  await prisma.verificationToken.deleteMany({
    where: { identifier: `${PREFIX}${user.id}` },
  });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + EXPIRY_MS);

  await prisma.verificationToken.create({
    data: {
      identifier: `${PREFIX}${user.id}`,
      token,
      expires,
    },
  });

  const resetUrl = `${getAppBaseUrl()}/restablecer-contrasena?token=${encodeURIComponent(token)}`;
  await sendPasswordResetEmail(user.email, resetUrl);
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = token.trim();
  if (!trimmed || newPassword.length < 6) {
    return { ok: false, error: "Datos inválidos." };
  }

  const row = await prisma.verificationToken.findFirst({
    where: {
      token: trimmed,
      expires: { gt: new Date() },
    },
  });

  if (!row || !row.identifier.startsWith(PREFIX)) {
    return { ok: false, error: "El enlace no es válido o ha caducado." };
  }

  const userId = row.identifier.slice(PREFIX.length);
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });

  if (!user) {
    return { ok: false, error: "El enlace no es válido o ha caducado." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: row.identifier,
          token: row.token,
        },
      },
    }),
  ]);

  return { ok: true };
}
