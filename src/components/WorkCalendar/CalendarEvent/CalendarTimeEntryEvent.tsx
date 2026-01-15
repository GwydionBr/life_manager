import { useIntl } from "@/hooks/useIntl";

import { alpha, Card, HoverCard, Stack, Text } from "@mantine/core";

import { CalendarTimeEntry } from "@/types/workCalendar.types";
import CalendarEventHoverCard from "./CalendarEventHoverCard";

interface CalendarTimeEntryEventProps {
  isNewTimeEntry?: boolean;
  s: CalendarTimeEntry;
  toY: (date: Date) => number;
  color: string;
  handleSessionClick: (sessionId: string) => void;
}

export default function CalendarTimeEntryEvent({
  isNewTimeEntry,
  s,
  color,
  toY,
  handleSessionClick,
}: CalendarTimeEntryEventProps) {
  const { formatDuration } = useIntl();
  const start = new Date(s.start_time);
  const end = new Date(s.end_time);
  const top = toY(start);
  const bottom = toY(end);
  const height = bottom - top;
  const backgroundColor = alpha(color, 0.15);

  return (
    <HoverCard
      openDelay={200}
      closeDelay={100}
      position="right"
      disabled={isNewTimeEntry}
    >
      <HoverCard.Target>
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
            border: `1px solid ${color}`,
            borderLeft: `6px solid ${color}`,
            zIndex: 13,
          }}
          onClick={() => {
            if (!isNewTimeEntry) {
              handleSessionClick(s.id);
            }
          }}
        >
          <Stack h="100%" pl={6} pt={4} gap={0} bg={backgroundColor}>
            <Text size="xs">{formatDuration(s.active_seconds)}</Text>
            {s.memo && (
              <Text size="xs" c="dimmed">
                {s.memo}
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
              {s.projectTitle}
            </Text>
          </Stack>
        </Card>
      </HoverCard.Target>
      <HoverCard.Dropdown p={0}>
        <CalendarEventHoverCard s={s} color={color} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
