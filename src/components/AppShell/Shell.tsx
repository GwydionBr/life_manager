import { useSettingsStore } from "@/stores/settingsStore";

import { AppShell, Group, Button, Title, ActionIcon } from "@mantine/core";
import { Link, Outlet } from "@tanstack/react-router";
import SchemeToggle from "@/components/Scheme/SchemeToggleButton";
import { UserMenu } from "@/components/User/UserMenu";
import { IconSettings } from "@tabler/icons-react";
import SettingsModal from "@/components/Settings/SettingsModal";

export function Shell() {
  const { setIsModalOpen } = useSettingsStore();
  return (
    <AppShell header={{ height: 60 }} padding="md">
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
            <Button component={Link} to="/test" variant="subtle">
              Test
            </Button>
          </Group>
          <Group>
            <ActionIcon
              variant="transparent"
              onClick={() => setIsModalOpen(true)}
            >
              <IconSettings size={16} />
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
