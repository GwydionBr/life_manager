import { createIsomorphicFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase/supabaseServerClient";

export const getAuthUser = createIsomorphicFn()
  .server(async () => {
    try {
      const client = getSupabaseServerClient();
      const {
        data: { user },
      } = await client.auth.getUser();
      return user;
    } catch (error) {
      console.error("Error getting server client:", error);
      return null;
    }
  })
  .client(async () => {
    try {
      const { connector } = await import("@/db/powersync/db");
      const session = await connector.getCurrentSession();
      if (!session?.user) {
        return null;
      }
      return session.user;
    } catch (error) {
      console.error("Error getting client auth:", error);
      return null;
    }
  });
