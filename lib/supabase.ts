import { createClient } from '@supabase/supabase-js';

// Server-side client (used in API routes). Uses the service role key so
// it can write to storage/db without per-user Supabase auth, since access
// to the app itself is already gated by the shared PIN in middleware.ts.
export function supabaseServer() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
