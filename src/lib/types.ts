export type {
  UserRole,
  VolunteerStatus,
  ActivityType,
  ActivityStatus,
  EnrollmentStatus,
  HourLogStatus,
  NotificationType,
  BadgeCriteria,
} from "@prisma/client";

export type { User, Activity, ActivityEnrollment, HourLog, Notification, Badge, UserBadge } from "@prisma/client";

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  social: "Social / Comunitario",
  comunitario: "Comunitario",
  educacion: "Educación",
  ambiente: "Medio Ambiente",
  salud: "Salud",
  comunicacion: "Comunicación",
  logistica: "Logística",
  otro: "Otro",
};

export const VOLUNTEER_STATUS_LABELS: Record<string, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  pendiente: "Pendiente",
};
