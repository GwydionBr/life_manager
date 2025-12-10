import {
  createFileRoute,
  redirect,
  Outlet,
  Link,
} from "@tanstack/react-router";
import { AppShell, Group, Title, Button } from "@mantine/core";
import { UserButton } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/" });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Button component={Link} to="/dashboard" variant="subtle">
              <Title order={3} c="violet">
                Habbit Ruler
              </Title>
            </Button>
          </Group>
          <Group>
            <UserButton />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
