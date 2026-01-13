import { useUnreadNotifications } from "@/db/collections/notification/use-notification-query";
import { useIntl } from "@/hooks/useIntl";

import { ActionIcon, Indicator, Popover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBell } from "@tabler/icons-react";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const { getLocalizedText } = useIntl();
  const [opened, { toggle, close }] = useDisclosure(false);
  const { data: unreadNotifications } = useUnreadNotifications();

  const unreadCount = unreadNotifications?.length ?? 0;

  return (
    <Popover
      opened={opened}
      onChange={toggle}
      position="right-start"
      offset={12}
      shadow="lg"
      radius="md"
      transitionProps={{ transition: "fade-down", duration: 200 }}
    >
      <Popover.Target>
        <Indicator
          disabled={unreadCount === 0}
          label={unreadCount > 99 ? "99+" : unreadCount}
          size={16}
          offset={8}
          color="red"
        >
          <ActionIcon
            size="xl"
            variant="transparent"
            onClick={toggle}
            aria-label={getLocalizedText("Benachrichtigungen", "Notifications")}
          >
            <IconBell stroke={1.5} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <NotificationDropdown onClose={close} />
      </Popover.Dropdown>
    </Popover>
  );
}
