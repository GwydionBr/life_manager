import { createFileRoute } from "@tanstack/react-router";
import { BUILD_VERSION } from "@/version";

export const Route = createFileRoute("/api/version")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(
          { version: BUILD_VERSION },
          {
            headers: {
              "content-type": "application/json",
              "cache-control": "no-store",
            },
          }
        );
      },
    },
  },
});
