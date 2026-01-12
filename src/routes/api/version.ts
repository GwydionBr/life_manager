import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/version")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          version:
            process.env.VERCEL_GIT_COMMIT_SHA ||
            process.env.COMMIT_SHA ||
            "dev",
        });
      },
    },
  },
});
