import { useState } from "react";
import { Button } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import {
  useWorkProjects,
  workProjectsCollection,
} from "@/db/collections/work/work-project/work-project-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";

export function UpdateTestProjectButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { getLocalizedText } = useIntl();
  const { data: workProjects } = useWorkProjects();

  const handleUpdateTestProject = async () => {
    setIsLoading(true);

    try {
      if (!workProjects || workProjects.length === 0) {
        throw new Error("Keine Projekte zum Aktualisieren gefunden");
      }

      // Wähle ein zufälliges Projekt aus
      const randomProject =
        workProjects[Math.floor(Math.random() * workProjects.length)];

      // Generiere eine zufällige Farbe
      const randomColor = `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;

      // Generiere einen neuen Titel mit Timestamp
      const timestamp = new Date().toLocaleTimeString("de-DE");
      const newTitle = `${randomProject.title.split(" (Updated")[0]} (Updated ${timestamp})`;

      // Generiere neues Gehalt
      const newSalary =
        randomProject.salary + Math.floor(Math.random() * 10) - 5;

      // Aktualisiere das Projekt über die TanStack Collection mit Callback-Funktion
      workProjectsCollection.update(randomProject.id, (draft) => {
        draft.title = newTitle;
        draft.color = randomColor;
        draft.salary = newSalary;
      });

      console.log("Project updated:", {
        ...randomProject,
        title: newTitle,
        color: randomColor,
        salary: newSalary,
      });

      showActionSuccessNotification(
        getLocalizedText(
          `Test-Projekt erfolgreich aktualisiert: ${newTitle}`,
          `Test project successfully updated: ${newTitle}`
        )
      );
    } catch (error) {
      console.error(error);
      showActionErrorNotification(
        getLocalizedText(
          `Fehler beim Aktualisieren: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
          `Error updating project: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      leftSection={<IconRefresh size={20} />}
      onClick={handleUpdateTestProject}
      loading={isLoading}
      variant="filled"
      color="green"
    >
      {getLocalizedText("Test-Projekt aktualisieren", "Update Test Project")}
    </Button>
  );
}
