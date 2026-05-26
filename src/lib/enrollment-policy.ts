export const UNENROLL_CUTOFF_DAYS = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

export function unenrollCutoffFor(start: Date | string): Date {
  const d = new Date(start);
  return new Date(d.getTime() - UNENROLL_CUTOFF_DAYS * DAY_MS);
}

export function canVolunteerUnenroll(
  fechaInicio: Date | string,
  now: Date = new Date(),
): boolean {
  return now < unenrollCutoffFor(fechaInicio);
}

export const UNENROLL_CLOSED_MESSAGE =
  "Ya no puedes desinscribirte: la actividad inicia en menos de 2 días.";

/**
 * Devuelve true si la actividad ya pasó su fecha de finalización (al cierre
 * del día indicado por `fechaCierre`). Se usa para deshabilitar inscripciones
 * en actividades vencidas.
 */
export function isActivityClosedForEnrollment(
  fechaCierre: Date | string,
  now: Date = new Date(),
): boolean {
  const end = new Date(fechaCierre);
  end.setHours(23, 59, 59, 999);
  return now > end;
}

export const ENROLLMENT_CLOSED_BY_DATE_MESSAGE =
  "La fecha de finalización de esta actividad ya pasó.";
