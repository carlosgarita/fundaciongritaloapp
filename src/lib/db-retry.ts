import { Prisma } from "@prisma/client";

const RETRYABLE_PRISMA_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // Database server timed out
  "P1008", // Operations timed out
  "P1017", // Server has closed the connection
  "P2024", // Timed out fetching a new connection from the pool
]);

function isRetryable(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    RETRYABLE_PRISMA_CODES.has(error.code)
  )
    return true;

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("connect_timeout") ||
      msg.includes("connection refused") ||
      msg.includes("econnrefused") ||
      msg.includes("econnreset") ||
      msg.includes("socket hang up") ||
      msg.includes("fetch failed")
    )
      return true;
  }

  return false;
}

/**
 * Executes `fn` with automatic retries on transient DB connection errors
 * (e.g. Neon cold-start). Non-retryable errors are thrown immediately.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries && isRetryable(error)) {
        const delayMs = Math.min(1000 * 2 ** attempt, 4000);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}
