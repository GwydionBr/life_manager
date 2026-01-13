import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useAppointmentMutations } from "@/db/collections/work/appointment/use-appointment-mutations";
import { useAppointmentById } from "@/db/collections/work/appointment/use-appointment-query";

import {
  Drawer,
  Flex,
  Group,
  Text,
  useDrawersStack,
  Box,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconExclamationCircle, IconTransform } from "@tabler/icons-react";
import AppointmentForm from "@/components/WorkCalendar/Appointment/AppointmentForm";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";
import { ConvertToTimeEntryForm } from "./ConvertToTimeEntryForm";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { AppointmentConversionPromptAlert } from "./AppointmentConversionPromptAlert";
import { AppointmentNoProjectAlert } from "./AppointmentNoProjectAlert";
import { AppointmentStatusAlert } from "./AppointmentStatusAlert";
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
import { AppointmentStatus } from "@/types/workCalendar.types";

interface EditAppointmentDrawerProps {
  appointment: Appointment;
  project?: WorkProject;
  opened: boolean;
  onClose: () => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export default function EditAppointmentDrawer({
  appointment: initialAppointment,
  opened,
  onClose,
  project,
  initialStartDate,
  initialEndDate,
}: EditAppointmentDrawerProps) {
  const { data: appointmentData } = useAppointmentById(initialAppointment.id);
  const { getLocalizedText } = useIntl();
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState<WorkProject | undefined>(
    project
  );
  const { data: workProjects } = useWorkProjects();
  const { updateAppointment, deleteAppointment } = useAppointmentMutations();

  const appointment = useMemo(() => {
    return appointmentData ?? initialAppointment;
  }, [appointmentData, initialAppointment]);

  const drawerStack = useDrawersStack([
    "edit-appointment",
    "delete-appointment",
    "add-project",
    "tag-form",
    "convert-to-time-entry",
  ]);

  const [showConversionPrompt, setShowConversionPrompt] = useState(false);
  const [showNoProjectAlert, setShowNoProjectAlert] = useState(false);
  const [showStatusAlert, setShowStatusAlert] = useState(false);

  // Determine which alert to show based on appointment state
  const determineAlertsToShow = useCallback(() => {
    const now = new Date();
    const endDate = new Date(appointment.end_date);
    const isPast = endDate < now;
    const hasProject = appointment.work_project_id !== null;
    const status = appointment.status;

    // Reset all alerts
    setShowConversionPrompt(false);
    setShowNoProjectAlert(false);
    setShowStatusAlert(false);

    // Priority 1: Show status alert if appointment is already marked as missed or completed
    if (
      status === AppointmentStatus.MISSED ||
      status === AppointmentStatus.COMPLETED
    ) {
      setShowStatusAlert(true);
      return;
    }

    // Priority 2: Show no project alert if finished/past and no project
    if ((status === AppointmentStatus.FINISHED || isPast) && !hasProject) {
      setShowNoProjectAlert(true);
      return;
    }

    // Priority 3: Show conversion prompt if past and has project
    if (isPast && hasProject && shouldShowConversionPrompt(appointment)) {
      setShowConversionPrompt(true);
      return;
    }
  }, [appointment]);

  // Sync external opened state with internal drawer stack
  useEffect(() => {
    if (opened) {
      drawerStack.open("edit-appointment");
      determineAlertsToShow();
    } else {
      drawerStack.closeAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, determineAlertsToShow]);

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
    setShowConversionPrompt(false);
    setShowStatusAlert(false);
  }

  async function handleMarkAsMissed() {
    await updateAppointment(appointment.id, {
      status: AppointmentStatus.MISSED,
    });
    // After marking as missed, re-evaluate which alerts to show
    setTimeout(() => determineAlertsToShow(), 100);
  }

  async function handleMarkAsCompleted() {
    await updateAppointment(appointment.id, {
      status: AppointmentStatus.COMPLETED,
    });
    // After marking as completed, re-evaluate which alerts to show
    setTimeout(() => determineAlertsToShow(), 100);
  }

  async function handleProjectAssigned(projectId: string) {
    await updateAppointment(appointment.id, { work_project_id: projectId });
    const selectedProject = workProjects.find((p) => p.id === projectId);
    if (selectedProject) {
      setCurrentProject(selectedProject);
    }
    // After assigning project, re-evaluate which alerts to show
    setTimeout(() => determineAlertsToShow(), 100);
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
            {showConversionPrompt && (
              <AppointmentConversionPromptAlert
                appointment={appointment}
                onConvert={handleOpenConvertModal}
                onMarkAsMissed={handleMarkAsMissed}
                onDismiss={() => setShowConversionPrompt(false)}
              />
            )}

            {showNoProjectAlert && (
              <AppointmentNoProjectAlert
                appointment={appointment}
                workProjects={workProjects}
                onMarkAsCompleted={handleMarkAsCompleted}
                onMarkAsMissed={handleMarkAsMissed}
                onProjectSelected={handleProjectAssigned}
                onOpenProjectForm={() => drawerStack.open("add-project")}
                onDismiss={() => setShowNoProjectAlert(false)}
              />
            )}

            {showStatusAlert && (
              <AppointmentStatusAlert
                appointment={appointment}
                onMarkAsCompleted={handleMarkAsCompleted}
                onMarkAsMissed={handleMarkAsMissed}
                onConvert={handleOpenConvertModal}
                onDismiss={() => setShowStatusAlert(false)}
              />
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
