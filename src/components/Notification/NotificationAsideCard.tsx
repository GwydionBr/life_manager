import { useState } from "react";
// import {
//   useAcceptFriendshipMutation,
//   useDeclineFriendshipMutation,
// } from "@/utils/queries/profile/use-friends";
import { useGroupStore } from "@/stores/groupStore";
import { useIntl } from "@/hooks/useIntl";

import {
  Divider,
  Group,
  Indicator,
  Paper,
  Stack,
  Text,
  Popover,
} from "@mantine/core";
import { IconUserPlus, IconUsersPlus } from "@tabler/icons-react";

import classes from "./Notification.module.css";
import CheckActionIcon from "../UI/ActionIcons/CheckActionIcon";
import XActionIcon from "../UI/ActionIcons/XActionIcon";

import { Friend } from "@/types/profile.types";
import { useSettings } from "@/db/collections/settings/settings-collection";

interface NotificationAsideCardProps {
  pendingFriends: Friend[];
}

export default function NotificationAsideCard({
  pendingFriends,
}: NotificationAsideCardProps) {
  // const { mutate: acceptFriend, isPending: isAcceptingFriend } =
  //   useAcceptFriendshipMutation();
  // const { mutate: declineFriend, isPending: isDecliningFriend } =
  //   useDeclineFriendshipMutation();
  const { groupRequests, answerGroupRequest } = useGroupStore();
  const { data: settings } = useSettings();
  const { getLocalizedText } = useIntl();
  const [friendRequestsOpened, setFriendRequestsOpened] = useState(false);
  const [groupRequestsOpened, setGroupRequestsOpened] = useState(false);

  return (
    <Paper mah={300} w={220} p="md" withBorder>
      <Stack gap="xs">
        {pendingFriends.length > 0 && (
          <Popover
            opened={friendRequestsOpened}
            onChange={setFriendRequestsOpened}
          >
            <Popover.Target>
              <Group
                className={classes.notificationRow}
                onClick={() => setFriendRequestsOpened(true)}
              >
                <Indicator size={16} label={pendingFriends.length}>
                  <IconUserPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
                </Indicator>
                <Text className={classes.notificationTitle}>
                  {getLocalizedText("Freundschaftsanfragen", "Friend Requests")}
                </Text>
              </Group>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack>
                {pendingFriends.map((request) => (
                  <Group
                    key={request.friendshipId}
                    className={classes.notificationDropdownRow}
                    justify="space-between"
                  >
                    {request.username}
                    <Group gap="xs">
                      <CheckActionIcon
                        size="sm"
                        iconSize={20}
                        onClick={() => {}}
                        // onClick={() => acceptFriend(request.friendshipId)}
                      />
                      <XActionIcon
                        size="sm"
                        iconSize={20}
                        onClick={() => {}}
                        // onClick={() => declineFriend(request.friendshipId)}
                      />
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}
        {pendingFriends.length > 0 && groupRequests.length > 0 && (
          <Divider orientation="vertical" />
        )}
        {groupRequests.length > 0 && (
          <Popover
            opened={groupRequestsOpened}
            onChange={setGroupRequestsOpened}
          >
            <Popover.Target>
              <Group
                className={classes.notificationRow}
                onClick={() => setGroupRequestsOpened(true)}
              >
                <Indicator size={16} label={groupRequests.length}>
                  <IconUsersPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
                </Indicator>
                <Text className={classes.notificationTitle}>
                  {getLocalizedText("Gruppenanfragen", "Group Requests")}
                </Text>
              </Group>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack>
                {groupRequests.map((request) => (
                  <Group
                    key={request.requestId}
                    className={classes.notificationDropdownRow}
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
            </Popover.Dropdown>
          </Popover>
        )}
      </Stack>
    </Paper>
  );
}
