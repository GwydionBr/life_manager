import { useState } from "react";
import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { addTestProject } from "./addTestProject";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";

export function AddTestProjectButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { getLocalizedText } = useIntl();

  const handleAddTestProject = async () => {
    setIsLoading(true);

    try {
      const project = await addTestProject();
      console.log("Project created:", project);
      showActionSuccessNotification(
        getLocalizedText(
          `Test-Projekt erfolgreich erstellt: ${project.title}`,
          `Test project successfully created: ${project.title}`
        )
      );
    } catch (error) {
      console.error(error);
      showActionErrorNotification(
        getLocalizedText(
          `Fehler beim Erstellen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
          `Error creating project: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      leftSection={<IconPlus size={20} />}
      onClick={handleAddTestProject}
      loading={isLoading}
      variant="filled"
      color="blue"
    >
      {getLocalizedText("Test-Projekt hinzufügen", "Add Test Project")}
    </Button>
  );
}
