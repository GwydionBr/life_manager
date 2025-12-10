import { getCookies, setCookie } from "@tanstack/react-start/server";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/db.types";

export function getSupabaseServerClient() {
  return createServerClient<Database>(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            setCookie(cookie.name, cookie.value);
          });
        },
      },
    }
  );
}
