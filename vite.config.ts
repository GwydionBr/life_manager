// vite.config.ts
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart(),
    nitro(),
    // react's vite plugin must come after start's vite plugin
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Life Manager",
        short_name: "Life Manager",
        description: "Track your habits and achieve your goals",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // Cache-Strategien für verschiedene Assets
        // WICHTIG: Keine HTML files precachen bei SSR!
        globPatterns: ["**/*.{js,css,ico,png,svg,woff,woff2}"],
        // Ignoriere HTML files beim Precaching (werden von SSR generiert)
        globIgnores: ["**/*.html", "**/index.html"],
        // Kein navigateFallback bei SSR - Pages werden vom Server gerendert
        navigateFallback: null,
        // Maximale Cache-Größe erhöhen für bessere Offline-Erfahrung
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            // API-Calls mit Network First (online bevorzugen, offline fallback)
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 Stunden
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // PowerSync mit Network First
            urlPattern: /^https:\/\/.*\.powersync\..*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "powersync-api",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Bilder mit Cache First
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Tage
              },
            },
          },
          {
            // Fonts mit Cache First
            urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Jahr
              },
            },
          },
          {
            // Navigation Requests - für SSR Pages
            // Bei SSR: Network First (Server bevorzugen, Cache als Fallback)
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "ssr-pages",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 Stunden (kürzer bei SSR)
              },
              networkTimeoutSeconds: 5, // Mehr Zeit für SSR
            },
          },
        ],
        // Cleanup alte Caches bei Update
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        // Dev-Mode: PWA deaktiviert um Probleme mit SSR zu vermeiden
        // In Production wird der Service Worker korrekt generiert
        enabled: false,
        type: "module",
      },
    }),
  ],
  optimizeDeps: {
    include: ["cookie"],
    exclude: ["@powersync/web", "@journeyapps/wa-sqlite"],
  },
  ssr: {
    noExternal: ["@tabler/icons-react"],
  },
  worker: {
    format: "es",
  },
  resolve: {
    alias: [
      {
        find: "use-sync-external-store/shim/index.js",
        replacement: "react",
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
});
