import {
  useWorkProjects,
  workProjectsCollection,
} from "@/db/collections/work/work-project-collection";

export async function updateTestProject() {
  try {
    // Hole alle existierenden Projekte
    const projects = useWorkProjects();

    if (!projects.data || projects.data?.length === 0) {
      throw new Error("Keine Projekte zum Aktualisieren gefunden");
    }

    // Wähle ein zufälliges Projekt aus
    const randomProject =
      projects.data?.[Math.floor(Math.random() * projects.data.length || 0)];

    // Generiere eine zufällige Farbe
    const randomColor = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;

    // Generiere einen neuen Titel mit Timestamp
    const timestamp = new Date().toLocaleTimeString("de-DE");
    const newTitle = `${randomProject.title.split(" (Updated")[0]} (Updated ${timestamp})`;

    // Generiere neues Gehalt
    const newSalary = randomProject.salary + Math.floor(Math.random() * 10) - 5;

    // Aktualisiere das Projekt über die TanStack Collection mit Callback-Funktion
    workProjectsCollection.update(randomProject.id, (draft) => {
      draft.title = newTitle;
      draft.color = randomColor;
      draft.salary = newSalary;
    });

    console.log("Test project updated successfully:", {
      ...randomProject,
      title: newTitle,
      color: randomColor,
      salary: newSalary,
    });

    return {
      ...randomProject,
      title: newTitle,
      color: randomColor,
      salary: newSalary,
    };
  } catch (error) {
    console.error("Failed to update test project:", error);
    throw error;
  }
}
