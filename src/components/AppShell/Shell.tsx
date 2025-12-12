import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { useLocation } from "@tanstack/react-router";

import { AppShell, Group, Button, Title, ActionIcon } from "@mantine/core";
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

export function Shell() {
  const { setIsModalOpen } = useSettingsStore();
  const { getLocalizedText } = useIntl();
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  return (
    <AppShell header={{ height: 45 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Button component={Link} to="/dashboard" variant="transparent">
              <Title order={3} c="violet">
                Life Manager
              </Title>
            </Button>
          </Group>
          <Group>
            <Button
              component={Link}
              to="/work"
              variant={pathname.includes("/work") ? "light" : "subtle"}
              leftSection={<IconBriefcase />}
            >
              {getLocalizedText("Arbeit", "Work")}
            </Button>
            <Button
              color="violet"
              component={Link}
              to="/finance"
              variant={pathname.includes("/finance") ? "light" : "subtle"}
              leftSection={<IconCurrencyDollar />}
            >
              {getLocalizedText("Finanzen", "Finance")}
            </Button>
            <Button
              color="cyan"
              component={Link}
              to="/calendar"
              variant={pathname.includes("/calendar") ? "light" : "subtle"}
              leftSection={<IconCalendar />}
            >
              {getLocalizedText("Kalender", "Calendar")}
            </Button>
            <Button
              color="pink"
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
              <IconSettings stroke={1.5}/>
            </ActionIcon>
            <SchemeToggle />
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      <SettingsModal />
    </AppShell>
  );
}
