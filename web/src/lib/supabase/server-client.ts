import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAuthenticatedSupabaseServerClient() {
  const url = process.env.SUPABASE_URL; const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("SUPABASE_AUTH_UNAVAILABLE");
  const store = await cookies();
  return createServerClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (items) => { try { for (const { name, value, options } of items) store.set(name, value, options); } catch { /* Server Components rely on proxy refresh. */ } },
    },
  });
}
