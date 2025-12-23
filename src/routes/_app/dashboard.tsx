import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  SimpleGrid,
  ThemeIcon,
  Group,
  Badge,
  Box,
  ActionIcon,
  Tooltip,
  getThemeColor,
  useMantineTheme,
  alpha,
} from "@mantine/core";
import { useIntl } from "@/hooks/useIntl";
import {
  IconBriefcase,
  IconCalendar,
  IconCurrencyDollar,
  IconTarget,
  IconArrowRight,
  IconPlus,
  IconChartBar,
} from "@tabler/icons-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { getGradientForColor } from "@/constants/colors";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  ssr: false,
});

function Dashboard() {
  const { getLocalizedText } = useIntl();
  const { workColor, financeColor, calendarColor, habitColor } =
    useSettingsStore();
  const theme = useMantineTheme();
  // Base app configuration ohne Farben
  const apps = [
    {
      id: "work",
      icon: IconBriefcase,
      title: "Work",
      titleDe: "Arbeit",
      description: "Track your project hours and analyze your productivity",
      descriptionDe:
        "Erfasse deine Projektzeiten und analysiere deine Produktivität",
      link: "/work",
      badge: getLocalizedText("Aktiv", "Active"),
      active: true,
      stats: [
        { label: getLocalizedText("Heute", "Today"), value: "0h" },
        { label: getLocalizedText("Diese Woche", "This Week"), value: "0h" },
      ],
      color: {
        base: getThemeColor(workColor, theme),
        gradient: getGradientForColor(workColor),
      },
    },
    {
      id: "finance",
      icon: IconCurrencyDollar,
      title: "Finance",
      titleDe: "Finanzen",
      description: "Manage your income, expenses and financial overview",
      descriptionDe: "Verwalte Einnahmen, Ausgaben und Finanzübersicht",
      link: "/finance",
      badge: getLocalizedText("Aktiv", "Active"),
      active: true,
      stats: [
        { label: getLocalizedText("Diesen Monat", "This Month"), value: "€0" },
        { label: getLocalizedText("Einträge", "Entries"), value: "0" },
      ],
      color: {
        base: getThemeColor(financeColor, theme),
        gradient: getGradientForColor(financeColor),
      },
    },
    {
      id: "calendar",
      icon: IconCalendar,
      title: "Calendar",
      titleDe: "Kalender",
      description: "Manage appointments and schedule your time",
      descriptionDe: "Verwalte Termine und plane deine Zeit",
      link: "/calendar",
      badge: getLocalizedText("Aktiv", "Active"),
      active: true,
      stats: [
        { label: getLocalizedText("Heute", "Today"), value: "0" },
        { label: getLocalizedText("Diese Woche", "This Week"), value: "0" },
      ],
      color: {
        base: getThemeColor(calendarColor, theme),
        gradient: getGradientForColor(calendarColor),
      },
    },
    {
      id: "habit",
      icon: IconTarget,
      title: "Habit Tracker",
      titleDe: "Gewohnheiten",
      description: "Build sustainable habits and track your daily routines",
      descriptionDe:
        "Baue nachhaltige Gewohnheiten auf und tracke deine Routinen",
      link: "/habbit-tracker",
      badge: getLocalizedText("Aktiv", "Active"),
      active: false,
      stats: [
        {
          label: getLocalizedText("Aktive Habits", "Active Habits"),
          value: "0 " + "Streak",
        },
        {
          label: getLocalizedText("Streak", "Streak"),
          value: "0 " + getLocalizedText("Tage", "Days"),
        },
      ],
      color: {
        base: getThemeColor(habitColor, theme),
        gradient: getGradientForColor(habitColor),
      },
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <Box>
          <Title order={1} size="2.5rem" fw={700} mb="xs">
            {getLocalizedText("Dashboard", "Dashboard")}
          </Title>
          <Text size="lg" c="dimmed">
            {getLocalizedText(
              "Willkommen bei deinem Life Manager! Wähle eine App aus, um loszulegen.",
              "Welcome to your Life Manager! Choose an app to get started."
            )}
          </Text>
        </Box>

        {/* Apps Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 2 }} spacing="xl">
          {apps.map((app) => (
            <Card
              key={app.title}
              shadow="md"
              padding="xl"
              radius="lg"
              withBorder
              style={{
                transition: "all 0.3s ease",
                cursor: app.active ? "pointer" : "default",
                opacity: app.active ? 1 : 0.7,
              }}
              {...(app.active && {
                component: Link,
                to: app.link,
              })}
              onMouseEnter={(e) => {
                if (app.active) {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = `0 12px 32px ${alpha(app.color.base, 0.2)}`;
                }
              }}
              onMouseLeave={(e) => {
                if (app.active) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }
              }}
            >
              <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between" align="flex-start">
                  <Group gap="md">
                    <ThemeIcon
                      size={60}
                      radius="lg"
                      variant="gradient"
                      gradient={app.color.gradient}
                    >
                      <app.icon size={32} />
                    </ThemeIcon>
                    <Box>
                      <Title order={3} size="1.5rem" fw={600}>
                        {getLocalizedText(app.titleDe, app.title)}
                      </Title>
                      <Badge
                        size="sm"
                        variant={app.active ? "gradient" : "light"}
                        gradient={app.active ? app.color.gradient : undefined}
                        color={app.active ? undefined : "gray"}
                        mt={4}
                      >
                        {app.active
                          ? getLocalizedText("Aktiv", "Active")
                          : getLocalizedText("Demnächst", "Coming Soon")}
                      </Badge>
                    </Box>
                  </Group>

                  {app.active && (
                    <ActionIcon
                      size="lg"
                      variant="subtle"
                      color={app.color.base}
                      radius="xl"
                    >
                      <IconArrowRight size={20} />
                    </ActionIcon>
                  )}
                </Group>

                {/* Description */}
                <Text size="sm" c="dimmed">
                  {getLocalizedText(app.descriptionDe, app.description)}
                </Text>

                {/* Stats */}
                <Group gap="xl" mt="xs">
                  {app.stats.map((stat, index) => (
                    <Box key={index}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                        {stat.label}
                      </Text>
                      <Text size="lg" fw={600} mt={4}>
                        {stat.value}
                      </Text>
                    </Box>
                  ))}
                </Group>

                {/* Quick Actions */}
                {app.active && (
                  <Group gap="xs" mt="xs">
                    <Tooltip
                      label={getLocalizedText("Neuer Eintrag", "New Entry")}
                    >
                      <ActionIcon
                        variant="light"
                        color={app.color.base}
                        size="lg"
                        radius="md"
                      >
                        <IconPlus size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip
                      label={getLocalizedText("Statistiken", "Statistics")}
                    >
                      <ActionIcon
                        variant="light"
                        color={app.color.base}
                        size="lg"
                        radius="md"
                      >
                        <IconChartBar size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                )}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        {/* Info Box */}
        <Card
          padding="lg"
          radius="md"
          style={{
            background:
              "linear-gradient(135deg, rgba(190, 75, 219, 0.1) 0%, rgba(134, 46, 156, 0.15) 100%)",
            border: "1px solid rgba(190, 75, 219, 0.2)",
          }}
        >
          <Group gap="md">
            <ThemeIcon size={40} radius="md" variant="light" color="grape">
              <IconTarget size={24} />
            </ThemeIcon>
            <Box style={{ flex: 1 }}>
              <Text fw={600} size="sm">
                {getLocalizedText(
                  "Weitere Apps folgen in Kürze!",
                  "More apps coming soon!"
                )}
              </Text>
              <Text size="xs" c="dimmed">
                {getLocalizedText(
                  "Wir arbeiten hart daran, dir weitere Funktionen zu bieten. Bleib dran!",
                  "We're working hard to bring you more features. Stay tuned!"
                )}
              </Text>
            </Box>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}
