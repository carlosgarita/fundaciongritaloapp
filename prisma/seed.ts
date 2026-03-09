import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@gritalo.org" },
    update: {},
    create: {
      email: "admin@gritalo.org",
      passwordHash,
      nombre: "Admin",
      apellido: "Grítalo",
      role: "admin",
      estado: "activo",
    },
  });

  console.log("Seed completado: usuario admin@gritalo.org / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
