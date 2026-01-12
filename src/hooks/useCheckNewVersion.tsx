// src/hooks/useCheckNewVersion.ts
import { useEffect, useState, useRef } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import { useIntl } from "@/hooks/useIntl";
import { useNetwork } from "@mantine/hooks";

import { Group, Text, Stack, Button } from "@mantine/core";
import { IconRefresh, IconInfoCircle } from "@tabler/icons-react";

import { notifications } from "@mantine/notifications";


const NOTIFICATION_ID = "new-version";

export function useCheckNewVersion(interval = 60000) {
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const { online } = useNetwork();
  const { getLocalizedText } = useIntl();
  const { data: profile } = useProfile();
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);

  // Get current version from environment
  // Try multiple env var names for compatibility
  const currentVersion =
    import.meta.env.VITE_COMMIT_SHA ||
    import.meta.env.NEXT_PUBLIC_COMMIT_SHA ||
    import.meta.env.COMMIT_SHA ||
    null;

  useEffect(() => {
    // Skip checks when there is no authenticated user/profile or offline
    if (!profile || !online) {
      setNewVersion(null);
      // Hide notification when going offline or logging out
      notifications.hide(NOTIFICATION_ID);
      return;
    }
    console.log("currentVersion", currentVersion);

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
        console.log("data", data);
        const serverVersion = data?.version;

        // Only update if we have both versions and they differ
        if (
          serverVersion &&
          currentVersion &&
          serverVersion !== currentVersion
        ) {
          setNewVersion(serverVersion);
        } else {
          setNewVersion(null);
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
  }, [interval, profile, online, currentVersion]);

  useEffect(() => {
    if (newVersion) {
      notifications.show({
        id: NOTIFICATION_ID,
        title: (
          <Group gap="xs">
            <IconInfoCircle size={16} />
            <Text fw={600}>
              {getLocalizedText(
                "Neue Version verfügbar",
                "New Version available"
              )}
            </Text>
          </Group>
        ),
        message: (
          <Stack>
            <Text ml={26} c="dimmed" size="sm">
              {getLocalizedText(
                "Aktualisiere um die neuesten Änderungen zu sehen.",
                "Refresh to see the latest changes."
              )}
            </Text>
            <Group justify="flex-end">
              <Button
                variant="outline"
                onClick={() => {
                  notifications.hide(NOTIFICATION_ID);
                  setNewVersion(null);
                }}
              >
                {getLocalizedText("Nicht jetzt", "Not now")}
              </Button>
              <Button
                onClick={() => window.location.reload()}
                leftSection={<IconRefresh />}
              >
                {getLocalizedText("Aktualisieren", "Refresh")}
              </Button>
            </Group>
          </Stack>
        ),
        color: "yellow",
        autoClose: false,
        withBorder: true,
        withCloseButton: false,
      });
    } else {
      // Hide notification when version is cleared
      notifications.hide(NOTIFICATION_ID);
    }
  }, [newVersion, getLocalizedText]);
}
