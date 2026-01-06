import { useState, useEffect, useMemo } from "react";
// import { useFriendsQuery } from "@/utils/queries/profile/use-friends";
import { useGroupStore } from "@/stores/groupStore";

import {
  ActionIcon,
  Box,
  Collapse,
  Indicator,
  Popover,
  Transition,
} from "@mantine/core";
import { IconBellFilled } from "@tabler/icons-react";
import NotificationAsideCard from "./NotificationAsideCard";
import NotificationPopover from "./NotificationPopover";

import classes from "./Notification.module.css";
import { Friend } from "@/types/profile.types";

export default function NotificationAside({
  isNotificationOpen,
  asideOpened,
  setIsNotificationOpen,
}: {
  isNotificationOpen: boolean;
  asideOpened: boolean;
  setIsNotificationOpen: (value: boolean) => void;
}) {
  // TODO: Implement friends query
  // const { data: friends } = useFriendsQuery();
  const { groupRequests } = useGroupStore();
  const [opened, setOpened] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // const pendingFriends = useMemo(
  //   () =>
  //     friends?.filter(
  //       (friend) => friend.friendshipStatus === "pending" && !friend.isRequester
  //     ) || [],
  //   [friends]
  // );
  const pendingFriends: Friend[] = useMemo(() => [], []);

  useEffect(() => {
    if (
      asideOpened &&
      (pendingFriends.length > 0 || groupRequests.length > 0)
    ) {
      setShowCard(true);
    } else {
      setShowCard(false);
    }
  }, [asideOpened, pendingFriends, groupRequests]);

  function toggleOpened() {
    if (asideOpened) {
      const newNotificationOpen = !isNotificationOpen;
      setIsNotificationOpen(newNotificationOpen);
      setOpened(false);
    } else {
      setIsNotificationOpen(false);
      const newOpened = !opened;
      setOpened(newOpened);
    }
  }

  return (
    <Box className={classes.notificationAside}>
      <Popover
        opened={opened}
        onChange={setOpened}
        position="left-start"
        offset={5}
        withArrow
        arrowSize={20}
      >
        <Popover.Target>
          <Indicator
            size={16}
            disabled={pendingFriends.length + groupRequests.length === 0}
            label={pendingFriends.length + groupRequests.length}
            color="red"
          >
            <ActionIcon variant="transparent" onClick={toggleOpened}>
              <IconBellFilled />
            </ActionIcon>
          </Indicator>
        </Popover.Target>
        {(pendingFriends.length > 0 || groupRequests.length > 0) && (
          <Popover.Dropdown>
            <NotificationPopover />
          </Popover.Dropdown>
        )}
      </Popover>
      <Collapse in={isNotificationOpen} transitionDuration={500}>
        <Transition
          mounted={showCard}
          transition="fade"
          duration={200}
          enterDelay={200}
        >
          {(styles) => (
            <div style={styles}>
              <NotificationAsideCard pendingFriends={pendingFriends} />
            </div>
          )}
        </Transition>
      </Collapse>
    </Box>
  );
}
