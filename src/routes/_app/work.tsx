import { createFileRoute } from "@tanstack/react-router";
import { useWorkProjects } from "@/db/collections/work/work-project/work-project-collection";
import { Box } from "@mantine/core";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useSettingsStore } from "@/stores/settingsStore";
import WorkInitializer from "@/components/Work/WorkInitializer";
import ProjectNavbar from "@/components/Navbar/ProjectNavbar";
import ProjectDetail from "@/components/Work/Project/ProjectDetail";

const workSearchSchema = z.object({
  projectId: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/_app/work")({
  component: RouteComponent,
  validateSearch: zodValidator(workSearchSchema),
  ssr: false,
});

function RouteComponent() {
  // Führe eine Live-Query aus: alle Projekte abrufen
  const workProjects = useWorkProjects();

  const { isWorkNavbarOpen } = useSettingsStore();
  if (workProjects && workProjects.length === 0) {
    return <WorkInitializer />;
  }

  return (
    <Box>
      <ProjectNavbar />
      <Box
        ml={isWorkNavbarOpen ? 250 : 60}
        style={{ transition: "margin 0.4s ease-in-out" }}
      >
        <ProjectDetail />
      </Box>
    </Box>
  );
}
