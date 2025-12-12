import { AppShell, Group, Button, Title } from "@mantine/core";
import { Link, Outlet } from "@tanstack/react-router";
import SchemeToggle from "@/components/Scheme/SchemeToggleButton";
import { UserMenu } from "@/components/User/UserMenu";

export function Shell() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Button component={Link} to="/dashboard" variant="transparent">
              <Title order={3} c="violet">
                Habbit Ruler
              </Title>
            </Button>
          </Group>
          <Group>
            <Button component={Link} to="/test" variant="subtle">
              Test
            </Button>
          </Group>
          <Group>
            <SchemeToggle />
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
