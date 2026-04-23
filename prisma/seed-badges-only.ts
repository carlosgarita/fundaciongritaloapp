/**
 * Solo sincroniza el catálogo de insignias en la BD (crear/actualizar por nombre).
 * No borra usuarios ni datos demo. Uso: npm run db:seed:badges
 */
import { PrismaClient } from "@prisma/client";
import { CATALOG_BADGES, upsertCatalogBadges } from "./badge-catalog";

const prisma = new PrismaClient();

async function main() {
  await upsertCatalogBadges(prisma);
  console.log(
    `Listo: ${CATALOG_BADGES.length} insignias sincronizadas en la tabla Badge.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
