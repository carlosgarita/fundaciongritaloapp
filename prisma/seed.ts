import {
  PrismaClient,
  Prisma,
  ActivityStatus,
  ActivityType,
  EnrollmentStatus,
  HourLogStatus,
  BadgeCriteria,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL_SUFFIX = "@demo.gritalo.org";
const DEMO_ACTIVITY_PREFIX = "[Demo]";

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
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

  /* ── Limpiar datos demo anteriores (re-ejecución idempotente) ── */
  await prisma.user.deleteMany({
    where: { email: { endsWith: DEMO_EMAIL_SUFFIX } },
  });
  await prisma.activity.deleteMany({
    where: { nombre: { startsWith: DEMO_ACTIVITY_PREFIX } },
  });
  await prisma.badge.deleteMany({
    where: { nombre: { startsWith: "[Demo]" } },
  });

  const badgeVoluntario = await prisma.badge.create({
    data: {
      nombre: "[Demo] Voluntario destacado",
      descripcion: "Reconocimiento manual por impacto en la comunidad.",
      icono: "⭐",
      criterio: BadgeCriteria.especial,
      valorCriterio: 0,
    },
  });
  await prisma.badge.create({
    data: {
      nombre: "[Demo] 50 horas",
      descripcion: "Meta de horas validadas (asignación manual en demo).",
      icono: "⏱️",
      criterio: BadgeCriteria.horas,
      valorCriterio: 50,
    },
  });

  const demoPassword = await bcrypt.hash("demo12345", 12);

  const v1 = await prisma.user.create({
    data: {
      email: `maria.garcia${DEMO_EMAIL_SUFFIX}`,
      passwordHash: demoPassword,
      nombre: "María",
      apellido: "García",
      cedula: "1-2345-6789",
      telefono: "8888-1111",
      role: "voluntario",
      estado: "activo",
      habilidades: ["primeros auxilios", "logística"],
    },
  });

  const v2 = await prisma.user.create({
    data: {
      email: `carlos.mora${DEMO_EMAIL_SUFFIX}`,
      passwordHash: demoPassword,
      nombre: "Carlos",
      apellido: "Mora",
      cedula: "2-3456-7890",
      telefono: "8888-2222",
      role: "voluntario",
      estado: "activo",
      habilidades: ["comunicación", "redes sociales"],
    },
  });

  const v3 = await prisma.user.create({
    data: {
      email: `ana.rojas${DEMO_EMAIL_SUFFIX}`,
      passwordHash: demoPassword,
      nombre: "Ana",
      apellido: "Rojas",
      cedula: "3-4567-8901",
      telefono: "8888-3333",
      role: "voluntario",
      estado: "pendiente",
      habilidades: ["educación"],
    },
  });

  const now = new Date();
  const inOneWeek = new Date(now);
  inOneWeek.setDate(inOneWeek.getDate() + 7);
  const inTwoWeeks = new Date(now);
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

  const actPublicada = await prisma.activity.create({
    data: {
      nombre: `${DEMO_ACTIVITY_PREFIX} Jornada de limpieza costera`,
      descripcion: "Recolección de residuos y sensibilización ambiental.",
      tipo: ActivityType.ambiente,
      fechaInicio: inOneWeek,
      fechaCierre: new Date(inOneWeek.getTime() + 5 * 60 * 60 * 1000),
      cuposTotales: 25,
      cuposDisponibles: 22,
      estado: ActivityStatus.publicada,
      ubicacion: "Playa Jacó",
      createdById: admin.id,
    },
  });

  const actProxima = await prisma.activity.create({
    data: {
      nombre: `${DEMO_ACTIVITY_PREFIX} Taller de primeros auxilios`,
      descripcion: "Capacitación básica para voluntarios.",
      tipo: ActivityType.salud,
      fechaInicio: inTwoWeeks,
      fechaCierre: new Date(inTwoWeeks.getTime() + 3 * 60 * 60 * 1000),
      cuposTotales: 15,
      cuposDisponibles: 14,
      estado: ActivityStatus.publicada,
      ubicacion: "Sede Grítalo",
      createdById: admin.id,
    },
  });

  const actFinalizada = await prisma.activity.create({
    data: {
      nombre: `${DEMO_ACTIVITY_PREFIX} Campaña escolar marzo`,
      descripcion: "Charlas en centros educativos.",
      tipo: ActivityType.educacion,
      fechaInicio: lastMonth,
      fechaCierre: new Date(lastMonth.getTime() + 4 * 60 * 60 * 1000),
      cuposTotales: 40,
      cuposDisponibles: 0,
      estado: ActivityStatus.finalizada,
      ubicacion: "San José",
      createdById: admin.id,
    },
  });

  await prisma.activity.create({
    data: {
      nombre: `${DEMO_ACTIVITY_PREFIX} Borrador: feria comunitaria`,
      descripcion: "Pendiente de publicación.",
      tipo: ActivityType.comunitario,
      fechaInicio: inTwoWeeks,
      fechaCierre: new Date(inTwoWeeks.getTime() + 6 * 60 * 60 * 1000),
      cuposTotales: 50,
      cuposDisponibles: 50,
      estado: ActivityStatus.borrador,
      ubicacion: "Por definir",
      createdById: admin.id,
    },
  });

  /* Inscripciones (necesarias para registros de horas) */
  await prisma.activityEnrollment.createMany({
    data: [
      {
        activityId: actPublicada.id,
        volunteerId: v1.id,
        estado: EnrollmentStatus.confirmado,
      },
      {
        activityId: actPublicada.id,
        volunteerId: v2.id,
        estado: EnrollmentStatus.inscrito,
      },
      {
        activityId: actProxima.id,
        volunteerId: v1.id,
        estado: EnrollmentStatus.inscrito,
      },
      {
        activityId: actFinalizada.id,
        volunteerId: v1.id,
        estado: EnrollmentStatus.confirmado,
      },
      {
        activityId: actFinalizada.id,
        volunteerId: v2.id,
        estado: EnrollmentStatus.confirmado,
      },
    ],
  });

  /* Registros de horas */
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const midMonth = new Date(now.getFullYear(), now.getMonth(), 12);

  await prisma.userBadge.create({
    data: {
      userId: v1.id,
      badgeId: badgeVoluntario.id,
    },
  });

  await prisma.hourLog.createMany({
    data: [
      {
        volunteerId: v1.id,
        activityId: actFinalizada.id,
        fecha: firstOfMonth,
        horas: new Prisma.Decimal("6.0"),
        estado: HourLogStatus.validado,
        notas: "Apoyo en logística",
        validatedById: admin.id,
      },
      {
        volunteerId: v2.id,
        activityId: actFinalizada.id,
        fecha: firstOfMonth,
        horas: new Prisma.Decimal("4.5"),
        estado: HourLogStatus.validado,
        notas: "",
        validatedById: admin.id,
      },
      {
        volunteerId: v1.id,
        activityId: actFinalizada.id,
        fecha: midMonth,
        horas: new Prisma.Decimal("3.0"),
        estado: HourLogStatus.pendiente,
        notas: "Pendiente de validar",
      },
    ],
  });

  console.log("");
  console.log("Seed completado.");
  console.log("  Admin:     admin@gritalo.org / admin123");
  console.log(`  Demo pass: *${DEMO_EMAIL_SUFFIX} → demo12345`);
  console.log(`    - ${v1.email}`);
  console.log(`    - ${v2.email}`);
  console.log(`    - ${v3.email}`);
  console.log(
    `  Actividades ${DEMO_ACTIVITY_PREFIX}* y datos de horas creados.`,
  );
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
