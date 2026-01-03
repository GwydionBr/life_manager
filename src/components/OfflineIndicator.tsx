import { useEffect, useRef } from "react";
import { useNetwork } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";

import { IconWifiOff, IconWifi } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

/**
 * Displays a notification to the user when the app is offline.
 * Useful to inform the user why certain features may not work.
 */
export function OfflineIndicator() {
  const { getLocalizedText } = useIntl();
  const { online } = useNetwork();
  const wasOfflineRef = useRef(false);
  useEffect(() => {
    if (online && wasOfflineRef.current) {
      notifications.show({
        icon: <IconWifi size="1.2rem" />,
        title: getLocalizedText("Wieder online", "Back online"),
        message: getLocalizedText(
          "Die Verbindung wurde wiederhergestellt.",
          "The connection has been restored."
        ),
        color: "teal",
        autoClose: 3000,
      });
    } else if (!online) {
      wasOfflineRef.current = true;
      notifications.show({
        icon: <IconWifiOff size="1.2rem" />,
        title: getLocalizedText("Offline-Modus", "Offline mode"),
        message: getLocalizedText(
          "Du bist offline. Die App funktioniert weiterhin mit lokalen Daten.",
          "You are offline. The app will continue to work with local data."
        ),
        color: "orange",
        autoClose: 3000,
      });
    }
  }, [online, getLocalizedText]);

  return null;
}
