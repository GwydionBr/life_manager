import { useIntl } from "@/hooks/useIntl";
import { useBrowserNotificationPermission } from "@/hooks/notificationHooks/useBrowserNotificationPermission";
import useSettingsStore from "@/stores/settingsStore";

import { Group, Button, Text, Stack, Badge, Switch } from "@mantine/core";
import { IconBell, IconBellOff, IconAlertCircle } from "@tabler/icons-react";

export default function NotificationPermissionSettings() {
  const { getLocalizedText } = useIntl();
  const { permission, requestPermission, isSupported, permissionText } =
    useBrowserNotificationPermission();
  const { browserNotificationsEnabled, setBrowserNotificationsEnabled } =
    useSettingsStore();

  const getPermissionBadge = () => {
    if (!isSupported) {
      return (
        <Badge
          color="gray"
          variant="light"
          leftSection={<IconAlertCircle size={14} />}
        >
          {getLocalizedText("Nicht unterstützt", "Not supported")}
        </Badge>
      );
    }

    switch (permission) {
      case "granted":
        return (
          <Badge
            color="green"
            variant="light"
            leftSection={<IconBell size={14} />}
          >
            {getLocalizedText("Berechtigung erteilt", "Permission granted")}
          </Badge>
        );
      case "denied":
        return (
          <Badge
            color="red"
            variant="light"
            leftSection={<IconBellOff size={14} />}
          >
            {getLocalizedText("Blockiert", "Blocked")}
          </Badge>
        );
      default:
        return (
          <Badge
            color="yellow"
            variant="light"
            leftSection={<IconAlertCircle size={14} />}
          >
            {getLocalizedText("Ausstehend", "Pending")}
          </Badge>
        );
    }
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    // Enable notifications if permission was granted
    if (result === "granted") {
      setBrowserNotificationsEnabled(true);
    }
  };

  const handleToggleNotifications = (checked: boolean) => {
    setBrowserNotificationsEnabled(checked);
  };

  return (
    <Stack gap="md" w="100%">
      {/* Browser Permission Status */}
      <Group justify="space-between" w="100%">
        <Stack gap="xs">
          <Group gap="xs">
            <Text size="sm" fw={500}>
              {permissionText}
            </Text>
            {getPermissionBadge()}
          </Group>

          {permission === "denied" && (
            <Text size="xs" c="dimmed">
              {getLocalizedText(
                "Benachrichtigungen wurden in den Browser-Einstellungen blockiert. Um diese Einstellung zu ändern, öffnen Sie die Browser-Einstellungen und aktivieren Sie die Benachrichtigungen.",
                "Notifications were blocked in browser settings. To change this setting, open the browser settings and enable notifications."
              )}
            </Text>
          )}
        </Stack>

        {isSupported && permission !== "granted" && permission !== "denied" && (
          <Button
            variant="light"
            size="sm"
            leftSection={<IconBell size={16} />}
            onClick={handleRequestPermission}
          >
            {getLocalizedText("Berechtigung erteilen", "Grant Permission")}
          </Button>
        )}
      </Group>

      {/* Enable/Disable Toggle (only shown if permission is granted) */}
      {isSupported && permission === "granted" && (
        <Group justify="space-between" w="100%">
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              {getLocalizedText(
                "Browser-Benachrichtigungen anzeigen",
                "Show Browser Notifications"
              )}
            </Text>
            <Text size="xs" c="dimmed">
              {getLocalizedText(
                "Benachrichtigungen auch außerhalb der App anzeigen",
                "Show notifications outside the app"
              )}
            </Text>
          </Stack>
          <Switch
            checked={browserNotificationsEnabled}
            onChange={(event) =>
              handleToggleNotifications(event.currentTarget.checked)
            }
            size="md"
            onLabel={getLocalizedText("An", "On")}
            offLabel={getLocalizedText("Aus", "Off")}
          />
        </Group>
      )}
    </Stack>
  );
}
