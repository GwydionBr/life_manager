import { useEffect, useState } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useAppointmentMutations } from "@/db/collections/work/appointment/use-appointment-mutations";

import {
  Drawer,
  Flex,
  Group,
  Text,
  useDrawersStack,
  Box,
  Alert,
  Button,
  Stack,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconExclamationCircle,
  IconTransform,
  IconAlertTriangle,
} from "@tabler/icons-react";
import AppointmentForm from "@/components/WorkCalendar/Appointment/AppointmentForm";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";
import { ConvertToTimeEntryForm } from "./ConvertToTimeEntryForm";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import {
  canConvertAppointmentToTimeEntry,
  shouldShowConversionPrompt,
} from "@/lib/appointmentTimerHelpers";

import {
  Appointment,
  InsertAppointment,
  UpdateAppointment,
} from "@/types/work.types";
import { WorkProject } from "@/types/work.types";

interface EditAppointmentDrawerProps {
  appointment: Appointment;
  project?: WorkProject;
  opened: boolean;
  onClose: () => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export default function EditAppointmentDrawer({
  appointment,
  opened,
  onClose,
  project,
  initialStartDate,
  initialEndDate,
}: EditAppointmentDrawerProps) {
  const { getLocalizedText } = useIntl();
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState<WorkProject | undefined>(
    project
  );
  const { data: workProjects } = useWorkProjects();
  const { updateAppointment, deleteAppointment } = useAppointmentMutations();

  const drawerStack = useDrawersStack([
    "edit-appointment",
    "delete-appointment",
    "add-project",
    "tag-form",
    "convert-to-time-entry",
  ]);

  const [showPrompt, setShowPrompt] = useState(false);

  // Sync external opened state with internal drawer stack
  useEffect(() => {
    if (opened) {
      drawerStack.open("edit-appointment");
      // Check if we should show the conversion prompt
      setShowPrompt(shouldShowConversionPrompt(appointment));
    } else {
      drawerStack.closeAll();
      setShowPrompt(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  function handleClose() {
    drawerStack.closeAll();
    onClose();
  }

  async function handleSubmit(values: InsertAppointment | UpdateAppointment) {
    // Convert empty strings to null for database compatibility
    const cleanedValues = {
      ...values,
      description:
        values.description && values.description.trim() !== ""
          ? values.description
          : null,
    };

    await updateAppointment(appointment.id, cleanedValues as UpdateAppointment);
    handleClose();
  }

  function handleDelete() {
    if (appointment) {
      deleteAppointment(appointment.id);
      handleClose();
    }
  }

  function handleOpenConvertModal() {
    drawerStack.open("convert-to-time-entry");
    setShowPrompt(false);
  }

  async function handleMarkAsMissed() {
    await updateAppointment(appointment.id, { status: "missed" });
    setShowPrompt(false);
  }

  const canConvert = canConvertAppointmentToTimeEntry(appointment);

  // Prepare initial values
  const getInitialValues = (): InsertAppointment | UpdateAppointment => {
    if (appointment) {
      return {
        title: appointment.title,
        description: appointment.description || "",
        start_date: appointment.start_date,
        end_date: appointment.end_date,
        type: appointment.type,
        status: appointment.status,
        is_all_day: appointment.is_all_day,
        work_project_id: appointment.work_project_id,
        reminder: appointment.reminder,
      };
    }

    // New appointment with initial dates or current time
    const startDate = initialStartDate || new Date();
    const endDate =
      initialEndDate || new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour

    return {
      title: "",
      description: "",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      type: "work",
      status: "upcoming",
      is_all_day: false,
      work_project_id: project?.id || null,
      reminder: null,
    };
  };

  return (
    <Box>
      <Drawer.Stack>
        <Drawer
          {...drawerStack.register("edit-appointment")}
          onClose={handleClose}
          title={
            <Group justify="space-between" w="100%">
              <Group>
                <DeleteActionIcon
                  tooltipLabel={getLocalizedText(
                    "Termin löschen",
                    "Delete Appointment"
                  )}
                  onClick={() => {
                    drawerStack.open("delete-appointment");
                  }}
                />
                {canConvert && (
                  <Tooltip
                    label={getLocalizedText(
                      "In Zeiteintrag umwandeln",
                      "Convert to Time Entry"
                    )}
                  >
                    <ActionIcon
                      variant="light"
                      color="teal"
                      onClick={handleOpenConvertModal}
                    >
                      <IconTransform size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Text>
                  {getLocalizedText("Termin bearbeiten", "Edit Appointment")}
                </Text>
              </Group>
              <AppointmentStatusBadge status={appointment.status} />
            </Group>
          }
          size="lg"
          padding="md"
        >
          <Flex direction="column" gap="xl">
            {showPrompt && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                title={getLocalizedText(
                  "Termin ist vorbei",
                  "Appointment has passed"
                )}
                color="orange"
                variant="light"
              >
                <Stack gap="sm">
                  <Text size="sm">
                    {getLocalizedText(
                      "Dieser Termin ist bereits vorbei. Möchten Sie ihn in einen Zeiteintrag umwandeln?",
                      "This appointment has already passed. Would you like to convert it to a time entry?"
                    )}
                  </Text>
                  <Group gap="sm">
                    <Button
                      size="xs"
                      variant="light"
                      color="teal"
                      leftSection={<IconTransform size={14} />}
                      onClick={handleOpenConvertModal}
                    >
                      {getLocalizedText("Umwandeln", "Convert")}
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={handleMarkAsMissed}
                    >
                      {getLocalizedText(
                        "Als verpasst markieren",
                        "Mark as Missed"
                      )}
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={() => setShowPrompt(false)}
                    >
                      {getLocalizedText("Abbrechen", "Cancel")}
                    </Button>
                  </Group>
                </Stack>
              </Alert>
            )}

            <AppointmentForm
              initialValues={getInitialValues()}
              onCancel={handleClose}
              onSubmit={handleSubmit}
              onOpenProjectForm={() => drawerStack.open("add-project")}
              onProjectChange={setCurrentProject}
              newAppointment={false}
              project={currentProject}
            />
          </Flex>
        </Drawer>
        <Drawer
          {...drawerStack.register("add-project")}
          onClose={() => drawerStack.close("add-project")}
          title={
            <Group>
              <Text>
                {getLocalizedText("Projekt hinzufügen", "Add Project")}
              </Text>
            </Group>
          }
          size="lg"
        >
          <ProjectForm
            onCancel={() => drawerStack.close("add-project")}
            tagIds={tagIds}
            setTagIds={setTagIds}
            onSuccess={(project) =>
              setCurrentProject(
                workProjects.find((p) => p.id === project.id) ?? project
              )
            }
            onOpenTagForm={() => drawerStack.open("tag-form")}
          />
        </Drawer>
        <Drawer
          {...drawerStack.register("tag-form")}
          onClose={() => drawerStack.close("tag-form")}
          title={getLocalizedText("Tag hinzufügen", "Add Tag")}
        >
          <FinanceTagForm
            onClose={() => drawerStack.close("tag-form")}
            onSuccess={(tag) => setTagIds([...tagIds, tag.id])}
          />
        </Drawer>
        <Drawer
          {...drawerStack.register("delete-appointment")}
          onClose={() => drawerStack.close("delete-appointment")}
          title={
            <Group>
              <IconExclamationCircle size={25} color="red" />
              <Text>
                {getLocalizedText("Termin löschen", "Delete Appointment")}
              </Text>
            </Group>
          }
          size="md"
        >
          <Text>
            {getLocalizedText(
              "Bist du dir sicher, dass du diesen Termin löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden. ",
              "Are you sure you want to delete this appointment? This action cannot be undone. "
            )}
          </Text>
          <Group mt="md" justify="flex-end" gap="sm">
            <CancelButton onClick={handleClose} color="teal" />
            <DeleteButton
              onClick={handleDelete}
              tooltipLabel={getLocalizedText(
                "Termin löschen",
                "Delete Appointment"
              )}
            />
          </Group>
        </Drawer>
        <Drawer
          {...drawerStack.register("convert-to-time-entry")}
          onClose={() => drawerStack.close("convert-to-time-entry")}
          title={getLocalizedText(
            "In Zeiteintrag umwandeln",
            "Convert to Time Entry"
          )}
          size="lg"
        >
          <ConvertToTimeEntryForm
            appointment={appointment}
            onClose={handleClose}
          />
        </Drawer>
      </Drawer.Stack>
    </Box>
  );
}
