// src/hooks/useCheckNewVersion.ts
import { useEffect, useRef } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import { useIntl } from "@/hooks/useIntl";
import { useNetwork, useIdle } from "@mantine/hooks";
import {
  addNotificationSilent,
  checkNotificationExists,
} from "@/db/collections/notification/notification-mutations";

/**
 * Hook that checks for new app versions and creates a notification
 * when a new version is available.
 *
 * Creates a high priority notification in the database.
 * The actual display is handled by useNotificationHandler.
 */
export function useCheckNewVersion(interval = 1000 * 60 * 2) {
  const { online } = useNetwork();
  const { getLocalizedText } = useIntl();
  const { data: profile } = useProfile();
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const ignoredVersionRef = useRef<string | null>(null);
  const isIdle = useIdle(1000 * 60 * 3); // 3 minutes

  // Get current version from window object (set in root layout)
  const currentVersion =
    typeof window !== "undefined" ? (window.__BUILD_VERSION__ ?? null) : null;

  useEffect(() => {
    // Skip checks when there is no authenticated user/profile or offline
    if (!profile?.id || !online || isIdle) {
      return;
    }

    // Abort any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const check = async () => {
      // Create new abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const res = await fetch("/api/version", {
          cache: "no-store",
          signal: abortController.signal,
        });

        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !contentType.includes("application/json")) {
          throw new Error(
            `Unexpected response: ${res.status} ${res.statusText}`
          );
        }

        const data = await res.json();
        const serverVersion = data?.version;

        // Early return if versions are missing
        if (!currentVersion || !serverVersion) {
          return;
        }

        // Check if versions differ AND server version is different from ignored version
        if (
          serverVersion !== currentVersion &&
          serverVersion !== ignoredVersionRef.current
        ) {
          // Check if we already have a notification for this version
          const notificationId = `version-${serverVersion}`;
          const exists = await checkNotificationExists(
            notificationId,
            "system.version"
          );

          
          if (!exists && profile?.id) {
            // Create notification in database
            await addNotificationSilent(
              {
                type: "system.version",
                title: getLocalizedText(
                  "Neue Version verfügbar",
                  "New Version available"
                ),
                body: getLocalizedText(
                  "Aktualisiere um die neuesten Änderungen zu sehen.",
                  "Refresh to see the latest changes."
                ),
                priority: "low",
                resource_type: null,
                resource_id: notificationId,
              },
              profile.id
            );

            // Remember the version so we don't create another notification
            ignoredVersionRef.current = serverVersion;
          }
        }
      } catch (err) {
        // Ignore abort errors (expected when component unmounts or dependencies change)
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        // Only log unexpected errors in development
        if (import.meta.env.DEV) {
          console.error("Version check failed", err);
        }
      } finally {
        // Clear abort controller if this was the active request
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    };

    // Run initial check
    check();

    // Set up interval if interval > 0
    if (interval > 0) {
      intervalRef.current = window.setInterval(check, interval);
    }

    return () => {
      // Clear interval
      if (intervalRef.current !== undefined) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [interval, profile?.id, online, currentVersion, isIdle, getLocalizedText]);
}
