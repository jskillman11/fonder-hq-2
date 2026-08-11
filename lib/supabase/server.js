import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Component / Route Handler client: reads the user's session from
// request cookies. `setAll` failures are swallowed because Server Components
// can't write cookies — middleware.js is what actually refreshes the session.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // called from a Server Component; middleware handles session refresh
        }
      },
    },
  });
}
