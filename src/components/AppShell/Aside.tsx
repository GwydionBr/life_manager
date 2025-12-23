import { useState, useEffect, useMemo } from "react";
import { useGroupStore } from "@/stores/groupStore";

import {
  ActionIcon,
  alpha,
  getThemeColor,
  Group,
  MantineColor,
  ScrollArea,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconArrowBarLeft } from "@tabler/icons-react";
import NotificationAside from "@/components/Notification/NotificationAside";
import TimeTrackerManager from "@/components/TimeTracker/TimeTrackerManager";

import TransitionDivider from "@/components/UI/TransitionDivider";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import Shortcut from "@/components/UI/Shortcut";

interface AsideProps {
  toggleAside: () => void;
  isAsideOpen: boolean;
  currentAppColor: MantineColor;
}

export default function Aside({ toggleAside, isAsideOpen, currentAppColor }: AsideProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isTimeTrackerMinimized, setIsTimeTrackerMinimized] = useState(false);
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date | null>(
    null
  );

  const { selectedDate, isDateChanged } = useGroupStore();

  const theme = useMantineTheme();
  const backgroundColor = useMemo(() => {
    return alpha(getThemeColor(currentAppColor, theme), 0.4);
  }, [currentAppColor, theme]);

  useEffect(() => {
    if (isDateChanged && selectedDate !== currentSelectedDate) {
      setCurrentSelectedDate(selectedDate);
      setIsTimeTrackerMinimized(true);
      setIsNotificationOpen(false);
    }
  }, [selectedDate, isDateChanged]);

  return (
    <Stack py="md" h="100%" align="center" bg={backgroundColor}>
      <Stack align="flex-start" w="100%" gap="lg">
        <Group pl="xs" justify="flex-start">
          <DelayedTooltip
            label={
              <Stack align="center">
                <Text>Toggle Sidebar</Text>
                <Shortcut keys={["mod", "B"]} />
              </Stack>
            }
          >
            <ActionIcon
              onClick={toggleAside}
              aria-label="Toggle Sidebar"
              variant="transparent"
            >
              <IconArrowBarLeft
                style={{ transform: isAsideOpen ? "rotate(180deg)" : "none", transition: "transform 0.4s linear" }}
              />
            </ActionIcon>
          </DelayedTooltip>
        </Group>
        <Group pl="xs">
          <NotificationAside
            isNotificationOpen={isNotificationOpen}
            asideOpened={isAsideOpen}
            setIsNotificationOpen={setIsNotificationOpen}
          />
        </Group>
      </Stack>
      <TransitionDivider
        mounted={isAsideOpen}
        transition="fade"
        duration={200}
        enterDelay={200}
      />
      <ScrollArea type="never">
        <TimeTrackerManager
          isBig={isAsideOpen}
          isTimeTrackerMinimized={isTimeTrackerMinimized}
          setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
        />
        <TransitionDivider
          mounted={isAsideOpen}
          transition="fade"
          duration={200}
          enterDelay={200}
        />
        {/* <CalendarAside isBig={isAsideOpen} /> */}
      </ScrollArea>
    </Stack>
  );
}
