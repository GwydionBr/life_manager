import { useIntl } from "@/hooks/useIntl";

import { Card, Text, Badge, Group } from "@mantine/core";
import {
  IconClock,
  IconCash,
  IconTrendingUp,
  IconTrophy,
  IconAlertTriangle,
  IconCalendar,
} from "@tabler/icons-react";

/**
 * Types of work statistic cards that can be displayed
 */
export type WorkStatisticType =
  | "totalTime"
  | "totalSalary"
  | "hourlyRate"
  | "bestPeriod"
  | "worstPeriod"
  | "totalPeriods";

/**
 * Props for the WorkStatisticCard component
 */
interface WorkStatisticCardProps {
  type: WorkStatisticType;
  value: string | number;
  subtitle?: string;
  color?: "teal" | "red" | "green" | "blue";
  badge?: string;
  badgeColor?: "green" | "red";
}

/**
 * Reusable work statistic card component
 * Displays work statistics in a consistent card format
 */
export default function WorkStatisticCard({
  type,
  value,
  subtitle,
  color = "green",
  badge,
  badgeColor = "green",
}: WorkStatisticCardProps) {
  const { getLocalizedText } = useIntl();
  // Get title and default styling based on type
  const getCardConfig = () => {
    switch (type) {
      case "totalTime":
        return {
          title: getLocalizedText("Gesamtzeit", "Total Time"),
          defaultColor: "blue" as const,
          icon: IconClock,
        };
      case "totalSalary":
        return {
          title: getLocalizedText("Gesamtgehalt", "Total Salary"),
          defaultColor: "green" as const,
          icon: IconCash,
        };
      case "hourlyRate":
        return {
          title: getLocalizedText("Stundenrate", "Hourly Rate"),
          defaultColor: "teal" as const,
          icon: IconTrendingUp,
        };
      case "bestPeriod":
        return {
          title: getLocalizedText("Bester Tag", "Best Period"),
          defaultColor: "green" as const,
          icon: IconTrophy,
        };
      case "worstPeriod":
        return {
          title: getLocalizedText("Schlechteste Tag", "Worst Period"),
          defaultColor: "red" as const,
          icon: IconAlertTriangle,
        };
      case "totalPeriods":
        return {
          title: getLocalizedText("Gesamtperioden", "Total Periods"),
          defaultColor: "blue" as const,
          icon: IconCalendar,
        };
      default:
        return {
          title: getLocalizedText("Statistik", "Statistic"),
          defaultColor: "blue" as const,
          icon: IconClock,
        };
    }
  };

  const config = getCardConfig();
  const displayColor = color || config.defaultColor;
  const IconComponent = config.icon;

  return (
    <Card withBorder p="md" h="100%">
      <Group mb="xs">
        <IconComponent
          size={16}
          color={`var(--mantine-color-${displayColor}-6)`}
        />
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          {config.title}
        </Text>
      </Group>
      <Group>
        <Text size="xl" fw={700} c={displayColor}>
          {value}
        </Text>
        {badge && (
          <Badge color={badgeColor} variant="light" mt="xs">
            {badge}
          </Badge>
        )}
      </Group>
      {subtitle && (
        <Text size="xs" c="dimmed">
          {subtitle}
        </Text>
      )}
    </Card>
  );
}
