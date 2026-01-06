// import { useFriendsQuery } from "@/utils/queries/profile/use-friends";
// import {
//   useAcceptFriendshipMutation,
//   useDeclineFriendshipMutation,
// } from "@/utils/queries/profile/use-friends";
import { useGroupStore } from "@/stores/groupStore";
import { useIntl } from "@/hooks/useIntl";
import { useMemo } from "react";
import { useSettings } from "@/db/collections/settings/settings-collection";

import { Group, Indicator, Stack, Text } from "@mantine/core";
import { IconUserPlus, IconUsersPlus } from "@tabler/icons-react";

import classes from "./Notification.module.css";
import CheckActionIcon from "@/components/UI/ActionIcons/CheckActionIcon";
import XActionIcon from "@/components/UI/ActionIcons/XActionIcon";
import { Friend } from "@/types/profile.types";

export default function NotificationPopover() {
  // const { data: friends } = useFriendsQuery();
  // const friends: any[] = [];
  // const { mutate: acceptFriend, isPending: isAcceptingFriend } =
  //   useAcceptFriendshipMutation();
  // const { mutate: declineFriend, isPending: isDecliningFriend } =
  //   useDeclineFriendshipMutation();
  const { groupRequests, answerGroupRequest } = useGroupStore();
  const { data: settings } = useSettings();
  const { getLocalizedText } = useIntl();

  // const requestedFriends = useMemo(
  //   () =>
  //     friends?.filter(
  //       (friend) => friend.friendshipStatus === "pending" && !friend.isRequester
  //     ) || [],
  //   [friends]
  // );
  const requestedFriends: Friend[] = useMemo(() => [], []);

  return (
    <Stack gap="xs">
      {requestedFriends.length > 0 && (
        <Stack>
          <Group className={classes.popoverTitle}>
            <Indicator size={16} label={requestedFriends.length}>
              <IconUserPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
            </Indicator>
            <Text className={classes.notificationTitle}>
              {getLocalizedText("Freundschaftsanfragen", "Friend Requests")}
            </Text>
          </Group>
          <Stack>
            {requestedFriends.map((request) => (
              <Group
                key={request.friendshipId}
                className={classes.popoverRow}
                justify="space-between"
              >
                {request.username}
                <Group gap="xs">
                  <CheckActionIcon
                    size="sm"
                    iconSize={20}
                    // onClick={() => acceptFriend(request.friendshipId)}
                    onClick={() => {}}
                  />
                  <XActionIcon
                    size="sm"
                    iconSize={20}
                    // onClick={() => declineFriend(request.friendshipId)}
                    onClick={() => {}}
                  />
                </Group>
              </Group>
            ))}
          </Stack>
        </Stack>
      )}
      {groupRequests.length > 0 && (
        <Stack>
          <Group className={classes.popoverTitle}>
            <Indicator size={16} label={groupRequests.length}>
              <IconUsersPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
            </Indicator>
            <Text className={classes.notificationTitle}>
              {getLocalizedText("Gruppenanfragen", "Group Requests")}
            </Text>
          </Group>
          <Stack>
            {groupRequests.map((request) => (
              <Group
                key={request.requestId}
                className={classes.popoverRow}
                justify="space-between"
              >
                {request.name}
                <Group gap="xs">
                  <CheckActionIcon
                    size="sm"
                    iconSize={20}
                    onClick={() =>
                      answerGroupRequest(
                        request.requestId,
                        true,
                        settings?.default_group_color ?? null
                      )
                    }
                  />
                  <XActionIcon
                    size="sm"
                    iconSize={20}
                    onClick={() =>
                      answerGroupRequest(
                        request.requestId,
                        false,
                        settings?.default_group_color ?? null
                      )
                    }
                  />
                </Group>
              </Group>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
