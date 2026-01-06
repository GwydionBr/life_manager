import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

export function getRouter() {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
  });

  if (!router.isServer) {
    Sentry.init({
      dsn: "https://39f2c1c4c908e1ffc780145d542c258b@o4510289719263232.ingest.de.sentry.io/4510663769718864",

      // Adds request headers and IP for users, for more info visit:
      // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
      sendDefaultPii: true,

      integrations: [Sentry.replayIntegration()],

      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error.
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}
