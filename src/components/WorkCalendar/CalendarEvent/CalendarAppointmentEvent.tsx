import { alpha, Card, Stack, Text } from "@mantine/core";

import { CalendarAppointment } from "@/types/workCalendar.types";

interface CalendarAppointmentEventProps {
  a: CalendarAppointment;
  toY: (date: Date) => number;
  color: string;
}

export default function CalendarAppointmentEvent({
  a,
  color,
  toY,
}: CalendarAppointmentEventProps) {
  const start = new Date(a.start_date);
  const end = new Date(a.end_date);
  const top = toY(start);
  const bottom = toY(end);
  const height = bottom - top;
  const backgroundColor = alpha(color, 0.15);

  return (
    <Card
      p={0}
      radius="sm"
      withBorder
      w="100%"
      h={Math.max(height, 4)}
      bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-9))"
      style={{
        position: "absolute",
        left: 0,
        top: top,
        cursor: "pointer",
        border: `1px solid light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-1))`,
        borderLeft: `6px solid ${color}`,
        zIndex: 13,
      }}
    >
      <Stack h="100%" pl={6} pt={4} gap={0} bg={backgroundColor}>
        <Text size="xs" fw={600}>
          {a.title}
        </Text>
        {a.description && (
          <Text size="xs" c="dimmed">
            {a.description}
          </Text>
        )}
        <Text
          maw="100%"
          size="xs"
          fw={600}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {a.projectTitle}
        </Text>
      </Stack>
    </Card>
  );
}
