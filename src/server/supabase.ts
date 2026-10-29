import "server-only";
import { createClient } from "@supabase/supabase-js";

// The only way the app reaches Supabase: on the server, with the secret key.
// The browser never talks to Supabase (no table is readable with the
// publishable key), so there's no browser client

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !secretKey) {
  throw new Error(
    "Supabase isn't configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
  );
}

export const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
