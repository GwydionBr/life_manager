import { useIntl } from "@/hooks/useIntl";

import { Text, Group, Badge, Stack, Divider, HoverCard } from "@mantine/core";
import {
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconClock,
  IconSettings,
  IconBuilding,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import InfoActionIcon from "@/components/UI/ActionIcons/InfoActionIcon";
import { getRoundingLabel } from "@/lib/timeTrackerFunctions";
import { TimeTrackerState } from "@/hooks/useTimeTracker";

interface TimeTrackerInfoHoverCardProps {
  timerState: TimeTrackerState;
}

export default function TimeTrackerInfoHoverCard({
  timerState,
}: TimeTrackerInfoHoverCardProps) {
  const { locale, getLocalizedText, formatMoney } = useIntl();
  const getCurrencyIcon = () => {
    return timerState.currency === "EUR" ? (
      <IconCurrencyEuro size={16} />
    ) : (
      <IconCurrencyDollar size={16} />
    );
  };

  return (
    <HoverCard
      width={290}
      closeDelay={300}
      openDelay={150}
      position="bottom"
      radius="md"
      shadow="xl"
    >
      <HoverCard.Target>
        <InfoActionIcon onClick={() => {}} />
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Stack gap="md">
          {/* Project Title */}
          <Group>
            <IconBuilding size={16} color="var(--mantine-color-blue-6)" />
            <Text size="sm" fw={600} c="blue">
              {getLocalizedText("Projekt-Details", "Project Details")}
            </Text>
          </Group>

          <Text size="lg" fw={700} ta="center">
            {timerState.projectTitle}
          </Text>

          <Divider />

          {/* Salary Information */}
          <Group justify="space-between" align="center">
            <Group gap="xs">
              {getCurrencyIcon()}
              <Text size="sm" c="dimmed">
                {getLocalizedText("Gehalt", "Salary")}
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {formatMoney(timerState.salary, timerState.currency)}
            </Text>
          </Group>

          {/* Payment Type */}
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {getLocalizedText("Zahlungsart", "Payment Type")}
            </Text>
            <Badge
              color={timerState.hourlyPayment ? "green" : "blue"}
              variant="light"
              size="sm"
              leftSection={
                timerState.hourlyPayment ? (
                  <IconCheck size={12} />
                ) : (
                  <IconX size={12} />
                )
              }
            >
              {timerState.hourlyPayment
                ? getLocalizedText("Stündlich", "Hourly")
                : getLocalizedText("Fest", "Fixed")}
            </Badge>
          </Group>

          <Divider />

          {/* Rounding Settings */}
          <Group>
            <IconSettings size={16} color="var(--mantine-color-orange-6)" />
            <Text size="sm" fw={600} c="orange">
              {getLocalizedText("Rundungs-Einstellungen", "Rounding Settings")}
            </Text>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {getLocalizedText("Modus", "Mode")}
            </Text>
            <Badge color="orange" variant="light" size="sm">
              {getRoundingLabel(
                timerState.timerRoundingSettings.roundingDirection,
                timerState.timerRoundingSettings.roundInTimeFragments,
                locale
              )}
            </Badge>
          </Group>

          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconClock size={16} />
              <Text size="sm" c="dimmed">
                {getLocalizedText("Intervall", "Interval")}
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {timerState.timerRoundingSettings.roundInTimeFragments
                ? timerState.timerRoundingSettings.timeFragmentInterval
                : timerState.timerRoundingSettings.roundingInterval}{" "}
              min
            </Text>
          </Group>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
