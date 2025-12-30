import { createIsomorphicFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase/supabaseServerClient";

export const getAuthUser = createIsomorphicFn()
  .server(async () => {
    try {
      const client = getSupabaseServerClient();
      const {
        data: { user },
        error,
      } = await client.auth.getUser();
      if (error) {
        console.error("Error getting server auth:", error);
        return undefined;
      }
      return user;
    } catch (error) {
      console.error("Error getting client auth:", error);
      return undefined;
    }
  })
  .client(async () => {
    try {
      const { connector } = await import("@/db/powersync/db");
      const session = await connector.getCurrentSession();
      if (!session?.user) {
        return undefined;
      }
      return session.user;
    } catch (error) {
      console.error("Error getting client auth:", error);
      return undefined;
    }
  });
