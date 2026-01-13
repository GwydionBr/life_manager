import { Alert, Button, Group, Stack, Text, Select } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useIntl } from "@/hooks/useIntl";
import { Appointment, WorkProject } from "@/types/work.types";
import { useState } from "react";

interface AppointmentNoProjectAlertProps {
  appointment: Appointment;
  workProjects: WorkProject[];
  onMarkAsCompleted: () => void;
  onMarkAsMissed: () => void;
  onProjectSelected: (projectId: string) => void;
  onOpenProjectForm: () => void;
  onDismiss: () => void;
}

export function AppointmentNoProjectAlert({
  appointment,
  workProjects,
  onMarkAsCompleted,
  onMarkAsMissed,
  onProjectSelected,
  onOpenProjectForm,
  onDismiss,
}: AppointmentNoProjectAlertProps) {
  const { getLocalizedText } = useIntl();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const projectOptions = workProjects.map((project) => ({
    value: project.id,
    label: project.title,
  }));

  const handleAssignProject = () => {
    if (selectedProjectId) {
      onProjectSelected(selectedProjectId);
    }
  };

  return (
    <Alert
      icon={<IconExclamationCircle size={16} />}
      title={getLocalizedText("Kein Projekt zugewiesen", "No Project Assigned")}
      color="blue"
      variant="light"
    >
      <Stack gap="sm">
        <Text size="sm">
          {getLocalizedText(
            "Diesem Termin ist kein Projekt zugewiesen. Fügen Sie ein Projekt hinzu, um den Termin in einen Zeiteintrag umwandeln zu können.",
            "This appointment has no project assigned. Add a project to be able to convert the appointment to a time entry."
          )}
        </Text>

        <Select
          label={getLocalizedText("Projekt auswählen", "Select Project")}
          placeholder={getLocalizedText(
            "Projekt auswählen...",
            "Select project..."
          )}
          data={projectOptions}
          value={selectedProjectId}
          onChange={setSelectedProjectId}
          searchable
          clearable
        />

        <Group gap="sm">
          <Button
            size="xs"
            variant="light"
            color="blue"
            onClick={handleAssignProject}
            disabled={!selectedProjectId}
          >
            {getLocalizedText("Projekt zuweisen", "Assign Project")}
          </Button>
          <Button
            size="xs"
            variant="light"
            color="teal"
            onClick={onOpenProjectForm}
          >
            {getLocalizedText("Neues Projekt erstellen", "Create New Project")}
          </Button>
          <Button
            size="xs"
            variant="light"
            color="green"
            onClick={onMarkAsCompleted}
          >
            {getLocalizedText(
              "Als abgeschlossen markieren",
              "Mark as Completed"
            )}
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            onClick={onMarkAsMissed}
          >
            {getLocalizedText("Als verpasst markieren", "Mark as Missed")}
          </Button>
          <Button size="xs" variant="subtle" color="gray" onClick={onDismiss}>
            {getLocalizedText("Abbrechen", "Cancel")}
          </Button>
        </Group>
      </Stack>
    </Alert>
  );
}
