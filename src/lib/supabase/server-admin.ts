import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client that uses the service role key.
 * Bypasses RLS — use only in server components / route handlers
 * for trusted operations like reading user profiles.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY — add it to .env.local"
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
