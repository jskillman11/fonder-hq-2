import { createClient } from "@supabase/supabase-js";

// Service-role client for the few operations that genuinely need it (reading
// auth.users, inviting new accounts). Only ever import this from a "use
// server" module, and only after an admin check against the session-bound
// client — this bypasses RLS entirely. For local dev this reads the same
// SUPABASE_SERVICE_ROLE_KEY as scripts/*.js; to work on the deployed app it
// must also be set as a server-side env var on Vercel (not yet done as of
// this writing — confirm before adding it there).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
