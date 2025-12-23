// src/routes/__root.tsx
/// <reference types="vite/client" />
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";

import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { createTheme, MantineProvider, ColorSchemeScript } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { DatesProvider } from "@mantine/dates";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient } from "@tanstack/react-query";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import useSettingsStore from "@/stores/settingsStore";
import { fetchSupabaseAuth } from "@/actions/auth/fetchSupabaseAuth";
import { createIsomorphicFn } from "@tanstack/react-start";

/**
 * Client-seitiger Fallback für Auth-Prüfung (funktioniert offline)
 */
const getClientAuth = createIsomorphicFn()
  .server(async () => {
    return { user: null };
  })
  .client(async () => {
    try {
      const { connector } = await import("@/db/powersync/db");
      const {
        data: { session },
      } = await connector.client.auth.getSession();
      return {
        user: session?.user ?? null,
      };
    } catch (error) {
      console.error("Error getting client auth:", error);
      return { user: null };
    }
  });

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  beforeLoad: async () => {
    // Versuche zuerst Server-Auth (für SSR), fallback auf Client-Auth (für Offline)
    try {
      const user = await fetchSupabaseAuth();
      return { user };
    } catch (error) {
      // Server nicht erreichbar (Offline) → nutze Client-Auth
      console.log("Server auth unavailable, using client auth (offline mode)");
      const user = await getClientAuth();
      return { user };
    }
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Life Manager",
        description: "Manage your life and achieve your goals",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: "/favicon-96x96.png",
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <ModalsProvider>
        <Notifications />
        <Outlet />
      </ModalsProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { primaryColor, locale } = useSettingsStore();
  const theme = createTheme({
    /** Put your mantine theme override here */
    primaryColor: primaryColor,
  });

  // Service Worker registrieren für Offline-Support
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // PWA Service Worker wird automatisch von vite-plugin-pwa registriert
      // Hier können wir Updates überwachen
      navigator.serviceWorker.ready.then((registration) => {
        console.log("Service Worker registered and ready for offline support");

        // Prüfe auf Updates
        registration.update().catch((error) => {
          console.error("Service Worker update check failed:", error);
        });
      });

      // Überwache wenn die App offline geht
      window.addEventListener("online", () => {
        console.log("App is now online");
      });

      window.addEventListener("offline", () => {
        console.log("App is now offline - using cached data");
      });
    }
  }, []);

  return (
    <html suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <HeadContent />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <DatesProvider
            settings={{
              locale: locale === "de-DE" ? "de" : "en",
              firstDayOfWeek: locale === "de-DE" ? 1 : 0,
              weekendDays: locale === "de-DE" ? [0, 6] : [0],
            }}
          >
            {children}
          </DatesProvider>
        </MantineProvider>
        <ReactQueryDevtools />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
