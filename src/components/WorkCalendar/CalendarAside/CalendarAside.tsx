import { useState, useMemo } from "react";
import { useIntl } from "@/hooks/useIntl";
import {
  Stack,
  Text,
  Button,
  Box,
  Group,
  Badge,
  ActionIcon,
  Divider,
  Paper,
  Tooltip,
  rem,
  Collapse,
  ScrollArea,
} from "@mantine/core";
import {
  IconCalendarPlus,
  IconChevronDown,
  IconChevronUp,
  IconCalendarTime,
  IconCircleFilled,
} from "@tabler/icons-react";
import { format, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { useDisclosure } from "@mantine/hooks";

import { useAppointments } from "@/db/collections/work/appointment/use-appointment-query";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { AppointmentStatus, Appointment } from "@/types/workCalendar.types";
import NewAppointmentModal from "../Appointment/NewAppointmentModal";
import EditAppointmentDrawer from "../Appointment/EditAppointmentDrawer";

interface CalendarAsideProps {
  isBig: boolean;
}

export default function CalendarAside({ isBig }: CalendarAsideProps) {
  const { getLocalizedText } = useIntl();
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [
    newAppointmentModalOpened,
    { open: openNewAppointmentModal, close: closeNewAppointmentModal },
  ] = useDisclosure(false);

  const [
    appointmentDrawerOpened,
    { open: openAppointmentDrawer, close: closeAppointmentDrawer },
  ] = useDisclosure(false);

  const { data: appointments } = useAppointments();
  const { data: projects } = useWorkProjects();

  const handleCreateAppointment = () => {
    openNewAppointmentModal();
  };

  const handleAppointmentClick = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      openAppointmentDrawer();
    }
  };

  const handleCloseAppointmentDrawer = () => {
    closeAppointmentDrawer();
    setSelectedAppointment(null);
  };

  // Get upcoming appointments sorted by start date
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((apt) => {
        const startDate = parseISO(apt.start_date);
        return apt.status === AppointmentStatus.UPCOMING && startDate >= now;
      })
      .sort((a, b) => {
        return (
          parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime()
        );
      })
      .slice(0, 5); // Show max 5 upcoming appointments
  }, [appointments]);

  // Get today's appointments
  const todayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const startDate = parseISO(apt.start_date);
      return isToday(startDate) && apt.status === AppointmentStatus.UPCOMING;
    });
  }, [appointments]);

  // Format date with relative labels
  const formatAppointmentDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return `Heute, ${format(date, "HH:mm", { locale: de })}`;
    }
    if (isTomorrow(date)) {
      return `Morgen, ${format(date, "HH:mm", { locale: de })}`;
    }
    if (isThisWeek(date)) {
      return format(date, "EEEE, HH:mm", { locale: de });
    }
    return format(date, "dd.MM.yyyy, HH:mm", { locale: de });
  };

  // Get project color
  const getProjectColor = (projectId: string | null) => {
    if (!projectId) return "gray";
    const project = projects.find((p) => p.id === projectId);
    return project?.color || "gray";
  };

  if (!isBig) {
    return (
      <>
        <Box p="xs" style={{ textAlign: "center" }}>
          <Tooltip label={getLocalizedText("Neuer Termin", "New Appointment")}>
            <ActionIcon
              onClick={handleCreateAppointment}
              size="lg"
              variant="light"
              color="blue"
            >
              <IconCalendarPlus size={20} />
            </ActionIcon>
          </Tooltip>
          {todayAppointments.length > 0 && (
            <Badge
              size="xs"
              variant="filled"
              color="blue"
              style={{ marginTop: rem(8) }}
            >
              {todayAppointments.length}
            </Badge>
          )}
        </Box>
        <NewAppointmentModal
          opened={newAppointmentModalOpened}
          onClose={closeNewAppointmentModal}
        />
        {selectedAppointment && (
          <EditAppointmentDrawer
            appointment={selectedAppointment}
            project={
              selectedAppointment.work_project_id
                ? projects.find(
                    (p) => p.id === selectedAppointment.work_project_id
                  )
                : undefined
            }
            opened={appointmentDrawerOpened}
            onClose={handleCloseAppointmentDrawer}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Stack gap="xs" p="xs" style={{ width: "100%" }}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <IconCalendarTime size={18} />
            <Text size="sm" fw={600}>
              {getLocalizedText("Termine", "Appointments")}
            </Text>
          </Group>
          <Group gap={4} wrap="nowrap">
            {todayAppointments.length > 0 && (
              <Badge size="sm" variant="filled" color="blue">
                {todayAppointments.length} {getLocalizedText("heute", "today")}
              </Badge>
            )}
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronUp size={16} />
              )}
            </ActionIcon>
          </Group>
        </Group>

        <Collapse in={!isMinimized}>
          <Stack>
            <Button
              leftSection={<IconCalendarPlus size={16} />}
              size="xs"
              variant="light"
              onClick={handleCreateAppointment}
              fullWidth
            >
              {getLocalizedText("Neuer Termin", "New Appointment")}
            </Button>

            <Divider />

            <Stack gap="xs" style={{ maxHeight: rem(250), overflowY: "auto" }}>
              {upcomingAppointments.length === 0 ? (
                <Text size="xs" c="dimmed" ta="center" py="md">
                  {getLocalizedText(
                    "Keine kommenden Termine",
                    "No upcoming appointments"
                  )}
                </Text>
              ) : (
                <ScrollArea.Autosize mah={150} type="auto">
                  {upcomingAppointments.map((appointment) => (
                    <Paper
                      key={appointment.id}
                      p="xs"
                      withBorder
                      style={{
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onClick={() => handleAppointmentClick(appointment.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateX(2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <Stack gap={4}>
                        <Group gap={6} wrap="nowrap">
                          <IconCircleFilled
                            size={8}
                            color={getProjectColor(appointment.work_project_id)}
                          />
                          <Text size="xs" fw={500} lineClamp={1}>
                            {appointment.title}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {formatAppointmentDate(appointment.start_date)}
                        </Text>
                      </Stack>
                    </Paper>
                  ))}
                </ScrollArea.Autosize>
              )}
            </Stack>
          </Stack>
        </Collapse>
      </Stack>
      <NewAppointmentModal
        opened={newAppointmentModalOpened}
        onClose={closeNewAppointmentModal}
      />
      {selectedAppointment && (
        <EditAppointmentDrawer
          appointment={selectedAppointment}
          project={
            selectedAppointment.work_project_id
              ? projects.find(
                  (p) => p.id === selectedAppointment.work_project_id
                )
              : undefined
          }
          opened={appointmentDrawerOpened}
          onClose={handleCloseAppointmentDrawer}
        />
      )}
    </>
  );
}
