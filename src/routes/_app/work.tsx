import { useEffect } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useWorkProjects } from "@/db/collections/work/work-project/work-project-collection";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Group } from "@mantine/core";
import WorkInitializer from "@/components/Work/WorkInitializer";
import ProjectNavbar from "@/components/Navbar/ProjectNavbar";
import ProjectDetail from "@/components/Work/Project/ProjectDetail";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";

const workSearchSchema = z.object({
  projectId: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/_app/work")({
  component: RouteComponent,
  validateSearch: zodValidator(workSearchSchema),
  ssr: false,
});

function RouteComponent() {
  const { projectId } = Route.useSearch();
  // Führe eine Live-Query aus: alle Projekte abrufen
  const workProjects = useWorkProjects();

  const { isWorkNavbarOpen } = useSettingsStore();
  const { setActiveProjectId, activeProjectId, lastActiveProjectId } =
    useWorkStore();

  const router = useRouter();

  useEffect(() => {
    if (!projectId) {
      if (activeProjectId) {
        router.navigate({
          to: "/work",
          search: { projectId: activeProjectId },
        });
      } else if (lastActiveProjectId) {
        router.navigate({
          to: "/work",
          search: { projectId: lastActiveProjectId },
        });
      }
    }
  }, [projectId]);

  if (workProjects && workProjects.length === 0) {
    return <WorkInitializer />;
  }

  return (
    <Group h="100%" wrap="nowrap">
      <ProjectNavbar />
      <Box
        style={{ transition: "margin 0.4s ease-in-out" }}
        w="100%"
      >
        <ProjectDetail />
      </Box>
    </Group>
  );
}
