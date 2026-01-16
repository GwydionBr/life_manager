import { useMemo } from "react";
import { useIntl } from "@/hooks/useIntl";

import { Box, Text, Stack, Badge, HoverCard } from "@mantine/core";
import { format } from "date-fns";
import CalendarEventHoverCard from "@/components/WorkCalendar/CalendarEvent/CalendarEventHoverCard";
import AppointmentHoverCard from "@/components/WorkCalendar/CalendarEvent/AppointmentHoverCard";

import { CalendarDay } from "@/types/workCalendar.types";

interface MonthDayCellProps {
  day: Date;
  height: number;
  calendarDay?: CalendarDay;
  isCurrentMonth: boolean;
  isToday: boolean;
  handleDayClick: (date: Date) => void;
  handleSessionClick: (sessionId: string) => void;
  handleAppointmentClick?: (appointmentId: string) => void;
}

export function MonthDayCell({
  day,
  height,
  calendarDay,
  isCurrentMonth,
  isToday,
  handleDayClick,
  handleSessionClick,
  handleAppointmentClick,
}: MonthDayCellProps) {
  const maxEventsPerDay = useMemo(() => Math.floor((height - 40) / 22), [height]);
  const { formatTimeSpan, getLocalizedText } = useIntl();
  
  const events = useMemo(() => calendarDay?.events ?? [], [calendarDay]);
  const visibleEvents = useMemo(
    () => events.slice(0, maxEventsPerDay),
    [events, maxEventsPerDay]
  );
  const remainingCount = useMemo(
    () => events.length - maxEventsPerDay,
    [events, maxEventsPerDay]
  );

  return (
    <Box
      p="xs"
      h={height}
      style={{
        border:
          "1px solid light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-4))",
        background: isCurrentMonth
          ? "var(--mantine-color-body)"
          : "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={() => handleDayClick(day)}
    >
      {/* Day Number */}
      <Text
        size="sm"
        fw={isToday ? 700 : 500}
        c={
          isToday
            ? "var(--mantine-color-teal-6)"
            : isCurrentMonth
              ? "var(--mantine-color-text)"
              : "dimmed"
        }
        mb={4}
      >
        {format(day, "d")}
      </Text>

      {/* Events */}
      <Stack gap={2} mt={4}>
        {visibleEvents.map((event, index) => {
          const color =
            event.type === "session"
              ? event.data.color
              : event.data.work_project_id
                ? event.data.color
                : "var(--mantine-color-gray-6)";

          return (
            <HoverCard
              key={`${event.type}-${event.data.id}-${index}`}
              openDelay={200}
              closeDelay={100}
              position="right"
            >
              <HoverCard.Target>
                <Badge
                  size="xs"
                  variant="filled"
                  color={color}
                  style={{
                    cursor: "pointer",
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (event.type === "session") {
                      handleSessionClick(event.data.id);
                    } else if (handleAppointmentClick) {
                      handleAppointmentClick(event.data.id);
                    }
                  }}
                >
                  {event.type === "session"
                    ? formatTimeSpan(new Date(event.data.start_time), new Date(event.data.end_time))
                    : event.data.title}
                </Badge>
              </HoverCard.Target>
              <HoverCard.Dropdown p={0}>
                {event.type === "session" ? (
                  <CalendarEventHoverCard s={event.data} color={color} />
                ) : (
                  <AppointmentHoverCard
                    appointment={event.data}
                    color={color}
                  />
                )}
              </HoverCard.Dropdown>
            </HoverCard>
          );
        })}

        {/* "+X more" indicator */}
        {remainingCount > 0 && (
          <Text size="xs" c="dimmed" mt={2}>
            +{remainingCount} {getLocalizedText("mehr", "more")}
          </Text>
        )}
      </Stack>
    </Box>
  );
}
