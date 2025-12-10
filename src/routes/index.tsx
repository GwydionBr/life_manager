// src/routes/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Box,
  Group,
  Modal,
} from "@mantine/core";
import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { userId } = Route.useRouteContext();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="xl" mt="10vh">
        <Box ta="center">
          <Title
            order={1}
            size="4rem"
            fw={900}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Habbit Ruler
          </Title>
          <Text size="xl" mt="md" c="dimmed" maw={600} mx="auto">
            Take control of your habits and build a better you. Track your daily
            routines, measure your progress, and rule your habits with Habbit
            Ruler.
          </Text>
        </Box>

        <Group mt="xl">
          {userId ? (
            <Button
              component={Link}
              to="/dashboard"
              size="lg"
              variant="gradient"
              gradient={{ from: "violet", to: "grape", deg: 135 }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              size="lg"
              variant="gradient"
              gradient={{ from: "violet", to: "grape", deg: 135 }}
              onClick={() => setAuthModalOpen(true)}
            >
              Get Started
            </Button>
          )}
        </Group>

        <Stack gap="md" mt="xl" maw={500}>
          <Box ta="center">
            <Title order={3} mb="sm">
              Why Habbit Ruler?
            </Title>
            <Text c="dimmed">
              Build lasting habits with our intuitive tracking system. Visualize
              your progress, stay motivated, and achieve your goals one day at a
              time.
            </Text>
          </Box>
        </Stack>
      </Stack>

      <Modal
        opened={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Authentication"
        centered
      >
        <AuthForm />
      </Modal>
    </Container>
  );
}
