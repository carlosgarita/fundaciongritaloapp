/**
 * Filtro Prisma para registros no eliminados lógicamente.
 * Usar en `where` junto con el resto de condiciones.
 */
export const notDeleted = { deletedAt: null } as const;
