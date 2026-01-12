import { useIntl } from "@/hooks/useIntl";
import { useRecentNotifications } from "@/db/collections/notification/use-notification-query";
import { useNotificationMutations } from "@/db/collections/notification/use-notification-mutations";
import { Notification } from "@/types/system.types";
import { useRouter } from "@tanstack/react-router";

import {
  Box,
  Button,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconBell, IconCheck } from "@tabler/icons-react";
import { NotificationItem } from "./NotificationItem";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { getLocalizedText } = useIntl();
  const { data: notifications } = useRecentNotifications(30);
  const { markAsRead, dismiss, updateNotification } =
    useNotificationMutations();
  const router = useRouter();

  const unreadCount =
    notifications?.filter((n) => !n.read_at && !n.dismissed_at).length ?? 0;

  const handleRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDismiss = async (id: string) => {
    await dismiss(id);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to related resource if available
    if (
      notification.resource_type === "appointment" &&
      notification.resource_id
    ) {
      router.navigate({ to: "/calendar" });
      onClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications?.filter(
      (n) => !n.read_at && !n.dismissed_at
    );
    if (unreadNotifications) {
      await Promise.all(
        unreadNotifications.map((n) =>
          updateNotification(n.id, { read_at: new Date().toISOString() })
        )
      );
    }
  };

  return (
    <Box w={360}>
      {/* Header */}
      <Box p="md" pb="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon size={28} radius="md" variant="light" color="blue">
              <IconBell size={16} />
            </ThemeIcon>
            <Text size="lg" fw={600}>
              {getLocalizedText("Benachrichtigungen", "Notifications")}
            </Text>
          </Group>
          {unreadCount > 0 && (
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconCheck size={14} />}
              onClick={handleMarkAllAsRead}
            >
              {getLocalizedText("Alle gelesen", "Mark all read")}
            </Button>
          )}
        </Group>
      </Box>

      <Divider />

      {/* Notification List */}
      <ScrollArea.Autosize mah={400} type="auto">
        <Stack gap={0} p="xs">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleRead}
                onDismiss={handleDismiss}
                onClick={handleNotificationClick}
              />
            ))
          ) : (
            <Box py="xl" ta="center">
              <ThemeIcon
                size={48}
                radius="xl"
                variant="light"
                color="gray"
                mb="md"
                mx="auto"
              >
                <IconBell size={24} />
              </ThemeIcon>
              <Text size="sm" c="dimmed">
                {getLocalizedText(
                  "Keine Benachrichtigungen",
                  "No notifications"
                )}
              </Text>
            </Box>
          )}
        </Stack>
      </ScrollArea.Autosize>
    </Box>
  );
}
