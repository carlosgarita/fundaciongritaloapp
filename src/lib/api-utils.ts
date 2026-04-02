import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Standard JSON success response.
 */
export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standard JSON error response.
 */
export function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Retrieves the authenticated session or returns a 401 response.
 * Use in API route handlers to protect endpoints.
 */
export async function getSessionOrFail() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: jsonError("No autenticado", 401) };
  }
  const active = await prisma.user.findFirst({
    where: { id: session.user.id, deletedAt: null },
    select: { id: true },
  });
  if (!active) {
    return { session: null, error: jsonError("No autenticado", 401) };
  }
  return { session, error: null };
}

/**
 * Checks that the authenticated user has the admin role,
 * otherwise returns a 403 response.
 */
export async function requireAdmin() {
  const { session, error } = await getSessionOrFail();
  if (error) return { session: null, error };
  if (session!.user.role !== "admin") {
    return { session: null, error: jsonError("No autorizado", 403) };
  }
  return { session: session!, error: null };
}
