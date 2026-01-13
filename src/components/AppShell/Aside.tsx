import { useState, useMemo } from "react";
import { useHotkeys } from "@mantine/hooks";

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
import TimeTrackerManager from "@/components/TimeTracker/TimeTrackerManager";
import CalendarAside from "@/components/WorkCalendar/CalendarAside/CalendarAside";

import TransitionDivider from "@/components/UI/TransitionDivider";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import Shortcut from "@/components/UI/Shortcut";

interface AsideProps {
  toggleAside: () => void;
  isAsideOpen: boolean;
  currentAppColor: MantineColor;
}

export default function Aside({
  toggleAside,
  isAsideOpen,
  currentAppColor,
}: AsideProps) {
  const [isTimeTrackerMinimized, setIsTimeTrackerMinimized] = useState(false);

  useHotkeys([["mod + B", () => toggleAside()]]);

  const theme = useMantineTheme();
  const backgroundColor = useMemo(() => {
    return alpha(getThemeColor(currentAppColor, theme), 0.4);
  }, [currentAppColor, theme]);

  return (
    <Stack h="100%" gap={0} align="center" bg={backgroundColor}>
      <Group pl="xs" justify="flex-start" w="100%">
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
            h={50}
          >
            <IconArrowBarLeft
              style={{
                transform: isAsideOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.4s linear",
              }}
            />
          </ActionIcon>
        </DelayedTooltip>
      </Group>
      <TransitionDivider
        mounted={isAsideOpen}
        transition="fade"
        duration={200}
        enterDelay={200}
      />
      <CalendarAside isBig={isAsideOpen} />
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
      </ScrollArea>
    </Stack>
  );
}
