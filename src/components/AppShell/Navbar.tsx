import { useSettingsStore } from "@/stores/settingsStore";
import { useRouter } from "@tanstack/react-router";
import { useWorkStore } from "@/stores/workManagerStore";

import {
  Button,
  Stack,
  alpha,
  getThemeColor,
  useMantineTheme,
  ActionIcon,
  Text,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import {
  IconBriefcase,
  IconCalendar,
  IconCurrencyDollar,
  IconSettings,
} from "@tabler/icons-react";
import { AppOptions } from "@/types/settings.types";
import { UserMenu } from "../User/UserMenu";
import SchemeToggle from "../Scheme/SchemeToggle";

interface NavbarProps {
  currentApp: AppOptions | null;
}

export default function Navbar({ currentApp }: NavbarProps) {
  const {
    primaryColor,
    workColor,
    financeColor,
    calendarColor,
    setIsModalOpen,
  } = useSettingsStore();
  const { lastActiveProjectId } = useWorkStore();
  const theme = useMantineTheme();
  const router = useRouter();
  return (
    <Stack
      bg={alpha(getThemeColor(primaryColor, theme), 0.4)}
      h="100%"
      align="center"
      justify="space-between"
    >
      <Stack align="center">
        <Stack gap="0">
          <Button
            component={Link}
            to="/dashboard"
            variant="transparent"
            size="xl"
            h={60}
          >
            <Text fw={700}>LM</Text>
          </Button>
        </Stack>
        <Stack>
          <ActionIcon
            onClick={() =>
              router.navigate({
                to: "/work",
                search: { projectId: lastActiveProjectId || "" },
              })
            }
            size="xl"
            color={workColor}
            variant={currentApp === AppOptions.WORK ? "light" : "subtle"}
          >
            <IconBriefcase />
          </ActionIcon>
          <ActionIcon
            component={Link}
            to="/finance"
            size="xl"
            color={financeColor}
            variant={currentApp === AppOptions.FINANCE ? "light" : "subtle"}
          >
            <IconCurrencyDollar />
          </ActionIcon>
          <ActionIcon
            component={Link}
            to="/calendar"
            size="xl"
            color={calendarColor}
            variant={currentApp === AppOptions.CALENDAR ? "light" : "subtle"}
          >
            <IconCalendar />
          </ActionIcon>
          {/* <ActionIcon
        component={Link}
        to="/habbit-tracker"
        size="xl"
        color={habitColor}
        variant={currentApp === AppOptions.HABBIT_TRACKER ? "light" : "subtle"}
      >
        <IconTarget />
      </ActionIcon> */}
        </Stack>
      </Stack>

      <Stack pb="md">
        <UserMenu />
        <SchemeToggle />
        <ActionIcon
          size="xl"
          variant="subtle"
          onClick={() => setIsModalOpen(true)}
        >
          <IconSettings stroke={1.5} />
        </ActionIcon>
      </Stack>
    </Stack>
  );
}
