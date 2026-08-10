import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

type CookieBridge = {
  getAll(): { name: string; value: string }[];
  setAll(items: { name: string; value: string; options: CookieOptions }[], headers?: Record<string, string>): void;
};
type AuthClientFactory = (cookies: CookieBridge) => { auth: { getUser(): Promise<unknown> } };

function environmentClient(cookies: CookieBridge) {
  const url = process.env.SUPABASE_URL; const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("SUPABASE_AUTH_UNAVAILABLE");
  return createServerClient(url, anonKey, { cookies });
}

export function createAdminSessionProxy(createClient: AuthClientFactory = environmentClient) {
  return async function adminSessionProxy(request: NextRequest) {
    let response = NextResponse.next({ request });
    try {
      const client = createClient({
        getAll: () => request.cookies.getAll(),
        setAll: (items, responseHeaders = {}) => {
          for (const { name, value } of items) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of items) response.cookies.set(name, value, options);
          for (const [name, value] of Object.entries(responseHeaders)) response.headers.set(name, value);
        },
      });
      await client.auth.getUser();
    } catch { return response; }
    return response;
  };
}

export const proxy = createAdminSessionProxy();
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
