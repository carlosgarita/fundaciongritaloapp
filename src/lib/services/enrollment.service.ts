import { prisma } from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import {
  ENROLLMENT_CLOSED_BY_DATE_MESSAGE,
  UNENROLL_CLOSED_MESSAGE,
  canVolunteerUnenroll,
  isActivityClosedForEnrollment,
} from "@/lib/enrollment-policy";
import type { ActivityStatus, EnrollmentStatus } from "@prisma/client";

const ENROLLABLE_STATES: ActivityStatus[] = ["publicada", "borrador"];

export class EnrollmentService {
  /**
   * Inscribe un voluntario en una actividad (actualiza cupos disponibles).
   */
  static async enroll(
    activityId: string,
    volunteerId: string,
    estado: EnrollmentStatus = "inscrito",
  ) {
    return prisma.$transaction(async (tx) => {
      const activity = await tx.activity.findFirst({
        where: { id: activityId, ...notDeleted },
      });
      if (!activity) throw new Error("Actividad no encontrada");
      if (!ENROLLABLE_STATES.includes(activity.estado)) {
        throw new Error(
          "Solo se pueden inscribir voluntarios en actividades en borrador o publicadas",
        );
      }
      if (isActivityClosedForEnrollment(activity.fechaCierre)) {
        throw new Error(ENROLLMENT_CLOSED_BY_DATE_MESSAGE);
      }
      if (activity.cuposDisponibles < 1) {
        throw new Error("No hay cupos disponibles para esta actividad");
      }

      const volunteer = await tx.user.findFirst({
        where: { id: volunteerId, role: "voluntario", ...notDeleted },
        select: { id: true },
      });
      if (!volunteer) throw new Error("Voluntario no encontrado");

      const existing = await tx.activityEnrollment.findUnique({
        where: {
          activityId_volunteerId: { activityId, volunteerId },
        },
      });
      if (existing) {
        throw new Error("Este voluntario ya está inscrito en la actividad");
      }

      const enrollment = await tx.activityEnrollment.create({
        data: {
          activityId,
          volunteerId,
          estado,
        },
      });

      await tx.activity.update({
        where: { id: activityId },
        data: { cuposDisponibles: activity.cuposDisponibles - 1 },
      });

      return enrollment;
    });
  }

  /**
   * Elimina la inscripción y libera un cupo.
   */
  static async unenroll(enrollmentId: string) {
    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.activityEnrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          activity: true,
        },
      });
      if (!enrollment) throw new Error("Inscripción no encontrada");
      if (enrollment.activity.deletedAt) {
        throw new Error("La actividad no está disponible");
      }

      await tx.activityEnrollment.delete({ where: { id: enrollmentId } });

      const activity = enrollment.activity;
      const nextCupos = Math.min(
        activity.cuposTotales,
        activity.cuposDisponibles + 1,
      );

      await tx.activity.update({
        where: { id: activity.id },
        data: { cuposDisponibles: nextCupos },
      });

      return { activityId: activity.id };
    });
  }

  /**
   * Desinscripción autogestionada por el voluntario.
   * Aplica el corte de seguridad (2 días antes del inicio) y libera el cupo.
   */
  static async unenrollSelf(activityId: string, volunteerId: string) {
    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.activityEnrollment.findUnique({
        where: { activityId_volunteerId: { activityId, volunteerId } },
        include: { activity: true },
      });
      if (!enrollment) {
        throw new Error("No estás inscrito en esta actividad.");
      }
      if (enrollment.activity.deletedAt) {
        throw new Error("La actividad no está disponible.");
      }
      if (!canVolunteerUnenroll(enrollment.activity.fechaInicio)) {
        throw new Error(UNENROLL_CLOSED_MESSAGE);
      }

      await tx.activityEnrollment.delete({ where: { id: enrollment.id } });

      const activity = enrollment.activity;
      const nextCupos = Math.min(
        activity.cuposTotales,
        activity.cuposDisponibles + 1,
      );
      await tx.activity.update({
        where: { id: activity.id },
        data: { cuposDisponibles: nextCupos },
      });

      return { activityId: activity.id };
    });
  }
}
