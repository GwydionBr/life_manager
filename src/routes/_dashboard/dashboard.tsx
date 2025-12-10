import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Text, Stack, Group } from "@mantine/core";
import { useSettings } from "@/queries/use-settings";
import { useProfile } from "@/queries/use-profile";

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: settings } = useSettings();
  const { data: profile } = useProfile();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={1}>Dashboard</Title>
        </Group>

        <Text size="lg" c="dimmed">
          Welcome to your Habbit Ruler dashboard! Start tracking your habits and
          building a better routine.
        </Text>
        <Text size="lg" c="dimmed">
          Settings: {JSON.stringify(settings)}
        </Text>
        <Text size="lg" c="dimmed">
          Profile: {JSON.stringify(profile)}
        </Text>
      </Stack>
    </Container>
  );
}
