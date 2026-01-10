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
  Card,
  SimpleGrid,
  ThemeIcon,
  Badge,
  Divider,
} from "@mantine/core";
import {
  IconClock,
  IconCalendar,
  IconCurrencyEuro,
  IconTarget,
  IconChartLine,
  IconBolt,
  IconShield,
} from "@tabler/icons-react";
import { Anchor } from "@mantine/core";

export const Route = createFileRoute("/")({
  component: Home,
});

const features = [
  {
    icon: IconClock,
    title: "Time Tracker",
    description:
      "Track your work hours precisely. Create projects, track your time, and analyze your productivity with detailed reports.",
    color: "teal",
  },
  {
    icon: IconCalendar,
    title: "Calendar",
    description:
      "Manage all your appointments in one place. Integrated with the Time Tracker for seamless time planning and project management.",
    color: "cyan",
  },
  {
    icon: IconCurrencyEuro,
    title: "Finances",
    description:
      "Keep track of your finances. Connect income with your projects and manage your expenses efficiently.",
    color: "blue",
  },
  {
    icon: IconTarget,
    title: "Habit Tracker",
    description:
      "Build sustainable habits. Track your daily routines, visualize your progress, and achieve your goals.",
    color: "green",
  },
];

const benefits = [
  {
    icon: IconChartLine,
    title: "Everything at a Glance",
    description: "One central platform for all aspects of your life",
  },
  {
    icon: IconBolt,
    title: "Maximum Productivity",
    description: "Optimize your time and achieve more in less time",
  },
  {
    icon: IconShield,
    title: "Your Data, Secure",
    description: "Highest security standards for your private information",
  },
];

function Home() {
  const { user } = Route.useRouteContext();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        py={80}
        style={{
          background:
            "linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(13, 148, 136, 0.15) 100%)",
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="xl">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "teal", to: "cyan", deg: 135 }}
            >
              Your Personal Life Manager
            </Badge>
            <Box ta="center">
              <Title
                order={1}
                size="4rem"
                fw={900}
                style={{
                  background:
                    "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "1.5rem",
                }}
              >
                Life Manager
              </Title>
              <Text size="xl" c="dimmed" maw={700} mx="auto" mb="xl">
                Your all-in-one solution for time management, finances,
                appointments, and habits. Organize your life, boost your
                productivity, and achieve your goals.
              </Text>
            </Box>
            <Group gap="md">
              {user ? (
                <Button
                  component={Link}
                  to="/dashboard"
                  size="xl"
                  variant="gradient"
                  gradient={{ from: "teal", to: "cyan", deg: 135 }}
                  leftSection={<IconBolt size={20} />}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    size="xl"
                    variant="gradient"
                    gradient={{ from: "teal", to: "cyan", deg: 135 }}
                    component={Link}
                    to="/auth/"
                    leftSection={<IconBolt size={20} />}
                  >
                    Get Started
                  </Button>
                  <Button
                    size="xl"
                    variant="default"
                    component="a"
                    href="#features"
                  >
                    Learn More
                  </Button>
                </>
              )}
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container size="lg" py={80} id="features">
        <Stack gap={60}>
          <Box ta="center">
            <Title order={2} size="2.5rem" fw={700} mb="md">
              Everything You Need
            </Title>
            <Text size="lg" c="dimmed" maw={600} mx="auto">
              Four powerful apps, seamlessly connected
            </Text>
          </Box>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
            {features.map((feature) => (
              <Card
                key={feature.title}
                shadow="sm"
                padding="xl"
                radius="md"
                withBorder
                style={{
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(20, 184, 166, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <Stack gap="md">
                  <ThemeIcon
                    size={60}
                    radius="md"
                    variant="gradient"
                    gradient={{ from: feature.color, to: "cyan", deg: 135 }}
                  >
                    <feature.icon size={32} />
                  </ThemeIcon>
                  <Title order={3} size="1.5rem" fw={600}>
                    {feature.title}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {feature.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      <Divider />

      {/* Benefits Section */}
      <Box
        py={80}
        style={{
          background:
            "linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(13, 148, 136, 0.08) 100%)",
        }}
      >
        <Container size="lg">
          <Stack gap={50}>
            <Box ta="center">
              <Title order={2} size="2.5rem" fw={700} mb="md">
                Why Life Manager?
              </Title>
              <Text size="lg" c="dimmed" maw={600} mx="auto">
                Your benefits at a glance
              </Text>
            </Box>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
              {benefits.map((benefit) => (
                <Card key={benefit.title} padding="xl" radius="md" withBorder>
                  <Stack gap="md" align="center" ta="center">
                    <ThemeIcon
                      size={50}
                      radius="md"
                      variant="light"
                      color="teal"
                    >
                      <benefit.icon size={28} />
                    </ThemeIcon>
                    <Title order={4} fw={600}>
                      {benefit.title}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {benefit.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      <Divider />

      {/* CTA Section */}
      <Container size="md" py={80}>
        <Card
          shadow="lg"
          padding="xl"
          radius="lg"
          style={{
            background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
          }}
        >
          <Stack align="center" gap="xl" ta="center">
            <Title order={2} c="white" size="2rem" fw={700}>
              Ready to Organize Your Life?
            </Title>
            <Text size="lg" c="white" opacity={0.9} maw={500}>
              Start today and experience how easy it can be to stay productive
              and organized.
            </Text>
            {!user && (
              <Button
                size="xl"
                variant="white"
                color="teal"
                component={Link}
                to="/auth/"
                leftSection={<IconBolt size={20} />}
              >
                Sign Up Free
              </Button>
            )}
          </Stack>
        </Card>
      </Container>

      {/* Footer */}
      <Box
        py={40}
        style={{
          borderTop: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <Container size="lg">
          <Group justify="center" gap="xl">
            <Anchor
              component={Link}
              to="/impressum"
              size="sm"
              c="dimmed"
              style={{ textDecoration: "none" }}
            >
              Impressum
            </Anchor>
            <Anchor
              component={Link}
              to="/datenschutz"
              size="sm"
              c="dimmed"
              style={{ textDecoration: "none" }}
            >
              Datenschutzerklärung
            </Anchor>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
