/**
 * CLI: Crear o reemplazar un administrador
 *
 * Uso:
 *   npx tsx scripts/create-admin.ts \
 *     --email director@gritalo.org \
 *     --nombre María \
 *     --apellido López \
 *     --password 'MiClaveSegura123!'
 *
 *   Si se omite --password, se genera una aleatoria y se muestra en consola.
 *   Requiere DATABASE_URL en .env o .env.local.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (key.startsWith("--") && i + 1 < argv.length) {
      args[key.slice(2)] = argv[++i];
    }
  }
  return args;
}

function generatePassword(length = 16): string {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.email) {
    console.error("\n  Uso: npx tsx scripts/create-admin.ts --email <email> --nombre <nombre> --apellido <apellido> [--password <password>]\n");
    process.exit(1);
  }

  const email = args.email.trim().toLowerCase();
  const nombre = args.nombre?.trim() || "";
  const apellido = args.apellido?.trim() || "";
  const wasGenerated = !args.password;
  const plainPassword = args.password?.trim() || generatePassword();

  if (plainPassword.length < 8) {
    console.error("  Error: La contraseña debe tener al menos 8 caracteres.\n");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(plainPassword, 12);

  const protect = args.protected !== "false";

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      nombre,
      apellido,
      role: "admin",
      estado: "activo",
      isProtected: protect,
      deletedAt: null,
    },
    create: {
      email,
      passwordHash,
      nombre,
      apellido,
      role: "admin",
      estado: "activo",
      isProtected: protect,
    },
  });

  console.log("\n  ✓ Administrador configurado exitosamente\n");
  console.log(`    ID:       ${user.id}`);
  console.log(`    Email:    ${email}`);
  console.log(`    Nombre:   ${nombre} ${apellido}`);
  console.log(`    Protegido: ${protect ? "Sí (no puede ser degradado desde la UI)" : "No"}`);
  if (wasGenerated) {
    console.log(`    Password: ${plainPassword}  (generada — guárdala en un lugar seguro)`);
  } else {
    console.log(`    Password: (la que proporcionaste)`);
  }
  console.log("");
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
