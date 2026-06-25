/**
 * Elimina TODOS los datos y deja la app lista para producción.
 *
 * Uso:  npm run db:clean
 *
 * Qué elimina:
 *   - Todas las actividades (y sus inscripciones/horas en cascada)
 *   - Todos los voluntarios
 *   - Admin de prueba (admin@gritalo.org)
 *   - Notificaciones, userBadges, pushSubscriptions
 *
 * Qué conserva:
 *   - Admins creados con admin:create (cualquier admin que NO sea admin@gritalo.org)
 *   - Catálogo de insignias (badges)
 *   - Estructura de la base de datos
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_ADMIN_EMAIL = "admin@gritalo.org";

async function main() {
  console.log("\n  🧹 Limpiando todos los datos...\n");

  // 1. Horas (dependen de actividades y usuarios)
  const hours = await prisma.hourLog.deleteMany();
  console.log(`    ✓ ${hours.count} registros de horas eliminados`);

  // 2. Inscripciones
  const enrollments = await prisma.activityEnrollment.deleteMany();
  console.log(`    ✓ ${enrollments.count} inscripciones eliminadas`);

  // 3. Notificaciones
  const notifications = await prisma.notification.deleteMany();
  console.log(`    ✓ ${notifications.count} notificaciones eliminadas`);

  // 4. Badges de usuario
  const userBadges = await prisma.userBadge.deleteMany();
  console.log(`    ✓ ${userBadges.count} insignias de usuario eliminadas`);

  // 5. Push subscriptions
  const pushSubs = await prisma.pushSubscription.deleteMany();
  console.log(`    ✓ ${pushSubs.count} suscripciones push eliminadas`);

  // 6. Todas las actividades
  const activities = await prisma.activity.deleteMany();
  console.log(`    ✓ ${activities.count} actividades eliminadas`);

  // 7. Voluntarios (todos los usuarios con role voluntario)
  const volunteers = await prisma.user.deleteMany({
    where: { role: "voluntario" },
  });
  console.log(`    ✓ ${volunteers.count} voluntarios eliminados`);

  // 8. Admin de prueba
  const testAdmin = await prisma.user.deleteMany({
    where: { email: TEST_ADMIN_EMAIL },
  });
  if (testAdmin.count > 0) {
    console.log(`    ✓ Admin de prueba (${TEST_ADMIN_EMAIL}) eliminado`);
  }

  // 9. Verificar que queda al menos un admin
  const adminCount = await prisma.user.count({ where: { role: "admin" } });

  console.log("");
  if (adminCount === 0) {
    console.log("  ⚠️  No hay administradores en el sistema.");
    console.log("     Crea uno con:  npm run admin:create -- --email tu@email.com --nombre Tu --apellido Nombre\n");
  } else {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { email: true, nombre: true, apellido: true },
    });
    console.log(`  ✅ Limpieza completada. Admin(s) activo(s):`);
    admins.forEach((a) => console.log(`     - ${a.nombre} ${a.apellido} (${a.email})`));
    console.log("");
  }
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
