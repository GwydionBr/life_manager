import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { useLocation } from "@tanstack/react-router";

import {
  AppShell,
  Group,
  Button,
  Title,
  ActionIcon,
  alpha,
  getThemeColor,
  useMantineTheme,
} from "@mantine/core";
import { Link, Outlet } from "@tanstack/react-router";
import SchemeToggle from "@/components/Scheme/SchemeToggle";
import { UserMenu } from "@/components/User/UserMenu";
import {
  IconBriefcase,
  IconCalendar,
  IconCurrencyDollar,
  IconSettings,
  IconTarget,
} from "@tabler/icons-react";
import SettingsModal from "@/components/Settings/SettingsModal";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Aside from "./Aside";

export function Shell() {
  const {
    setIsModalOpen,
    primaryColor,
    workColor,
    financeColor,
    calendarColor,
    habitColor,
    isAsideOpen,
    toggleAside,
  } = useSettingsStore();
  const { getLocalizedText } = useIntl();
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  const theme = useMantineTheme();
  return (
    <AppShell
      header={{ height: 45 }}
      aside={{
        width: isAsideOpen ? 300 : 50,
        breakpoint: "md",
        collapsed: { desktop: false, mobile: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group
          h="100%"
          px="md"
          justify="space-between"
          bg={alpha(getThemeColor(primaryColor, theme), 0.1)}
        >
          <Group>
            <Button component={Link} to="/dashboard" variant="transparent">
              <Title order={3} c={primaryColor}>
                Life Manager
              </Title>
            </Button>
          </Group>
          <Group>
            <Button
              color={workColor}
              component={Link}
              to="/work"
              variant={pathname.includes("/work") ? "light" : "subtle"}
              leftSection={<IconBriefcase />}
            >
              {getLocalizedText("Arbeit", "Work")}
            </Button>
            <Button
              color={financeColor}
              component={Link}
              to="/finance"
              variant={pathname.includes("/finance") ? "light" : "subtle"}
              leftSection={<IconCurrencyDollar />}
            >
              {getLocalizedText("Finanzen", "Finance")}
            </Button>
            <Button
              color={calendarColor}
              component={Link}
              to="/calendar"
              variant={pathname.includes("/calendar") ? "light" : "subtle"}
              leftSection={<IconCalendar />}
            >
              {getLocalizedText("Kalender", "Calendar")}
            </Button>
            <Button
              color={habitColor}
              component={Link}
              to="/habbit-tracker"
              variant={
                pathname.includes("/habbit-tracker") ? "light" : "subtle"
              }
              leftSection={<IconTarget />}
            >
              {getLocalizedText("Gewohnheiten", "Habbit Tracker")}
            </Button>
          </Group>
          <Group gap="xs">
            <ActionIcon
              size="xl"
              variant="subtle"
              onClick={() => setIsModalOpen(true)}
            >
              <IconSettings stroke={1.5} />
            </ActionIcon>
            <SchemeToggle />
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      <AppShell.Aside
        bg="var(--mantine-color-body)"
        style={{ transition: "width 0.4s ease-in", overflow: "hidden" }}
      >
        <Aside toggleAside={toggleAside} isAsideOpen={isAsideOpen} />
      </AppShell.Aside>
      <SettingsModal />
      <OfflineIndicator />
    </AppShell>
  );
}
