export type UserRole = "admin" | "voluntario";

export type VolunteerStatus = "activo" | "inactivo" | "pendiente";

export type ActivityType =
  | "social"
  | "comunitario"
  | "educacion"
  | "ambiente"
  | "salud"
  | "comunicacion"
  | "logistica"
  | "otro";

export type HourLogStatus = "pendiente" | "validado" | "rechazado";

export type BadgeCriteria = "horas" | "actividades" | "antiguedad" | "especial";

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  role: UserRole;
  estado: VolunteerStatus;
  habilidades: string[];
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: ActivityType;
  fecha_inicio: string;
  fecha_cierre: string;
  cupos_totales: number;
  cupos_disponibles: number;
  estado: "borrador" | "publicada" | "finalizada" | "cancelada";
  ubicacion: string;
  created_by: string;
  created_at: string;
}

export interface ActivityEnrollment {
  id: string;
  activity_id: string;
  volunteer_id: string;
  estado: "inscrito" | "confirmado" | "cancelado";
  created_at: string;
}

export interface HourLog {
  id: string;
  volunteer_id: string;
  activity_id: string;
  fecha: string;
  horas: number;
  estado: HourLogStatus;
  notas: string;
  validated_by: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  tipo: "info" | "actividad" | "validacion" | "badge" | "sistema";
  link: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  criterio: BadgeCriteria;
  valor_criterio: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  social: "Social / Comunitario",
  comunitario: "Comunitario",
  educacion: "Educación",
  ambiente: "Medio Ambiente",
  salud: "Salud",
  comunicacion: "Comunicación",
  logistica: "Logística",
  otro: "Otro",
};

export const VOLUNTEER_STATUS_LABELS: Record<VolunteerStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  pendiente: "Pendiente",
};
