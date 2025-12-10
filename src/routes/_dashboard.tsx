import {
  createFileRoute,
  redirect,
  Outlet,
  Link,
} from "@tanstack/react-router";
import { AppShell, Group, Title, Button } from "@mantine/core";
import { UserMenu } from "@/components/UserMenu";
import SchemeToggle from "@/components/Scheme/SchemeToggleButton";
import { settingsQueryOptions } from "@/queries/use-settings";
import { profileQueryOptions } from "@/queries/use-profile";

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context }) => {
    const { queryClient } = context;
    await queryClient.ensureQueryData(settingsQueryOptions);
    await queryClient.ensureQueryData(profileQueryOptions);
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user } = Route.useRouteContext();

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
            <UserMenu userEmail={user?.email} />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
