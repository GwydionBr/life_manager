import { useIntl } from "@/hooks/useIntl";
import { Notification } from "@/types/system.types";

import {
  ActionIcon,
  Box,
  Group,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBell,
  IconCalendar,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

/**
 * Returns an icon based on the notification type.
 */
const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "appointment.reminder":
      return <IconBell size={16} />;
    case "appointment.start":
      return <IconCalendar size={16} />;
    case "system.version":
      return <IconAlertCircle size={16} />;
    default:
      return <IconBell size={16} />;
  }
};

/**
 * Returns a color based on the notification priority.
 */
const getPriorityColor = (priority: Notification["priority"]) => {
  switch (priority) {
    case "high":
      return "red";
    case "medium":
      return "orange";
    case "low":
      return "blue";
    default:
      return "gray";
  }
};

export function NotificationItem({
  notification,
  onRead,
  onDismiss,
  onClick,
}: NotificationItemProps) {
  const { formatRelativeTime, getLocalizedText } = useIntl();

  const isUnread = !notification.read_at;
  const createdAt = new Date(notification.created_at);

  const handleClick = () => {
    if (isUnread) {
      onRead(notification.id);
    }
    onClick?.(notification);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss(notification.id);
  };

  return (
    <Box
      onClick={handleClick}
      w="100%"
      style={{
        borderRadius: "var(--mantine-radius-md)",
        transition: "background-color 150ms ease",
      }}
    >
      <Box
        p="sm"
        style={{
          backgroundColor: isUnread
            ? "var(--mantine-color-blue-light)"
            : "transparent",
          borderRadius: "var(--mantine-radius-md)",
        }}
      >
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <ThemeIcon
            size={32}
            radius="md"
            variant="light"
            color={getPriorityColor(notification.priority)}
          >
            {getNotificationIcon(notification.type)}
          </ThemeIcon>

          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" wrap="nowrap">
              <Text
                size="sm"
                fw={isUnread ? 600 : 500}
                lineClamp={1}
                style={{ flex: 1 }}
              >
                {notification.title}
              </Text>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={handleDismiss}
                aria-label={getLocalizedText("Schließen", "Dismiss")}
              >
                <IconX size={14} />
              </ActionIcon>
            </Group>

            {notification.body && (
              <Text size="xs" c="dimmed" lineClamp={2}>
                {notification.body}
              </Text>
            )}

            <Text size="xs" c="dimmed">
              {formatRelativeTime(createdAt)}
            </Text>
          </Stack>

          {isUnread && (
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--mantine-color-blue-filled)",
                flexShrink: 0,
                marginTop: 4,
              }}
            />
          )}
        </Group>
      </Box>
    </Box>
  );
}
