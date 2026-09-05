import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv, getRequiredEnv } from "@/lib/env";

/**
 * Server-only Supabase admin client (BYPASSRLS via the secret key).
 *
 * Authentication is handled by Clerk; Supabase is used purely as a storage
 * backend, so this client is created with the admin key on the server and
 * must never be exposed to the browser.
 *
 * See: https://supabase.com/docs
 */
export function createAdminClient(): SupabaseClient {
  const url = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key =
    getEnv("SUPABASE_SECRET_KEY") ?? getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
