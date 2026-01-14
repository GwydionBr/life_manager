import { useIntl } from "@/hooks/useIntl";
import {
  IconClock,
  IconHourglass,
  IconCurrencyDollar,
  IconNote,
} from "@tabler/icons-react";

import { CalendarSession } from "@/types/workCalendar.types";
import { alpha, Card, Stack, Text, Group, Divider } from "@mantine/core";

interface CalendarEventHoverCardProps {
  s: CalendarSession;
  color: string;
}

export default function CalendarEventHoverCard({
  s,
  color,
}: CalendarEventHoverCardProps) {
  const { formatTimeSpan, formatDuration, formatMoney } = useIntl();
  const earnings = (s.salary * s.active_seconds) / 3600;

  return (
    <Card
      withBorder
      bg={alpha(color, 0.15)}
      style={{ borderColor: color, borderTop: `6px solid ${color}` }}
      miw={200}
      maw={400}
      radius="md"
    >
      <Card.Section p="sm" style={{ borderBottom: `1px solid ${color}` }}>
        <Text size="md" fw={600} ta="center" lineClamp={2}>
          {s.projectTitle}
        </Text>
      </Card.Section>
      <Stack pt="sm" pb="xs" gap="sm" px="sm">
        <Group gap="xs" wrap="nowrap">
          <IconClock
            size={16}
            strokeWidth={1.5}
            style={{ color, flexShrink: 0 }}
          />
          <Text size="xs" fw={500} style={{ flex: 1 }}>
            {formatTimeSpan(new Date(s.start_time), new Date(s.end_time))}
          </Text>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <IconHourglass
            size={16}
            strokeWidth={1.5}
            style={{ color, flexShrink: 0 }}
          />
          <Text size="xs" fw={500} style={{ flex: 1 }}>
            {formatDuration(s.active_seconds)}
          </Text>
        </Group>
        {earnings > 0 && (
          <Group gap="xs" wrap="nowrap">
            <IconCurrencyDollar size={16} style={{ color, flexShrink: 0 }} />
            <Text size="xs" fw={600} c={color} style={{ flex: 1 }}>
              {formatMoney(earnings, s.currency)}
            </Text>
          </Group>
        )}
      </Stack>
      {s.memo && (
        <>
          <Divider color={color} opacity={0.3} />
          <Card.Section p="sm">
            <Group gap="xs" wrap="nowrap" align="flex-start">
              <IconNote
                size={16}
                style={{ color, flexShrink: 0, marginTop: 2 }}
              />
              <Text size="xs" fw={500} style={{ flex: 1 }}>
                {s.memo}
              </Text>
            </Group>
          </Card.Section>
        </>
      )}
    </Card>
  );
}
