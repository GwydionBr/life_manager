import {
  Group,
  Title,
  Button,
  ActionIcon,
  alpha,
  getThemeColor,
  useMantineTheme,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { useWorkStore } from "@/stores/workManagerStore";

import {
  IconBriefcase,
  IconCalendar,
  IconCurrencyDollar,
  IconSettings,
} from "@tabler/icons-react";
import SchemeToggle from "@/components/Scheme/SchemeToggle";
import { UserMenu } from "@/components/User/UserMenu";

export default function DashboardHeader() {
  const {
    setIsModalOpen,
    primaryColor,
    workColor,
    financeColor,
    calendarColor,
  } = useSettingsStore();
  const { getLocalizedText } = useIntl();
  const theme = useMantineTheme();
  const { lastActiveProjectId } = useWorkStore();
  const router = useRouter();

  return (
    <Group
      h="100%"
      px="md"
      justify="space-between"
      bg={alpha(getThemeColor(primaryColor, theme), 0.4)}
    >
      <Group>
        <Button component={Link} to="/dashboard" variant="transparent">
          <Title order={3} c={primaryColor}>
            Life Manager
          </Title>
        </Button>
      </Group>
      <Group>
        <Button
          color={workColor}
          onClick={() =>
            router.navigate({
              to: "/work",
              search: { projectId: lastActiveProjectId || "" },
            })
          }
          variant="subtle"
          leftSection={<IconBriefcase />}
        >
          {getLocalizedText("Arbeit", "Work")}
        </Button>
        <Button
          color={financeColor}
          component={Link}
          to="/finance"
          variant="subtle"
          leftSection={<IconCurrencyDollar />}
        >
          {getLocalizedText("Finanzen", "Finance")}
        </Button>
        <Button
          color={calendarColor}
          component={Link}
          to="/calendar"
          variant="subtle"
          leftSection={<IconCalendar />}
        >
          {getLocalizedText("Kalender", "Calendar")}
        </Button>
        {/* <Button
          color={habitColor}
          component={Link}
          to="/habbit-tracker"
          variant="subtle"
          leftSection={<IconTarget />}
        >
          {getLocalizedText("Gewohnheiten", "Habbit Tracker")}
        </Button> */}
      </Group>
      <Group gap="xs">
        <UserMenu />
        <SchemeToggle />
        <ActionIcon
          size="xl"
          variant="subtle"
          onClick={() => setIsModalOpen(true)}
        >
          <IconSettings stroke={1.5} />
        </ActionIcon>
      </Group>
    </Group>
  );
}
