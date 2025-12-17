import { useIntl } from "@/hooks/useIntl";

import { CalendarSession } from "@/types/workCalendar.types";
import { alpha, Card, Stack, Text } from "@mantine/core";

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
      miw={175}
    >
      <Card.Section p="xs" style={{ borderBottom: `1px solid ${color}` }}>
        <Text size="md" fw={600} ta="center">
          {s.projectTitle}
        </Text>
      </Card.Section>
      <Stack pt="xs" gap="xs">
        <Text ta="center" size="xs" fw={500}>
          {formatTimeSpan(new Date(s.start_time), new Date(s.end_time))}
        </Text>
        <Text ta="center" size="xs" fw={500}>
          {formatDuration(s.active_seconds)}
        </Text>
        {earnings > 0 && (
          <Text ta="center" size="xs" fw={500}>
            {formatMoney(earnings, s.currency)}
          </Text>
        )}
        {s.memo && (
          <Card.Section p="xs" style={{ borderTop: `1px solid ${color}` }}>
            <Text ta="center" size="xs" fw={500}>
              {s.memo}
            </Text>
          </Card.Section>
        )}
      </Stack>
    </Card>
  );
}
