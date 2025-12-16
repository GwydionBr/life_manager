import { createFileRoute } from "@tanstack/react-router";
import { useWorkProjects } from "@/db/collections/work-project-collection";
import { Group, Text, Stack } from "@mantine/core";

export const Route = createFileRoute("/_app/work")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  // Führe eine Live-Query aus: alle Projekte abrufen
  const { data: workProjects } = useWorkProjects();
  return (
    <Stack>
      {!workProjects && <Text>Lade Arbeitsprojekte...</Text>}
      {workProjects && workProjects.length === 0 && (
        <Text c="dimmed">Keine Arbeitsprojekte gefunden</Text>
      )}
      {workProjects && workProjects.length > 0 && (
        <ul>
          {workProjects.map((workProject) => (
            <Group key={workProject.id}>
              <Text>{workProject.title}</Text>
            </Group>
          ))}
        </ul>
      )}
    </Stack>
  );
}
