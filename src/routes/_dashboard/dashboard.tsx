import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Text, Stack, Group } from "@mantine/core";
import { useIntl } from "@/hooks/useIntl";

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { getLocalizedText } = useIntl();
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={1}>{getLocalizedText("Dashboard", "Dashboard")}</Title>
        </Group>

        <Text size="lg" c="dimmed">
          {getLocalizedText(
            "Welcome to your Habbit Ruler dashboard! Start tracking your habits and building a better routine.",
            "Willkommen bei deinem Habbit Ruler Dashboard! Starte mit dem Tracken deiner Gewohnheiten und baue eine bessere Routine."
          )}
        </Text>
      </Stack>
    </Container>
  );
}
