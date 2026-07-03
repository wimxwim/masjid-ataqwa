import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function createServerSupabase() {
  const cookieStore = await cookies();

  /* Try reading cookies from the raw Cookie header as fallback */
  let rawHeaderCookies: { name: string; value: string }[] = [];
  try {
    const h = await headers();
    const cookieHeader = h.get("cookie");
    if (cookieHeader) {
      rawHeaderCookies = parseCookieHeader(cookieHeader).filter(
        (c): c is { name: string; value: string } => c.value !== undefined,
      );
    }
  } catch {
    /* headers() not available in this context — skip */
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const fromStore = cookieStore.getAll();
        if (fromStore.length > 0) return fromStore;
        if (rawHeaderCookies.length > 0) return rawHeaderCookies;
        return [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}
