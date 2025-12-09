// src/routes/dashboard.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Text, Stack, Group } from "@mantine/core";
import { UserButton } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={1}>Dashboard</Title>
          <UserButton />
        </Group>

        <Text size="lg" c="dimmed">
          Welcome to your Habbit Ruler dashboard! Start tracking your habits and
          building a better routine.
        </Text>
      </Stack>
    </Container>
  );
}
