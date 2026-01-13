import { useIntl } from "@/hooks/useIntl";

import {
  Card,
  Stack,
  Text,
  Group,
  Badge,
  HoverCard,
} from "@mantine/core";
import AppointmentHoverCard from "./AppointmentHoverCard";

import { getStatusStyles, getStatusIcon, getStatusText } from "@/lib/appointmentStatusHelpers";

import { CalendarAppointment } from "@/types/workCalendar.types";
import { AppointmentStatusBadge } from "../Appointment/AppointmentStatusBadge";

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
  const { getLocalizedText } = useIntl();
  const start = new Date(a.start_date);
  const end = new Date(a.end_date);
  const top = toY(start);
  const bottom = toY(end);
  const height = bottom - top;
  const statusStyles = getStatusStyles(a.status);
  // const backgroundColor = alpha(color, statusStyles.bgOpacity);
  const statusColor = statusStyles.borderColor;

  // Use status color if appointment has no project color
  const borderColor = a.work_project_id ? color : statusColor;

  return (
    <HoverCard openDelay={200} closeDelay={100} position="right">
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
            border: `1px solid ${borderColor}`,
            borderLeft: `6px solid ${borderColor}`,
            opacity: statusStyles.textOpacity,
            zIndex: 13,
          }}
        >
          <Stack h="100%" pl={6} pt={4} gap={2}>
            <Group gap={4} wrap="nowrap">
              {getStatusIcon(a.status)}
              <Text size="xs" fw={600} style={{ flex: 1, minWidth: 0 }}>
                {a.title}
              </Text>
            </Group>
            {a.description && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {a.description}
              </Text>
            )}
            {a.projectTitle && (
              <Text
                maw="100%"
                size="xs"
                fw={500}
                c="dimmed"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {a.projectTitle}
              </Text>
            )}
            {height > 30 && (
              <AppointmentStatusBadge status={a.status} />
            )}
          </Stack>
        </Card>
      </HoverCard.Target>
      <HoverCard.Dropdown p={0}>
        <AppointmentHoverCard appointment={a} color={borderColor} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
