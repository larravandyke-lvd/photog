import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const PHOTO_BUCKET = "gear-photos";

/** Signed photo URLs are short-lived; the UI re-fetches rows to refresh them. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60;

let cached: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service-role key.
 *
 * Every read and write goes through API routes and server components, so the
 * `gear_items` table keeps RLS on with no public policies — the service role
 * bypasses them and the anon key can reach nothing. Never import this from a
 * client component.
 */
export function supabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).",
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
