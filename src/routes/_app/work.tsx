import { useEffect } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";

import { Box, Center, ScrollArea, Loader } from "@mantine/core";
import WorkInitializer from "@/components/Work/WorkInitializer";
import ProjectNavbar from "@/components/Navbar/ProjectNavbar";
import ProjectDetail from "@/components/Work/Project/ProjectDetail";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";

const workSearchSchema = z.object({
  projectId: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/_app/work")({
  ssr: false,
  component: RouteComponent,
  validateSearch: zodValidator(workSearchSchema),
});

function RouteComponent() {
  const { projectId } = Route.useSearch();
  // Führe eine Live-Query aus: alle Projekte abrufen
  const { data: workProjects, isLoading } = useWorkProjects();

  const { activeProjectId, lastActiveProjectId, isWorkNavbarOpen } = useWorkStore();

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
      } else if (workProjects.length > 0) {
        router.navigate({
          to: "/work",
          search: { projectId: workProjects[0].id },
        });
      }
    }
  }, [projectId, activeProjectId, lastActiveProjectId, router, workProjects]);

  if (isLoading) {
    return (
      <Center w="100%" h="100%">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Box w="100%">
      <ProjectNavbar />
      <ScrollArea pl={isWorkNavbarOpen ? 290 : 60} w="100%" h="calc(100vh - 80px)">
        {workProjects && workProjects.length === 0 && !isLoading ? (
          <WorkInitializer />
        ) : (
          <ProjectDetail />
        )}
      </ScrollArea>
    </Box>
  );
}
