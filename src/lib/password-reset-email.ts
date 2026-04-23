/**
 * Envío del enlace de recuperación. Si defines SMTP_* y SMTP_FROM, se usa nodemailer.
 * Contraseña: SMTP_PASS o SMTP_PASSWORD (cualquiera vale).
 * En desarrollo sin SMTP, el enlace se imprime en consola del servidor.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ?? process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  const subject = "Recuperar contraseña — Fundación Grítalo";
  const text = `Hola,\n\nPara elegir una nueva contraseña, abre este enlace (válido por 1 hora):\n\n${resetUrl}\n\nSi no solicitaste este cambio, ignora este mensaje.\n`;
  const html = `<p>Hola,</p><p>Para elegir una nueva contraseña, haz clic en el siguiente enlace (válido por 1 hora):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>`;

  if (host && from && user != null && pass != null && pass !== "") {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({ from, to, subject, text, html });
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.info(
      "\n[password-reset] SMTP no configurado. Enlace de recuperación:\n",
      `  Para: ${to}\n  URL:  ${resetUrl}\n`,
    );
    return;
  }

  console.warn(
    "[password-reset] SMTP incompleto o ausente (SMTP_HOST, SMTP_FROM, SMTP_USER, SMTP_PASS o SMTP_PASSWORD). No se envió correo.",
  );
}
